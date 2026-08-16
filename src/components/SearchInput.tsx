import type { KeyboardEvent, ReactNode, Ref } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useT } from '@/i18n';

export function SearchInput({
  value,
  onChange,
  onKeyDown,
  onFocus,
  placeholder,
  ariaLabel,
  inputRef,
  trailing,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  placeholder: string;
  ariaLabel: string;
  inputRef?: Ref<HTMLInputElement>;
  trailing?: ReactNode;
  className?: string;
}) {
  const t = useT();

  return (
    <div className={cn('flex min-w-0 flex-1 items-center gap-2', className)}>
      <Search size={14} className="shrink-0 text-muted" aria-hidden />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="min-w-0 flex-1 bg-transparent font-mono text-sm focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t('search.clear')}
          className="shrink-0 p-0.5 text-muted hover:text-ink"
        >
          <X size={14} aria-hidden />
        </button>
      )}
      {trailing}
    </div>
  );
}
