/**
 * Display ads are paused until geoking.fr is approved. Flip to `false` to
 * serve units again (env `VITE_ADSENSE_CLIENT` / slots still required).
 */
export const ADSENSE_PAUSED = true;

/** AdSense client looks like `ca-pub-123…`. Empty means ads are off. */
export function adsenseClient(): string {
  if (ADSENSE_PAUSED) return '';
  return String(import.meta.env.VITE_ADSENSE_CLIENT ?? '').trim();
}

export type AdPlacement = 'intro' | 'mid' | 'end';

export function adsenseSlot(placement: AdPlacement): string {
  const env = import.meta.env;
  const specific =
    placement === 'intro'
      ? env.VITE_ADSENSE_SLOT_INTRO
      : placement === 'mid'
        ? env.VITE_ADSENSE_SLOT_MID
        : env.VITE_ADSENSE_SLOT_END;
  const trimmed = String(specific ?? '').trim();
  if (trimmed) return trimmed;
  return String(env.VITE_ADSENSE_SLOT ?? '').trim();
}

/** `ads.txt` publisher is `pub-…`, not `ca-pub-…`. */
export function publisherIdFromClient(client: string): string | undefined {
  const trimmed = client.trim();
  const match = trimmed.match(/^(?:ca-)?(pub-\d+)$/);
  return match?.[1];
}

export function adsTxtBody(client: string): string | undefined {
  const publisher = publisherIdFromClient(client);
  if (!publisher) return undefined;
  return `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`;
}

/**
 * Paths where Google would see ads without publisher article content
 * (editor, graph, quiz, legal, or any unmatched / 404 URL).
 */
const AD_DISABLED_PREFIXES = ['/try', '/live', '/map', '/quiz', '/privacy', '/contact'];

export function adsDisabledForPath(pathname: string): boolean {
  if (ADSENSE_PAUSED) return true;
  const path = pathname.replace(/\/+$/, '') || '/';
  if (AD_DISABLED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return true;
  }
  return !isContentPath(path);
}

/** Catalog and article URLs that have prose a reviewer can read. */
export function isContentPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return true;
  return [
    '/payment/',
    '/scheme/',
    '/infrastructure/',
    '/compare/',
    '/glossary',
    '/about',
    '/wero',
    '/message/',
    '/messages/',
    '/samples/',
    '/standards/',
    '/flows/',
    '/codes',
    '/thesaurus',
  ].some((prefix) => path === prefix.replace(/\/+$/, '') || path.startsWith(prefix));
}

/** Load adsbygoogle only after a content page mounts — never in the empty SPA shell. */
export function ensureAdsScript(client: string): void {
  if (typeof document === 'undefined' || !client) return;
  const marker = `adsense-${client}`;
  if (document.querySelector(`script[data-adsense="${marker}"]`)) return;
  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  script.dataset.adsense = marker;
  document.head.appendChild(script);
}

/**
 * Remount key: a new catalog page (and glossary term / message version) gets a
 * fresh unit so AdSense can serve another impression. Filter toggles on the
 * same article (explorer focus, flow step) stay on the same key.
 */
export function adRefreshKey(pathname: string, search: string): string {
  const params = new URLSearchParams(search);
  const parts = [pathname.replace(/\/+$/, '') || '/'];
  if (pathname === '/glossary' || pathname.startsWith('/glossary/')) {
    parts.push(params.get('id') ?? '');
  }
  if (pathname.startsWith('/messages/')) {
    parts.push(params.get('v') ?? '');
  }
  if (pathname.startsWith('/compare/')) {
    parts.push(params.get('from') ?? '', params.get('to') ?? '');
  }
  return parts.join('|');
}
