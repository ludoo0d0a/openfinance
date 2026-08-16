import { InteropGraph } from '@/components/InteropGraph';
import { useT } from '@/i18n';
import { PageAd } from '@/components/PageAd';

export function MapView() {
  const t = useT();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
      <header className="max-w-3xl">
        <p className="eyebrow">{t('map.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{t('map.title')}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('map.lead')}</p>
      </header>

      <PageAd placement="mid" />

      <div className="mt-8">
        <InteropGraph />
      </div>
    </div>
  );
}
