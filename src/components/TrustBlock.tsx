const trustItems = [
  { icon: '✅', text: 'Оригинальные компоненты' },
  { icon: '🔍', text: 'Проверка совместимости' },
  { icon: '🚚', text: 'Доставка по РФ и СНГ' },
  { icon: '🛠️', text: 'Помощь в подборе' },
];

export function TrustBlock() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => (
          <li key={item.text} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <span aria-hidden="true">{item.icon}</span>
            <span className="font-medium">{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
