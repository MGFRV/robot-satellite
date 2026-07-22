import type { Metadata } from 'next';

import { ContactsPageClient } from './ContactsPageClient';

export const metadata: Metadata = {
  title: 'Контакты ЩУПЫ.РУ — заказать щупы и датчики Renishaw',
  description: 'Телефон, email и мессенджеры ЩУПЫ.РУ для заказа щупов, стилусов, датчиков и комплектующих Renishaw. Отправьте заявку или вопрос специалисту.',
};

export default function ContactsPage() {
  return <ContactsPageClient />;
}
