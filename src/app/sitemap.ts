import type { MetadataRoute } from 'next';

import { getAllPosts } from '@/lib/blog';
import { getAllProducts } from '@/lib/products';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://schupy.ru';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = ['', '/catalog', '/blog', '/contacts'].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = getAllProducts().map((product) => ({
    url: `${siteUrl}/catalog/${product.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
