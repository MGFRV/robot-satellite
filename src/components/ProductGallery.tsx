'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { isExternalStorageImage, PRODUCT_IMAGE_PLACEHOLDER } from '@/lib/assets';

type ProductGalleryProps = {
  title: string;
  images: string[];
};

export function ProductGallery({ title, images }: ProductGalleryProps) {
  const safeImages = images.length > 0 ? images : [PRODUCT_IMAGE_PLACEHOLDER];
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const displayImages = safeImages.filter((image) => image === PRODUCT_IMAGE_PLACEHOLDER || !failedImages.has(image));
  const galleryImages = displayImages.length > 0 ? displayImages : [PRODUCT_IMAGE_PLACEHOLDER];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const activeImage = galleryImages[Math.min(activeIndex, galleryImages.length - 1)] ?? PRODUCT_IMAGE_PLACEHOLDER;

  useEffect(() => {
    if (activeIndex >= galleryImages.length) {
      setActiveIndex(Math.max(0, galleryImages.length - 1));
    }
  }, [activeIndex, galleryImages.length]);

  function handleImageError(image: string) {
    if (image === PRODUCT_IMAGE_PLACEHOLDER) {
      return;
    }

    setFailedImages((previous) => {
      const next = new Set(previous);
      next.add(image);
      return next;
    });
  }

  return (
    <section className="space-y-3">
      <button type="button" onClick={() => setIsLightboxOpen(true)} className="block w-full">
        <Image
          src={activeImage}
          alt={`${title} — изображение ${activeIndex + 1}`}
          width={1000}
          height={700}
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="h-80 w-full rounded-lg border border-slate-200 object-cover"
          onError={() => handleImageError(activeImage)}
          unoptimized={isExternalStorageImage(activeImage)}
        />
      </button>
      <div className="grid grid-cols-4 gap-2">
        {galleryImages.map((image, index) => (
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
              onError={() => handleImageError(image)}
              unoptimized={isExternalStorageImage(image)}
            />
          </button>
        ))}
      </div>

      {isLightboxOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/85 p-4" onClick={() => setIsLightboxOpen(false)}>
          <div className="relative w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <Image
              src={activeImage}
              alt={`${title} — увеличенное изображение`}
              width={1400}
              height={1000}
              sizes="100vw"
              className="max-h-[85vh] w-full rounded-lg object-contain"
              onError={() => handleImageError(activeImage)}
              unoptimized={isExternalStorageImage(activeImage)}
            />
            {galleryImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev <= 0 ? galleryImages.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded bg-white/90 px-3 py-2"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev >= galleryImages.length - 1 ? 0 : prev + 1))}
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
