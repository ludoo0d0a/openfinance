import type { ActorId } from '@/types';
import type { Locale } from './types';

/** Diagram legend / lane caption: regulatory short term + a light one-word gloss. */
export const ACTOR_LEGEND: Record<Locale, Record<ActorId, { term: string; short: string }>> = {
  en: {
    psu: { term: 'PSU', short: 'User' },
    tpp: { term: 'TPP', short: 'Provider' },
    aspsp: { term: 'ASPSP', short: 'Bank' },
    sca: { term: 'SCA', short: 'Auth' },
    csm: { term: 'CSM', short: 'Clearing' },
    beneficiary: { term: 'Creditor', short: 'Bank' },
    rail: { term: 'Rail', short: 'RTGS' },
    scheme: { term: 'Scheme', short: 'Wero' },
  },
  fr: {
    psu: { term: 'PSU', short: 'Utilisateur' },
    tpp: { term: 'TPP', short: 'Prestataire' },
    aspsp: { term: 'ASPSP', short: 'Banque' },
    sca: { term: 'SCA', short: 'Auth' },
    csm: { term: 'CSM', short: 'Compensation' },
    beneficiary: { term: 'Créancier', short: 'Banque' },
    rail: { term: 'Rail', short: 'RTGS' },
    scheme: { term: 'Schéma', short: 'Wero' },
  },
};
