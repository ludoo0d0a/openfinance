import { PAYMENTS } from '@/data/payments';
import { FLOWS } from '@/data/flows';
import { ISO_MESSAGES } from '@/data/iso20022';
import { ALL_SAMPLES } from '@/data/samples';
import { STANDARDS } from '@/data/standards';
import { INFRASTRUCTURES } from '@/data/infrastructures';
import { LIFE_SCENARIOS, LIFE_SCENES } from '@/data/lifeScenes';

const SITE_ORIGIN = 'https://openfinance.geoking.fr';

/**
 * Interactive tools: prerender so View Source is not the homepage (with or
 * without ads). Kept out of the sitemap — thin SPA shells, not articles.
 */
export const TOOL_PRERENDER_PATHS = ['/try', '/map', '/live', '/quiz/debug-reject'] as const;

export function isToolPath(path: string): boolean {
  if ((TOOL_PRERENDER_PATHS as readonly string[]).includes(path)) return true;
  if (path === '/live' || path.startsWith('/live/')) return true;
  if (path.startsWith('/quiz/')) return true;
  return path === '/try' || path === '/map';
}

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
  for (const scene of LIFE_SCENES) {
    paths.add(`/live/${scene.id}`);
  }
  for (const scenario of LIFE_SCENARIOS) {
    paths.add(`/live/${scenario.sceneId}/${scenario.id}`);
  }

  return [...paths].sort((a, b) => a.localeCompare(b));
}

/** Indexable article URLs only (no tool shells). */
export function listSitemapPaths(): string[] {
  return listPrerenderPaths().filter((path) => !isToolPath(path));
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
