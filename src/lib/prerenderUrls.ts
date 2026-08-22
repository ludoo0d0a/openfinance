import { PAYMENTS } from '@/data/payments';
import { FLOWS } from '@/data/flows';
import { ISO_MESSAGES } from '@/data/iso20022';
import { ALL_SAMPLES } from '@/data/samples';
import { STANDARDS } from '@/data/standards';
import { INFRASTRUCTURES } from '@/data/infrastructures';

const SITE_ORIGIN = 'https://openfinance.geoking.fr';

/**
 * Interactive tools: prerender so View Source is not the homepage (with or
 * without ads). Kept out of the sitemap — thin SPA shells, not articles.
 */
export const TOOL_PRERENDER_PATHS = ['/try', '/map', '/live', '/quiz/debug-reject'] as const;

/** Catalog + tool entry paths that get a static `dist/<path>/index.html`. */
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
  for (const t of TOOL_PRERENDER_PATHS) paths.add(t);

  return [...paths].sort((a, b) => a.localeCompare(b));
}

/** Indexable article URLs only (no tool shells). */
export function listSitemapPaths(): string[] {
  const tools = new Set<string>(TOOL_PRERENDER_PATHS);
  return listPrerenderPaths().filter((path) => !tools.has(path));
}

export function sitemapXml(paths: string[] = listSitemapPaths()): string {
  const urls = paths
    .map((path) => {
      const loc = path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
      return `  <url><loc>${loc}</loc></url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export { SITE_ORIGIN };
