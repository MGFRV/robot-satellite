'use client';

import Link from 'next/link';
import { useState } from 'react';

import { SearchBar } from '@/components/SearchBar';

const navItems = [
  { href: '/catalog', label: 'Каталог' },
  { href: '/blog', label: 'Блог' },
  { href: '/catalog', label: 'Поиск' },
  { href: '/podbor', label: 'Помочь с подбором' },
  { href: '/contacts', label: 'Контакты' },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="shrink-0 text-lg font-bold text-slate-900">
          Renishaw Parts B2B
        </Link>

        <nav className="hidden lg:block">
          <ul className="flex items-center gap-4 text-sm font-medium text-slate-700">
            {navItems.map((item) => (
              <li key={`${item.href}-${item.label}`}>
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
                <li key={`${item.href}-${item.label}`}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-md px-2 py-2 hover:bg-orange-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
