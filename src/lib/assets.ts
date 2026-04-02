const s3BaseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL ?? 'https://storage.yandexcloud.net/ваш-бакет';

function joinS3Path(pathname: string): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${s3BaseUrl}${normalizedPath}`;
}

export const PRODUCT_IMAGE_PLACEHOLDER = joinS3Path('/products/placeholder.webp');
export const BLOG_IMAGE_PLACEHOLDER = joinS3Path('/blog/placeholder.webp');

export function withS3BaseUrl(url: string | undefined, fallbackPath: string): string {
  if (!url || url.trim().length === 0) {
    return joinS3Path(fallbackPath);
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return joinS3Path(url);
}
