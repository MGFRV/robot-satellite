'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { AddToCartButton } from '@/components/AddToCartButton';
import { RFQForm } from '@/components/RFQForm';
import { PRODUCT_IMAGE_PLACEHOLDER } from '@/lib/assets';
import { formatProductPrice } from '@/lib/product-format';
import type { Product } from '@/lib/products';
import { RFQForm } from '@/components/RFQForm';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const previewImage = product.images[0] ?? PRODUCT_IMAGE_PLACEHOLDER;
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <article className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <Link href={`/catalog/${product.slug}`} className="absolute inset-0 z-0 cursor-pointer" aria-label={product.title} />

        <div className="relative z-10">
          <Image src={previewImage} alt={product.title} width={640} height={420} className="h-52 w-full object-cover" />
          <div className="space-y-3 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Артикул: {product.article}</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-slate-700">{product.title}</h2>
            </div>
            <p className="text-sm text-slate-600">{product.category}</p>
            {typeof product.price === 'number' ? <p className="text-base font-semibold text-slate-900">{formatProductPrice(product.price)}</p> : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsModalOpen(true);
                }}
                className="inline-flex rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                Запросить цену
              </button>
              <AddToCartButton slug={product.slug} title={product.title} article={product.article} />
            </div>
          </div>
        </div>
      </article>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-4">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700"
              >
                Закрыть
              </button>
            </div>
            <RFQForm
              title="Запросить цену и наличие"
              productName={product.title}
              productSku={product.article}
              subject={`Запрос цены: ${product.article} ${product.title}`}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
