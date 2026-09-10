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
import { getAllProducts, getProductBySlug } from '@/lib/products';
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
    const page = Math.max(1, Number((await searchParams)?.page || 1));
    return { title: page > 1 ? `${category.title} — страница ${page}` : { absolute: category.title }, description: category.description, alternates: { canonical: `${SITE_URL}/catalog/${parts.join('/')}${page > 1 ? `?page=${page}` : ''}` } };
  }
  const product = parts.length === 1 ? getProductBySlug(parts[0]) : null;
  if (!product) return {};
  const description = `${product.title}. Артикул ${product.article}, производитель ${product.brand}. ${product.description}`.slice(0, 300);
  return { title: { absolute: `${product.seoTitle ?? product.title} — ${product.article} — ЩУПЫ.РУ` }, description, alternates: { canonical: `/catalog/${product.slug}` }, openGraph: { title: product.title, description, images: product.images } };
}

export default async function CatalogEntityPage({ params, searchParams }: Props) {
  const parts = (await params).slug;
  const category = getCategoryBySlug(parts[0]);
  if (category) {
    const products = getAllProducts().filter(p => p.category === category.name);
    const total = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
    const page = Math.min(total, Math.max(1, Number((await searchParams)?.page || 1)));
    const posts = getAllPosts().filter(p => p.tags.some(tag => category.name.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes('щуп'))).slice(0, 5);
    const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${SITE_URL}/catalog` }, { '@type': 'ListItem', position: 3, name: category.name, item: `${SITE_URL}/catalog/${category.slug}` }] };
    return <article className="space-y-8"><script type="application/ld+json" dangerouslySetInnerHTML={jsonScript(crumbs)} /><nav className="text-sm text-slate-500"><Link href="/">Главная</Link> → <Link href="/catalog">Каталог</Link> → {category.name}</nav><header><h1 className="text-3xl font-bold">{category.h1}</h1><div className="prose mt-4 max-w-none" dangerouslySetInnerHTML={{ __html: category.intro_html }} /></header><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(p => <ProductCard key={p.slug} product={p} />)}</div><Pagination current={page} total={total} base={`/catalog/${category.slug}`} /><section><h2 className="mb-3 text-2xl font-semibold">Смежные категории</h2><div className="flex flex-wrap gap-3">{categories.filter(c => c.slug !== category.slug).map(c => <Link key={c.slug} href={`/catalog/${c.slug}`} className="underline">{c.name}</Link>)}</div></section>{posts.length ? <section><h2 className="mb-3 text-2xl font-semibold">Полезные материалы</h2><ul className="list-disc pl-5">{posts.map(p => <li key={p.slug}><Link href={`/blog/${p.slug}`}>{p.title}</Link></li>)}</ul></section> : null}</article>;
  }
  if (parts.length !== 1) notFound();
  const product = getProductBySlug(parts[0]);
  if (!product) notFound();
  const related = getAllProducts().filter(p => p.category === product.category && p.slug !== product.slug).slice(0, 4);
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${SITE_URL}/catalog` }, { '@type': 'ListItem', position: 3, name: product.category, item: `${SITE_URL}${categoryHref(product.category)}` }, { '@type': 'ListItem', position: 4, name: product.title, item: `${SITE_URL}/catalog/${product.slug}` }] };
  const offer = product.price ? { '@type': 'Offer', price: product.price, priceCurrency: 'RUB', availability: 'https://schema.org/InStock' } : { '@type': 'Offer', availability: 'https://schema.org/PreOrder' };
  const productLd = { '@context': 'https://schema.org', '@type': 'Product', name: product.title, sku: product.article, mpn: product.article, brand: { '@type': 'Brand', name: product.brand }, image: product.images, description: product.description, offers: offer };
  return <article className="space-y-10"><script type="application/ld+json" dangerouslySetInnerHTML={jsonScript(crumbs)} /><script type="application/ld+json" dangerouslySetInnerHTML={jsonScript(productLd)} /><nav className="text-sm text-slate-500"><Link href="/">Главная</Link> → <Link href="/catalog">Каталог</Link> → <Link href={categoryHref(product.category)}>{product.category}</Link> → {product.title}</nav><section className="grid gap-8 rounded-2xl border bg-white p-6 lg:grid-cols-2"><ProductGallery title={product.title} images={product.images} /><div className="space-y-4"><p className="text-sm text-slate-500">Бренд: {product.brand}</p><h1 className="text-3xl font-bold">{product.title}</h1><p>{product.description}</p><p className="text-sm">Артикул: <b>{product.article}</b></p><p className="text-2xl font-bold">{product.price ? formatProductPrice(product.price) : 'Под заказ, цена по запросу'}</p>{product.price ? <AddToCartButton slug={product.slug} title={product.title} article={product.article} mode="order" /> : <ProductPrimaryAction slug={product.slug} />}</div></section><section><h2 className="mb-3 text-2xl font-semibold">Характеристики и совместимость</h2><table className="w-full border bg-white"><tbody>{Object.entries(product.specs).map(([k,v]) => <tr className="border-b" key={k}><th className="w-1/3 bg-slate-50 p-3 text-left">{k}</th><td className="p-3">{v}</td></tr>)}</tbody></table></section><section><h2 className="mb-4 text-2xl font-semibold">Аналоги и с этим товаром берут</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.map(p => <ProductCard key={p.slug} product={p} />)}</div></section><section id="rfq-form" className="scroll-mt-24"><RFQForm productName={product.title} productSku={product.article} /></section></article>;
}
