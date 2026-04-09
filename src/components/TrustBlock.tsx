const trustItems = ['Оригинальные компоненты', 'Проверка совместимости', 'Доставка по РФ и СНГ', 'Помощь в подборе'];

export function TrustBlock() {
  return (
    <section className="rounded-xl border border-orange-200 bg-orange-50 p-4 md:p-5">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => (
          <li key={item} className="rounded-lg border border-orange-100 bg-white px-3 py-3 text-sm font-medium text-slate-700">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
