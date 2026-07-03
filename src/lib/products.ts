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

let productsCache: Product[] | null = null;
let categoriesCache: string[] | null = null;

function normalizeDescription(description: string): string {
  const marker = 'ООО «Эффективное производство»';
  const markerIndex = description.indexOf(marker);

  if (markerIndex === -1) {
    return description;
  }

  return description.slice(0, markerIndex).trim();
}

function remapCategoryByTitle(product: Product): string {
  const title = product.title ?? '';

  if (/щуп/i.test(title)) {
    return 'Измерительные щупы';
  }

  if (/датчик/i.test(title)) {
    return 'Датчики';
  }

  if (/болт/i.test(title)) {
    return 'Запчасти и комплектующие';
  }

  if (/комплект/i.test(title)) {
    return 'Комплекты';
  }

  if (/рычаг|удлинитель|приспособление/i.test(title)) {
    return 'Запчасти и комплектующие';
  }

  return product.category;
}

function normalizePrice(price: unknown): number | null {
  if (typeof price === 'number' && Number.isFinite(price)) {
    return price;
  }

  if (typeof price === 'string') {
    const normalizedPrice = Number(price.trim());
    return Number.isFinite(normalizedPrice) ? normalizedPrice : null;
  }

  return null;
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
    price: normalizePrice(product.price),
    description: normalizeDescription(product.description ?? ''),
    images: normalizedImages.length > 0 ? normalizedImages : [PRODUCT_IMAGE_PLACEHOLDER],
  };
}

function readProducts(): Product[] {
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

export function getAllProducts(): Product[] {
  if (!productsCache) {
    productsCache = readProducts();
  }

  return productsCache;
}

export function getProductBySlug(slug: string): Product | null {
  const product = getAllProducts().find((item) => item.slug === slug);
  return product ?? null;
}

export function getCategories(): string[] {
  if (!categoriesCache) {
    const categories = new Set(getAllProducts().map((product) => product.category));
    categoriesCache = [...categories].sort((a, b) => a.localeCompare(b, 'ru-RU'));
  }

  return categoriesCache;
}
