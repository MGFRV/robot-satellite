'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  INQUIRY_CART_EVENT,
  addItemToInquiryCart,
  getInquiryCart,
  removeInquiryItem,
  updateInquiryItemQuantity,
} from '@/lib/inquiry-cart';

type AddToCartButtonMode = 'compact' | 'order';

type AddToCartButtonProps = {
  slug: string;
  title: string;
  article: string;
  className?: string;
  mode?: AddToCartButtonMode;
};

export function AddToCartButton({ slug, title, article, className, mode = 'compact' }: AddToCartButtonProps) {
  const [alreadyAdded, setAlreadyAdded] = useState(false);
  const [toast, setToast] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const isOrderMode = mode === 'order';

  useEffect(() => {
    const sync = () => {
      const cartItems = getInquiryCart();
      const cartItem = cartItems.find((item) => item.slug === slug);
      setAlreadyAdded(Boolean(cartItem));
      if (cartItem) {
        setQuantity(cartItem.quantity);
      }
    };

    sync();
    window.addEventListener(INQUIRY_CART_EVENT, sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener(INQUIRY_CART_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [slug]);

  const baseClassName =
    className ??
    (isOrderMode
      ? 'inline-flex h-11 items-center justify-center whitespace-nowrap rounded-md bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600'
      : 'inline-flex h-11 items-center justify-center whitespace-nowrap rounded-md border border-slate-300 bg-transparent px-3 text-sm font-medium text-slate-800 hover:text-slate-950');

  const addToCart = () => {
    const normalizedQuantity = Math.max(1, quantity);

    if (alreadyAdded) {
      if (isOrderMode) {
        updateInquiryItemQuantity(slug, normalizedQuantity);
        setIsConfirmationOpen(true);
        return;
      }

      removeInquiryItem(slug);
      setAlreadyAdded(false);
      setToast('Удалено из корзины');
      window.setTimeout(() => setToast(''), 2000);
      return;
    }

    const result = addItemToInquiryCart({ slug, title, article }, normalizedQuantity);
    if (result.added) {
      setAlreadyAdded(true);
    }

    if (isOrderMode) {
      setIsConfirmationOpen(true);
      return;
    }

    if (result.added) {
      setToast('Добавлено в корзину');
      window.setTimeout(() => setToast(''), 2000);
    }
  };

  return (
    <>
      <div className={`relative grid h-11 gap-2 ${isOrderMode ? 'w-full max-w-full grid-cols-[72px,minmax(0,1fr)] sm:max-w-sm' : 'grid-cols-[44px,1fr]'}`}>
        <input
          type="number"
          min={1}
          value={quantity}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onChange={(event) => {
            const next = Number(event.target.value) || 1;
            setQuantity(Math.max(1, next));
          }}
          className="h-11 rounded-md border border-slate-300 bg-transparent px-1 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100"
        />

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            addToCart();
          }}
          className={`${baseClassName} ${alreadyAdded && !isOrderMode ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50' : ''}`}
        >
          {isOrderMode ? 'Заказать' : alreadyAdded ? '✓' : '+'}
        </button>

        {toast ? <span className="absolute -top-9 left-0 rounded bg-slate-900 px-2 py-1 text-xs text-white">{toast}</span> : null}
      </div>

      {isConfirmationOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">Товар добавлен в заказ</h2>
            <p className="mt-2 text-sm text-slate-600">Товар добавлен в заказ «{title}».</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/cart"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600"
              >
                К заказу
              </Link>
              <Link
                href="/catalog"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                onClick={() => setIsConfirmationOpen(false)}
              >
                Вернуться в каталог
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setIsConfirmationOpen(false)}
              className="mt-4 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Закрыть
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
