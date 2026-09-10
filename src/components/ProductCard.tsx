'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AddToCartButton } from '@/components/AddToCartButton';
import { FallbackImage } from '@/components/FallbackImage';
import { PRODUCT_IMAGE_PLACEHOLDER } from '@/lib/assets';
import { formatProductPrice } from '@/lib/product-format';
import type { CatalogProduct } from '@/lib/products';

const RFQForm = dynamic(() => import('@/components/RFQForm').then((module) => module.RFQForm), {
  loading: () => (
    <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
      Загружаем форму запроса…
    </div>
  ),
});

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const safeImages = product.images.length > 0 ? product.images : [PRODUCT_IMAGE_PLACEHOLDER];
  const safeImage = safeImages[0] ?? PRODUCT_IMAGE_PLACEHOLDER;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const topSpecs = Object.entries(product.specs ?? {}).filter(([, value]) => String(value).trim().length > 0).slice(0, 2);
  const hasPrice = typeof product.price === 'number';

  useEffect(() => {
    if (!isModalOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isModalOpen]);

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <Link href={`/catalog/${product.slug}`} aria-label={`Открыть товар: ${product.title}`}>
          <FallbackImage
            src={safeImage}
            fallbackSrc={[...safeImages.slice(1), PRODUCT_IMAGE_PLACEHOLDER]}
            alt={product.title}
            width={640}
            height={420}
            sizes="(min-width: 1280px) 256px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="h-52 w-full object-contain"
          />
        </Link>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            {product.article ? <p className="text-xs uppercase tracking-wide text-slate-500">Артикул: {product.article}</p> : null}
            <h2
              className="mt-1 break-words text-lg font-semibold text-slate-900 group-hover:text-slate-700"
              style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              <Link href={`/catalog/${product.slug}`}>{product.title}</Link>
            </h2>
          </div>

          <p className="text-sm text-slate-600">{product.category}</p>

          {topSpecs.length > 0 ? (
            <ul className="space-y-1 text-xs text-slate-600">
              {topSpecs.map(([key, value]) => (
                <li key={key} className="truncate">
                  <span className="font-medium text-slate-700">{key}:</span> {value}
                </li>
              ))}
            </ul>
          ) : null}
          {hasPrice ? <p className="text-base font-semibold text-slate-900">{formatProductPrice(product.price)}</p> : null}

          <div className={hasPrice ? 'mt-auto' : 'mt-auto grid grid-cols-[minmax(0,1fr),96px] items-end gap-2'}>
            {hasPrice ? (
              <AddToCartButton slug={product.slug} title={product.title} article={product.article} mode="order" />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-orange-500 px-2 text-sm font-medium text-white hover:bg-orange-600"
                >
                  Запросить цену
                </button>
                <AddToCartButton slug={product.slug} title={product.title} article={product.article} />
              </>
            )}
          </div>
        </div>
      </article>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-4" role="dialog" aria-modal="true" aria-label="Запросить цену и наличие">
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
