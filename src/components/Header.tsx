'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { CartButton } from '@/components/CartButton';
import { SearchBar } from '@/components/SearchBar';

const primaryNavItems = [
  { href: '/catalog', label: 'Каталог' },
  { href: '/blog', label: 'Блог' },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="shrink-0" aria-label="ЩУПЫ.РФ — на главную">
          <img
            src="/logo-schupy-horiz.png"
            alt="ЩУПЫ.РФ — Купить щупы для ЧПУ от Renishaw и других брендов в РФ"
            width={220}
            height={74}
            className="h-10 w-auto"
            onError={(event) => {
              const img = event.currentTarget;
              if (img.src.endsWith('/logo-schupy-horiz.png')) {
                img.src = '/logo%20schupy%20horiz.png';
              }
            }}
          />
        </Link>

        <nav className="hidden lg:block">
          <ul className="flex items-center gap-4 text-sm font-medium text-slate-700">
            {primaryNavItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="rounded-md px-2 py-1 hover:bg-orange-50 hover:text-slate-950">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto hidden w-full max-w-xl md:block" id="header-search">
          <SearchBar />
        </div>

        <Link
          href="/podbor"
          className="hidden whitespace-nowrap rounded-md bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 md:inline-flex"
        >
          Помочь с подбором
        </Link>

        <div className="hidden md:block">
          <CartButton />
        </div>

        <button
          type="button"
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 lg:hidden"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label="Открыть меню"
        >
          ☰
        </button>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-3 md:hidden">
        <SearchBar />
      </div>

      {isMobileMenuOpen ? (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="mx-auto w-full max-w-6xl px-4 py-3">
            <ul className="space-y-2 text-sm font-medium text-slate-700">
              {primaryNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-md px-2 py-2 hover:bg-orange-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/podbor"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-md bg-orange-500 px-2 py-2 font-bold text-white"
                >
                  Помочь с подбором
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-md px-2 py-2 hover:bg-orange-50"
                >
                  Список запроса
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
