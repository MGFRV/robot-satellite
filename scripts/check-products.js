const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(process.cwd(), 'content/products');
const files = fs.readdirSync(dir).filter((file) => file.endsWith('.json'));
const products = files.map((file) => ({ file, ...JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) }));
const errors = [];
const slugs = new Map();
const articles = new Map();
for (const product of products) {
  for (const field of ['title', 'slug', 'brand', 'category', 'description']) if (typeof product[field] !== 'string' || !product[field].trim()) errors.push(`${product.file}: missing ${field}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug || '')) errors.push(`${product.file}: invalid product URL slug "${product.slug}"`);
  if (slugs.has(product.slug)) errors.push(`duplicate slug ${product.slug}: ${slugs.get(product.slug)}, ${product.file}`); else slugs.set(product.slug, product.file);
  if (!product.specs || typeof product.specs !== 'object' || Array.isArray(product.specs)) errors.push(`${product.file}: invalid specs`);
  if (!Array.isArray(product.images) || !product.images.length) errors.push(`${product.file}: missing images`);
  const article = typeof product.article === 'string' ? product.article.trim().toUpperCase() : '';
  if (article) (articles.get(article) || articles.set(article, []).get(article)).push(product);
}
for (const [article, rows] of articles) if (rows.length > 1) {
  const brands = [...new Set(rows.map((row) => String(row.brand).trim().toLowerCase()))];
  const message = `duplicate SKU/MPN ${article}: ${rows.map((row) => `${row.brand}/${row.slug}`).join(', ')}`;
  if (brands.length > 1) errors.push(message); else console.warn(`WARNING: ${message}`);
}
for (const [file, forbidden] of [['datchik-linejnyh-peremeschenij-ka300-sino.json','A-4038-0001'],['datchik-linejnyh-peremeschenij-ka500-sino.json','A-2197-0049'],['datchik-dlya-kontrolya-detalej-ts-640-heidenhain.json','A-2008-0368']]) {
  if (fs.readFileSync(path.join(dir,file),'utf8').includes(forbidden)) errors.push(`${file}: known foreign article ${forbidden}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Validated ${products.length} products; duplicate identifiers are reported above.`);
