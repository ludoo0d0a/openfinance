import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageSeo } from '@/lib/seo';

/** Keep `<title>` / description in sync with the route (client); prerender injects the same values. */
export function DocumentMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = pageSeo(pathname);
    document.title = seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', seo.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', seo.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', seo.description);

    let robots = document.querySelector('meta[name="robots"]');
    if (seo.robots) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.setAttribute('name', 'robots');
        document.head.appendChild(robots);
      }
      robots.setAttribute('content', seo.robots);
    } else if (robots) {
      robots.remove();
    }
  }, [pathname]);

  return null;
}
