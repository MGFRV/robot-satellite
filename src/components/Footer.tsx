import Link from 'next/link';

import { CONTACT_LINKS } from '@/lib/contact-links';

export function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <section className="space-y-2 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">Контакты</h2>
          <p>Email: zakaz@schupy.ru</p>
          <p>Телефон: +7 961 137-59-74</p>
          <p>WhatsApp: +7 961 137-59-74</p>
          <p>Telegram: +7 961 137-59-74</p>
          <p>MAX: написать в MAX</p>
        </section>

        <section className="space-y-2 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">Навигация</h2>
          <ul className="space-y-1">
            <li><Link href="/catalog" className="hover:text-slate-900">Каталог</Link></li>
            <li><Link href="/blog" className="hover:text-slate-900">Блог</Link></li>
            <li><Link href="/podbor" className="hover:text-slate-900">Помочь подобрать</Link></li>
            <li><Link href="/contacts" className="hover:text-slate-900">Контакты</Link></li>
          </ul>
        </section>

        <section className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">Нужны запчасти? Мы всегда на связи</h2>
          <p> </p>
          <div className="flex gap-2 pt-1">
            <Link
              href={CONTACT_LINKS.whatsapp}
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.824L.057 23.428a.5.5 0 0 0 .609.61l5.71-1.496A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.5-5.24-1.375l-.372-.214-3.892 1.02 1.001-3.79-.228-.381A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              WhatsApp
            </Link>
            <Link
              href={CONTACT_LINKS.telegram}
              className="inline-flex items-center gap-2 rounded-lg bg-[#229ED9] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/>
              </svg>
              Telegram
            </Link>
            <Link
              href={CONTACT_LINKS.max}
              className="inline-flex items-center gap-2 rounded-lg bg-[#5B50D6] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2.5A9.5 9.5 0 0 0 2.5 12a9.45 9.45 0 0 0 1.6 5.3L3 21.5l4.3-1.1A9.5 9.5 0 1 0 12 2.5zm0 1.8a7.7 7.7 0 1 1-3.8 14.4l-.3-.2-2.7.7.7-2.6-.2-.3A7.67 7.67 0 0 1 12 4.3zm0 2a5.7 5.7 0 0 0-4 1.6 5.5 5.5 0 0 0 0 7.8l.1.1-.4 1.6 1.7-.4.1.1A5.7 5.7 0 1 0 12 6.3z"/>
              </svg>
              MAX
            </Link>
          </div>
        </section>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 py-5">
        <div className="mx-auto w-full max-w-6xl space-y-2 px-4 text-xs text-slate-600">
          <p>© 2005–2026 ЩУПЫ.РУ. Москва, Ленинский проспект, д. 15А. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}