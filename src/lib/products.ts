import fs from 'node:fs';
import path from 'node:path';

import { PRODUCT_IMAGE_PLACEHOLDER, withS3BaseUrl } from '@/lib/assets';

export { PRODUCT_IMAGE_PLACEHOLDER };

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

function remapCategoryByTitle(product: Product): string {
  if (product.category !== 'Запчасти для роботов') {
    return product.category;
  }

  const title = product.title ?? '';

  if (/щуп/i.test(title)) {
    return 'Измерительные щупы';
  }

  if (/датчик/i.test(title)) {
    return 'Датчики';
  }

  if (/Болт/.test(title)) {
    return 'Запчасти и комплектующие';
  }

  if (/Комплект/.test(title)) {
    return 'Комплекты';
  }

  return 'Запчасти и комплектующие';
}

function normalizeProduct(product: Product): Product {
  const normalizedImages = Array.isArray(product.images)
    ? product.images
        .filter((image) => typeof image === 'string' && image.trim().length > 0)
        .map((image) => withS3BaseUrl(image, '/products/placeholder.webp'))
    : [];

  return {
    ...product,
    category: remapCategoryByTitle(product),
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
    .filter((product) => product.title)
    .sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'ru-RU'));
}

export function getProductBySlug(slug: string): Product | null {
  const product = getAllProducts().find((item) => item.slug === slug);
  return product ?? null;
}

export function getCategories(): string[] {
  const categories = new Set(getAllProducts().map((product) => product.category));
  return [...categories].sort((a, b) => a.localeCompare(b, 'ru-RU'));
}
