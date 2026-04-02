/**
 * Универсальный парсер карточек товаров
 * 
 * Поддержка:
 *   - Shopify магазины (через JSON API)
 *   - HTML-сайты с каталогом (через cheerio)
 * 
 * Установка зависимостей:
 *   npm install cheerio
 * 
 * Запуск:
 *   node scrape-products.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

let cheerio;
try {
  cheerio = require('cheerio');
} catch {
  console.error('Установите cheerio: npm install cheerio');
  process.exit(1);
}

// ─── Настройки ───────────────────────────────────────────────
const S3_BUCKET = 'rbstorage';
const OUTPUT_DIR = path.join(__dirname, 'content', 'products');
// ─────────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

// ─── Утилиты ─────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/#/g, '-')
    .replace(/[\/\\]/g, '-')
    .replace(/[^a-z0-9а-яё\-]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function detectCondition(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('new') || t.includes('новый') || t.includes('новая')) return 'Новый';
  if (t.includes('refurbished') || t.includes('восстановлен')) return 'Восстановленный';
  if (t.includes('used') || t.includes('б/у') || t.includes('б.у')) return 'Б/У';
  return 'Уточняйте';
}

function makeCard({ title, slug, article, price, category, brand, description, specs, weight }) {
  const card = {
    title: title,
    slug: slug,
    article: article || slug.toUpperCase(),
    price: price && parseFloat(price) > 0 ? parseFloat(price) : null,
    category: category || 'Запчасти для роботов',
    brand: brand || '',
    description: description || `${brand} ${article}. Запчасть для промышленного оборудования.`,
    specs: {
      'Производитель': brand || '',
      'Артикул': article || '',
      ...(specs || {}),
      'Наличие': 'Под заказ',
    },
    images: [
      `https://storage.yandexcloud.net/${S3_BUCKET}/products/${(brand || 'other').toLowerCase()}/${slug}/1.jpg`
    ],
  };
  if (weight) card.specs['Вес'] = weight;
  return card;
}

function saveCard(card) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  const filePath = path.join(OUTPUT_DIR, `${card.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(card, null, 2), 'utf-8');
  return filePath;
}

async function fetchPage(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/json',
      'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} для ${url}`);
  return response.text();
}

// ─── Shopify парсер ──────────────────────────────────────────

const CATEGORY_MAP = {
  'Servo Drives': 'Сервоприводы',
  'Servo Motors': 'Сервомоторы',
  'Teach Pendants': 'Пульты управления',
  'Robotic Controller': 'Контроллеры',
  'Module': 'Модули',
  'RV Reducer': 'Редукторы',
  'Connectors & Accessories': 'Кабели и разъёмы',
  'Circuit Boards': 'Платы управления',
  'PCB Board': 'Платы управления',
  'Robot Power Supply': 'Блоки питания',
  'Power Supplies': 'Блоки питания',
  'Cooling Fans': 'Вентиляторы',
  'PLC Modules': 'Модули ПЛК',
  'Robot Arms': 'Роботы',
};

async function parseShopify(baseUrl, limit) {
  // Убираем trailing slash и добавляем products.json
  const cleanUrl = baseUrl.replace(/\/+$/, '');
  const apiUrl = `${cleanUrl}/products.json?limit=${limit}`;
  
  console.log(`\nShopify API: ${apiUrl}`);
  const text = await fetchPage(apiUrl);
  const data = JSON.parse(text);
  const products = data.products || [];
  console.log(`Найдено: ${products.length} товаров`);

  const cards = [];
  for (const p of products.slice(0, limit)) {
    const variant = p.variants?.[0] || {};
    const sku = variant.sku || p.handle.toUpperCase();
    const brand = p.vendor || '';
    const productType = p.product_type || '';
    const categoryRu = CATEGORY_MAP[productType] || 'Запчасти для роботов';
    const plain = stripHtml(p.body_html || '');

    // Формируем название БЕЗ категории
    const card = makeCard({
      title: `${brand} ${sku}`.trim(),
      slug: p.handle,
      article: sku,
      price: variant.price,
      category: categoryRu,
      brand: brand,
      description: `${categoryRu} ${brand} ${sku} для промышленных роботов. ${detectCondition(plain + ' ' + p.title) !== 'Уточняйте' ? detectCondition(plain + ' ' + p.title) + '.' : ''} Полностью протестирован, готов к установке.`.trim(),
      weight: variant.grams ? `${(variant.grams / 1000).toFixed(1)} kg` : null,
      specs: {
        'Тип': productType || 'Запчасть',
        'Состояние': detectCondition(plain + ' ' + p.title),
      },
    });

    cards.push(card);
  }
  return cards;
}

// ─── HTML парсер (fanuc-controller.com и подобные) ───────────

async function parseHtmlCatalog(catalogUrl, limit) {
  console.log(`\nЗагрузка каталога: ${catalogUrl}`);
  const html = await fetchPage(catalogUrl);
  const $ = cheerio.load(html);

  // Извлекаем ссылки на товары
  const links = new Set();
  const baseHost = new URL(catalogUrl).origin;

  // Стратегия: ищем все ссылки, которые ведут на страницы внутри текущего раздела
  // или содержат паттерны товарных страниц
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    const fullUrl = href.startsWith('http') ? href : `${baseHost}${href.startsWith('/') ? '' : '/'}${href}`;

    // Пропускаем навигационные и служебные ссылки
    if (fullUrl.includes('/cart') || fullUrl.includes('/login') || fullUrl.includes('/account')) return;
    if (fullUrl.includes('mailto:') || fullUrl.includes('tel:') || fullUrl.includes('#')) return;
    if (fullUrl.includes('javascript:')) return;

    // Берём только ссылки с того же домена
    try {
      const linkHost = new URL(fullUrl).origin;
      if (linkHost !== baseHost) return;
    } catch { return; }

    // Ищем паттерны товарных страниц
    if (
      fullUrl.match(/\.(html|htm)$/) ||
      fullUrl.includes('/products/') ||
      fullUrl.includes('/product/') ||
      fullUrl.includes('/tovar/') ||
      fullUrl.includes('/item/')
    ) {
      // Исключаем страницы категорий и каталога
      if (fullUrl === catalogUrl) return;
      if (fullUrl.endsWith('/')) return; // скорее всего категория
      links.add(fullUrl);
    }
  });

  // Также ищем ссылки внутри блоков с классами, содержащими "product", "item", "card"
  $('[class*="product"], [class*="item"], [class*="card"], [class*="catalog"]').find('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href || href.includes('#') || href.includes('mailto:') || href.includes('javascript:')) return;
    const fullUrl = href.startsWith('http') ? href : `${baseHost}${href.startsWith('/') ? '' : '/'}${href}`;
    try {
      if (new URL(fullUrl).origin === baseHost && fullUrl !== catalogUrl) {
        links.add(fullUrl);
      }
    } catch {}
  });

  const productUrls = [...links].slice(0, limit);
  console.log(`Найдено ссылок на товары: ${productUrls.length}`);

  if (productUrls.length === 0) {
    console.log('Не удалось найти товарные ссылки. Попробуйте другой URL.');
    return [];
  }

  // Обходим каждую товарную страницу
  const cards = [];
  for (let i = 0; i < productUrls.length; i++) {
    const url = productUrls[i];
    console.log(`  [${i + 1}/${productUrls.length}] ${url}`);

    try {
      const productHtml = await fetchPage(url);
      const card = parseProductPage(productHtml, url);
      if (card) cards.push(card);
    } catch (err) {
      console.log(`    Ошибка: ${err.message}`);
    }

    // Пауза между запросами
    await new Promise((r) => setTimeout(r, 500));
  }

  return cards;
}

function parseProductPage(html, url) {
  const $ = cheerio.load(html);
  const text = $.text();

  // Извлекаем заголовок
  const title = $('h1').first().text().trim() || $('title').text().split('|')[0].trim() || '';
  if (!title) return null;

  // Извлекаем артикул / модель
  let article = '';
  const articlePatterns = [
    /Model\s*(?:Number)?:\s*([A-Z0-9\-#\/]+)/i,
    /(?:SKU|Артикул|Part\s*(?:Number|No\.?)):\s*([A-Z0-9\-#\/]+)/i,
    /Reference:\s*(\d+)/i,
  ];
  for (const pat of articlePatterns) {
    const m = text.match(pat);
    if (m) { article = m[1].trim(); break; }
  }
  // Если артикул не найден, пытаемся вытащить из заголовка (первый паттерн типа A05B-2518-C204)
  if (!article) {
    const m = title.match(/([A-Z]\d{2}[A-Z0-9\-#]+)/i);
    if (m) article = m[1];
  }
  if (!article) article = title;

  // Извлекаем бренд
  let brand = '';
  const brandMatch = text.match(/Brand\s*(?:Name)?:\s*(\w+)/i) || text.match(/Производитель:\s*(\w+)/i);
  if (brandMatch) brand = brandMatch[1];
  if (!brand) {
    // Пробуем из заголовка
    const knownBrands = ['FANUC', 'ABB', 'KUKA', 'Siemens', 'SIEMENS', 'Heidenhain', 'HEIDENHAIN', 'Mitsubishi'];
    for (const b of knownBrands) {
      if (title.toUpperCase().includes(b.toUpperCase())) { brand = b.toUpperCase(); break; }
    }
  }

  // Извлекаем вес
  const weightMatch = text.match(/Weight:\s*([\d.]+\s*(?:kg|Kg|KG|г|кг))/i);
  const weight = weightMatch ? weightMatch[1] : null;

  // Извлекаем цену
  let price = null;
  const priceMatch = text.match(/(?:Price|Цена):\s*[€$₽]?\s*([\d\s.,]+)/i);
  if (priceMatch) price = parseFloat(priceMatch[1].replace(/[\s,]/g, ''));

  // Извлекаем страну
  const countryMatch = text.match(/(?:Country\s*(?:of)?\s*Origin|Страна):\s*(\w+)/i);

  // Извлекаем Reference
  const refMatch = text.match(/Reference:\s*(\d+)/i);

  const slug = slugify(article || title);

  const card = makeCard({
    title: `${brand} ${article}`.trim(),
    slug: slug,
    article: article,
    price: price,
    category: 'Запчасти для роботов',
    brand: brand,
    description: `${brand} ${article}. Запчасть для промышленного оборудования. Полностью протестирован.`,
    weight: weight,
    specs: {
      'Тип': 'Запчасть',
      'Состояние': detectCondition(text),
      ...(countryMatch ? { 'Страна производства': countryMatch[1] } : {}),
      ...(refMatch ? { 'Reference': refMatch[1] } : {}),
    },
  });

  return card;
}

// ─── Определение типа сайта ──────────────────────────────────

async function detectSiteType(url) {
  // Проверяем, является ли сайт Shopify
  const cleanUrl = url.replace(/\/+$/, '');
  try {
    const testUrl = `${cleanUrl}/products.json?limit=1`;
    const resp = await fetch(testUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (resp.ok) {
      const text = await resp.text();
      if (text.includes('"products"')) {
        return 'shopify';
      }
    }
  } catch {}
  return 'html';
}

// ─── Пагинация ──────────────────────────────────────────────

async function parseShopifyWithPagination(baseUrl, totalLimit) {
  const cleanUrl = baseUrl.replace(/\/+$/, '');
  const perPage = 24;
  let page = 1;
  const allCards = [];

  while (allCards.length < totalLimit) {
    const remaining = totalLimit - allCards.length;
    const fetchCount = Math.min(perPage, remaining);
    const apiUrl = `${cleanUrl}/products.json?limit=${fetchCount}&page=${page}`;
    
    console.log(`\n  Страница ${page}: ${apiUrl}`);
    try {
      const text = await fetchPage(apiUrl);
      const data = JSON.parse(text);
      const products = data.products || [];
      
      if (products.length === 0) {
        console.log('  Больше товаров нет.');
        break;
      }

      for (const p of products) {
        if (allCards.length >= totalLimit) break;
        const variant = p.variants?.[0] || {};
        const sku = variant.sku || p.handle.toUpperCase();
        const brand = p.vendor || '';
        const productType = p.product_type || '';
        const categoryRu = CATEGORY_MAP[productType] || 'Запчасти для роботов';
        const plain = stripHtml(p.body_html || '');

        const card = makeCard({
          title: `${brand} ${sku}`.trim(),
          slug: p.handle,
          article: sku,
          price: variant.price,
          category: categoryRu,
          brand: brand,
          description: `${categoryRu} ${brand} ${sku} для промышленных роботов. ${detectCondition(plain + ' ' + p.title) !== 'Уточняйте' ? detectCondition(plain + ' ' + p.title) + '.' : ''} Полностью протестирован, готов к установке.`.trim(),
          weight: variant.grams ? `${(variant.grams / 1000).toFixed(1)} kg` : null,
          specs: {
            'Тип': productType || 'Запчасть',
            'Состояние': detectCondition(plain + ' ' + p.title),
          },
        });

        allCards.push(card);
      }

      console.log(`  Собрано: ${allCards.length}/${totalLimit}`);
      
      if (products.length < perPage) break; // последняя страница
      page++;
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.log(`  Ошибка: ${err.message}`);
      break;
    }
  }

  return allCards;
}

// ─── Главная функция ─────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   Универсальный парсер карточек товаров  ║');
  console.log('║   Shopify / HTML сайты                   ║');
  console.log('╚══════════════════════════════════════════╝\n');

  const url = await ask('URL страницы каталога: ');
  if (!url) { console.log('URL не указан.'); rl.close(); return; }

  const countStr = await ask('Сколько карточек собрать? (по умолчанию 24): ');
  const count = parseInt(countStr) || 24;

  console.log(`\nОпределяю тип сайта...`);
  const siteType = await detectSiteType(url);
  console.log(`Тип: ${siteType === 'shopify' ? 'Shopify (JSON API)' : 'HTML-сайт (парсинг)'}`);

  let cards = [];
  if (siteType === 'shopify') {
    cards = await parseShopifyWithPagination(url, count);
  } else {
    cards = await parseHtmlCatalog(url, count);
  }

  if (cards.length === 0) {
    console.log('\nТоваров не найдено.');
    rl.close();
    return;
  }

  // Проверяем дубликаты
  const existing = new Set();
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.readdirSync(OUTPUT_DIR)
      .filter((f) => f.endsWith('.json'))
      .forEach((f) => existing.add(f.replace('.json', '')));
  }

  let created = 0;
  let skipped = 0;
  for (const card of cards) {
    if (existing.has(card.slug)) {
      console.log(`  Пропуск (дубль): ${card.slug}`);
      skipped++;
      continue;
    }
    saveCard(card);
    console.log(`  ✓ ${card.slug}.json`);
    existing.add(card.slug);
    created++;
  }

  console.log(`\n════════════════════════════════════════`);
  console.log(`Создано: ${created} карточек`);
  console.log(`Пропущено (дубли): ${skipped}`);
  console.log(`Папка: ${OUTPUT_DIR}`);
  console.log(`════════════════════════════════════════\n`);

  rl.close();
}

main().catch((err) => {
  console.error('Ошибка:', err.message);
  rl.close();
});
