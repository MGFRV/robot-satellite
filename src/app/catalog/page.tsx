import Link from 'next/link';

import { CatalogClient } from '@/components/CatalogClient';
import { getAllProducts, getCategories } from '@/lib/products';
import { searchProducts } from '@/lib/search';

type CatalogPageProps = {
  searchParams?: Promise<{
    search?: string;
  }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = (await searchParams) ?? {};
  const searchQuery = params.search?.trim() ?? '';

  const products = getAllProducts();
  const categories = getCategories();

  const searchResultSlugs = searchQuery.length > 0 ? new Set(searchProducts(searchQuery).map((item) => item.slug)) : null;
  const visibleProducts = searchResultSlugs
    ? products.filter((product) => searchResultSlugs.has(product.slug))
    : products;

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Каталог</h1>
      <p className="text-slate-700">Выберите категорию и подходящий товар из ассортимента.</p>

      {searchQuery.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-slate-900">
              Результаты поиска: «{searchQuery}» ({visibleProducts.length} товаров)
            </p>
            <Link
              href="/catalog"
              className="inline-flex rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Сбросить поиск
            </Link>
          </div>
        </div>
      ) : null}

      {searchQuery.length > 0 && visibleProducts.length === 0 ? (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-lg font-semibold text-slate-900">По запросу &quot;{searchQuery}&quot; ничего не найдено</p>
          <Link href="/podbor" className="inline-block font-medium text-slate-800 hover:text-slate-950">
            Отправьте маркировку — поможем подобрать
          </Link>
          <Link href="/catalog" className="block text-sm text-slate-600 hover:text-slate-900">
            Показать все товары
          </Link>
        </div>
      ) : (
        <CatalogClient products={visibleProducts} categories={categories} />
      )}
    </section>
  );
}
