import fs from 'node:fs';
import path from 'node:path';

export type Product = {
  slug: string;
  name: string;
  description: string;
  price: string;
  features: string[];
};

const productsDirectory = path.join(process.cwd(), 'content', 'products');

export function getProducts(): Product[] {
  const files = fs.readdirSync(productsDirectory).filter((file) => file.endsWith('.json'));

  return files
    .map((file) => {
      const fullPath = path.join(productsDirectory, file);
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      return JSON.parse(fileContent) as Product;
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'ru-RU'));
}

export function getProductBySlug(slug: string): Product | null {
  const products = getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}
