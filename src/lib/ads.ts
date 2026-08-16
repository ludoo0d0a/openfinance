/** AdSense client looks like `ca-pub-123…`. Empty means ads are off. */
export function adsenseClient(): string {
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
 * Paths where display ads would sit on top of an editor.
 */
export function adsDisabledForPath(pathname: string): boolean {
  return pathname === '/try' || pathname.startsWith('/try/');
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
