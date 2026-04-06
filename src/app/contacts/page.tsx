'use client';

import { FormEvent, useState } from 'react';

type ContactFormState = {
  name: string;
  contact: string;
  message: string;
};

const initialFormState: ContactFormState = {
  name: '',
  contact: '',
  message: '',
};

export default function ContactsPage() {
  const [formState, setFormState] = useState<ContactFormState>(initialFormState);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // TODO: подключить отправку формы (например, через API route или внешний сервис)
    console.log('Заявка из формы контактов', formState);

    setFormState(initialFormState);
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Контакты</h1>
        <p className="text-slate-700">Свяжитесь с нами удобным для вас способом.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Телефон</h2>
          <p className="mt-2 text-slate-900">+7 (000) 000-00-00</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Email</h2>
          <p className="mt-2 text-slate-900">info@example.ru</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Адрес</h2>
          <p className="mt-2 text-slate-900">Москва, ул. Примерная, 1</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Мессенджеры</h2>
          <p className="mt-2 text-slate-900">Telegram / WhatsApp / WeChat</p>
        </article>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold text-slate-900">Форма обратной связи</h2>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Имя</span>
          <input
            type="text"
            required
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-300 focus:ring"
            placeholder="Ваше имя"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Email или телефон</span>
          <input
            type="text"
            required
            value={formState.contact}
            onChange={(event) => setFormState((prev) => ({ ...prev, contact: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-300 focus:ring"
            placeholder="example@mail.ru / +7..."
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Сообщение</span>
          <textarea
            required
            rows={5}
            value={formState.message}
            onChange={(event) => setFormState((prev) => ({ ...prev, message: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-300 focus:ring"
            placeholder="Опишите ваш запрос"
          />
        </label>

        <button
          type="submit"
          className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Отправить
        </button>
      </form>
    </section>
  );
}
