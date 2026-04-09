'use client';

import { useEffect, useState } from 'react';

import { INQUIRY_CART_EVENT, addItemToInquiryCart, getInquiryCart } from '@/lib/inquiry-cart';

type AddToCartButtonProps = {
  slug: string;
  title: string;
  article: string;
  className?: string;
};

export function AddToCartButton({ slug, title, article, className }: AddToCartButtonProps) {
  const [alreadyAdded, setAlreadyAdded] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const sync = () => {
      const inCart = getInquiryCart().some((item) => item.slug === slug);
      setAlreadyAdded(inCart);
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
    className ?? 'inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();

          if (alreadyAdded) {
            return;
          }

          const result = addItemToInquiryCart({ slug, title, article });
          if (result.added) {
            setAlreadyAdded(true);
            setToast('Добавлено в запрос');
            window.setTimeout(() => setToast(''), 2000);
          }
        }}
        className={`${baseClassName} ${alreadyAdded ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50' : ''}`}
      >
        {alreadyAdded ? 'Уже в запросе ✓' : '+ В запрос'}
      </button>

      {toast ? <span className="absolute -top-9 left-0 rounded bg-slate-900 px-2 py-1 text-xs text-white">{toast}</span> : null}
    </div>
  );
}
