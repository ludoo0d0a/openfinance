import { PAYMENTS } from '@/data/payments';
import { FLOWS } from '@/data/flows';
import { ISO_MESSAGES } from '@/data/iso20022';
import { ALL_SAMPLES } from '@/data/samples';
import { STANDARDS } from '@/data/standards';
import { INFRASTRUCTURES } from '@/data/infrastructures';

const SITE_ORIGIN = 'https://openfinance.geoking.fr';

/** Catalog paths that get a static `dist/<path>/index.html` at build time. */
export function listPrerenderPaths(): string[] {
  const paths = new Set<string>(['/', '/about', '/privacy', '/contact', '/glossary']);

  for (const p of PAYMENTS) paths.add(`/payment/${p.id}`);
  for (const f of FLOWS) paths.add(`/flows/${f.id}`);
  for (const m of ISO_MESSAGES) {
    paths.add(`/messages/${m.short}`);
    paths.add(`/compare/${m.short}`);
  }
  for (const s of ALL_SAMPLES) paths.add(`/samples/${s.id}`);
  for (const s of STANDARDS) paths.add(`/standards/${s.id}`);
  for (const i of INFRASTRUCTURES) paths.add(`/infrastructure/${i.id}`);

  return [...paths].sort((a, b) => a.localeCompare(b));
}

export function sitemapXml(paths: string[] = listPrerenderPaths()): string {
  const urls = paths
    .map((path) => {
      const loc = path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
      return `  <url><loc>${loc}</loc></url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export { SITE_ORIGIN };
