import Image from 'next/image';
import { notFound } from 'next/navigation';

import { formatBlogDate, getAllPosts, getPostBySlug } from '@/lib/blog';

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="space-y-6">
      <header className="space-y-3">
        <p className="text-sm text-slate-500">{formatBlogDate(post.date)}</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{post.title}</h1>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              #{tag}
            </span>
          ))}
        </div>
      </header>

      <Image
        src={post.coverImage}
        alt={post.title}
        width={1400}
        height={700}
        unoptimized
        className="h-72 w-full rounded-lg border border-slate-200 object-cover"
      />

      <div className="prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-a:text-blue-700">
        {post.content}
      </div>
    </article>
  );
}
