'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';

type SearchApiResult = {
  slug: string;
  title: string;
  article: string;
  category: string;
  brand: string;
};

type SearchApiResponse = {
  results: SearchApiResult[];
  total: number;
};

const MAX_DROPDOWN_RESULTS = 6;

function MagnifierIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm10 16.59-4.24-4.24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchApiResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, [pathname]);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setTotal(0);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as SearchApiResponse;
        setResults(data.results.slice(0, MAX_DROPDOWN_RESULTS));
        setTotal(data.total);
        setIsOpen(true);
        setActiveIndex(-1);
      } catch {
        setResults([]);
        setTotal(0);
        setIsOpen(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showNoResults = query.trim().length >= 2 && isOpen && results.length === 0;
  const allResultsHref = useMemo(() => `/catalog?search=${encodeURIComponent(query.trim())}`, [query]);

  function submitSearch(searchQuery: string) {
    const trimmed = searchQuery.trim();
    if (trimmed.length === 0) {
      return;
    }

    setIsOpen(false);
    setActiveIndex(-1);
    router.push(`/catalog?search=${encodeURIComponent(trimmed)}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => {
        if (results.length === 0) {
          return -1;
        }

        return prev >= results.length - 1 ? 0 : prev + 1;
      });
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => {
        if (results.length === 0) {
          return -1;
        }

        return prev <= 0 ? results.length - 1 : prev - 1;
      });
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      if (activeIndex >= 0 && activeIndex < results.length) {
        const selected = results[activeIndex];
        setIsOpen(false);
        setActiveIndex(-1);
        router.push(`/catalog/${selected.slug}`);
        return;
      }

      submitSearch(query);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <MagnifierIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => {
              if (query.trim().length >= 2) {
                setIsOpen(true);
              }
            }}
            onKeyDown={onKeyDown}
            placeholder="Поиск по артикулу или названию..."
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-500"
            aria-label="Поиск по каталогу"
          />
        </div>

      </div>

      {isOpen ? (
        <div className="animate-fade-in absolute left-0 top-[calc(100%+0.5rem)] z-50 w-full rounded-xl border border-slate-200 bg-white shadow-lg md:w-full">
          {results.length > 0 ? (
            <>
              <ul className="max-h-[22rem] overflow-auto py-2">
                {results.map((result, index) => (
                  <li key={result.slug}>
                    <Link
                      href={`/catalog/${result.slug}`}
                      onClick={() => {
                        setIsOpen(false);
                        setActiveIndex(-1);
                      }}
                      className={`block px-4 py-3 text-sm ${
                        activeIndex === index ? 'bg-slate-100' : 'hover:bg-slate-100'
                      }`}
                    >
                      <p className="text-slate-900">
                        <span className="font-semibold">{result.article}</span> {result.title} ·{' '}
                        <span className="text-xs text-slate-500">{result.category}</span>
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="border-t border-slate-200 px-4 py-3">
                <Link
                  href={allResultsHref}
                  onClick={() => {
                    setIsOpen(false);
                    setActiveIndex(-1);
                  }}
                  className="text-sm font-medium text-slate-800 hover:text-slate-950"
                >
                  Все результаты по запросу &quot;{query.trim()}&quot; →
                </Link>
                <p className="mt-1 text-xs text-slate-500">Найдено: {total}</p>
              </div>
            </>
          ) : null}

          {showNoResults ? (
            <div className="space-y-3 px-4 py-4 text-sm">
              <p className="font-medium text-slate-900">По запросу &quot;{query.trim()}&quot; ничего не найдено</p>
              <p className="text-slate-600">Попробуйте ввести артикул или часть названия.</p>
              <p className="text-slate-600">Не нашли? Отправьте маркировку — поможем подобрать.</p>
              <Link
                href="/podbor"
                onClick={() => {
                  setIsOpen(false);
                  setActiveIndex(-1);
                }}
                className="inline-block font-medium text-slate-800 hover:text-slate-950"
              >
                Помочь подобрать деталь →
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
