import { compile, run } from '@mdx-js/mdx';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import rehypeSlug from 'rehype-slug';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';

import { formatDate, getAllSlugs, getPostBySlug, getRelatedPosts } from '@/lib/blog';

interface Props {
  params: Promise<{ slug: string }>;
}

async function renderMDX(source: string) {
  const code = String(
    await compile(source, {
      outputFormat: 'function-body',
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug],
    }),
  );

  const { default: MDXContent } = await run(code, {
    ...runtime,
    baseUrl: new URL(`file://${process.cwd()}/`),
  });

  return MDXContent;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const MDXContent = await renderMDX(post.content);
  const related = getRelatedPosts(slug, post.tags, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.date,
    description: post.excerpt,
    image: post.coverImage || undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="mx-auto max-w-3xl px-4 py-12">
        <nav className="mb-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600">
            Главная
          </Link>
          <span className="mx-2">→</span>
          <Link href="/blog" className="hover:text-gray-600">
            Блог
          </Link>
          <span className="mx-2">→</span>
          <span className="text-gray-600">{post.title}</span>
        </nav>

        {post.coverImage && (
          <div className="relative mb-8 aspect-video overflow-hidden rounded-xl">
            <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
          </div>
        )}

        <h1 className="mb-4 text-3xl font-bold md:text-4xl">{post.title}</h1>

        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <time>{formatDate(post.date)}</time>
          <span>•</span>
          <div className="flex gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div
          className="prose prose-lg max-w-none
          prose-headings:font-bold
          prose-a:text-blue-600 prose-a:underline
          prose-strong:font-semibold
          prose-table:border-collapse
          prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-3 prose-th:py-2 prose-th:text-left
          prose-td:border prose-td:border-gray-300 prose-td:px-3 prose-td:py-2
          prose-blockquote:rounded-r-lg prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50
          prose-img:rounded-lg"
        >
          <MDXContent />
        </div>

        {related.length > 0 && (
          <div className="mt-16 border-t pt-8">
            <h2 className="mb-6 text-xl font-bold">Похожие статьи</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="group block rounded-lg border p-4 transition hover:shadow-sm"
                >
                  <h3 className="mb-2 font-medium transition group-hover:text-blue-600">{relatedPost.title}</h3>
                  <p className="line-clamp-2 text-sm text-gray-500">{relatedPost.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
