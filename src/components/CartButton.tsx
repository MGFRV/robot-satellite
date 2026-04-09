'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { INQUIRY_CART_EVENT, getInquiryCart } from '@/lib/inquiry-cart';

export function CartButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getInquiryCart().length);

    sync();
    window.addEventListener(INQUIRY_CART_EVENT, sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener(INQUIRY_CART_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return (
    <Link href="/cart" className="relative inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700">
      Список запроса
      {count > 0 ? (
        <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-semibold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
