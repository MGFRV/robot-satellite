'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

type FallbackImageProps = Omit<ImageProps, 'src'> & {
  src: string;
  fallbackSrc: string | string[];
};

export function FallbackImage({ src, fallbackSrc, alt, onError, ...props }: FallbackImageProps) {
  const fallbackSources = Array.isArray(fallbackSrc) ? fallbackSrc : [fallbackSrc];
  const sources = [src, ...fallbackSources].filter((image, index, list) => image && list.indexOf(image) === index);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSrc = sources[currentIndex] ?? fallbackSources[0] ?? src;

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        if (currentIndex < sources.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }

        onError?.(event);
      }}
    />
  );
}
