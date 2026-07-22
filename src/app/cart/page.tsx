import type { Metadata } from 'next';

import { CartPageClient } from './CartPageClient';

export const metadata: Metadata = {
  title: 'Корзина запроса цены на щупы и датчики Renishaw',
  description: 'Проверьте выбранные щупы, стилусы, датчики и комплектующие Renishaw, укажите количество и отправьте запрос цены и наличия специалистам ЩУПЫ.РУ.',
};

export default function CartPage() {
  return <CartPageClient />;
}
