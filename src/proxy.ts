import { NextRequest, NextResponse } from 'next/server';
import { getCategoryByName } from '@/lib/categories';
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/catalog' && request.nextUrl.searchParams.has('category')) {
    const category = getCategoryByName(request.nextUrl.searchParams.get('category') || '');
    return NextResponse.redirect(new URL(category ? `/catalog/${category.slug}` : '/catalog', request.url), 301);
  }
  return NextResponse.next();
}
export const config = { matcher: '/catalog' };
