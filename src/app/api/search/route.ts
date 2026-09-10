import { NextRequest, NextResponse } from 'next/server';

import { searchProducts } from '@/lib/search';

const MAX_QUERY_LENGTH = 100;
const MAX_RESULTS = 10;

export function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (query.length < 2) {
    return NextResponse.json({
      results: [],
      total: 0,
    });
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ results: [], total: 0, error: 'Query is too long' }, { status: 400 });
  }

  const results = searchProducts(query);

  return NextResponse.json({
    results: results.slice(0, MAX_RESULTS),
    total: results.length,
  }, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } });
}
