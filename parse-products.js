/**
 * Скрипт парсинга товаров с inrobots.shop (Shopify API)
 * 
 * Запуск: node parse-products.js
 * 
 * Результат: JSON-файлы в папке content/products/
 */

const fs = require('fs');
const path = require('path');

// Коллекции для парсинга (по 24 товара с первой страницы)
const COLLECTIONS = [
  { url: 'https://www.inrobots.shop/collections/abb-parts/products.json?limit=24', brand: 'ABB' },
  { url: 'https://www.inrobots.shop/collections/fanuc-robots-parts/products.json?limit=24', brand: 'FANUC' },
  { url: 'https://www.inrobots.shop/collections/kuka-robot-parts/products.json?limit=24', brand: 'KUKA' },
];

// Замените на имя вашего бакета в Yandex Object Storage
const S3_BUCKET = 'YOUR-BUCKET';

// Таблица перевода категорий
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
  'Robot Cables': 'Кабели и разъёмы',
  'Cables': 'Кабели и разъёмы',
  'Robot Arms': 'Роботы',
  'Cooling Fans': 'Вентиляторы',
  'PLC Modules': 'Модули ПЛК',
  'I/O Modules': 'Модули ввода/вывода',
  'Sensors': 'Датчики',
};

function translateCategory(productType) {
  return CATEGORY_MAP[productType] || 'Запчасти для роботов';
}

function detectCondition(bodyHtml, title) {
  const text = (bodyHtml + ' ' + title).toLowerCase();
  if (text.includes('new')) return 'Новый';
  if (text.includes('refurbished')) return 'Восстановленный';
  if (text.includes('used')) return 'Б/У';
  return 'Уточняйте';
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractDescription(bodyHtml, vendor, sku, productType) {
  const plain = stripHtml(bodyHtml);
  
  // Извлекаем ключевые данные из текста
  const modelMatch = plain.match(/Model:\s*([^\s,]+)/i);
  const conditionMatch = plain.match(/Condition:\s*(\w+)/i);
  
  // Формируем описание на русском
  const model = modelMatch ? modelMatch[1] : sku;
  const condition = conditionMatch ? conditionMatch[1] : '';
  
  const typeRu = translateCategory(productType);
  
  return `${typeRu} ${vendor} ${model} для промышленных роботов. Полностью протестирован перед отправкой, готов к установке. ${condition === 'New' ? 'Новое изделие.' : condition === 'Used' ? 'Б/У, проверенное состояние.' : ''}`.trim();
}

function createProductCard(product, brandName) {
  const variant = product.variants && product.variants[0] ? product.variants[0] : {};
  const sku = variant.sku || product.handle.toUpperCase();
  const price = variant.price && parseFloat(variant.price) > 0 ? parseFloat(variant.price) : null;
  const weight = variant.grams ? `${(variant.grams / 1000).toFixed(1)} kg` : null;
  const vendor = product.vendor || brandName;
  const productType = product.product_type || '';
  
  const card = {
    title: `${vendor} ${sku} — ${translateCategory(productType)}`,
    slug: product.handle,
    article: sku,
    price: price,
    category: translateCategory(productType),
    brand: vendor,
    description: extractDescription(product.body_html, vendor, sku, productType),
    specs: {
      'Производитель': vendor,
      'Артикул': sku,
      'Тип': productType || 'Запчасть',
      'Состояние': detectCondition(product.body_html || '', product.title || ''),
      'Наличие': 'Под заказ',
    },
    images: [
      `https://storage.yandexcloud.net/${S3_BUCKET}/products/${vendor.toLowerCase()}/${product.handle}/1.jpg`
    ],
  };

  if (weight) {
    card.specs['Вес'] = weight;
  }

  return card;
}

async function fetchCollection(url, brand) {
  console.log(`\nЗагрузка ${brand}...`);
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`  Ошибка HTTP ${response.status} для ${brand}`);
      return [];
    }
    
    const data = await response.json();
    const products = data.products || [];
    console.log(`  Найдено товаров: ${products.length}`);
    return products;
  } catch (error) {
    console.error(`  Ошибка загрузки ${brand}: ${error.message}`);
    return [];
  }
}

async function main() {
  const outputDir = path.join(__dirname, 'content', 'products');
  
  // Создаём папку если не существует
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Проверяем существующие файлы
  const existingFiles = new Set(
    fs.readdirSync(outputDir)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''))
  );

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const collection of COLLECTIONS) {
    const products = await fetchCollection(collection.url, collection.brand);
    
    for (const product of products) {
      const slug = product.handle;
      
      // Пропускаем дубликаты
      if (existingFiles.has(slug)) {
        console.log(`  Пропуск (уже существует): ${slug}`);
        totalSkipped++;
        continue;
      }

      const card = createProductCard(product, collection.brand);
      const filePath = path.join(outputDir, `${slug}.json`);
      
      fs.writeFileSync(filePath, JSON.stringify(card, null, 2), 'utf-8');
      console.log(`  Создан: ${slug}.json`);
      existingFiles.add(slug);
      totalCreated++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Готово!`);
  console.log(`Создано карточек: ${totalCreated}`);
  console.log(`Пропущено (дубликаты): ${totalSkipped}`);
  console.log(`Файлы в: ${outputDir}`);
  console.log(`========================================`);
  console.log(`\nНе забудьте заменить YOUR-BUCKET на имя вашего бакета!`);
}

main();
