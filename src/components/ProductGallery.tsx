'use client';

import Image from 'next/image';
import { useState } from 'react';

import { PRODUCT_IMAGE_PLACEHOLDER } from '@/lib/assets';

type ProductGalleryProps = {
  title: string;
  images: string[];
};

export function ProductGallery({ title, images }: ProductGalleryProps) {
  const safeImages = images.length > 0 ? images : [PRODUCT_IMAGE_PLACEHOLDER];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <section className="space-y-3">
      <button type="button" onClick={() => setIsLightboxOpen(true)} className="block w-full">
        <Image
          src={safeImages[activeIndex]}
          alt={`${title} — изображение ${activeIndex + 1}`}
          width={1000}
          height={700}
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="h-80 w-full rounded-lg border border-slate-200 object-cover"
        />
      </button>
      <div className="grid grid-cols-4 gap-2">
        {safeImages.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`overflow-hidden rounded-md border ${
              index === activeIndex ? 'border-slate-900' : 'border-slate-300'
            }`}
          >
            <Image
              src={image}
              alt={`${title} превью ${index + 1}`}
              width={180}
              height={140}
              sizes="(min-width: 1024px) 12vw, 25vw"
              className="h-20 w-full object-cover"
            />
          </button>
        ))}
      </div>

      {isLightboxOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/85 p-4" onClick={() => setIsLightboxOpen(false)}>
          <div className="relative w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <Image
              src={safeImages[activeIndex]}
              alt={`${title} — увеличенное изображение`}
              width={1400}
              height={1000}
              sizes="100vw"
              className="max-h-[85vh] w-full rounded-lg object-contain"
            />
            {safeImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev <= 0 ? safeImages.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded bg-white/90 px-3 py-2"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev >= safeImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-white/90 px-3 py-2"
                >
                  ›
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
