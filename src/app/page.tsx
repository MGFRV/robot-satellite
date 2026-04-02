import Link from 'next/link';

import { BlogPostCard } from '@/components/BlogPostCard';
import { ProductCard } from '@/components/ProductCard';
import { getAllPosts } from '@/lib/blog';
import { getAllProducts } from '@/lib/products';

export default function HomePage() {
  const popularProducts = getAllProducts().slice(0, 6);
  const latestPosts = getAllPosts().slice(0, 3);

  return (
    <div className="space-y-16">
      <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm md:p-12">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            [Название компании] — [тип продукции]
          </h1>
          <p className="text-base text-slate-700 md:text-lg">
            Поставляем комплектующие и решения для промышленной автоматизации. Помогаем подобрать оборудование,
            проверяем совместимость и сопровождаем внедрение на каждом этапе.
          </p>
          <Link
            href="/catalog"
            className="inline-flex rounded-md bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700"
          >
            Перейти в каталог
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">Популярные товары</h2>
          <Link href="/catalog" className="text-sm font-medium text-blue-700 hover:text-blue-900">
            Смотреть все
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {popularProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">Блог</h2>
          <Link href="/blog" className="text-sm font-medium text-blue-700 hover:text-blue-900">
            Все статьи
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {latestPosts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-6 md:p-8">
        <div className="max-w-3xl space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">О компании</h2>
          <p className="text-slate-700">
            Мы специализируемся на поставке и сервисе компонентов для роботизированных производств. Работаем с
            предприятиями по всей России и подбираем решения под конкретные задачи и бюджеты.
          </p>
          <Link href="/contacts" className="inline-flex text-sm font-medium text-blue-700 hover:text-blue-900">
            Связаться с нами
          </Link>
        </div>
      </section>
    </div>
  );
}
