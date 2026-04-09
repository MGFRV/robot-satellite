import Link from 'next/link';

import { ProductCard } from '@/components/ProductCard';
import { RFQForm } from '@/components/RFQForm';
import { SearchBar } from '@/components/SearchBar';
import { TrustBlock } from '@/components/TrustBlock';
import { getAllProducts, getCategories } from '@/lib/products';

export default function HomePage() {
  const products = getAllProducts();
  const categories = getCategories().slice(0, 8);
  const latestProducts = products.slice(0, 8);

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-slate-900 p-8 text-white md:p-12">
        <div className="max-w-3xl space-y-5">
          <h1 className="text-3xl font-bold md:text-5xl">Щупы, стилусы и датчики Renishaw</h1>
          <p className="text-base text-slate-100 md:text-lg">
            Поставка оригинальных измерительных компонентов для станков с ЧПУ. Помощь в подборе по маркировке.
          </p>
          <p className="text-sm text-slate-200">
            Подберем и доставим оригинальное оборудование и запчасти Renishaw в РФ
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#rfq-form" className="rounded-md bg-orange-500 px-5 py-3 text-sm font-semibold hover:bg-orange-600">
              Запросить цену
            </a>
            <Link
              href="/podbor"
              className="rounded-md border border-slate-500 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Помочь подобрать деталь
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-3">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">Поиск по артикулу</h2>
          <p className="text-sm text-slate-600">Введите артикул в поиске чтобы быстро найти товар.</p>
          <SearchBar />
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">Каталог по категориям</h2>
          <Link href="/catalog" className="text-sm font-medium text-orange-600 hover:text-orange-700">
            Открыть каталог →
          </Link>
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900">Не знаете артикул?</h2>
          <Link href="/podbor" className="text-sm font-medium text-orange-600 hover:text-orange-700">
            Помочь с подбором →
          </Link>
        </div>
      </section>

      <section className="space-y-5 rounded-xl border border-orange-200 bg-orange-50 p-6">
        <h2 className="text-2xl font-semibold text-slate-900">Как мы работаем</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          <li className="rounded-lg border border-orange-100 bg-white p-4 text-sm text-slate-700">
            Отправьте артикул или фото маркировки
          </li>
          <li className="rounded-lg border border-orange-100 bg-white p-4 text-sm text-slate-700">
            Мы подтвердим совместимость и наличие
          </li>
          <li className="rounded-lg border border-orange-100 bg-white p-4 text-sm text-slate-700">
            Доставим в любой город России и СНГ
          </li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-orange-500">Почему нам доверяют</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
            Оригинальные комплектующие и щупы Renishaw 
          </p>
          <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
            30 лет на рынке поставки измерительного оборудования
          </p>
          <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
            Техническая поддержка ваших заказов
          </p>
          <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
            Более 500 позиций в каталоге и привоз под заказ
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Популярные категории</h2>
          <Link href="/catalog" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            Все категории
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category}
              href="/catalog"
              className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 hover:border-orange-300"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Последние товары</h2>
          <Link href="/catalog" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            Смотреть все
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

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-semibold text-slate-900">Не нашли нужную деталь?</h2>
        <p className="mt-2 text-sm text-slate-700">Отправьте артикул или фото маркировки — быстро подберём вариант и сроки.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/podbor" className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
            Помочь с подбором
          </Link>
          <Link
            href="https://wa.me/70000000000"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800"
          >
            Написать в WhatsApp
          </Link>
        </div>
      </section>
    </div>
  );
}
