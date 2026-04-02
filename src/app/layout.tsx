import type { Metadata } from 'next';

import './globals.css';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

const siteName = '[Название компании]';
const siteDescription = 'Поставки комплектующих и оборудования для промышленных роботов.';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

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
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
