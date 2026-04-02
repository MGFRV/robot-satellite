import { notFound } from 'next/navigation';

import { getProductBySlug, getProducts } from '@/lib/products';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{product.name}</h1>
        <p className="text-lg font-medium text-slate-800">{product.price}</p>
      </header>
      <p className="max-w-3xl text-slate-700">{product.description}</p>
      <section>
        <h2 className="text-xl font-semibold text-slate-900">Характеристики</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-slate-700">
          {product.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
