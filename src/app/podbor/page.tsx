'use client';

import { useState } from 'react';

import { TrustBlock } from '@/components/TrustBlock';

type PodborState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  machine: string;
  marking: string;
  message: string;
};

const WEB3FORM_ACCESS_KEY = 'efb5634c-52e7-4950-9f5c-5ad0b50d1bcf';

const initialState: PodborState = {
  name: '',
  company: '',
  email: '',
  phone: '',
  machine: '',
  marking: '',
  message: '',
};

export default function PodborPage() {
  const [formState, setFormState] = useState<PodborState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formState.name || !formState.email || !formState.phone) {
      setErrorMessage('Заполните обязательные поля: имя, email и телефон/WhatsApp.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      access_key: WEB3FORM_ACCESS_KEY,
      subject: 'Помочь подобрать деталь',
      from_name: 'Сайт Renishaw',
      ...formState,
    };

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Ошибка запроса');
      }

      setIsSuccess(true);
      setFormState(initialState);
    } catch {
      setErrorMessage('Ошибка отправки. Напишите нам напрямую: info@example.ru');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">Помочь подобрать деталь</h1>
        <p className="text-slate-700">
          Если вы не уверены в артикуле, нужна замена или хотите проверить совместимость — отправьте запрос, мы
          поможем.
        </p>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-semibold text-slate-900">Когда обращаться</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>Не знаете точный артикул</li>
          <li>Нужно проверить совместимость со станком</li>
          <li>Ищете замену или аналог</li>
          <li>Хотите уточнить по фото/маркировке</li>
        </ul>
      </div>

      <div id="rfq-form" className="rounded-xl border border-slate-200 bg-white p-5">
        {isSuccess ? (
          <div className="space-y-3 rounded-lg bg-emerald-50 p-4">
            <h3 className="text-lg font-semibold text-emerald-900">Заявка отправлена</h3>
            <p className="text-sm text-emerald-800">Мы свяжемся с вами в течение 2 часов.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Имя *"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Компания"
                value={formState.company}
                onChange={(event) => setFormState((prev) => ({ ...prev, company: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="email"
                placeholder="Email *"
                value={formState.email}
                onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Телефон / WhatsApp *"
                value={formState.phone}
                onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Станок / контроллер"
                value={formState.machine}
                onChange={(event) => setFormState((prev) => ({ ...prev, machine: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Маркировка на детали"
                value={formState.marking}
                onChange={(event) => setFormState((prev) => ({ ...prev, marking: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <textarea
              rows={5}
              placeholder="Сообщение"
              value={formState.message}
              onChange={(event) => setFormState((prev) => ({ ...prev, message: event.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />

            {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              {isSubmitting ? 'Отправляем...' : 'Отправить запрос'}
            </button>
          </form>
        )}
      </div>

      <p className="text-sm text-slate-700">
        Также вы можете отправить фото маркировки на info@example.ru или в WhatsApp +7 (000) 000-00-00.
      </p>
    </section>
  );
}
