import { describe, expect, it } from 'vitest';
import { listPrerenderPaths, sitemapXml } from '../src/lib/prerenderUrls';
import { pageSeo } from '../src/lib/seo';

describe('prerenderUrls', () => {
  it('lists every catalog page and excludes tools', () => {
    const paths = listPrerenderPaths();
    expect(paths.length).toBeGreaterThanOrEqual(100);
    expect(paths).toContain('/');
    expect(paths).toContain('/about');
    expect(paths).toContain('/privacy');
    expect(paths).toContain('/contact');
    expect(paths).toContain('/glossary');
    expect(paths).toContain('/payment/sepa-instant');
    expect(paths).toContain('/flows/sct-inst-happy-path');
    expect(paths).toContain('/messages/pacs.008');
    expect(paths).toContain('/compare/pacs.008');
    expect(paths).toContain('/standards/berlin-group');
    expect(paths.some((p) => p.startsWith('/samples/'))).toBe(true);
    expect(paths.some((p) => p.startsWith('/infrastructure/'))).toBe(true);

    expect(paths).not.toContain('/try');
    expect(paths).not.toContain('/map');
    expect(paths).not.toContain('/live');
    expect(paths).not.toContain('/quiz/debug-reject');
    expect(paths.some((p) => p.startsWith('/scheme/'))).toBe(false);
  });

  it('builds a sitemap from the same inventory', () => {
    const xml = sitemapXml(['/', '/payment/wero']);
    expect(xml).toContain('https://openfinance.geoking.fr/');
    expect(xml).toContain('https://openfinance.geoking.fr/payment/wero');
    expect(xml).toContain('<urlset');
  });
});

describe('pageSeo', () => {
  it('returns unique titles for catalog articles', () => {
    expect(pageSeo('/payment/sepa-instant').title).toMatch(/SEPA Instant/i);
    expect(pageSeo('/flows/sct-inst-happy-path').description.length).toBeGreaterThan(40);
    expect(pageSeo('/messages/pacs.008').title).toContain('pacs.008');
    expect(pageSeo('/privacy').title).toMatch(/Privacy/i);
  });
});
