import fs from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';

import { withS3BaseUrl } from '@/lib/assets';

export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  coverImage: string;
};

export type BlogPostSource = BlogPostMeta & {
  source: string;
};

type BlogPostEntry = BlogPostMeta & {
  filePath: string;
};

const blogDirectory = path.join(process.cwd(), 'content', 'blog');
const supportedBlogExtensions = new Set(['.mdx', '.md']);

function getBlogFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return getBlogFiles(fullPath);
    }

    if (!entry.isFile()) {
      return [];
    }

    const extension = path.extname(entry.name).toLowerCase();
    return supportedBlogExtensions.has(extension) ? [fullPath] : [];
  });
}

function getPostEntries(): BlogPostEntry[] {
  const files = getBlogFiles(blogDirectory);

  return files
    .map((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(source);

      const relativePath = path.relative(blogDirectory, filePath).replace(/\\/g, '/');
      const fileSlug = relativePath.replace(/\.(mdx|md)$/i, '');

      return {
        filePath,
        slug: typeof data.slug === 'string' && data.slug.trim().length > 0 ? data.slug : fileSlug,
        title: String(data.title),
        date: String(data.date),
        excerpt: String(data.excerpt),
        tags: Array.isArray(data.tags) ? data.tags.map((tag) => String(tag)) : [],
        coverImage: withS3BaseUrl(
          typeof data.coverImage === 'string' ? data.coverImage : undefined,
          '/blog/placeholder.webp',
        ),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date, 'ru-RU'));
}

export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function getAllPosts(): BlogPostMeta[] {
  return getPostEntries().map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    tags: post.tags,
    coverImage: post.coverImage,
  }));
}

export async function getPostBySlug(slug: string): Promise<BlogPostSource | null> {
  const entry = getPostEntries().find((post) => post.slug === slug);

  if (!entry) {
    return null;
  }

  return {
    ...entry,
    source: fs.readFileSync(entry.filePath, 'utf8'),
  };
}
