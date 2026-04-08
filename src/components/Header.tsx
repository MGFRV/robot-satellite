'use client';

import Link from 'next/link';
import { useState } from 'react';

import { SearchBar } from '@/components/SearchBar';

import { SearchBar } from '@/components/SearchBar';

const navItems = [
  { href: '/catalog', label: 'Каталог' },
  { href: '/blog', label: 'Блог' },
  { href: '/podbor', label: 'Помочь подобрать' },
  { href: '/contacts', label: 'Контакты' },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="shrink-0 text-lg font-bold text-slate-900">
          Renishaw Parts B2B
        </Link>

        <nav className="hidden lg:block">
          <ul className="flex items-center gap-5 text-sm font-medium text-slate-700">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-slate-950">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto hidden w-full max-w-xl md:block">
          <SearchBar />
        </div>

        <Link
          href="#rfq-form"
          className="hidden rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 md:inline-flex"
        >
          Запросить цену
        </Link>

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
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-md px-2 py-2 hover:bg-slate-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="#rfq-form"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mt-2 inline-flex rounded-md bg-orange-500 px-3 py-2 text-white"
                >
                  Запросить цену
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
