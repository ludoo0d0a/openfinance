import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adsenseClient, ensureAdsScript } from '@/lib/ads';
import {
  getAdConsent,
  isFundingChoicesDebug,
  setAdConsent,
  type AdConsentChoice,
} from '@/lib/adConsent';
import { useT } from '@/i18n';

export function CookieConsent() {
  const t = useT();
  const { search } = useLocation();
  const client = adsenseClient();
  const [choice, setChoice] = useState<AdConsentChoice | null>(() => getAdConsent());
  const [ready, setReady] = useState(false);
  const fcDebug = isFundingChoicesDebug(search);

  useEffect(() => {
    setChoice(getAdConsent());
    setReady(true);
  }, []);

  // Let Google CMP load without our banner when previewing Funding Choices.
  useEffect(() => {
    if (!fcDebug || !client) return;
    ensureAdsScript(client);
  }, [fcDebug, client]);

  if (!ready || !client || choice || fcDebug) return null;

  function decide(next: AdConsentChoice) {
    setAdConsent(next);
    setChoice(next);
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-ink bg-paper p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(13,20,32,0.12)] sm:p-5"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
        <div className="min-w-0 flex-1">
          <p id="cookie-consent-title" className="font-display text-[15px] font-bold tracking-tight text-ink">
            {t('consent.title')}
          </p>
          <p id="cookie-consent-desc" className="mt-1.5 text-[13px] leading-relaxed text-muted sm:text-[14px]">
            {t('consent.body')}{' '}
            <Link to="/privacy" className="text-signal underline-offset-2 hover:underline">
              {t('consent.privacy')}
            </Link>
            .
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[14rem] sm:flex-shrink-0">
          <button
            type="button"
            onClick={() => decide('personalized')}
            className="w-full border border-ink bg-ink px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-ink-raised sm:py-2"
          >
            {t('consent.accept')}
          </button>
          <button
            type="button"
            onClick={() => decide('non-personalized')}
            className="w-full border border-rule bg-surface px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-ink hover:border-ink sm:py-2"
          >
            {t('consent.reject')}
          </button>
        </div>
      </div>
    </div>
  );
}
