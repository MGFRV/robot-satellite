const fs = require('node:fs');
const path = require('node:path');

const errors = [];
const read = (file) => fs.readFileSync(file, 'utf8');

for (const file of fs.readdirSync('content/products').filter((name) => name.endsWith('.json'))) {
  const product = JSON.parse(read(path.join('content/products', file)));
  if (typeof product.title !== 'string' || !product.title.trim()) errors.push(`${file}: missing title`);
  if (typeof (product.metaDescription || product.description) !== 'string' || !(product.metaDescription || product.description).trim()) {
    errors.push(`${file}: missing metadata description fallback`);
  }
}

const canonicalPages = [
  'src/app/page.tsx',
  'src/app/catalog/page.tsx',
  'src/app/catalog/[...slug]/page.tsx',
  'src/app/blog/page.tsx',
  'src/app/blog/[slug]/page.tsx',
  'src/app/contacts/page.tsx',
  'src/app/podbor/page.tsx',
  'src/app/about/page.tsx',
  'src/app/delivery/page.tsx',
  'src/app/payment/page.tsx',
  'src/app/warranty/page.tsx',
  'src/app/privacy/page.tsx',
  'src/app/consent/page.tsx',
];
for (const file of canonicalPages) {
  const source = read(file);
  if (!source.includes('title:')) errors.push(`${file}: missing metadata title`);
  if (!source.includes('description:')) errors.push(`${file}: missing metadata description`);
  if (!source.includes('canonical')) errors.push(`${file}: missing canonical`);
}

const catalogPage = read('src/app/catalog/page.tsx');
if (!/robots:\s*isSearch\s*\?\s*\{\s*index:\s*false,\s*follow:\s*true/.test(catalogPage)) {
  errors.push('catalog search must be noindex, follow');
}
const cartPage = read('src/app/cart/page.tsx');
if (!/robots:\s*\{\s*index:\s*false,\s*follow:\s*true/.test(cartPage)) errors.push('cart must be noindex, follow');

const productPage = read('src/app/catalog/[...slug]/page.tsx');
for (const forbidden of [/price\s*:\s*0/, /mpn:\s*product\.article/, /schema\.org\/InStock/, /schema\.org\/PreOrder/]) {
  if (forbidden.test(productPage)) errors.push(`Product JSON-LD contains forbidden pattern ${forbidden}`);
}
if (!productPage.includes("'@type': 'Product'") || !productPage.includes("'@type': 'BreadcrumbList'")) {
  errors.push('product template must contain Product and BreadcrumbList JSON-LD');
}

const sitemap = read('src/lib/sitemaps.ts');
if (sitemap.includes("'/cart'")) errors.push('noindex cart must not be in sitemap');
if (/new Date\(\)/.test(sitemap) || /statSync\([^)]*\)\.mtime/.test(sitemap)) errors.push('sitemap must not use build-time dates');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Validated SEO metadata for ${canonicalPages.length} templates and structured-data invariants.`);
