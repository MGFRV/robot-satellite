const fs = require('node:fs'); const path = require('node:path');
const blogDir='content/blog', productDir='content/products';
const blog=new Set(fs.readdirSync(blogDir).filter(f=>f.endsWith('.mdx')).map(f=>f.slice(0,-4)));
const products=new Set(fs.readdirSync(productDir).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(productDir,f))).slug));
const categories=new Set(JSON.parse(fs.readFileSync('content/categories.json')).map(x=>x.slug));
const errors=[];
for(const file of fs.readdirSync(blogDir).filter(f=>f.endsWith('.mdx'))){const source=fs.readFileSync(path.join(blogDir,file),'utf8'); const links=[...source.matchAll(/(?:\]\(|href=["'])(\/(?:blog|catalog)(?:\/[^)"'#?\s]+)?(?:\?[^)"'#\s]+)?)/g)].map(m=>m[1]); for(const href of links){const url=new URL(href,'https://schupy.ru'); if(url.pathname==='/catalog'&&url.search) errors.push(`${file}: unsupported catalog query ${href}`); const [,root,slug]=url.pathname.split('/'); if(root==='blog'&&slug&&!blog.has(slug)) errors.push(`${file}: missing blog slug ${slug}`); if(root==='catalog'&&slug&&!products.has(slug)&&!categories.has(slug)) errors.push(`${file}: missing catalog slug ${slug}`);}}
if(errors.length){console.error(errors.join('\n'));process.exit(1)} console.log(`Validated internal links in ${blog.size} articles.`);
