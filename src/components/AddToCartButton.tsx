'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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

  const compactButtonClassName =
    className ??
    'inline-flex h-11 items-center justify-center whitespace-nowrap rounded-md border border-slate-300 bg-transparent px-3 text-sm font-medium text-slate-800 hover:text-slate-950';
  const orderButtonClassName =
    className ?? 'inline-flex h-11 items-center justify-center whitespace-nowrap rounded-md bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600';
  const iconButtonClassName =
    'inline-flex h-11 items-center justify-center whitespace-nowrap rounded-md border border-slate-300 bg-transparent px-3 text-sm font-medium text-slate-800 hover:text-slate-950';

  const addToCart = () => {
    const normalizedQuantity = Math.max(1, quantity);

    if (alreadyAdded) {
      updateInquiryItemQuantity(slug, normalizedQuantity);
      setIsConfirmationOpen(true);
      return;
    }

    const result = addItemToInquiryCart({ slug, title, article }, normalizedQuantity);
    if (result.added) {
      setAlreadyAdded(true);
    }
    setIsConfirmationOpen(true);
  };

  const toggleCompactCart = () => {
    if (alreadyAdded) {
      removeInquiryItem(slug);
      setAlreadyAdded(false);
      setToast('Удалено из корзины');
      window.setTimeout(() => setToast(''), 2000);
      return;
    }

    const result = addItemToInquiryCart({ slug, title, article }, quantity);
    if (result.added) {
      setAlreadyAdded(true);
      setToast('Добавлено в корзину');
      window.setTimeout(() => setToast(''), 2000);
    }
  };

  const quantityInput = (
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
  );

  const confirmationModal = isConfirmationOpen
    ? createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/70 p-4">
          <div className="relative w-full max-w-sm bg-white p-7 text-center shadow-xl">
            <button
              type="button"
              aria-label="Закрыть"
              onClick={() => setIsConfirmationOpen(false)}
              className="absolute right-3 top-3 text-xl leading-none text-slate-500 hover:text-slate-700"
            >
              ×
            </button>
            <h2 className="text-lg font-medium text-slate-900">Товар добавлен в заказ</h2>
            <p className="mx-auto mt-3 max-w-64 text-sm text-slate-600">{title}</p>
            <a
              href="https://schupy.ru/cart"
              className="mt-5 inline-flex h-11 items-center justify-center rounded bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600"
            >
              К заказу
            </a>
            <button
              type="button"
              onClick={() => setIsConfirmationOpen(false)}
              className="mt-3 block w-full text-sm text-slate-700 underline underline-offset-2 hover:text-slate-950"
            >
              Вернуться в каталог
            </button>
          </div>
        </div>,
        document.body,
      )
    : null;

  if (isOrderMode) {
    return (
      <>
        <div className="relative grid h-11 w-full grid-cols-[minmax(0,1fr),44px,44px] gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              addToCart();
            }}
            className={orderButtonClassName}
          >
            Заказать
          </button>
          {quantityInput}
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              addToCart();
            }}
            className={iconButtonClassName}
          >
            +
          </button>
        </div>
        {confirmationModal}
      </>
    );
  }

  return (
    <div className="relative grid h-11 grid-cols-[44px,1fr] gap-2">
      {quantityInput}

      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleCompactCart();
        }}
        className={`${compactButtonClassName} ${alreadyAdded ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50' : ''}`}
      >
        {alreadyAdded ? '✓' : '+'}
      </button>

      {toast ? <span className="absolute -top-9 left-0 rounded bg-slate-900 px-2 py-1 text-xs text-white">{toast}</span> : null}
    </div>
  );
}
