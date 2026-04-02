import Image from 'next/image';
import Link from 'next/link';

import { formatBlogDate, type BlogPostMeta } from '@/lib/blog';

type BlogPostCardProps = {
  post: BlogPostMeta;
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Image
        src={post.coverImage}
        alt={post.title}
        width={800}
        height={420}
        unoptimized
        className="h-52 w-full object-cover"
      />
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">{formatBlogDate(post.date)}</p>
        <h2 className="text-lg font-semibold text-slate-900">{post.title}</h2>
        <p className="text-sm text-slate-600">{post.excerpt}</p>
        <Link href={`/blog/${post.slug}`} className="inline-flex text-sm font-medium text-blue-700 hover:text-blue-900">
          Читать статью
        </Link>
      </div>
    </article>
  );
}
