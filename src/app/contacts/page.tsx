import type { Metadata } from 'next';

import { ContactsPageClient } from './ContactsPageClient';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Контакты ЩУПЫ.РУ — заказать щупы и датчики Renishaw',
  description: 'Телефон, email и мессенджеры ЩУПЫ.РУ для заказа щупов, стилусов, датчиков и комплектующих Renishaw. Отправьте заявку или вопрос специалисту.',
};

export default function ContactsPage() {
  return <div className="space-y-10"><section className="rounded-xl border bg-white p-6"><h1 className="text-3xl font-bold">Контакты и реквизиты</h1><dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
    <div><dt className="font-semibold">Полное наименование</dt><dd>{SITE.legalName}</dd></div><div><dt className="font-semibold">Краткое наименование</dt><dd>{SITE.shortName}</dd></div>
    <div><dt className="font-semibold">ИНН / КПП</dt><dd>{SITE.taxId} / {SITE.kpp}</dd></div><div><dt className="font-semibold">ОГРН</dt><dd>{SITE.ogrn}</dd></div>
    <div><dt className="font-semibold">Юридический адрес</dt><dd>{SITE.legalAddress}</dd></div><div><dt className="font-semibold">Фактический адрес</dt><dd>{SITE.address}</dd></div>
    <div><dt className="font-semibold">Банковские реквизиты</dt><dd>{SITE.bankDetails}</dd></div><div><dt className="font-semibold">Режим работы</dt><dd>{SITE.hours}</dd></div>
  </dl><a className="mt-5 inline-flex rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white" href="/company-card.pdf" download>Скачать карточку предприятия (PDF)</a></section><ContactsPageClient /></div>;
}
