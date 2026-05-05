'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type RFQFormProps = {
  productName?: string;
  productSku?: string;
  pageUrl?: string;
  title?: string;
  subject?: string;
};

type RFQFormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
};

type RFQFormErrors = Partial<Record<keyof RFQFormState, string>>;

const WEB3FORM_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? '5e837837-b769-4e1a-bb18-2d3fbe7a3a9b';

const initialState: RFQFormState = {
  name: '',
  company: '',
  email: '',
  phone: '',
  message: '',
};

export function RFQForm({ productName, productSku, pageUrl, title, subject }: RFQFormProps) {
  const [formState, setFormState] = useState<RFQFormState>(initialState);
  const [formErrors, setFormErrors] = useState<RFQFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resolvedUrl, setResolvedUrl] = useState(pageUrl ?? '');

  useEffect(() => {
    if (!pageUrl && typeof window !== 'undefined') {
      setResolvedUrl(window.location.href);
    }
  }, [pageUrl]);

  const resolvedTitle = title ?? 'Запросить цену и наличие';

  const resolvedSubject = useMemo(() => {
    if (subject) {
      return subject;
    }

    if (productName || productSku) {
      return `Запрос цены: ${productSku ?? ''} ${productName ?? ''}`.trim();
    }

    return 'Запрос цены с сайта';
  }, [productName, productSku, subject]);

  function validate(): RFQFormErrors {
    const errors: RFQFormErrors = {};

    if (!formState.name.trim()) {
      errors.name = 'Укажите имя';
    }

    if (!formState.email.trim()) {
      errors.email = 'Укажите email';
    }

    if (!formState.phone.trim()) {
      errors.phone = 'Укажите телефон или WhatsApp';
    }

    return errors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validate();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (!WEB3FORM_ACCESS_KEY) {
      setErrorMessage('Форма временно недоступна. Напишите нам напрямую: zakaz@schupy.ru');
      return;
    }

    const payload = {
      access_key: WEB3FORM_ACCESS_KEY,
      subject: resolvedSubject,
      from_name: 'Сайт ЩУПЫ.РУ',
      name: formState.name,
      company: formState.company,
      email: formState.email,
      phone: formState.phone,
      message: formState.message,
      productName,
      productSku,
      pageUrl: resolvedUrl,
    };

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Не удалось отправить форму');
      }

      setIsSuccess(true);
      setFormState(initialState);
    } catch {
      setErrorMessage('Ошибка отправки. Напишите нам напрямую: zakaz@schupy.ru');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <h3 className="text-lg font-semibold text-emerald-900">Заявка отправлена!</h3>
        <p className="text-sm text-emerald-800">
          Мы свяжемся с вами в течение 2 часов. Для срочных вопросов: WhatsApp +7 961 137-59-74 / Email
          zakaz@schupy.ru
        </p>
        <Link href="/catalog" className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Вернуться к каталогу
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-xl font-semibold text-slate-900">{resolvedTitle}</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Имя *</span>
          <input
            type="text"
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Иван"
          />
          {formErrors.name ? <span className="text-xs text-rose-600">{formErrors.name}</span> : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Компания</span>
          <input
            type="text"
            value={formState.company}
            onChange={(event) => setFormState((prev) => ({ ...prev, company: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="ООО Пример"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Email *</span>
          <input
            type="email"
            value={formState.email}
            onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="mail@example.ru"
          />
          {formErrors.email ? <span className="text-xs text-rose-600">{formErrors.email}</span> : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Телефон / WhatsApp *</span>
          <input
            type="text"
            value={formState.phone}
            onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="+7..."
          />
          {formErrors.phone ? <span className="text-xs text-rose-600">{formErrors.phone}</span> : null}
        </label>
      </div>

      <label className="space-y-1">
        <span className="text-sm font-medium text-slate-700">Сообщение</span>
        <textarea
          rows={4}
          value={formState.message}
          onChange={(event) => setFormState((prev) => ({ ...prev, message: event.target.value }))}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Укажите нужное количество, сроки и город доставки"
        />
      </label>

      {productName ? <input type="hidden" name="productName" value={productName} /> : null}
      {productSku ? <input type="hidden" name="productSku" value={productSku} /> : null}
      {resolvedUrl ? <input type="hidden" name="pageUrl" value={resolvedUrl} /> : null}

      {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Отправляем...' : 'Отправить запрос'}
      </button>
    </form>
  );
}
