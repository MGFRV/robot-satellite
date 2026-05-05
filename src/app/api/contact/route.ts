import nodemailer from 'nodemailer';

const SMTP_USER = process.env.SMTP_USER ?? 'zakaz@schupy.ru';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const CONTACT_TO = process.env.CONTACT_TO ?? SMTP_USER;

const transporter = nodemailer.createTransport({
  host: 'smtp.mail.ru',
  port: 465,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

type ContactPayload = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  contact?: string;
  message?: string;
  subject?: string;
  productName?: string;
  productSku?: string;
  pageUrl?: string;
  machine?: string;
  marking?: string;
  cart_json?: string;
};

export async function POST(request: Request) {
  if (!SMTP_PASSWORD) {
    return Response.json({ success: false, error: 'SMTP_PASSWORD is not configured' }, { status: 500 });
  }

  const body = (await request.json()) as ContactPayload;
  const {
    name = '',
    company = '',
    email = '',
    phone = '',
    contact = '',
    message = '',
    subject = 'Новая заявка с сайта',
    productName = '',
    productSku = '',
    pageUrl = '',
    machine = '',
    marking = '',
    cart_json = '',
  } = body;

  const text = [
    `Имя: ${name || '-'}`,
    `Компания: ${company || '-'}`,
    `Email: ${email || '-'}`,
    `Телефон: ${phone || contact || '-'}`,
    `Сообщение: ${message || '-'}`,
    `Товар: ${productName || '-'}`,
    `Артикул: ${productSku || '-'}`,
    `Страница: ${pageUrl || '-'}`,
    `Станок/контроллер: ${machine || '-'}`,
    `Маркировка: ${marking || '-'}`,
    `Корзина JSON: ${cart_json || '-'}`,
  ].join('\n');

  try {
    await transporter.sendMail({
      from: SMTP_USER,
      to: CONTACT_TO,
      replyTo: email || undefined,
      subject,
      text,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
