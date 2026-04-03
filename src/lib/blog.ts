import fs from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';

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
  content: React.ReactNode;
};

type BlogPostIndexEntry = {
  fileSlug: string;
  slug: string;
  aliases: string[];
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  coverImage: string;
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

function getBlogIndex(): BlogPostIndexEntry[] {
  const files = getBlogFiles(blogDirectory);

  return files
    .map((fullPath) => {
      const source = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(source);

      const relativePath = path.relative(blogDirectory, fullPath);
      const fileSlug = relativePath.replace(/\.(md|mdx)$/i, '').replace(/\\/g, '/');
      const frontmatterSlug = typeof data.slug === 'string' ? data.slug : '';
      const title = String(data.title);
      const titleSlug = slugify(title);
      const slug = frontmatterSlug || fileSlug;

      return {
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
}

export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function getAllPosts(): BlogPostMeta[] {
  return getBlogIndex().map(({ slug, title, date, excerpt, tags, coverImage }) => ({
    slug,
    title,
    date,
    excerpt,
    tags,
    coverImage,
  }));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const normalizedSlug = slug.toLowerCase();
  const entry = getBlogIndex().find((post) => post.aliases.some((alias) => alias.toLowerCase() === normalizedSlug));

  if (!entry) {
    return null;
  }

  const fullPath = getBlogFiles(blogDirectory).find((filePath) => {
    const relativePath = path.relative(blogDirectory, filePath).replace(/\\/g, '/');
    const normalized = relativePath.replace(/\.(md|mdx)$/i, '');
    return normalized === entry.fileSlug;
  });

  if (!fullPath) {
    return null;
  }
  const source = fs.readFileSync(fullPath, 'utf8');

  const { content, frontmatter } = await compileMDX<{
    title: string;
    date: string;
    excerpt: string;
    tags: string[];
    coverImage: string;
    slug?: string;
  }>({
    source,
    options: {
      parseFrontmatter: true,
    },
  });

  return {
    slug: entry.slug,
    title: frontmatter.title,
    date: frontmatter.date,
    excerpt: frontmatter.excerpt,
    tags: frontmatter.tags ?? [],
    coverImage: withS3BaseUrl(frontmatter.coverImage, '/blog/placeholder.webp') || BLOG_IMAGE_PLACEHOLDER,
    content,
  };
}
