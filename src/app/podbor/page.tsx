import type { Metadata } from 'next';

import { PodborPageClient } from './PodborPageClient';

export const metadata: Metadata = {
  title: 'Подбор щупов и комплектующих Renishaw по артикулу или фото',
  description: 'Поможем подобрать щуп, стилус, датчик или замену Renishaw для вашего станка с ЧПУ. Пришлите артикул, маркировку, фото или параметры детали.',
};

export default function PodborPage() {
  return <PodborPageClient />;
}
