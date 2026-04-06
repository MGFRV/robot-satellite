import type { Metadata } from 'next';
import Link from 'next/link';

import { formatDate, getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Блог',
  description: 'Статьи о промышленной робототехнике, обслуживании и запчастях.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Блог</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
          >
            {post.coverImage && (
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-5">
              <div className="mb-2 flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="mb-2 text-lg font-semibold transition group-hover:text-blue-600">{post.title}</h2>
              <p className="mb-3 line-clamp-2 text-sm text-gray-500">{post.excerpt}</p>
              <time className="text-xs text-gray-400">{formatDate(post.date)}</time>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
