import type { Metadata } from 'next';
import Script from 'next/script';

import './globals.css';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { StickyContact } from '@/components/StickyContact';
import { ScrollTopButton } from '@/components/ScrollTopButton';

const siteName = 'ЩУПЫ.РУ — поставка щупов Renishaw, стилусов и датчиков для ЧПУ.';
const siteDescription = 'ЩУПЫ.РУ — поставка щупов Renishaw, стилусов, датчиков и комплектующих для ЧПУ.';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://schupy.ru';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-24 md:pb-10">{children}</main>
        <Footer />
        <StickyContact />
        <ScrollTopButton />

        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=109048844', 'ym');

            ym(109048844, 'init', {
              ssr:true,
              webvisor:true,
              clickmap:true,
              ecommerce:"dataLayer",
              referrer: document.referrer,
              url: location.href,
              accurateTrackBounce:true,
              trackLinks:true
            });
          `}
        </Script>
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/109048844" style={{ position: 'absolute', left: '-9999px' }} alt="" />
          </div>
        </noscript>
      </body>
    </html>
  );
}
