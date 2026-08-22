import { useEffect, useState } from 'react';
import { PUBLISHER_EMAIL } from '@/lib/publisher';

/**
 * Render the publisher email so Cloudflare Scrape Shield does not replace it
 * with `data-cfemail` (empty for AdSense crawlers). Visible text is split;
 * a real mailto is attached after mount.
 */
export function PublisherEmail({ className }: { className?: string }) {
  const [href, setHref] = useState<string | undefined>(undefined);
  const [local, domain] = PUBLISHER_EMAIL.split('@') as [string, string];

  useEffect(() => {
    setHref(`mailto:${PUBLISHER_EMAIL}`);
  }, []);

  return (
    <a className={className} href={href}>
      {local}
      {/* keep @ out of a contiguous `user@domain` string in SSR HTML */}
      <span aria-hidden="true">&#64;</span>
      {domain}
    </a>
  );
}
