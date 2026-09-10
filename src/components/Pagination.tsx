import Link from 'next/link';

export function Pagination({ current, total, base }: { current: number; total: number; base: string }) {
  if (total <= 1) return null;
  const href = (page: number) => page === 1 ? base : `${base}?page=${page}`;
  return <nav aria-label="Постраничная навигация" className="flex flex-wrap justify-center gap-2">
    {Array.from({ length: total }, (_, index) => index + 1).map((page) =>
      <Link key={page} href={href(page)} aria-current={page === current ? 'page' : undefined}
        className={`rounded border px-3 py-2 text-sm ${page === current ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}>{page}</Link>)}
  </nav>;
}
