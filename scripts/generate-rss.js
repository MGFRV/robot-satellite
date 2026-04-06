const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ваш-домен.ru';
const SITE_NAME = 'Название сайта';

const blogDir = path.join(process.cwd(), 'content', 'blog');
const files = fs.readdirSync(blogDir).filter((file) => file.endsWith('.mdx'));

const posts = files
  .map((file) => {
    const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    const { data } = matter(raw);
    return { ...data, slug: file.replace(/\.mdx$/, '') };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

const items = posts
  .map(
    (post) => `
  <item>
    <title><![CDATA[${post.title}]]></title>
    <link>${SITE_URL}/blog/${post.slug}</link>
    <description><![CDATA[${post.excerpt || ''}]]></description>
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <guid>${SITE_URL}/blog/${post.slug}</guid>
  </item>`,
  )
  .join('');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>Блог</description>
    <language>ru</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

fs.writeFileSync(path.join(process.cwd(), 'public', 'rss.xml'), rss.trim());
console.log('RSS generated:', posts.length, 'posts');
