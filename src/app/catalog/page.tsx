import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/lib/products';

export default function CatalogPage() {
  const products = getProducts();

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Каталог</h1>
      <p className="text-slate-700">Выберите подходящий товар из нашего ассортимента.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
