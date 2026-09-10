import type { Metadata } from 'next';
import Link from 'next/link';
import { permanentRedirect } from 'next/navigation';
import { Pagination } from '@/components/Pagination';
import { ProductCard } from '@/components/ProductCard';
import { categories, getCategoryByName } from '@/lib/categories';
import { getAllProducts } from '@/lib/products';
import { SITE_URL } from '@/lib/site';

const PAGE_SIZE = 24;
type Props = { searchParams?: Promise<{ page?: string; category?: string; search?: string }> };
const pageNumber = (value?: string) => Math.max(1, Number.parseInt(value || '1', 10) || 1);

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = pageNumber((await searchParams)?.page);
  return { title: `Каталог щупов и датчиков${page > 1 ? ` — страница ${page}` : ''} — ЩУПЫ.РУ`, description: 'Каталог щупов, стилусов, датчиков и комплектующих для станков с ЧПУ.', alternates: { canonical: page > 1 ? `/catalog?page=${page}` : '/catalog' } };
}

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;
  if (params?.category) {
    const category = getCategoryByName(params.category);
    permanentRedirect(category ? `/catalog/${category.slug}` : '/catalog');
  }
  const page = pageNumber(params?.page);
  const products = getAllProducts();
  const total = Math.ceil(products.length / PAGE_SIZE);
  const shown = products.slice((Math.min(page, total) - 1) * PAGE_SIZE, Math.min(page, total) * PAGE_SIZE);
  const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${SITE_URL}/catalog` }] };
  return <section className="space-y-6">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    <h1 className="text-3xl font-bold text-slate-900">Каталог</h1>
    <p className="text-slate-700">Все {products.length} товаров доступны поисковым роботам через постраничную навигацию.</p>
    <nav className="flex flex-wrap gap-2" aria-label="Категории">{categories.map(c => <Link className="rounded-full border bg-white px-4 py-2 text-sm" key={c.slug} href={`/catalog/${c.slug}`}>{c.name}</Link>)}</nav>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{shown.map(product => <ProductCard key={product.slug} product={product} />)}</div>
    <Pagination current={Math.min(page, total)} total={total} base="/catalog" />
  </section>;
}
