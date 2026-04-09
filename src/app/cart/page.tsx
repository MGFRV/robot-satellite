'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import {
  clearInquiryCart,
  getInquiryCart,
  removeInquiryItem,
  type InquiryCartItem,
  updateInquiryItemQuantity,
} from '@/lib/inquiry-cart';

const WEB3FORM_ACCESS_KEY = 'efb5634c-52e7-4950-9f5c-5ad0b50d1bcf';

export default function CartPage() {
  const [items, setItems] = useState<InquiryCartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [formState, setFormState] = useState({ name: '', company: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const sync = () => setItems(getInquiryCart());

    sync();
    setIsHydrated(true);

    window.addEventListener('inquiry-cart-updated', sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener('inquiry-cart-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const cartPayload = useMemo(
    () =>
      items.map((item) => ({
        article: item.article,
        title: item.title,
        quantity: item.quantity,
      })),
    [items],
  );

  async function submitInquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (items.length === 0) {
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORM_ACCESS_KEY,
          subject: `Запрос цены на ${items.length} позиций`,
          from_name: 'Сайт Renishaw',
          name: formState.name,
          company: formState.company,
          email: formState.email,
          phone: formState.phone,
          message: `${formState.message}\n\nСписок позиций:\n${cartPayload
            .map((item) => `- ${item.article} | ${item.title} | Кол-во: ${item.quantity}`)
            .join('\n')}`,
          cart_json: JSON.stringify(cartPayload),
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка');
      }

      clearInquiryCart();
      setItems([]);
      setFormState({ name: '', company: '', email: '', phone: '', message: '' });
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Ваша корзина товаров</h1>

      {!isHydrated ? <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">Загрузка списка...</div> : null}

      {isHydrated && items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-slate-700">Список пуст. Перейдите в каталог, чтобы выбрать детали.</p>
          <Link href="/catalog" className="mt-3 inline-flex text-sm font-semibold text-orange-600 hover:text-orange-700">
            Перейти в каталог
          </Link>
        </div>
      ) : null}

      {isHydrated && items.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">Артикул</th>
                  <th className="px-4 py-3">Название</th>
                  <th className="px-4 py-3">Количество</th>
                  <th className="px-4 py-3 text-center">Удалить</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.slug} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <Link href={`/catalog/${item.slug}`} className="hover:text-orange-600">
                        {item.article}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.title}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) => {
                          const nextQuantity = Number(event.target.value) || 1;
                          setItems(updateInquiryItemQuantity(item.slug, nextQuantity));
                        }}
                        className="w-20 rounded-md border border-slate-300 px-2 py-1"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setItems(removeInquiryItem(item.slug))}
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-700 hover:bg-slate-100"
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() => {
              clearInquiryCart();
              setItems([]);
            }}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Очистить список
          </button>

          <form onSubmit={submitInquiry} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900">Отправить запрос на {items.length} позиций</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                required
                type="text"
                placeholder="Имя"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2"
              />
              <input
                type="text"
                placeholder="Компания"
                value={formState.company}
                onChange={(event) => setFormState((prev) => ({ ...prev, company: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={formState.email}
                onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2"
              />
              <input
                required
                type="text"
                placeholder="Телефон / WhatsApp"
                value={formState.phone}
                onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2"
              />
            </div>

            <textarea
              rows={4}
              placeholder="Сообщение"
              value={formState.message}
              onChange={(event) => setFormState((prev) => ({ ...prev, message: event.target.value }))}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />

            <input type="hidden" name="cart_json" value={JSON.stringify(cartPayload)} readOnly />

            {status === 'success' ? <p className="text-sm text-emerald-700">Запрос отправлен успешно. Список очищен.</p> : null}
            {status === 'error' ? (
              <p className="text-sm text-rose-600">Ошибка отправки. Напишите нам напрямую: info@example.ru</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              {isSubmitting ? 'Отправляем...' : 'Отправить запрос'}
            </button>
          </form>
        </>
      ) : null}
    </section>
  );
}
