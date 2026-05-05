import Image from 'next/image';
import Link from 'next/link';

import { ProductCard } from '@/components/ProductCard';
import { RFQForm } from '@/components/RFQForm';
import { getAllProducts } from '@/lib/products';

const processSteps = [
  {
    title: 'Отправьте артикул или фото маркировки',
    description: 'Знаете обозначение — пришлите его. Нет — сфотографируйте наклейку или сам компонент.',
  },
  {
    title: 'Подтвердим совместимость и наличие',
    description: 'Проверяем по базе Renishaw. Уточняем под ваш станок, если нужно.',
  },
  {
    title: 'Доставим в любой город России и СНГ',
    description: 'Оригинальная упаковка, документы для таможни, отслеживание отправления.',
  },
];

const trustChips = [
  'Независимый поставщик оригинальных компонентов',
  'Проверка совместимости перед отправкой',
  'Подбор по фото и маркировке',
  'Широкий ассортимент компонентов Renishaw',
];

function formatPositions(count: number): string {
  const last = count % 10;
  const lastTwo = count % 100;

  if (last === 1 && lastTwo !== 11) return `${count} позиция`;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return `${count} позиции`;
  return `${count} позиций`;
}

export default function HomePage() {
  const products = getAllProducts();
  const latestProducts = products.slice(0, 8);

  const topCategories = [...products.reduce((acc, product) => {
    const current = acc.get(product.category) ?? 0;
    acc.set(product.category, current + 1);
    return acc;
  }, new Map<string, number>()).entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru-RU'))
    .slice(0, 8);

  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-2xl bg-[#0E0E0C] text-[#F2EFE9]">
        <div className="relative grid min-h-[320px] md:grid-cols-[minmax(320px,1fr)_minmax(420px,1.2fr)]">
          <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <defs>
              <pattern id="heroGrid" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M36 0H0V36" fill="none" stroke="#fff" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#heroGrid)" />
          </svg>

          <div className="relative z-10 flex max-w-md flex-col justify-center px-8 py-12">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D95215]">Оригинальные компоненты Renishaw</p>
            <h1 className="mb-4 text-[38px] font-extrabold leading-[1.06] tracking-[-0.03em]">Щупы, стилусы и датчики</h1>
            <p className="mb-7 max-w-[280px] text-[13px] leading-[1.65] text-[#F2EFE9]/45">
              Поставка измерительных компонентов для станков с ЧПУ. Подбор по артикулу или фото маркировки.
            </p>
            <a href="#rfq-form" className="inline-flex w-fit items-center gap-2 rounded-md bg-[#D95215] px-5 py-2.5 text-[13px] font-semibold text-white hover:opacity-95">
              Запросить цену <span aria-hidden>→</span>
            </a>
            <Link href="/podbor" className="mt-2.5 text-[11px] text-[#F2EFE9]/30 underline underline-offset-4">
              или помогите подобрать деталь
            </Link>
          </div>

          <div className="relative z-10 flex items-center justify-center p-4 md:justify-end md:p-5">
            <div className="relative w-full max-w-[640px] overflow-hidden rounded-[28px] md:aspect-[4/2.35]">
              <Image
                src="/hero-image.png"
                alt="Компоненты Renishaw"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 640px, (min-width: 768px) 50vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#F2EFE9] px-8 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D95215]" />
          <p className="flex-1 text-xs text-[#111110]">
            В наличии и под заказ <span className="text-black/45">— КП и сроки поставки в течение 10–30 минут в рабочее время. Поддерживаем поставку по РФ и СНГ.</span>
          </p>
          <a href="#rfq-form" className="whitespace-nowrap rounded-md border border-black/20 px-3.5 py-1.5 text-xs font-medium text-[#111110] hover:bg-black/5">
            Получить КП быстро
          </a>
        </div>
      </section>

      <section className="grid gap-10 bg-[#F2EFE9] px-8 py-12 md:grid-cols-[180px_1fr]">
        <div>
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D95215]">Процесс</p>
          <h2 className="text-2xl font-extrabold tracking-[-0.025em] text-[#111110]">Как мы работаем</h2>
        </div>
        <div>
          {processSteps.map((step, index) => (
            <div key={step.title} className="mb-6 flex items-start gap-4 border-b border-black/10 pb-6 last:mb-0 last:border-b-0 last:pb-0">
              <div className="w-14 shrink-0 text-5xl font-extrabold leading-none tracking-[-0.04em] text-black/10">{String(index + 1).padStart(2, '0')}</div>
              <div>
                <h3 className="text-sm font-semibold text-[#111110]">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-black/50">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap gap-1.5 px-8 pb-10">
        {trustChips.map((chip) => (
          <span key={chip} className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-[11px] text-black/55">
            {chip}
          </span>
        ))}
      </section>

      <section className="space-y-5 px-8 pb-12">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#111110]">Популярные категории</h2>
          <Link href="/catalog" className="text-xs font-medium text-[#D95215] hover:opacity-80">
            Все категории →
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {topCategories.map(([category, count]) => (
            <Link key={category} href={`/catalog?category=${encodeURIComponent(category)}`} className="rounded-lg border border-black/10 bg-white p-4 hover:border-black/20">
              <p className="text-xs font-semibold text-[#111110]">{category}</p>
              <p className="mt-1 text-[11px] text-black/40">{formatPositions(count)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Часто запрашивают</h2>
          <Link href="/catalog" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            Весь каталог
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {latestProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section id="rfq-form" className="space-y-4">
        <RFQForm title="Запросить цену" subject="Запрос цены с сайта" />
      </section>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-2xl font-semibold text-slate-900">FAQ по заказу</h2>
        <div className="space-y-3">
          <details className="rounded-lg border border-slate-200 p-4" open>
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">Как быстро вы отвечаете на запрос?</summary>
            <p className="mt-2 text-sm text-slate-700">Обычно отправляем КП и сроки в течение 10–30 минут в рабочее время.</p>
          </details>
          <details className="rounded-lg border border-slate-200 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">Как проверить совместимость детали?</summary>
            <p className="mt-2 text-sm text-slate-700">Пришлите артикул, фото маркировки или данные станка — проверим совместимость перед отгрузкой.</p>
          </details>
          <details className="rounded-lg border border-slate-200 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">Какие документы предоставляете?</summary>
            <p className="mt-2 text-sm text-slate-700">Подготовим полный комплект закрывающих документов для юрлиц и ИП.</p>
          </details>
          <details className="rounded-lg border border-slate-200 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">Есть ли доставка по регионам?</summary>
            <p className="mt-2 text-sm text-slate-700">Да, отправляем в любые регионы России и страны СНГ через надежные транспортные компании.</p>
          </details>
        </div>
      </section>

    </div>
  );
}
