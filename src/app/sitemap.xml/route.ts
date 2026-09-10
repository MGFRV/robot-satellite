import { SITE_URL } from '@/lib/site';
import { xmlResponse } from '@/lib/sitemaps';
export const dynamic = 'force-static';
export function GET() { return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${SITE_URL}/sitemap-pages.xml</loc></sitemap><sitemap><loc>${SITE_URL}/sitemap-catalog.xml</loc></sitemap><sitemap><loc>${SITE_URL}/sitemap-blog.xml</loc></sitemap></sitemapindex>`); }
