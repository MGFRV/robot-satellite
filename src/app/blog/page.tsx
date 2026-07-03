import type { Metadata } from 'next';
import Link from 'next/link';

import { BlogPostCard } from '@/components/BlogPostCard';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Блог',
  description: 'Статьи о промышленной робототехнике, обслуживании и запчастях.',
};

const POSTS_PER_PAGE = 9;

type BlogPageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

function getPageNumber(value: string | undefined, totalPages: number): number {
  const parsed = Number(value ?? '1');

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return Math.min(parsed, totalPages);
}

function getPageHref(page: number): string {
  return page <= 1 ? '/blog' : `/blog?page=${page}`;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = (await searchParams) ?? {};
  const posts = getAllPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const currentPage = getPageNumber(params.page, totalPages);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const visiblePosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Блог</h1>
          <p className="mt-2 text-sm text-slate-600">Страница {currentPage} из {totalPages}</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePosts.map((post) => (
          <BlogPostCard key={post.slug} post={post} />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Навигация по страницам блога">
          <Link
            href={getPageHref(Math.max(1, currentPage - 1))}
            aria-disabled={currentPage === 1}
            className={`rounded-md border px-3 py-2 text-sm ${
              currentPage === 1 ? 'pointer-events-none border-slate-200 text-slate-300' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Назад
          </Link>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <Link
              key={page}
              href={getPageHref(page)}
              className={`rounded-md border px-3 py-2 text-sm ${
                page === currentPage
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {page}
            </Link>
          ))}

          <Link
            href={getPageHref(Math.min(totalPages, currentPage + 1))}
            aria-disabled={currentPage === totalPages}
            className={`rounded-md border px-3 py-2 text-sm ${
              currentPage === totalPages
                ? 'pointer-events-none border-slate-200 text-slate-300'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Вперёд
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
