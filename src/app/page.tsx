import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Добро пожаловать в [Название компании]</h1>
      <p className="max-w-2xl text-base text-slate-700">
        Мы создаём надёжные решения для вашего бизнеса. Ознакомьтесь с нашим каталогом товаров и полезными статьями
        в блоге.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/catalog" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          Перейти в каталог
        </Link>
        <Link href="/blog" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100">
          Читать блог
        </Link>
      </div>
    </section>
  );
}
