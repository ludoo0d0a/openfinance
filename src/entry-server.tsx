import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { I18nProvider } from '@/i18n';
import { SearchQueryProvider } from '@/hooks/SearchQueryContext';
import App from '@/App';
import { pageSeo, canonicalUrl, type PageSeo } from '@/lib/seo';

export type RenderResult = {
  html: string;
  seo: PageSeo;
  canonical: string;
};

/** Server render of a catalog URL (English) for static HTML emission. */
export function render(url: string): RenderResult {
  const pathname = url.split('?')[0] || '/';
  const seo = pageSeo(pathname);
  const html = renderToString(
    <StaticRouter location={url}>
      <I18nProvider initialLocale="en">
        <SearchQueryProvider>
          <App />
        </SearchQueryProvider>
      </I18nProvider>
    </StaticRouter>,
  );
  return { html, seo, canonical: canonicalUrl(pathname) };
}
