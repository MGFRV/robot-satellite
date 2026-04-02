'use client';

import { useMemo, useState } from 'react';

import type { Product } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';

type CatalogClientProps = {
  products: Product[];
  categories: string[];
};

export function CatalogClient({ products, categories }: CatalogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Все') {
      return products;
    }

    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

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
        {filteredProducts.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-sm text-slate-600">Товары в выбранной категории не найдены.</p>
      ) : null}
    </div>
  );
}
