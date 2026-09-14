import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Pagination } from '@/components/Pagination';
import { ProductCard } from '@/components/ProductCard';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductPrimaryAction } from '@/components/ProductPrimaryAction';
import { RFQForm } from '@/components/RFQForm';
import { categories, categoryHref, getCategoryBySlug } from '@/lib/categories';
import { getAllPosts } from '@/lib/blog';
import { formatProductPrice } from '@/lib/product-format';
import { getAllProducts, getProductBySlug, toCatalogProduct } from '@/lib/products';
import { SITE_URL } from '@/lib/site';

const PAGE_SIZE = 24;
type Props = { params: Promise<{ slug: string[] }>; searchParams?: Promise<{ page?: string }> };
export const dynamicParams = true;
export function generateStaticParams() { return [...getAllProducts().map(p => ({ slug: [p.slug] })), ...categories.map(c => ({ slug: [c.slug] }))]; }
const jsonScript = (value: object) => ({ __html: JSON.stringify(value) });

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const parts = (await params).slug;
  const category = getCategoryBySlug(parts[0]);
  if (category) {
    const page = Number((await searchParams)?.page ?? '1');
    return { title: page > 1 ? `${category.title} — страница ${page}` : { absolute: category.title }, description: category.description, alternates: { canonical: `${SITE_URL}/catalog/${parts.join('/')}${page > 1 ? `?page=${page}` : ''}` } };
  }
  const product = parts.length === 1 ? getProductBySlug(parts[0]) : null;
  if (!product) return {};
  const description = (product.metaDescription || product.description).slice(0, 300);
  // product.seoTitle already carries the article and "| ЩУПЫ.РУ" for every
  // current product — appending them again here used to double both up
  // (e.g. "... A-4038-0001 | ЩУПЫ.РУ — A-4038-0001 — ЩУПЫ.РУ"), which is why
  // titles were running 80-95 characters. Only pad the fallback (bare
  // product.title, with neither) so future entries without a seoTitle still
  // get a complete <title>.
  const pageTitle = product.seoTitle ?? `${product.title}${product.article ? ` — ${product.article}` : ''} — ЩУПЫ.РУ`;
  return { title: { absolute: pageTitle }, description, alternates: { canonical: `/catalog/${product.slug}` }, openGraph: { title: product.title, description, images: product.images } };
}

export default async function CatalogEntityPage({ params, searchParams }: Props) {
  const parts = (await params).slug;
  const category = getCategoryBySlug(parts[0]);
  if (category) {
    const products = getAllProducts().filter(p => p.category === category.name);
    const total = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
    const page = Number((await searchParams)?.page ?? '1');
    if (!Number.isInteger(page) || page < 1 || page > total) notFound();
    const posts = getAllPosts().filter(p => p.tags.some(tag => category.name.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes('щуп'))).slice(0, 5);
    const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${SITE_URL}/catalog` }, { '@type': 'ListItem', position: 3, name: category.name, item: `${SITE_URL}/catalog/${category.slug}` }] };
    return <article className="space-y-8"><script type="application/ld+json" dangerouslySetInnerHTML={jsonScript(crumbs)} /><nav className="text-sm text-slate-500"><Link href="/">Главная</Link> → <Link href="/catalog">Каталог</Link> → {category.name}</nav><header><h1 className="text-3xl font-bold">{category.h1}</h1><div className="prose mt-4 max-w-none" dangerouslySetInnerHTML={{ __html: category.intro_html }} /></header><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(toCatalogProduct).map(p => <ProductCard key={p.slug} product={p} />)}</div><Pagination current={page} total={total} base={`/catalog/${category.slug}`} /><section><h2 className="mb-3 text-2xl font-semibold">Смежные категории</h2><div className="flex flex-wrap gap-3">{categories.filter(c => c.slug !== category.slug).map(c => <Link key={c.slug} href={`/catalog/${c.slug}`} className="underline">{c.name}</Link>)}</div></section>{posts.length ? <section><h2 className="mb-3 text-2xl font-semibold">Полезные материалы</h2><ul className="list-disc pl-5">{posts.map(p => <li key={p.slug}><Link href={`/blog/${p.slug}`}>{p.title}</Link></li>)}</ul></section> : null}</article>;
  }
  if (parts.length !== 1) notFound();
  const product = getProductBySlug(parts[0]);
  if (!product) notFound();
  const related = getAllProducts().filter(p => p.category === product.category && p.slug !== product.slug).slice(0, 4);
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${SITE_URL}/catalog` }, { '@type': 'ListItem', position: 3, name: product.category, item: `${SITE_URL}${categoryHref(product.category)}` }, { '@type': 'ListItem', position: 4, name: product.title, item: `${SITE_URL}/catalog/${product.slug}` }] };
  const specEntries = Object.entries(product.specs).filter(([k]) => !['Производитель', 'Артикул', 'Состояние', 'Наличие', 'Тип'].includes(k));
  const isNew = product.specs['Состояние'] === 'Новое';
  // Everything in the catalog ships "под заказ" (ordered in from the
  // manufacturer, never held in local stock), so the only availability value
  // that isn't a false claim is BackOrder — see scripts/check-seo.js, which
  // deliberately fails the build on an InStock/PreOrder literal here.
  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    ...(product.article ? { sku: product.article } : {}),
    brand: { '@type': 'Brand', name: product.brand },
    image: product.images,
    description: product.description,
    ...(specEntries.length ? { additionalProperty: specEntries.map(([name, value]) => ({ '@type': 'PropertyValue', name, value })) } : {}),
    ...(product.price
      ? { offers: { '@type': 'Offer', price: product.price, priceCurrency: 'RUB', ...(isNew ? { itemCondition: 'https://schema.org/NewCondition' } : {}), availability: 'https://schema.org/BackOrder' } }
      : {}),
  };
  return <article className="space-y-10"><script type="application/ld+json" dangerouslySetInnerHTML={jsonScript(crumbs)} /><script type="application/ld+json" dangerouslySetInnerHTML={jsonScript(productLd)} /><nav className="text-sm text-slate-500"><Link href="/">Главная</Link> → <Link href="/catalog">Каталог</Link> → <Link href={categoryHref(product.category)}>{product.category}</Link> → {product.title}</nav><section className="grid gap-8 rounded-2xl border bg-white p-6 lg:grid-cols-2"><ProductGallery title={product.title} images={product.images} /><div className="space-y-4"><p className="text-sm text-slate-500">Бренд: {product.brand}</p><h1 className="text-3xl font-bold">{product.title}</h1>{product.article ? <p className="text-sm">Артикул: <b>{product.article}</b></p> : null}<p className="text-2xl font-bold">{product.price ? formatProductPrice(product.price) : 'Под заказ, цена по запросу'}</p>{product.price ? <AddToCartButton slug={product.slug} title={product.title} article={product.article} mode="order" /> : <ProductPrimaryAction slug={product.slug} />}</div></section><section><h2 className="mb-3 text-2xl font-semibold">Описание</h2><div className="space-y-3 text-slate-700">{product.description.split(/\n{2,}/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section><section><h2 className="mb-3 text-2xl font-semibold">Характеристики и совместимость</h2><table className="w-full border bg-white"><tbody>{Object.entries(product.specs).map(([k,v]) => <tr className="border-b" key={k}><th className="w-1/3 bg-slate-50 p-3 text-left">{k}</th><td className="p-3">{v}</td></tr>)}</tbody></table></section><section><h2 className="mb-4 text-2xl font-semibold">Аналоги и с этим товаром берут</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.map(toCatalogProduct).map(p => <ProductCard key={p.slug} product={p} />)}</div></section><section id="rfq-form" className="scroll-mt-24"><RFQForm productName={product.title} productSku={product.article} /></section></article>;
}
