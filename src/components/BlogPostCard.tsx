import Image from 'next/image';
import Link from 'next/link';

import { BLOG_IMAGE_PLACEHOLDER, isExternalStorageImage } from '@/lib/assets';
import { formatBlogDate, type BlogPostMeta } from '@/lib/blog';

type BlogPostCardProps = {
  post: BlogPostMeta;
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  const coverImage = post.coverImage || BLOG_IMAGE_PLACEHOLDER;

  return (
    <article className="h-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col">
        <div className="relative aspect-video overflow-hidden bg-slate-100">
          <Image
            src={coverImage}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
            unoptimized={isExternalStorageImage(coverImage)}
          />
        </div>
        <div className="flex flex-1 flex-col space-y-2 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">{formatBlogDate(post.date)}</p>
          <h2 className="break-words text-lg font-semibold text-slate-900 group-hover:text-blue-700">{post.title}</h2>
          <p className="line-clamp-3 text-sm text-slate-600">{post.excerpt}</p>
          <span className="mt-auto inline-flex text-sm font-medium text-blue-700 group-hover:text-blue-900">Читать статью</span>
        </div>
      </Link>
    </article>
  );
}
