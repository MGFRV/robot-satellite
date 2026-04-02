export function formatProductPrice(price: number | null): string {
  if (price === null) {
    return 'Цена по запросу';
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
}
