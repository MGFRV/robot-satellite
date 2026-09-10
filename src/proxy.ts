import { NextRequest, NextResponse } from 'next/server';
import { getCategoryByName } from '@/lib/categories';
export function proxy(request: NextRequest) {
  if (request.headers.get('host')?.split(':')[0].toLowerCase() === 'www.schupy.ru') {
    const destination = request.nextUrl.clone();
    destination.hostname = 'schupy.ru';
    destination.protocol = 'https';
    destination.port = '';
    return NextResponse.redirect(destination, 308);
  }
  if (request.nextUrl.pathname === '/catalog' && request.nextUrl.searchParams.has('category')) {
    const category = getCategoryByName(request.nextUrl.searchParams.get('category') || '');
    return NextResponse.redirect(new URL(category ? `/catalog/${category.slug}` : '/catalog', request.url), 301);
  }
  return NextResponse.next();
}
export const config = { matcher: '/((?!_next/static|_next/image|favicon.ico).*)' };
