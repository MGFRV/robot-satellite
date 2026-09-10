const fs = require('node:fs');
const path = require('node:path');

const directory = path.join(process.cwd(), 'content', 'products');
const products = fs.readdirSync(directory).filter((file) => file.endsWith('.json')).map((file) => {
  const product = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
  for (const field of ['title', 'slug']) {
    if (typeof product[field] !== 'string' || !product[field].trim()) throw new Error(`${file}: missing ${field}`);
  }
  if (!product.specs || typeof product.specs !== 'object' || Array.isArray(product.specs)) throw new Error(`${file}: invalid specs`);
  if (!Array.isArray(product.images) || product.images.length === 0) throw new Error(`${file}: missing images`);
  return { file, ...product };
});

const slugs = new Map();
for (const product of products) {
  if (slugs.has(product.slug)) throw new Error(`Duplicate slug ${product.slug}: ${slugs.get(product.slug)}, ${product.file}`);
  slugs.set(product.slug, product.file);
}
console.log(`Validated ${products.length} products`);
