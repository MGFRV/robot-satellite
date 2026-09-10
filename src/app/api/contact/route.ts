import nodemailer from 'nodemailer';

const SMTP_USER = process.env.SMTP_USER ?? 'zakaz@schupy.ru';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const CONTACT_TO = process.env.CONTACT_TO ?? SMTP_USER;
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
  if (!SMTP_PASSWORD) {
    console.error('Contact form is unavailable: SMTP is not configured');
    return Response.json({ success: false, error: 'Service temporarily unavailable' }, { status: 503 });
  }

  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
      return Response.json({ success: false, error: 'Payload too large' }, { status: 413 });
    }
    const data = parsePayload(JSON.parse(raw) as ContactPayload);
    const subject = data.productSku ? `Запрос цены: ${data.productSku}` : data.cartJson ? 'Запрос цены по списку' : 'Новая заявка с сайта';
    const text = [
      `Имя: ${data.name}`, `Компания: ${data.company || '-'}`, `Email: ${data.email}`,
      `Телефон/контакт: ${data.phone || data.contact}`, `Сообщение: ${data.message || '-'}`, `Товар: ${data.productName || '-'}`,
      `Артикул: ${data.productSku || '-'}`, `Страница: ${data.pageUrl || '-'}`,
      `Станок/контроллер: ${data.machine || '-'}`, `Маркировка: ${data.marking || '-'}`,
      `Корзина JSON: ${data.cartJson || '-'}`,
    ].join('\n');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp.mail.ru',
      port: Number(process.env.SMTP_PORT ?? 465), secure: true,
      connectionTimeout: 10_000, socketTimeout: 15_000,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    });
    await transporter.sendMail({ from: SMTP_USER, to: CONTACT_TO, replyTo: data.email || undefined, subject, text });
    return Response.json({ success: true });
  } catch (error) {
    const invalid = error instanceof SyntaxError || (error instanceof Error && /Поле|Некоррект|Spam/.test(error.message));
    if (!invalid) console.error('Contact form delivery failed', error);
    return Response.json({ success: false, error: invalid ? 'Invalid request' : 'Delivery failed' }, { status: invalid ? 400 : 502 });
  }
}
