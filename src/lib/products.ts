import fs from 'node:fs';
import path from 'node:path';

export const PRODUCT_IMAGE_PLACEHOLDER =
  'https://storage.yandexcloud.net/rbstorage/2.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=YCAJEvDNROHS4gdVa7JCn_BhA%2F20260402%2Fru-central1%2Fs3%2Faws4_request&X-Amz-Date=20260402T070450Z&X-Amz-Expires=60&X-Amz-Signature=359d40bb1f912921858ff8587d70a30fb779f6b962d5f73d2f2bc28598d4e9f0&X-Amz-SignedHeaders=host';

export type Product = {
  title: string;
  slug: string;
  article: string;
  price: number | null;
  category: string;
  brand: string;
  description: string;
  specs: Record<string, string>;
  images: string[];
};

const productsDirectory = path.join(process.cwd(), 'content', 'products');

function normalizeProduct(product: Product): Product {
  const normalizedImages = Array.isArray(product.images)
    ? product.images.filter((image) => typeof image === 'string' && image.trim().length > 0)
    : [];

  return {
    ...product,
    images: normalizedImages.length > 0 ? normalizedImages : [PRODUCT_IMAGE_PLACEHOLDER],
  };
}

export function getAllProducts(): Product[] {
  const files = fs.readdirSync(productsDirectory).filter((file) => file.endsWith('.json'));

  return files
    .map((file) => {
      const filePath = path.join(productsDirectory, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      return normalizeProduct(JSON.parse(raw) as Product);
    })
    .sort((a, b) => a.title.localeCompare(b.title, 'ru-RU'));
}

export function getProductBySlug(slug: string): Product | null {
  const product = getAllProducts().find((item) => item.slug === slug);
  return product ?? null;
}

export function getCategories(): string[] {
  const categories = new Set(getAllProducts().map((product) => product.category));
  return [...categories].sort((a, b) => a.localeCompare(b, 'ru-RU'));
}
