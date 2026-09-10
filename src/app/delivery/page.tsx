import type { Metadata } from 'next';
import { INFO_PAGES } from '@/lib/pages';
const page = INFO_PAGES['delivery'];
export const metadata: Metadata = { title: { absolute: page.title }, description: page.description, alternates: { canonical: '/delivery' } };
export default function Page() { return <article className="prose prose-slate mx-auto max-w-3xl"><h1>{page.h1}</h1>{page.sections.map(([heading, text]) => <section key={heading}><h2>{heading}</h2><p>{text}</p>{heading === 'Офис и склад' ? <div className="rounded border bg-slate-100 p-8 text-center" role="img" aria-label="Фотографии офиса и склада ожидают согласования">Фотографии будут добавлены после согласования</div> : null}</section>)}</article>; }
