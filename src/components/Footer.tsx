export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 text-sm text-slate-600">
        © {new Date().getFullYear()} [Название компании]. Все права защищены.
      </div>
    </footer>
  );
}
