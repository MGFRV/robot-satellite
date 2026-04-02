import { notFound } from 'next/navigation';

import { getBlogPostBySlug, getBlogPosts } from '@/lib/blog';

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-slate-500">{post.date}</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{post.title}</h1>
        <p className="text-slate-700">{post.excerpt}</p>
      </header>
      <div className="prose prose-slate max-w-none whitespace-pre-line">{post.content}</div>
    </article>
  );
}
