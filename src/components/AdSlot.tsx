import { useEffect, useRef, useState } from 'react';
import { adsenseClient, ensureAdsScript } from '@/lib/ads';
import { cn } from '@/lib/cn';
import { useT } from '@/i18n';

type AdFormat = 'horizontal' | 'rectangle';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({
  slot,
  format,
  refreshKey,
  className,
}: {
  slot: string;
  format: AdFormat;
  refreshKey: string;
  className?: string;
}) {
  const t = useT();
  const insRef = useRef<HTMLModElement>(null);
  const client = adsenseClient();
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const ins = insRef.current;
    if (!client || !slot || !ins) return;

    const syncFilled = () => {
      setFilled(ins.getAttribute('data-ad-status') === 'filled');
    };
    syncFilled();
    const observer = new MutationObserver(syncFilled);
    observer.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });

    if (!ins.getAttribute('data-adsbygoogle-status')) {
      ensureAdsScript(client);
      window.adsbygoogle = window.adsbygoogle ?? [];
      try {
        window.adsbygoogle.push({});
      } catch {
        /* already filled, or the request was blocked */
      }
    }

    return () => observer.disconnect();
  }, [client, slot, refreshKey]);

  if (!client || !slot) return null;

  return (
    <aside
      className={cn(filled ? className : 'h-0 overflow-hidden')}
      aria-label={filled ? t('ad.label') : undefined}
      aria-hidden={!filled}
    >
      {filled ? <p className="eyebrow mb-2">{t('ad.label')}</p> : null}
      <ins
        ref={insRef}
        className="adsbygoogle block w-full overflow-hidden"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
