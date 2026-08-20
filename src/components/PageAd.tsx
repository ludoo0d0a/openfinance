import { useLocation } from 'react-router-dom';
import { AdSlot } from './AdSlot';
import {
  adsDisabledForPath,
  adsenseClient,
  adsenseSlot,
  adRefreshKey,
  type AdPlacement,
} from '@/lib/ads';

const FORMAT = {
  intro: 'horizontal',
  end: 'rectangle',
} as const;

/** Display unit remounted when the catalog page (or glossary term) changes. */
export function PageAd({ placement }: { placement: AdPlacement }) {
  const { pathname, search } = useLocation();
  if (adsDisabledForPath(pathname)) return null;

  const client = adsenseClient();
  const slot = adsenseSlot(placement);
  if (!client || !slot) return null;

  const refreshKey = `${placement}:${adRefreshKey(pathname, search)}`;
  return (
    <AdSlot
      key={refreshKey}
      slot={slot}
      format={FORMAT[placement]}
      refreshKey={refreshKey}
      className={placement === 'intro' ? 'px-4 pt-6 lg:px-8' : 'px-4 pb-8 lg:px-8'}
    />
  );
}
