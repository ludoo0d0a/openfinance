import { describe, expect, it } from 'vitest';
import { listPrerenderPaths, listSitemapPaths, sitemapXml } from '../src/lib/prerenderUrls';
import { pageSeo } from '../src/lib/seo';

describe('prerenderUrls', () => {
  it('lists catalog pages plus tool entry shells', () => {
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

    // Tool shells so View Source is not the homepage (AdSense inventory).
    expect(paths).toContain('/try');
    expect(paths).toContain('/map');
    expect(paths).toContain('/live');
    expect(paths).toContain('/quiz/debug-reject');
    expect(paths.some((p) => p.startsWith('/scheme/'))).toBe(false);
  });

  it('keeps tools out of the sitemap', () => {
    const sitemap = listSitemapPaths();
    expect(sitemap).toContain('/payment/sepa-instant');
    expect(sitemap).not.toContain('/try');
    expect(sitemap).not.toContain('/map');
    expect(sitemap).not.toContain('/live');
    expect(sitemap).not.toContain('/quiz/debug-reject');
  });

  it('builds a sitemap from the same inventory', () => {
    const xml = sitemapXml(['/', '/payment/wero']);
    expect(xml).toContain('https://openfinance.geoking.fr/');
    expect(xml).toContain('https://openfinance.geoking.fr/payment/wero');
    expect(xml).toContain('<urlset');
  });
});

describe('pageSeo', () => {
  it('returns unique titles for catalog articles and tools', () => {
    expect(pageSeo('/payment/sepa-instant').title).toMatch(/SEPA Instant/i);
    expect(pageSeo('/flows/sct-inst-happy-path').description.length).toBeGreaterThan(40);
    expect(pageSeo('/messages/pacs.008').title).toContain('pacs.008');
    expect(pageSeo('/privacy').title).toMatch(/Privacy/i);
    expect(pageSeo('/try').title).toMatch(/Try/i);
    expect(pageSeo('/map').title).toMatch(/Interop map/i);
    expect(pageSeo('/live').title).toMatch(/Live/i);
  });
});
