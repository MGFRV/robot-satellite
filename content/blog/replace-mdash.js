const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!entry.isFile() || !fullPath.endsWith('.mdx')) {
      continue;
    }

    const original = fs.readFileSync(fullPath, 'utf8');
    const updated = original
      .replace(/—/g, '-')
      .replace(/–/g, '-');

    if (updated !== original) {
      fs.writeFileSync(fullPath, updated, 'utf8');
      console.log(`Updated: ${fullPath}`);
    }
  }
}

walk(rootDir);
console.log('Done.');