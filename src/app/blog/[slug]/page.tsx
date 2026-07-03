import { compile, run } from '@mdx-js/mdx';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ComponentType } from 'react';
import rehypeSlug from 'rehype-slug';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';

import { BlogPostCard } from '@/components/BlogPostCard';
import { BLOG_IMAGE_PLACEHOLDER } from '@/lib/assets';
import { formatDate, getAllSlugs, getPostBySlug, getRelatedPosts } from '@/lib/blog';

interface Props {
  params: Promise<{ slug: string }>;
}

type HastNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: unknown[];
};

function wrapTablesInScrollableContainer(node: HastNode) {
  if (!Array.isArray(node.children)) {
    return;
  }

  node.children = node.children.map((child) => {
    if (typeof child !== 'object' || child === null) {
      return child;
    }

    const childNode = child as HastNode;

    if (childNode.type === 'element' && childNode.tagName === 'table') {
      childNode.properties = {
        ...childNode.properties,
        border: '1',
        style: 'width: 100%; min-width: 600px; border-collapse: collapse;',
      };

      return {
        type: 'element',
        tagName: 'div',
        properties: {
          style: 'overflow-x: auto; -webkit-overflow-scrolling: touch;',
        },
        children: [childNode],
      };
    }

    wrapTablesInScrollableContainer(childNode);
    return childNode;
  });
}

function rehypeScrollableTables() {
  return wrapTablesInScrollableContainer;
}

const mdxComponentCache = new Map<string, Promise<ComponentType>>();

async function compileMDX(source: string) {
  const code = String(
    await compile(source, {
      outputFormat: 'function-body',
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug, rehypeScrollableTables],
    }),
  );

  const { default: MDXContent } = await run(code, {
    ...runtime,
    baseUrl: new URL(`file://${process.cwd()}/`),
  });

  return MDXContent as ComponentType;
}

async function renderMDX(slug: string, source: string) {
  const cached = mdxComponentCache.get(slug);

  if (cached) {
    return cached;
  }

  const compiled = compileMDX(source);
  mdxComponentCache.set(slug, compiled);
  return compiled;
}

export const dynamicParams = false;

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
      images: [post.coverImage || BLOG_IMAGE_PLACEHOLDER],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const MDXContent = await renderMDX(slug, post.content);
  const related = getRelatedPosts(slug, post.tags, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.date,
    description: post.excerpt,
    image: post.coverImage || BLOG_IMAGE_PLACEHOLDER,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="mx-auto min-w-0 max-w-3xl overflow-hidden px-4 py-8 sm:py-12">
        <nav className="mb-6 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 break-words text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600">
            Главная
          </Link>
          <span>→</span>
          <Link href="/blog" className="hover:text-gray-600">
            Блог
          </Link>
          <span>→</span>
          <span className="text-gray-600">{post.title}</span>
        </nav>

        <div className="relative mb-8 aspect-video overflow-hidden rounded-xl">
          <Image
            src={post.coverImage || BLOG_IMAGE_PLACEHOLDER}
            alt={post.title}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>

        <h1 className="mb-4 break-words text-3xl font-bold md:text-4xl">{post.title}</h1>

        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <time>{formatDate(post.date)}</time>
          <span>•</span>
          <div className="flex min-w-0 flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="max-w-full break-words rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div
          className="prose prose-slate max-w-none break-words prose-pre:max-w-full prose-pre:overflow-x-auto prose-code:break-words sm:prose-lg
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
                <BlogPostCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
