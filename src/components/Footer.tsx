import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <section className="space-y-2 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">Контакты</h2>
          <p>Email: info@example.ru</p>
          <p>Телефон: +7 (000) 000-00-00</p>
          <p>WhatsApp: +7 (000) 000-00-00</p>
          <p>Telegram: @example</p>
        </section>

        <section className="space-y-2 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">Навигация</h2>
          <ul className="space-y-1">
            <li>
              <Link href="/catalog" className="hover:text-slate-900">
                Каталог
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-slate-900">
                Блог
              </Link>
            </li>
            <li>
              <Link href="/podbor" className="hover:text-slate-900">
                Помочь подобрать
              </Link>
            </li>
            <li>
              <Link href="/contacts" className="hover:text-slate-900">
                Контакты
              </Link>
            </li>
          </ul>
        </section>

        <section className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">Нужна деталь? Напишите нам</h2>
          <p>
            Email: <Link href="mailto:info@example.ru">info@example.ru</Link>
          </p>
          <p>
            WhatsApp / Telegram: <Link href="https://wa.me/70000000000">+7 (000) 000-00-00</Link>
          </p>
        </section>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 py-5">
        <div className="mx-auto w-full max-w-6xl space-y-2 px-4 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} RenishawParts - Ваш надежный поставщик Renishaw в РФ и СНГ. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
