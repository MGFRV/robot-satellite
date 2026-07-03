'use client';

import { useState, type ImgHTMLAttributes } from 'react';

import { BLOG_IMAGE_PLACEHOLDER } from '@/lib/assets';

type BlogMdxImageProps = ImgHTMLAttributes<HTMLImageElement>;

export function BlogMdxImage({ src, alt = '', onError, ...props }: BlogMdxImageProps) {
  const [currentSrc, setCurrentSrc] = useState(typeof src === 'string' && src.trim().length > 0 ? src : BLOG_IMAGE_PLACEHOLDER);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        if (currentSrc !== BLOG_IMAGE_PLACEHOLDER) {
          setCurrentSrc(BLOG_IMAGE_PLACEHOLDER);
        }

        onError?.(event);
      }}
    />
  );
}
