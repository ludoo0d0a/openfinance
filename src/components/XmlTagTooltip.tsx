import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const SHOW_DELAY_MS = 200;

/**
 * Lightweight hover/focus tip for XML tag names.
 * Content matches form field defs / ISO element dictionary — no browser title.
 */
export function XmlTagTooltip({
  text,
  className,
  children,
}: {
  text: string | undefined;
  className?: string;
  children: ReactNode;
}) {
  const tipId = useId();
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!text) {
    return <span className={className}>{children}</span>;
  }

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setVisible(false);
  };

  return (
    <span
      className={cn('relative inline-block', className)}
      aria-describedby={visible ? tipId : undefined}
      aria-label={text}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          id={tipId}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute bottom-[calc(100%+6px)] left-0 z-30',
            'max-w-[min(22rem,70vw)] border border-rule bg-surface px-2 py-1.5',
            'font-sans text-[11px] leading-snug font-normal normal-case tracking-normal text-ink shadow-none',
          )}
        >
          {text}
        </span>
      )}
    </span>
  );
}
