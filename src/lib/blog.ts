import fs from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';

import { BLOG_IMAGE_PLACEHOLDER, withS3BaseUrl } from '@/lib/assets';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  coverImage?: string;
  content: string;
}

export type BlogPostMeta = Omit<BlogPost, 'content'>;

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

let postsCache: BlogPost[] | null = null;

function stripMarkdownLinks(value: string): string {
  return value.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

function sanitizeMetaText(value: unknown): string {
  return stripMarkdownLinks(String(value ?? '')).trim();
}

function loadAllPostData(): BlogPost[] {
  const files = fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith('.mdx'));

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, '');
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    const { data, content } = matter(raw);

    return {
      slug,
      title: sanitizeMetaText(data.title),
      date: String(data.date ?? ''),
      excerpt: sanitizeMetaText(data.excerpt ?? data.description),
      tags: Array.isArray(data.tags) ? data.tags.map(sanitizeMetaText).filter(Boolean) : [],
      coverImage:
        typeof data.coverImage === 'string' && data.coverImage.trim().length > 0 && !data.coverImage.includes('ваш-бакет')
          ? withS3BaseUrl(data.coverImage, '/blog/placeholder.webp')
          : BLOG_IMAGE_PLACEHOLDER,
      content,
    } satisfies BlogPost;
  });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function readAllPostData(): BlogPost[] {
  if (!postsCache) {
    postsCache = loadAllPostData();
  }

  return postsCache;
}

export function getAllPosts(): BlogPostMeta[] {
  return readAllPostData().map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    tags: post.tags,
    coverImage: post.coverImage,
  }));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return readAllPostData().find((post) => post.slug === slug);
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''));
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  getAllPosts().forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}

export function getPostsByTag(tag: string): BlogPostMeta[] {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}

export function getRelatedPosts(currentSlug: string, tags: string[], count = 3): BlogPostMeta[] {
  const allPosts = getAllPosts().filter((post) => post.slug !== currentSlug);
  const scored = allPosts.map((post) => ({
    post,
    score: post.tags.filter((tag) => tags.includes(tag)).length,
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((item) => item.post);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export const formatBlogDate = formatDate;
