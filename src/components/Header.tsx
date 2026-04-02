import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Главная' },
  { href: '/catalog', label: 'Каталог' },
  { href: '/blog', label: 'Блог' },
  { href: '/contacts', label: 'Контакты' },
];

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-slate-900 hover:text-slate-700">
          [Название компании]
        </Link>
        <nav>
          <ul className="flex items-center gap-4 text-sm font-medium text-slate-700 md:gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
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
