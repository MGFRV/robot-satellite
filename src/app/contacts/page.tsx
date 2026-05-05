'use client';

import { useState } from 'react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setStatus('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
              subject: 'Запрос цены с сайта',
          from_name: 'Сайт Renishaw',
          ...formState,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка отправки');
      }

      setStatus('success');
      setFormState(initialFormState);
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Контакты</h1>
        <p className="text-slate-700">Свяжитесь с ЩУПЫ.РУ удобным для вас способом.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Телефон</h2>
          <p className="mt-2 text-slate-900">+7 961 137-59-74</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Email</h2>
          <p className="mt-2 text-slate-900">zakaz@schupy.ru</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">WhatsApp</h2>
          <p className="mt-2 text-slate-900">+7 961 137-59-74</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Telegram</h2>
          <p className="mt-2 text-slate-900">@schupy_ru</p>
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
            className="w-full rounded-md border border-slate-300 px-3 py-2"
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
            className="w-full rounded-md border border-slate-300 px-3 py-2"
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
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="Опишите ваш запрос"
          />
        </label>

        {status === 'success' ? (
          <p className="text-sm text-emerald-700">Заявка отправлена. Мы скоро свяжемся с вами.</p>
        ) : null}
        {status === 'error' ? (
          <p className="text-sm text-rose-600">Ошибка отправки. Напишите нам напрямую: zakaz@schupy.ru или звоните +7 961 137-59-74</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          {isSubmitting ? 'Отправляем...' : 'Отправить'}
        </button>
      </form>
    </section>
  );
}
