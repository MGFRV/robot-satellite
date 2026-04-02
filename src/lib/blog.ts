import fs from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';

export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};

const blogDirectory = path.join(process.cwd(), 'content', 'blog');

export function getBlogPosts(): BlogPostMeta[] {
  const files = fs.readdirSync(blogDirectory).filter((file) => file.endsWith('.mdx'));

  return files
    .map((file) => {
      const fullPath = path.join(blogDirectory, file);
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContent);

      return {
        slug: file.replace(/\.mdx$/, ''),
        title: String(data.title),
        date: String(data.date),
        excerpt: String(data.excerpt),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date, 'ru-RU'));
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const fullPath = path.join(blogDirectory, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContent = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContent);

  return {
    slug,
    title: String(data.title),
    date: String(data.date),
    excerpt: String(data.excerpt),
    content,
  };
}
