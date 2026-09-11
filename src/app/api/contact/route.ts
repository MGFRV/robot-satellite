import nodemailer from 'nodemailer';

const SMTP_USER = process.env.SMTP_USER ?? 'zakaz@schupy.ru';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
// With a third-party relay (Brevo, etc.) the SMTP auth login is the relay
// account, not a deliverable mailbox — the visible "From" must be a sender
// verified with that relay, so it's tracked separately from SMTP_USER.
const MAIL_FROM = process.env.MAIL_FROM ?? SMTP_USER;
const CONTACT_TO = process.env.CONTACT_TO ?? MAIL_FROM;
const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY ?? process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
// Preferred channel: the VPS's outbound SMTP ports (587/465/25) are blocked at
// the network level (confirmed via ETIMEDOUT on SMTP CONN), but outbound
// HTTPS (443) works, so Brevo's HTTP API is used instead of raw SMTP.
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://schupy.ru';
const MAX_BODY_BYTES = 32_000;
type ContactPayload = Record<string, unknown>;

function textField(body: ContactPayload, key: string, max: number, required = false) {
  const value = body[key];
  if (value === undefined || value === null || value === '') {
    if (required) throw new Error(`Поле ${key} обязательно`);
    return '';
  }
  if (typeof value !== 'string' || value.length > max || /[\r\n]/.test(key === 'subject' ? value : '')) {
    throw new Error(`Некорректное поле ${key}`);
  }
  return value.trim();
}

function parsePayload(body: ContactPayload) {
  if (body.consent !== true) throw new Error('Поле consent обязательно');
  const name = textField(body, 'name', 100, true);
  const email = textField(body, 'email', 254);
  const phone = textField(body, 'phone', 50);
  const contact = textField(body, 'contact', 254);
  const contactIsEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  if (!email && !phone && !contact) throw new Error('Поле contact обязательно');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Некорректный email');
  if (textField(body, 'website', 200)) throw new Error('Spam detected');
  return {
    name,
    email,
    replyEmail: email || (contactIsEmail ? contact : ''),
    phone,
    contact,
    company: textField(body, 'company', 200),
    message: textField(body, 'message', 5_000),
    productName: textField(body, 'productName', 300),
    productSku: textField(body, 'productSku', 100),
    pageUrl: textField(body, 'pageUrl', 2_000),
    machine: textField(body, 'machine', 300),
    marking: textField(body, 'marking', 300),
    cartJson: textField(body, 'cart_json', 10_000),
  };
}

function formatCart(cartJson: string) {
  if (!cartJson) return '-';
  try {
    const items = JSON.parse(cartJson) as unknown;
    if (!Array.isArray(items) || items.length === 0 || items.length > 100) throw new Error('invalid cart');
    return items.map((item) => {
      if (!item || typeof item !== 'object') throw new Error('invalid cart item');
      const record = item as Record<string, unknown>;
      const article = String(record.article ?? '').slice(0, 100);
      const title = String(record.title ?? '').slice(0, 300);
      const quantity = Number(record.quantity);
      if (!title || !Number.isInteger(quantity) || quantity < 1 || quantity > 10_000) throw new Error('invalid cart item');
      return `- ${article || 'без артикула'} | ${title} | Кол-во: ${quantity}`;
    }).join('\n');
  } catch {
    throw new Error('Некорректное поле cart_json');
  }
}

async function deliverWithWeb3Forms(subject: string, text: string, name: string, email: string) {
  if (!WEB3FORMS_ACCESS_KEY) throw new Error('DELIVERY_NOT_CONFIGURED');
  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: SITE_URL,
      Referer: `${SITE_URL}/`,
    },
    body: JSON.stringify({
      access_key: WEB3FORMS_ACCESS_KEY,
      subject,
      from_name: 'Сайт ЩУПЫ.РУ',
      name,
      email: email || CONTACT_TO,
      message: text,
    }),
    signal: AbortSignal.timeout(15_000),
    cache: 'no-store',
  });
  const result = await response.json().catch(() => null) as { success?: boolean; message?: string } | null;
  if (!response.ok || !result?.success) throw new Error(`WEB3FORMS_FAILED:${result?.message ?? response.status}`);
}

async function deliverWithBrevoApi(subject: string, text: string, email: string) {
  if (!BREVO_API_KEY) throw new Error('DELIVERY_NOT_CONFIGURED');
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: 'Сайт ЩУПЫ.РУ', email: MAIL_FROM },
      to: [{ email: CONTACT_TO }],
      ...(email ? { replyTo: { email } } : {}),
      subject,
      textContent: text,
    }),
    signal: AbortSignal.timeout(15_000),
    cache: 'no-store',
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`BREVO_API_FAILED:${response.status}:${body.slice(0, 200)}`);
  }
}

async function deliverInquiry(subject: string, text: string, name: string, email: string) {
  if (BREVO_API_KEY) {
    try {
      await deliverWithBrevoApi(subject, text, email);
      return;
    } catch (error) {
      console.error('Brevo API delivery failed; trying the configured fallback', error);
    }
  }
  if (SMTP_PASSWORD) {
    try {
      const port = Number(process.env.SMTP_PORT ?? 465);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST ?? 'smtp.mail.ru',
        port,
        // 465 uses implicit TLS; 587/25 (e.g. Brevo) use STARTTLS on a plain socket.
        secure: port === 465,
        connectionTimeout: 10_000, socketTimeout: 15_000,
        auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
      });
      await transporter.sendMail({ from: MAIL_FROM, to: CONTACT_TO, replyTo: email || undefined, subject, text });
      return;
    } catch (error) {
      console.error('SMTP delivery failed; trying the configured fallback', error);
    }
  }
  await deliverWithWeb3Forms(subject, text, name, email);
}

export function GET() {
  const configured = Boolean(BREVO_API_KEY || SMTP_PASSWORD || WEB3FORMS_ACCESS_KEY);
  return Response.json(
    { status: configured ? 'ready' : 'unavailable', delivery: configured ? 'configured' : 'missing' },
    { status: configured ? 200 : 503 },
  );
}

export async function POST(request: Request) {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') {
    return Response.json({ success: false, error: 'Unsupported content type' }, { status: 415 });
  }
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return Response.json({ success: false, error: 'Payload too large' }, { status: 413 });
  }
  // TODO: enforce distributed rate limiting at the reverse proxy or in a shared
  // store. An in-memory counter is not reliable across production instances.
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
      return Response.json({ success: false, error: 'Payload too large' }, { status: 413 });
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new SyntaxError('Invalid JSON object');
    const data = parsePayload(parsed as ContactPayload);
    const subject = data.productSku ? `Запрос цены: ${data.productSku}` : data.cartJson ? 'Запрос цены по списку' : 'Новая заявка с сайта';
    const text = [
      `Имя: ${data.name}`, `Компания: ${data.company || '-'}`, `Email: ${data.email}`,
      `Телефон/контакт: ${data.phone || data.contact}`, `Сообщение: ${data.message || '-'}`, `Товар: ${data.productName || '-'}`,
      `Артикул: ${data.productSku || '-'}`, `Страница: ${data.pageUrl || '-'}`,
      `Станок/контроллер: ${data.machine || '-'}`, `Маркировка: ${data.marking || '-'}`,
      `Список позиций:\n${formatCart(data.cartJson)}`,
    ].join('\n');

    await deliverInquiry(subject, text, data.name, data.replyEmail);
    return Response.json({ success: true });
  } catch (error) {
    const invalid = error instanceof SyntaxError || (error instanceof Error && /Поле|Некоррект|Spam/.test(error.message));
    if (!invalid) console.error('Contact form delivery failed', error);
    const unavailable = error instanceof Error && error.message === 'DELIVERY_NOT_CONFIGURED';
    const message = invalid
      ? 'Проверьте обязательные поля и согласие на обработку данных.'
      : unavailable
        ? 'Сервис отправки временно не настроен.'
        : 'Почтовый сервис не принял заявку.';
    return Response.json({ success: false, error: message }, { status: invalid ? 400 : unavailable ? 503 : 502 });
  }
}
