import fs from 'node:fs';
import path from 'node:path';
import { categories } from '@/lib/categories';
import { getAllPosts } from '@/lib/blog';
import { getAllProducts } from '@/lib/products';
import { SITE_URL } from '@/lib/site';
const esc = (v: string) => v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export const urlset = (rows: { url: string; lastmod?: string }[]) => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${rows.map(r => `<url><loc>${esc(r.url)}</loc>${r.lastmod ? `<lastmod>${r.lastmod}</lastmod>` : ''}</url>`).join('')}</urlset>`;
export const xmlResponse = (body: string) => new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
export function pageUrls() { return ['', '/catalog', '/blog', '/contacts', '/podbor', '/cart', '/privacy', '/consent', '/about', '/delivery', '/payment', '/warranty'].map(url => ({ url: `${SITE_URL}${url}` })); }
export function catalogUrls() {
 const productDirectory = path.join(process.cwd(), 'content/products');
 const modifiedBySlug = new Map(fs.readdirSync(productDirectory).filter(file => file.endsWith('.json')).map(file => {
   const filePath = path.join(productDirectory, file);
   const record = JSON.parse(fs.readFileSync(filePath, 'utf8')) as { slug: string };
   return [record.slug, fs.statSync(filePath).mtime.toISOString()];
 }));
 const products = getAllProducts().map(p => ({ url: `${SITE_URL}/catalog/${p.slug}`, lastmod: modifiedBySlug.get(p.slug) }));
 const categoryUrls = categories.flatMap(c => { const count = getAllProducts().filter(p => p.category === c.name).length; return Array.from({ length: Math.max(1, Math.ceil(count / 24)) }, (_, i) => ({ url: `${SITE_URL}/catalog/${c.slug}${i ? `?page=${i + 1}` : ''}` })); });
 const pages = Array.from({ length: Math.ceil(getAllProducts().length / 24) }, (_, i) => ({ url: `${SITE_URL}/catalog${i ? `?page=${i + 1}` : ''}` }));
 return [...products, ...categoryUrls, ...pages];
}
export function blogUrls() { const posts = getAllPosts().map(p => ({ url: `${SITE_URL}/blog/${p.slug}`, lastmod: new Date(p.date).toISOString() })); const pages = Array.from({ length: Math.ceil(posts.length / 9) }, (_, i) => ({ url: `${SITE_URL}/blog${i ? `?page=${i + 1}` : ''}` })); return [...posts, ...pages]; }
