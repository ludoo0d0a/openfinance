import { Link } from 'react-router-dom';

export function NotFoundView() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 lg:px-8">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-3xl font-bold">Nothing at this path</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        The standard, flow or message you asked for is not in the catalog. Search with{' '}
        <kbd className="border border-rule px-1 font-mono text-xs">⌘K</kbd> to find what is.
      </p>
      <Link to="/" className="mt-6 inline-block border border-ink px-4 py-2 font-mono text-xs uppercase tracking-widest">
        Back to overview
      </Link>
    </div>
  );
}
