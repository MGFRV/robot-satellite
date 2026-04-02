import Link from 'next/link';

import type { Product } from '@/lib/products';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
      <p className="mt-2 text-sm text-slate-600">{product.description}</p>
      <p className="mt-3 text-base font-medium text-slate-900">{product.price}</p>
      <Link
        href={`/catalog/${product.slug}`}
        className="mt-4 inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"
      >
        Подробнее
      </Link>
    </article>
  );
}
