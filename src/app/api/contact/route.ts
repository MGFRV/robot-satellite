import nodemailer from 'nodemailer';

const SMTP_USER = process.env.SMTP_USER ?? 'zakaz@schupy.ru';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const CONTACT_TO = process.env.CONTACT_TO ?? SMTP_USER;
const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY ?? process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
const MAX_BODY_BYTES = 32_000;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

type ContactPayload = Record<string, unknown>;
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

function isRateLimited(ip: string) {
  const now = Date.now();
  if (attempts.size > 10_000) {
    for (const [key, value] of attempts) if (value.resetAt <= now) attempts.delete(key);
  }
  const current = attempts.get(ip);
  if (!current || current.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

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
  if (!email && !phone && !contact) throw new Error('Поле contact обязательно');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Некорректный email');
  if (textField(body, 'website', 200)) throw new Error('Spam detected');
  return {
    name,
    email,
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
      const quantity = Math.max(1, Number(record.quantity) || 1);
      if (!article || !title) throw new Error('invalid cart item');
      return `- ${article} | ${title} | Кол-во: ${quantity}`;
    }).join('\n');
  } catch {
    throw new Error('Некорректное поле cart_json');
  }
}

async function deliverWithWeb3Forms(subject: string, text: string, email: string) {
  if (!WEB3FORMS_ACCESS_KEY) throw new Error('DELIVERY_NOT_CONFIGURED');
  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_key: WEB3FORMS_ACCESS_KEY, subject, from_name: 'Сайт ЩУПЫ.РУ', email, message: text }),
    signal: AbortSignal.timeout(15_000),
    cache: 'no-store',
  });
  const result = await response.json().catch(() => null) as { success?: boolean; message?: string } | null;
  if (!response.ok || !result?.success) throw new Error(`WEB3FORMS_FAILED:${result?.message ?? response.status}`);
}

async function deliverInquiry(subject: string, text: string, email: string) {
  if (SMTP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST ?? 'smtp.mail.ru',
        port: Number(process.env.SMTP_PORT ?? 465), secure: true,
        connectionTimeout: 10_000, socketTimeout: 15_000,
        auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
      });
      await transporter.sendMail({ from: SMTP_USER, to: CONTACT_TO, replyTo: email || undefined, subject, text });
      return;
    } catch (error) {
      console.error('SMTP delivery failed; trying the configured fallback', error);
    }
  }
  await deliverWithWeb3Forms(subject, text, email);
}

export async function POST(request: Request) {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') {
    return Response.json({ success: false, error: 'Unsupported content type' }, { status: 415 });
  }
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return Response.json({ success: false, error: 'Payload too large' }, { status: 413 });
  }
  if (isRateLimited(clientIp(request))) {
    return Response.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
      return Response.json({ success: false, error: 'Payload too large' }, { status: 413 });
    }
    const data = parsePayload(JSON.parse(raw) as ContactPayload);
    if (!SMTP_PASSWORD) {
      console.error('Contact form is unavailable: SMTP is not configured');
      return Response.json({ success: false, error: 'Service temporarily unavailable' }, { status: 503 });
    }
    const subject = data.productSku ? `Запрос цены: ${data.productSku}` : data.cartJson ? 'Запрос цены по списку' : 'Новая заявка с сайта';
    const text = [
      `Имя: ${data.name}`, `Компания: ${data.company || '-'}`, `Email: ${data.email}`,
      `Телефон/контакт: ${data.phone || data.contact}`, `Сообщение: ${data.message || '-'}`, `Товар: ${data.productName || '-'}`,
      `Артикул: ${data.productSku || '-'}`, `Страница: ${data.pageUrl || '-'}`,
      `Станок/контроллер: ${data.machine || '-'}`, `Маркировка: ${data.marking || '-'}`,
      `Список позиций:\n${formatCart(data.cartJson)}`,
    ].join('\n');

    await deliverInquiry(subject, text, data.email);
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
