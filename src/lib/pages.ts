import pages from '../../content/pages.json';
export type InfoPage = { title: string; description: string; h1: string; sections: [string, string][] };
export const INFO_PAGES = pages as unknown as Record<string, InfoPage>;
