import { describe, expect, it } from 'vitest';
import {
  adsDisabledForPath,
  adsTxtBody,
  adRefreshKey,
  isContentPath,
  publisherIdFromClient,
} from '../src/lib/ads';

describe('ads', () => {
  it('derives ads.txt publisher ids from ca-pub clients', () => {
    expect(publisherIdFromClient('ca-pub-1234567890123456')).toBe('pub-1234567890123456');
    expect(publisherIdFromClient('pub-1234567890123456')).toBe('pub-1234567890123456');
    expect(publisherIdFromClient('')).toBeUndefined();
    expect(publisherIdFromClient('not-a-pub')).toBeUndefined();
  });

  it('emits a valid ads.txt line', () => {
    expect(adsTxtBody('ca-pub-1234567890123456')).toBe(
      'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n',
    );
  });

  it('skips screens without publisher article content', () => {
    expect(adsDisabledForPath('/try')).toBe(true);
    expect(adsDisabledForPath('/try/')).toBe(true);
    expect(adsDisabledForPath('/map')).toBe(true);
    expect(adsDisabledForPath('/quiz/debug-reject')).toBe(true);
    expect(adsDisabledForPath('/privacy')).toBe(true);
    expect(adsDisabledForPath('/contact')).toBe(true);
    expect(adsDisabledForPath('/this-path-does-not-exist')).toBe(true);
    expect(adsDisabledForPath('/payment/wero')).toBe(false);
    expect(adsDisabledForPath('/glossary')).toBe(false);
    expect(isContentPath('/')).toBe(true);
    expect(isContentPath('/about')).toBe(true);
    expect(isContentPath('/map')).toBe(false);
  });

  it('remounts ads when the catalog page or glossary term changes', () => {
    expect(adRefreshKey('/payment/wero', '')).not.toBe(adRefreshKey('/payment/sepa-instant', ''));
    expect(adRefreshKey('/glossary', '?id=vop')).not.toBe(adRefreshKey('/glossary', '?id=ipr'));
    expect(adRefreshKey('/messages/pacs.008', '?v=foo')).not.toBe(adRefreshKey('/messages/pacs.008', ''));
    expect(adRefreshKey('/compare/pacs.008', '?from=a&to=b')).not.toBe(
      adRefreshKey('/compare/pacs.008', '?from=a&to=c'),
    );
  });

  it('does not remount when explorer filters or flow steps change', () => {
    expect(adRefreshKey('/payment/wero', '?focus=pacs.008&level=expert')).toBe(
      adRefreshKey('/payment/wero', '?via=pisp'),
    );
    expect(adRefreshKey('/flows/sct-inst-happy-path', '?step=3')).toBe(
      adRefreshKey('/flows/sct-inst-happy-path', '?step=1'),
    );
  });
});
