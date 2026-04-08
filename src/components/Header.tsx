import Link from 'next/link';

import { SearchBar } from '@/components/SearchBar';

const navItems = [
  { href: '/', label: 'Главная' },
  { href: '/catalog', label: 'Каталог' },
  { href: '/blog', label: 'Блог' },
  { href: '/contacts', label: 'Контакты' },
];

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-4">
        <Link href="/" className="shrink-0 text-lg font-semibold text-slate-900 hover:text-slate-700">
          [Название компании]
        </Link>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-4 text-sm font-medium text-slate-700 lg:gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-slate-950">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto w-full max-w-xl md:ml-0 md:flex-1">
          <SearchBar />
        </div>

        <Link
          href="/contacts"
          className="hidden shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 lg:inline-flex"
        >
          Оставить заявку
        </Link>
      </div>

      <div className="border-t border-slate-100 px-4 pb-3 pt-2 md:hidden">
        <nav>
          <ul className="flex items-center gap-4 overflow-x-auto text-sm font-medium text-slate-700">
            {navItems.map((item) => (
              <li key={item.href} className="shrink-0">
                <Link href={item.href} className="hover:text-slate-950">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
