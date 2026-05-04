import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AddToCartButton } from '@/components/AddToCartButton';
import { ProductCard } from '@/components/ProductCard';
import { ProductPrimaryAction } from '@/components/ProductPrimaryAction';
import { ProductGallery } from '@/components/ProductGallery';
import { RFQForm } from '@/components/RFQForm';
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
    title: `${product.title} | ${product.article}`,
    description: product.description,
  };
}

export const dynamicParams = false;

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const productState = product.specs['Состояние'] ?? product.specs['Condition'] ?? 'Уточняйте у менеджера';
  const relatedProducts = getAllProducts()
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, 4);
  const useCases = [
    'Контроль измерений и привязка инструмента на станках с ЧПУ',
    'Снижение брака за счёт точной калибровки и повторяемости',
    'Плановая замена изношенных компонентов в сервисном цикле',
  ];

  return (
    <article className="space-y-10">
      <section className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 lg:grid-cols-2">
        <ProductGallery title={product.title} images={product.images} />

        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-500">Бренд: Renishaw</p>
          <h1 className="text-3xl font-bold text-slate-900">{product.title}</h1>
          <dl className="space-y-2 text-sm text-slate-700">
            <div className="flex gap-2">
              <dt className="font-semibold">Артикул/SKU:</dt>
              <dd>{product.article}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold">Категория:</dt>
              <dd>{product.category}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold">Состояние:</dt>
              <dd>{productState}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            <ProductPrimaryAction slug={product.slug} />
            <AddToCartButton
              slug={product.slug}
              title={product.title}
              article={product.article}
              className="inline-flex rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            />
          </div>
          <p className="text-sm text-slate-600">Ответим в течение 2 часов</p>
          <p className="text-sm font-medium text-slate-500">Цена по запросу</p>
          <Link href="/podbor" className="inline-flex text-sm font-medium text-slate-800 hover:text-slate-950">
            Не уверены в совместимости? Поможем подобрать
          </Link>
          
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">Характеристики</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
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

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-2xl font-semibold text-slate-900">Применение</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
          {useCases.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Похожие товары</h2>
        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">Пока нет похожих товаров в этой категории.</p>
        )}
      </section>


      <section id="rfq-form">
        <RFQForm
          productName={product.title}
          productSku={product.article}
          subject={`Запрос цены: ${product.article} ${product.title}`}
          title="Запросить цену и наличие"
        />
      </section>
    </article>
  );
}
