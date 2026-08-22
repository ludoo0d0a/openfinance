/**
 * Post-`vite build` step: emit `dist/<path>/index.html` for every catalog URL
 * so AdSense / crawlers see article prose without waiting on the SPA shell.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer, type ViteDevServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function replaceRootInner(html: string, inner: string): string {
  const openTag = '<div id="root">';
  const start = html.indexOf(openTag);
  if (start === -1) {
    throw new Error('dist/index.html is missing <div id="root">');
  }
  let i = start + openTag.length;
  let depth = 1;
  while (i < html.length && depth > 0) {
    const nextOpen = html.indexOf('<div', i);
    const nextClose = html.indexOf('</div>', i);
    if (nextClose === -1) {
      throw new Error('dist/index.html has an unclosed #root');
    }
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      i = nextOpen + 4;
      continue;
    }
    depth -= 1;
    if (depth === 0) {
      return `${html.slice(0, start)}<div id="root">${inner}</div>${html.slice(nextClose + 6)}`;
    }
    i = nextClose + 6;
  }
  throw new Error('dist/index.html has an unclosed #root');
}

function applySeo(template: string, seo: { title: string; description: string; robots?: string }, canonical: string): string {
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(seo.title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
  );
  if (html.includes('rel="canonical"')) {
    html = html.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
      `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    );
  } else {
    html = html.replace('</head>', `    <link rel="canonical" href="${escapeHtml(canonical)}" />\n  </head>`);
  }
  const robots = seo.robots?.trim();
  if (robots) {
    if (/<meta\s+name="robots"/i.test(html)) {
      html = html.replace(
        /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="robots" content="${escapeHtml(robots)}" />`,
      );
    } else {
      html = html.replace('</head>', `    <meta name="robots" content="${escapeHtml(robots)}" />\n  </head>`);
    }
  } else {
    html = html.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>\s*/i, '');
  }
  return html;
}

function injectRoot(template: string, appHtml: string): string {
  // Drop any leftover noscript shell so View Source only shows the article h1.
  const withoutNoscript = template.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, '');
  return replaceRootInner(withoutNoscript, appHtml);
}

async function writePage(relPath: string, html: string): Promise<void> {
  const filePath =
    relPath === '/'
      ? path.join(dist, 'index.html')
      : path.join(dist, relPath.replace(/^\//, ''), 'index.html');
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, html, 'utf8');
}

async function main(): Promise<void> {
  const rawTemplate = await readFile(path.join(dist, 'index.html'), 'utf8');
  // Re-runs may already contain prerendered home HTML inside #root — start empty.
  const template = replaceRootInner(rawTemplate, '');

  const vite: ViteDevServer = await createServer({
    root,
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  });

  try {
    const { listPrerenderPaths, listSitemapPaths, sitemapXml } = await vite.ssrLoadModule(
      '/src/lib/prerenderUrls.ts',
    );
    const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');

    const paths = listPrerenderPaths() as string[];
    const sitemapPaths = listSitemapPaths() as string[];
    console.log(`Prerendering ${paths.length} pages (${sitemapPaths.length} in sitemap)…`);

    for (const url of paths) {
      const { html, seo, canonical } = render(url) as {
        html: string;
        seo: { title: string; description: string };
        canonical: string;
      };
      if (!html || html.length < 80) {
        throw new Error(`Prerender produced thin HTML for ${url} (${html.length} chars)`);
      }
      if (html.includes('adsbygoogle') || html.includes('data-ad-client')) {
        throw new Error(`Prerender leaked AdSense markup into ${url}`);
      }
      const page = injectRoot(applySeo(template, seo, canonical), html);
      await writePage(url, page);
    }

    const sitemap = sitemapXml(sitemapPaths);
    await writeFile(path.join(dist, 'sitemap.xml'), sitemap, 'utf8');
    await writeFile(path.join(root, 'public', 'sitemap.xml'), sitemap, 'utf8');
    console.log(`Wrote ${paths.length} pages + sitemap.xml`);
  } finally {
    await vite.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
