'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AddToCartButton } from '@/components/AddToCartButton';
import { RFQForm } from '@/components/RFQForm';
import { PRODUCT_IMAGE_PLACEHOLDER } from '@/lib/assets';
import { formatProductPrice } from '@/lib/product-format';
import type { Product } from '@/lib/products';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const safeImages = product.images.length > 0 ? product.images : [PRODUCT_IMAGE_PLACEHOLDER];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const router = useRouter();

  return (
    <>
      <article
        role="link"
        tabIndex={0}
        onClick={() => router.push(`/catalog/${product.slug}`)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            router.push(`/catalog/${product.slug}`);
          }
        }}
        className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setGalleryIndex(0);
            setIsGalleryOpen(true);
          }}
          className="block"
        >
          <Image src={safeImages[0]} alt={product.title} width={640} height={420} className="h-52 w-full object-cover" />
        </button>

        <div className="flex flex-1 flex-col space-y-3 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Артикул: {product.article}</p>
            <h2
              className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-slate-700"
              style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {product.title}
            </h2>
          </div>

          <p className="text-sm text-slate-600">{product.category}</p>
          {typeof product.price === 'number' ? <p className="text-base font-semibold text-slate-900">{formatProductPrice(product.price)}</p> : null}

          <div className="mt-auto grid grid-cols-[1fr,1fr] items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsModalOpen(true);
              }}
              className="inline-flex h-10 items-center justify-center rounded-md bg-orange-500 px-3 text-sm font-medium text-white hover:bg-orange-600"
            >
              Запросить цену
            </button>
            <AddToCartButton slug={product.slug} title={product.title} article={product.article} />
          </div>
        </div>
      </article>

      {isGalleryOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/80 p-4"
          onClick={() => setIsGalleryOpen(false)}
        >
          <div className="relative w-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
            <Image
              src={safeImages[galleryIndex]}
              alt={`${product.title} ${galleryIndex + 1}`}
              width={1200}
              height={900}
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
            {safeImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => setGalleryIndex((prev) => (prev <= 0 ? safeImages.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded bg-white/90 px-3 py-2 text-sm"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryIndex((prev) => (prev >= safeImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-white/90 px-3 py-2 text-sm"
                >
                  ›
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

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
