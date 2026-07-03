'use client';

import { useEffect, useMemo, useState } from 'react';

import { ProductCard } from '@/components/ProductCard';
import type { CatalogProduct } from '@/lib/products';

type CatalogClientProps = {
  products: CatalogProduct[];
  categories: string[];
  initialCategory?: string;
};

const PRODUCTS_PER_PAGE = 24;

export function CatalogClient({ products, categories, initialCategory }: CatalogClientProps) {
  const resolvedInitialCategory = initialCategory && categories.includes(initialCategory) ? initialCategory : 'Все';
  const [selectedCategory, setSelectedCategory] = useState<string>(resolvedInitialCategory);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Все') {
      return products;
    }

    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredProducts.length;

  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [selectedCategory, products]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {['Все', ...categories].map((category) => {
          const isActive = selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleProducts.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      {hasMoreProducts ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PRODUCTS_PER_PAGE)}
            className="rounded-md border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Показать ещё {Math.min(PRODUCTS_PER_PAGE, filteredProducts.length - visibleCount)} из {filteredProducts.length}
          </button>
        </div>
      ) : null}

      {filteredProducts.length === 0 ? (
        <p className="text-sm text-slate-600">Товары в выбранной категории не найдены.</p>
      ) : null}
    </div>
  );
}
