'use client';

import { useEffect, useState } from 'react';

import { INQUIRY_CART_EVENT, getInquiryCart } from '@/lib/inquiry-cart';

type ProductPrimaryActionProps = {
  slug: string;
};

export function ProductPrimaryAction({ slug }: ProductPrimaryActionProps) {
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    const sync = () => setInCart(getInquiryCart().some((item) => item.slug === slug));

    sync();
    window.addEventListener(INQUIRY_CART_EVENT, sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener(INQUIRY_CART_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [slug]);

  if (inCart) {
    return (
      <a href="/cart" className="inline-flex rounded-md bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600">
        Перейти в корзину
      </a>
    );
  }

  return (
    <a href="#rfq-form" className="inline-flex rounded-md bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600">
      Запросить цену и наличие
    </a>
  );
}
