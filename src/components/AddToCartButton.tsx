'use client';

import { useEffect, useState } from 'react';

import { INQUIRY_CART_EVENT, addItemToInquiryCart, getInquiryCart, removeInquiryItem } from '@/lib/inquiry-cart';

type AddToCartButtonProps = {
  slug: string;
  title: string;
  article: string;
  className?: string;
};

export function AddToCartButton({ slug, title, article, className }: AddToCartButtonProps) {
  const [alreadyAdded, setAlreadyAdded] = useState(false);
  const [toast, setToast] = useState('');
  const [quantity, setQuantity] = useState(1);

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
    'inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-800 hover:bg-slate-100';

  return (
    <div className="relative grid grid-cols-[64px,1fr] gap-2">
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
        className="h-10 rounded-md border border-slate-300 px-2 text-sm"
      />

      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();

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
        }}
        className={`${baseClassName} ${alreadyAdded ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50' : ''}`}
      >
        {alreadyAdded ? '✓' : '+'}
      </button>

      {toast ? <span className="absolute -top-9 left-0 rounded bg-slate-900 px-2 py-1 text-xs text-white">{toast}</span> : null}
    </div>
  );
}
