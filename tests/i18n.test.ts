import { describe, expect, it } from 'vitest';
import { interpolate, resolveMessage } from '../src/i18n/types';
import { en } from '../src/i18n/locales/en';
import { fr } from '../src/i18n/locales/fr';

describe('i18n', () => {
  it('resolves nested keys in both locales', () => {
    expect(resolveMessage(en, 'nav.overview')).toBe('Overview');
    expect(resolveMessage(fr, 'nav.overview')).toBe('Vue d’ensemble');
  });

  it('interpolates placeholders', () => {
    expect(interpolate('{{count}} steps', { count: 3 })).toBe('3 steps');
  });

  it('keeps EN and FR key trees aligned for core nav', () => {
    for (const key of ['nav.overview', 'nav.try', 'nav.glossary', 'nav.about', 'home.title1', 'locale.fr', 'flow.entities']) {
      expect(resolveMessage(en, key), key).toBeTypeOf('string');
      expect(resolveMessage(fr, key), key).toBeTypeOf('string');
    }
  });
});
