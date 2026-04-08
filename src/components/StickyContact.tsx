'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const hiddenOnPaths = ['/podbor', '/contacts'];

export function StickyContact() {
  const pathname = usePathname();

  if (hiddenOnPaths.includes(pathname)) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-3 shadow-[0_-4px_16px_rgba(15,23,42,0.12)] md:hidden">
      <div className="mx-auto flex max-w-5xl gap-2">
        <a
          href="#rfq-form"
          className="flex-1 rounded-md bg-orange-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-orange-600"
        >
          Запросить цену
        </a>
        <Link
          href="https://wa.me/70000000000"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-800"
        >
          WhatsApp
        </Link>
      </div>
    </div>
  );
}
