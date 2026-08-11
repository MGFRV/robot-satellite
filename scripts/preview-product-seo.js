const fs = require('node:fs');
const path = require('node:path');

const PRODUCTS_DIRECTORY = path.join(process.cwd(), 'content', 'products');
const TITLE_SUFFIX = ' | ЩУПЫ.РУ';
const MAX_TITLE_LENGTH = 70;
const PILOT_SLUGS = ['datchik-renishaw-omp60-a-4038-0001', 'datchik-renishaw-ts20'];
const META_ENDING =
  'для ЧПУ. Под заказ. Уточните наличие, сроки поставки и получите консультацию по совместимости с вашим оборудованием.';

// Long titles need semantic shortening rather than removing words from the end.
// These descriptions keep model/component codes in source order and discard
// generic characteristics first.
const TRUNCATED_DESCRIPTION_OVERRIDES = new Map([
  ['A-5003-1358-renishaw-m4-100mm', 'Щуп Renishaw M4 L 100мм Ø6 шарик'],
  ['datchik-olp40-opticheskij-opticheskij-tradicionnyj-renishaw', 'Датчик OLP40 RENISHAW'],
  ['datchik-omp40-2ls-opticheskij-opticheskij-tradicionnyj-renishaw', 'Датчик OMP40-2LS RENISHAW'],
  ['datchik-ots-1-2-aa-s-kvadratnym-stilusom-opticheskij-opticheski-modulirovannyj-renishaw', 'Датчик OTS 1/2 AA с квадратным стилусом'],
  ['datchik-privyazki-instrumenta-ts27r-diskovyj-stilus-renishaw', 'Датчик привязки инструмента TS27R RENISHAW'],
  ['datchik-renishaw-a-2197-0049-rp3-probe-for-hpra-hppa-and-hpma-arms', 'Датчик Renishaw RP3-Probe HPRA HPPA HPMA'],
  ['hpma-ruka', 'Renishaw Высокоточная рука HPMA'],
  ['interfejs-osi-rezhim-mnozhestvennogo-zondirovaniya-renishaw', 'Интерфейс OSI RENISHAW'],
  ['komplekt-datchika-ts27r-datchik-ts27r-s-diskovym-stilusom-i-interfejsom-mi-8-4-renishaw', 'Комплект датчика TS27R MI-8-4 RENISHAW'],
  ['komplekt-datchika-ts27r-ts27r-s-diskovym-stilusom-i-interfejsom-hsi-renishaw', 'Комплект датчика TS27R HSI RENISHAW'],
  ['komplekt-datchikov-renishaw-opticheskij-datchik-omp60-opticheskij-datchik-ots-diskovyj-stilus-i-komplekt-opticheskogo-interfejsa-priemnika-omi-2t-8-m-renishaw', 'Комплект датчиков Renishaw OMP60 OTS OMI-2T'],
  ['komplekt-vysokoj-proizvoditelnosti-s-rezboj-m2-a-5003-2310-renishaw', 'Комплект высокой производительности с резьбой М2'],
  ['lp2-i-lp2h-sistema-1', 'LP2 и LP2H контактная измерительная система'],
  ['lp2dd-i-lp2hdd-kontaktnaya-izmeritelnaya-sistema-renishaw', 'LP2DD и LP2HDD контактная измерительная система'],
  ['modul-datchika-omp40m-opticheskij-opticheskij-s-modulyaciej-renishaw', 'Модуль датчика OMP40M RENISHAW'],
  ['modul-datchika-omp60m-opticheskij-opticheskij-ustarevshij-renishaw', 'Модуль датчика OMP60M RENISHAW'],
  ['opticheskij-datchik-omp40-2-opticheskij-datchik-ots-diskovyj-stilus-i-komplekt-opticheskogo-interfejsa-priemnika-omi-2t-15-m-renishaw', 'Оптический датчик OMP40-2 OTS OMI-2T'],
  ['opticheskij-interfejs-priemnik-omi-2-15-m-renishaw', 'Оптический интерфейс/приемник OMI-2 (15 м)'],
  ['opticheskij-interfejs-priemnik-omi-2-8-m-renishaw', 'Оптический интерфейс/приемник OMI-2 (8 м)'],
  ['opticheskij-priemnik-omm-2c-s-vozdushnym-potokom-renishaw', 'Оптический приемник OMM-2C RENISHAW'],
  ['prisposoblenie-dlya-ustanovki-schupov-m2-m3-a-5004-7582-renishaw', 'Приспособление для установки щупов M2-M3'],
  ['schup-renishaw-m3-l-12mm-18-a-5004-3728-s-keramicheskoj-polusferoj', 'Щуп Renishaw M3 L 12мм Ø18'],
  ['schup-renishaw-m3-l-75mm-10-a-5004-1992-sharik-iz-nitrida-kremniya', 'Щуп Renishaw M3 L 75мм Ø10 шарик из нитрида'],
  ['schup-renishaw-m3-l-75mm-8-a-5004-1991-sharik-iz-nitrida-kremniya', 'Щуп Renishaw M3 L 75мм Ø8 шарик из нитрида'],
  ['sistema-naladki-instrumenta-nc4-renishaw-razdelnaya-sistema', 'Система наладки инструмента NC4 RENISHAW'],
  ['tl-micro', 'Лазерная система TL Micro HEIDENHAIN'],
  ['tl-nano', 'Лазерная система TL Nano HEIDENHAIN'],
]);

function normalizeSpaces(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function descriptiveTitle(title, article) {
  const withoutArticle = title.replace(new RegExp(escapeRegExp(article), 'giu'), ' ');
  return normalizeSpaces(withoutArticle).replace(/^[\s—–|,.;:-]+|[\s—–|,.;:-]+$/gu, '');
}

function removeLastSecondaryPart(value) {
  const words = value.split(' ');
  return words.length > 1 ? words.slice(0, -1).join(' ') : value;
}

function buildSeoTitle(product) {
  const article = normalizeSpaces(String(product.article ?? ''));
  let description = descriptiveTitle(normalizeSpaces(String(product.title ?? '')), article);
  const suffix = ` ${article}${TITLE_SUFFIX}`;
  let truncationIterations = 0;

  if (`${description}${suffix}`.length > MAX_TITLE_LENGTH) {
    const preservedDescription = TRUNCATED_DESCRIPTION_OVERRIDES.get(product.slug);
    if (preservedDescription) {
      description = preservedDescription;
      truncationIterations = 1;
    }
  }

  while (`${description}${suffix}`.length > MAX_TITLE_LENGTH) {
    const shortened = removeLastSecondaryPart(description);

    if (shortened === description) {
      break;
    }

    description = shortened;
    truncationIterations += 1;
  }

  const seoTitle = `${description}${suffix}`;

  if (seoTitle.length > MAX_TITLE_LENGTH) {
    return { reason: 'не помещается в 70 символов без сокращения артикула' };
  }

  return { description, seoTitle, truncationIterations };
}

function truncateAtWord(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }

  const shortened = value.slice(0, maxLength + 1).replace(/\s+\S*$/u, '').trim();
  return shortened || value.slice(0, maxLength).trim();
}

function buildMetaDescription(description) {
  const maxDescriptionLength = 155 - META_ENDING.length - 1;
  const shortenedDescription = truncateAtWord(description, maxDescriptionLength).replace(/[.,;:!?]+$/u, '');
  return `${shortenedDescription} ${META_ENDING}`;
}

function readProducts() {
  return fs
    .readdirSync(PRODUCTS_DIRECTORY)
    .filter((file) => file.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b, 'ru-RU'))
    .map((file) => {
      const filePath = path.join(PRODUCTS_DIRECTORY, file);
      return { ...JSON.parse(fs.readFileSync(filePath, 'utf8')), sourceFile: filePath };
    });
}

function analyze(products) {
  const candidates = [];
  const manualReview = [];
  const excluded = new Set();

  for (const product of products) {
    const result = buildSeoTitle(product);

    if (!result.seoTitle) {
      manualReview.push({ slug: product.slug, reason: result.reason });
      continue;
    }

    candidates.push({
      slug: product.slug,
      brand: product.brand,
      sourceFile: product.sourceFile,
      seoTitle: result.seoTitle,
      metaDescription: buildMetaDescription(result.description),
      truncationIterations: result.truncationIterations,
    });
  }

  for (const candidate of candidates) {
    const brand = normalizeSpaces(String(candidate.brand ?? ''));
    const isRenishaw = brand.toLocaleLowerCase('ru-RU') === 'renishaw';
    const titleContainsBrand = candidate.seoTitle.toLocaleLowerCase('ru-RU').includes(brand.toLocaleLowerCase('ru-RU'));

    if (!isRenishaw && !titleContainsBrand) {
      excluded.add(candidate.slug);
      manualReview.push({
        slug: candidate.slug,
        reason: 'потеря небрендового наименования при усечении',
      });
    }
  }

  const byTitle = new Map();
  for (const candidate of candidates) {
    const group = byTitle.get(candidate.seoTitle) ?? [];
    group.push(candidate);
    byTitle.set(candidate.seoTitle, group);
  }

  const collisions = new Set();
  for (const group of byTitle.values()) {
    if (group.length > 1) {
      for (const candidate of group) {
        collisions.add(candidate.slug);
        excluded.add(candidate.slug);
        manualReview.push({
          slug: candidate.slug,
          reason: `коллизия seoTitle после усечения: «${candidate.seoTitle}»`,
        });
      }
    }
  }

  return {
    generated: candidates,
    accepted: candidates.filter((candidate) => !excluded.has(candidate.slug)),
    manualReview: manualReview.sort((a, b) => a.slug.localeCompare(b.slug, 'ru-RU')),
  };
}

function writeAcceptedProducts(accepted) {
  let written = 0;
  for (const candidate of accepted) {
    const product = JSON.parse(fs.readFileSync(candidate.sourceFile, 'utf8'));
    if (product.seoTitle === candidate.seoTitle && product.metaDescription === candidate.metaDescription) {
      continue;
    }
    product.seoTitle = candidate.seoTitle;
    product.metaDescription = candidate.metaDescription;
    fs.writeFileSync(candidate.sourceFile, `${JSON.stringify(product, null, 2)}\n`, 'utf8');
    written += 1;
  }
  return written;
}

function printReport(products, result) {
  const reasons = new Map();
  const truncated = result.generated.filter((candidate) => candidate.truncationIterations > 0);
  const truncatedNonRenishaw = truncated.filter(
    (candidate) => normalizeSpaces(String(candidate.brand ?? '')).toLocaleLowerCase('ru-RU') !== 'renishaw',
  );
  for (const item of result.manualReview) {
    reasons.set(item.reason, (reasons.get(item.reason) ?? 0) + 1);
  }

  console.log('# Предпросмотр SEO-генерации');
  console.log('');
  console.log(`- Всего товаров: **${products.length}**`);
  console.log(`- Готовы к автоматической записи: **${result.accepted.length}**`);
  console.log(`- Требуют ручного разбора: **${result.manualReview.length}**`);
  console.log(`- Коллизий после усечения: **${[...reasons.entries()].filter(([reason]) => reason.startsWith('коллизия')).reduce((sum, [, count]) => sum + count, 0)}**`);
  console.log(`- Потребовали хотя бы одной итерации обрезки: **${truncated.length}**`);
  console.log(`- Среди обрезанных имеют бренд не Renishaw: **${truncatedNonRenishaw.length}**`);
  console.log('');
  console.log('## Причины ручного разбора');
  console.log('');
  for (const [reason, count] of reasons) {
    console.log(`- ${reason}: **${count}**`);
  }
  console.log('');
  console.log('## Полный список ручного разбора');
  console.log('');
  for (const item of result.manualReview) {
    console.log(`- \`${item.slug}\` — ${item.reason}`);
  }
  console.log('');
  console.log('## Обрезанные товары не бренда Renishaw');
  console.log('');
  if (truncatedNonRenishaw.length === 0) {
    console.log('- Нет.');
  } else {
    for (const item of truncatedNonRenishaw) {
      console.log(`- \`${item.slug}\` — бренд: ${item.brand}; seoTitle: «${item.seoTitle}»`);
    }
  }
  console.log('');
  console.log('## Проверка пилотных OMP60 и TS20');
  console.log('');
  for (const slug of PILOT_SLUGS) {
    const accepted = result.accepted.find((candidate) => candidate.slug === slug);
    const manual = result.manualReview.find((item) => item.slug === slug);
    if (accepted) {
      console.log(`- \`${slug}\` — автоматическая группа, ${accepted.seoTitle.length} символов: «${accepted.seoTitle}»`);
    } else {
      console.log(`- \`${slug}\` — ручной разбор: ${manual?.reason ?? 'кандидат не найден'}`);
    }
  }
}

const products = readProducts();
const result = analyze(products);
printReport(products, result);

if (process.argv.includes('--write')) {
  const written = writeAcceptedProducts(result.accepted);
  console.log('');
  console.log(`Записано файлов: ${written}`);
}
