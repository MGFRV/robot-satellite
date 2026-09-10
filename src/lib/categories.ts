import categoriesData from '../../content/categories.json';

export type Category = { slug: string; name: string; h1: string; title: string; description: string; intro_html: string; parent_id: string | null; sort: number };
export const categories = (categoriesData as Category[]).sort((a, b) => a.sort - b.sort);

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getCategoryByName(name: string) {
  return categories.find((category) => category.name === name);
}

export function categoryHref(name: string) {
  return getCategoryByName(name) ? `/catalog/${getCategoryByName(name)!.slug}` : '/catalog';
}
