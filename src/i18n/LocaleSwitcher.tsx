import { useI18n } from './useI18n';
import { LOCALES } from './types';
import { cn } from '@/lib/cn';

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={cn('flex gap-px border border-rule', className)}
      role="group"
      aria-label={t('locale.label')}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={cn(
            'px-2 py-1 font-mono text-[10px] uppercase tracking-widest',
            locale === code ? 'bg-ink text-white' : 'bg-surface text-muted hover:text-ink',
          )}
          aria-pressed={locale === code}
          title={code === 'en' ? 'English' : 'Français'}
        >
          {t(`locale.${code}`)}
        </button>
      ))}
    </div>
  );
}
