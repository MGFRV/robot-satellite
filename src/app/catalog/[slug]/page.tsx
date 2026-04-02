import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProductGallery } from '@/components/ProductGallery';
import { formatProductPrice } from '@/lib/product-format';
import { getAllProducts, getProductBySlug } from '@/lib/products';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Товар не найден',
      description: 'Запрошенный товар не найден в каталоге.',
    };
  }

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [{ url: product.images[0] }],
    },
  };
}

export const dynamicParams = false;

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <article className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery title={product.title} images={product.images} />

        <section className="space-y-4">
          <p className="text-sm text-slate-500">Артикул: {product.article}</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{product.title}</h1>
          <p className="text-2xl font-semibold text-slate-900">{formatProductPrice(product.price)}</p>
          <p className="text-slate-700">{product.description}</p>

          <Link
            href="/contacts"
            className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            {product.price === null ? 'Запросить цену' : 'Связаться'}
          </Link>
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">Характеристики</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full border-collapse bg-white text-sm">
            <tbody>
              {Object.entries(product.specs).map(([key, value]) => (
                <tr key={key} className="border-b border-slate-200 last:border-0">
                  <th className="w-1/3 bg-slate-50 px-4 py-3 text-left font-medium text-slate-700">{key}</th>
                  <td className="px-4 py-3 text-slate-900">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
