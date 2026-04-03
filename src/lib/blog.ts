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

export type BlogPost = BlogPostMeta & {
  content: string;
};

type BlogPostEntry = BlogPostMeta & {
  filePath: string;
  fileSlug: string;
  aliases: string[];
};

const blogDirectory = path.join(process.cwd(), 'content', 'blog');
const supportedBlogExtensions = new Set(['.mdx', '.md']);

const translitMap: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'c',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .split('')
    .map((char) => translitMap[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getPostEntries(): BlogPostEntry[] {
  const files = getBlogFiles(blogDirectory);

  const entries = files
    .map((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(source);

      const relativePath = path.relative(blogDirectory, filePath).replace(/\\/g, '/');
      const fileSlug = relativePath.replace(/\.(mdx|md)$/i, '');
      const frontmatterSlug = typeof data.slug === 'string' ? data.slug.trim() : '';
      const title = String(data.title);
      const titleSlug = slugify(title);
      const slug = frontmatterSlug || fileSlug;

      return {
        filePath,
        fileSlug,
        slug,
        aliases: Array.from(new Set([slug, fileSlug, frontmatterSlug, titleSlug].filter(Boolean))),
        title,
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

  const slugToFile = new Map<string, string>();

  for (const entry of entries) {
    const duplicateFilePath = slugToFile.get(entry.slug);

    if (duplicateFilePath) {
      throw new Error(
        `Duplicate blog slug "${entry.slug}" found in files: ${duplicateFilePath} and ${entry.filePath}`,
      );
    }

    slugToFile.set(entry.slug, entry.filePath);
  }

  return entries;
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

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const normalizedSlug = slug.toLowerCase();
  const entry = getPostEntries().find((post) => post.aliases.some((alias) => alias.toLowerCase() === normalizedSlug));

  if (!entry) {
    return null;
  }

  const source = fs.readFileSync(entry.filePath, 'utf8');
  const { content } = matter(source);

  return {
    slug: entry.slug,
    title: entry.title,
    date: entry.date,
    excerpt: entry.excerpt,
    tags: entry.tags,
    coverImage: entry.coverImage,
    content,
  };
}
