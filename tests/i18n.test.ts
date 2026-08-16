import { describe, expect, it } from 'vitest';
import { interpolate, resolveMessage } from '../src/i18n/types';
import { en } from '../src/i18n/locales/en';
import { fr } from '../src/i18n/locales/fr';
import { ACTOR_LEGEND } from '../src/i18n/actorLegend';
import type { ActorId } from '../src/types';

describe('i18n', () => {
  it('resolves nested keys in both locales', () => {
    expect(resolveMessage(en, 'nav.overview')).toBe('Payment Explorer');
    expect(resolveMessage(fr, 'nav.overview')).toBe('Payment Explorer');
  });

  it('interpolates placeholders', () => {
    expect(interpolate('{{count}} steps', { count: 3 })).toBe('3 steps');
  });

  it('keeps EN and FR key trees aligned for core nav', () => {
    for (const key of [
      'nav.overview',
      'nav.try',
      'nav.glossary',
      'nav.about',
      'home.title1',
      'locale.fr',
      'flow.entities',
      'flow.fullscreen',
      'flow.exitFullscreen',
    ]) {
      expect(resolveMessage(en, key), key).toBeTypeOf('string');
      expect(resolveMessage(fr, key), key).toBeTypeOf('string');
    }
  });

  it('gives every actor a short legend term in EN and FR', () => {
    const ids: ActorId[] = ['psu', 'tpp', 'aspsp', 'sca', 'csm', 'beneficiary', 'rail', 'scheme'];
    for (const id of ids) {
      expect(ACTOR_LEGEND.en[id].term).toBeTruthy();
      expect(ACTOR_LEGEND.en[id].short).toBeTruthy();
      expect(ACTOR_LEGEND.fr[id].term).toBeTruthy();
      expect(ACTOR_LEGEND.fr[id].short).toBeTruthy();
    }
    expect(ACTOR_LEGEND.en.psu).toEqual({ term: 'PSU', short: 'User' });
    expect(ACTOR_LEGEND.en.tpp).toEqual({ term: 'TPP', short: 'Provider' });
    expect(ACTOR_LEGEND.en.sca).toEqual({ term: 'SCA', short: 'Auth' });
  });
});
