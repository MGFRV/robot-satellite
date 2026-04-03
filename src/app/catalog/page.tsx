import { CatalogClient } from '@/components/CatalogClient';
import { getAllProducts, getCategories } from '@/lib/products';

export default function CatalogPage() {
  const products = getAllProducts();
  const categories = getCategories();

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Каталог</h1>
      <p className="text-slate-700">Выберите категорию и подходящий товар из ассортимента.</p>
      <CatalogClient products={products} categories={categories} />
    </section>
  );
}
