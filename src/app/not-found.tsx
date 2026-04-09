import Link from 'next/link';

import { SearchBar } from '@/components/SearchBar';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 rounded-xl border border-slate-200 bg-white p-8 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Страница не найдена. Ищете конкретную деталь?</h1>
      <div className="mx-auto w-full max-w-xl">
        <SearchBar />
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/podbor" className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
          Помочь подобрать
        </Link>
        <Link href="/catalog" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800">
          Перейти в каталог
        </Link>
      </div>
    </section>
  );
}
