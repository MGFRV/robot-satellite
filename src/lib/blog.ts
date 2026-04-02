import fs from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';

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

const blogDirectory = path.join(process.cwd(), 'content', 'blog');

export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function getAllPosts(): BlogPostMeta[] {
  const files = fs.readdirSync(blogDirectory).filter((file) => file.endsWith('.mdx'));

  return files
    .map((file) => {
      const fullPath = path.join(blogDirectory, file);
      const source = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(source);

      return {
        slug: file.replace(/\.mdx$/, ''),
        title: String(data.title),
        date: String(data.date),
        excerpt: String(data.excerpt),
        tags: Array.isArray(data.tags) ? data.tags.map((tag) => String(tag)) : [],
        coverImage: String(data.coverImage),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date, 'ru-RU'));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const fullPath = path.join(blogDirectory, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const source = fs.readFileSync(fullPath, 'utf8');

  const { content, frontmatter } = await compileMDX<{
    title: string;
    date: string;
    excerpt: string;
    tags: string[];
    coverImage: string;
  }>({
    source,
    options: {
      parseFrontmatter: true,
    },
  });

  return {
    slug,
    title: frontmatter.title,
    date: frontmatter.date,
    excerpt: frontmatter.excerpt,
    tags: frontmatter.tags ?? [],
    coverImage: frontmatter.coverImage,
    content,
  };
}
