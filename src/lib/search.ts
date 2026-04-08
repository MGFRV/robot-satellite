import type { Product } from '@/lib/products';
import { getAllProducts } from '@/lib/products';

export type SearchResult = Pick<Product, 'slug' | 'title' | 'article' | 'category' | 'brand'>;

type RankedResult = {
  product: Product;
  rank: number;
};

const SEARCH_WORD_MIN_LENGTH = 2;

function normalize(value: string): string {
  return value.toLowerCase().replace(/renishaw/gi, ' ').replace(/[.-]/g, '').replace(/\s+/g, ' ').trim();
}

function tokenize(query: string): string[] {
  return normalize(query)
    .split(' ')
    .map((part) => part.trim())
    .filter((part) => part.length >= SEARCH_WORD_MIN_LENGTH);
}

function getProductRank(product: Product, terms: string[]): number | null {
  const articleNormalized = normalize(product.article ?? '');
  const titleNormalized = normalize(product.title ?? '');
  const categoryNormalized = normalize(product.category ?? '');
  const brandNormalized = normalize(product.brand ?? '');
  const descriptionNormalized = normalize(product.description ?? '');

  const searchableFields = [articleNormalized, titleNormalized, categoryNormalized, brandNormalized, descriptionNormalized];

  const allTermsPresent = terms.every((term) => searchableFields.some((field) => field.includes(term)));
  if (!allTermsPresent) {
    return null;
  }

  const articleAllExact = terms.every((term) => articleNormalized === term);
  const articleIncludesAll = terms.every((term) => articleNormalized.includes(term));
  if (articleAllExact) {
    return 1;
  }

  if (articleIncludesAll) {
    return 2;
  }

  const titleIncludesAll = terms.every((term) => titleNormalized.includes(term));
  if (titleIncludesAll) {
    return 3;
  }

  const categoryIncludesAll = terms.every((term) => categoryNormalized.includes(term));
  if (categoryIncludesAll) {
    return 4;
  }

  const brandIncludesAll = terms.every((term) => brandNormalized.includes(term));
  if (brandIncludesAll) {
    return 5;
  }

  return 6;
}

function mapResult(product: Product): SearchResult {
  return {
    slug: product.slug,
    title: product.title,
    article: product.article,
    category: product.category,
    brand: product.brand,
  };
}

export function searchProducts(query: string): SearchResult[] {
  const terms = tokenize(query);

  if (terms.length === 0) {
    return [];
  }

  const ranked: RankedResult[] = [];

  for (const product of getAllProducts()) {
    const rank = getProductRank(product, terms);

    if (rank !== null) {
      ranked.push({ product, rank });
    }
  }

  return ranked
    .sort((a, b) => {
      if (a.rank !== b.rank) {
        return a.rank - b.rank;
      }

      return a.product.title.localeCompare(b.product.title, 'ru-RU');
    })
    .map((item) => mapResult(item.product));
}
