import Image from 'next/image';
import Link from 'next/link';

import { PRODUCT_IMAGE_PLACEHOLDER } from '@/lib/assets';
import { formatProductPrice } from '@/lib/product-format';
import type { Product } from '@/lib/products';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const previewImage = product.images[0] ?? PRODUCT_IMAGE_PLACEHOLDER;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Image src={previewImage} alt={product.title} width={640} height={420} className="h-52 w-full object-cover" />
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Артикул: {product.article}</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">{product.title}</h2>
        </div>
        <p className="text-sm text-slate-600">{product.category}</p>
        <p className="text-base font-semibold text-slate-900">{formatProductPrice(product.price)}</p>
        <Link
          href={`/catalog/${product.slug}`}
          className="inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
        >
          Подробнее
        </Link>
      </div>
    </article>
  );
}
