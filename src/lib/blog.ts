import fs from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';

import { BLOG_IMAGE_PLACEHOLDER, withS3BaseUrl } from '@/lib/assets';

export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  coverImage: string;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};

type BlogPostEntry = BlogPostMeta & {
  filePath: string;
};

const blogDirectory = path.join(process.cwd(), 'content', 'blog');

export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

function getPostEntries(): BlogPostEntry[] {
  const files = fs.readdirSync(blogDirectory).filter((file) => file.endsWith('.mdx'));

  return files
    .map((file) => {
      const filePath = path.join(blogDirectory, file);
      const source = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(source);

      return {
        filePath,
        slug: typeof data.slug === 'string' && data.slug.trim().length > 0 ? data.slug : file.replace(/\.mdx$/, ''),
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

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const entry = getPostEntries().find((post) => post.slug === slug);

  if (!entry) {
    return null;
  }

  const source = fs.readFileSync(entry.filePath, 'utf8');
  const { content } = matter(source);

  return {
    ...entry,
    coverImage: entry.coverImage || BLOG_IMAGE_PLACEHOLDER,
    content,
  };
}
