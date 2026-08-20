import { Link } from 'react-router-dom';
import { JargonText } from '@/components/JargonText';
import { cn } from '@/lib/cn';

export function ConceptCard({
  title,
  body,
  links,
  accent = 'signal',
}: {
  title: string;
  body: string;
  links: { to: string; label: string }[];
  accent?: 'signal' | 'violet' | 'jade';
}) {
  const bar =
    accent === 'violet' ? 'border-violet' : accent === 'jade' ? 'border-jade' : 'border-signal';
  return (
    <div className={cn('bg-surface px-4 py-4 sm:px-5', 'border-t-2', bar)}>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        <JargonText text={body} />
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="inline-block border border-rule px-2 py-0.5 font-mono text-[11px] hover:border-ink"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
