const s3BaseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL ?? 'https://storage.yandexcloud.net/rbstorage';

function encodePathSegment(segment: string): string {
  try {
    return encodeURIComponent(decodeURIComponent(segment));
  } catch {
    return encodeURIComponent(segment);
  }
}

function encodePathname(pathname: string): string {
  return pathname.split('/').map(encodePathSegment).join('/');
}

function joinS3Path(pathname: string): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${s3BaseUrl}${encodePathname(normalizedPath)}`;
}

export function isExternalStorageImage(src: unknown): boolean {
  return typeof src === 'string' && src.startsWith('https://storage.yandexcloud.net/');
}

export const PRODUCT_IMAGE_PLACEHOLDER = joinS3Path('/products/placeholder.webp');
export const BLOG_IMAGE_PLACEHOLDER = joinS3Path('/products/blog/placeholder.webp');

export function withS3BaseUrl(url: string | undefined, fallbackPath: string): string {
  if (!url || url.trim().length === 0) {
    return joinS3Path(fallbackPath);
  }

  if (/^https?:\/\//i.test(url)) {
    const parsedUrl = new URL(url);
    parsedUrl.pathname = encodePathname(parsedUrl.pathname);
    return parsedUrl.toString();
  }

  return joinS3Path(url);
}
