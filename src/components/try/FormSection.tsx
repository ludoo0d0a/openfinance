import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-rule-soft pt-3 first:border-t-0 first:pt-0">
      <h3 className="eyebrow mb-2 inline-flex items-center gap-1.5">
        <Icon size={12} aria-hidden />
        {title}
      </h3>
      {children}
    </section>
  );
}
