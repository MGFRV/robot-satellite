import Link from 'next/link';

import type { BlogPostMeta } from '@/lib/blog';

type BlogPostCardProps = {
  post: BlogPostMeta;
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{post.date}</p>
      <h2 className="mt-2 text-lg font-semibold text-slate-900">{post.title}</h2>
      <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>
      <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex text-sm font-medium text-blue-700 hover:text-blue-900">
        Читать статью
      </Link>
    </article>
  );
}
