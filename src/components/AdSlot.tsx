import { useEffect, useRef } from 'react';
import { adsenseClient, ensureAdsScript } from '@/lib/ads';
import { cn } from '@/lib/cn';
import { useT } from '@/i18n';

type AdFormat = 'horizontal' | 'rectangle' | 'inarticle';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({
  slot,
  format,
  refreshKey,
}: {
  slot: string;
  format: AdFormat;
  refreshKey: string;
}) {
  const t = useT();
  const insRef = useRef<HTMLModElement>(null);
  const client = adsenseClient();

  useEffect(() => {
    const ins = insRef.current;
    if (!client || !slot || !ins) return;
    if (ins.getAttribute('data-adsbygoogle-status')) return;
    ensureAdsScript(client);
    window.adsbygoogle = window.adsbygoogle ?? [];
    try {
      window.adsbygoogle.push({});
    } catch {
      /* already filled, or the request was blocked */
    }
  }, [client, slot, refreshKey]);

  if (!client || !slot) return null;

  return (
    <aside className="ad-slot" aria-label={t('ad.label')}>
      <p className="eyebrow mb-2">{t('ad.label')}</p>
      <ins
        ref={insRef}
        className={cn(
          'adsbygoogle block w-full overflow-hidden border border-rule bg-surface',
          format === 'horizontal' && 'min-h-[90px]',
          format === 'rectangle' && 'min-h-[250px]',
          format === 'inarticle' && 'min-h-[120px]',
        )}
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format === 'inarticle' ? 'fluid' : format}
        data-ad-layout={format === 'inarticle' ? 'in-article' : undefined}
        data-full-width-responsive={format === 'inarticle' ? undefined : 'true'}
      />
    </aside>
  );
}
