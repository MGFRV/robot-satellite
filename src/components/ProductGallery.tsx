'use client';

import Image from 'next/image';
import { useState } from 'react';

type ProductGalleryProps = {
  title: string;
  images: string[];
};

export function ProductGallery({ title, images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="space-y-3">
      <Image
        src={images[activeIndex]}
        alt={`${title} — изображение ${activeIndex + 1}`}
        width={1000}
        height={700}
        unoptimized
        className="h-80 w-full rounded-lg border border-slate-200 object-cover"
      />
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={image}
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
              unoptimized
              className="h-20 w-full object-cover"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
