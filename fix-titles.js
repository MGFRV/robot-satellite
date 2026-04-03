const fs = require('fs');
const dir = './content/products';
const remove = [
  '— Кабели и разъёмы',
  '— Сервоприводы',
  '— Пульты управления',
  '— Пульт управления',
  '— Запчасти для роботов',
  '— Модули',
  '— Сервомоторы',
  '— Платы управления',
  '— Блоки питания',
  '— Контроллеры',
  '— Редукторы',
  '— Вентиляторы',
];
let fixed = 0;
fs.readdirSync(dir).filter(f => f.endsWith('.json')).forEach(f => {
  const p = dir + '/' + f;
  const card = JSON.parse(fs.readFileSync(p, 'utf-8'));
  if (!card.title) {
    card.title = (card.brand || '') + ' ' + (card.article || f.replace('.json','').toUpperCase());
    card.title = card.title.trim();
    fs.writeFileSync(p, JSON.stringify(card, null, 2), 'utf-8');
    fixed++;
    console.log('  ✓ ' + f + ' (title был пустой)');
    return;
  }
  const old = card.title;
  for (const r of remove) {
    card.title = card.title.replace(r, '').trim();
  }
  if (card.title !== old) {
    fs.writeFileSync(p, JSON.stringify(card, null, 2), 'utf-8');
    fixed++;
    console.log('  ✓ ' + f);
  }
});
console.log('Исправлено: ' + fixed);