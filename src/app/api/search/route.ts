import { NextRequest, NextResponse } from 'next/server';

import { searchProducts } from '@/lib/search';

export function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (query.length < 2) {
    return NextResponse.json({
      results: [],
      total: 0,
    });
  }

  const results = searchProducts(query);

  return NextResponse.json({
    results,
    total: results.length,
  });
}
