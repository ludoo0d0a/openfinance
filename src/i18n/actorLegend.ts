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
    'external-network': { term: 'ExtNet', short: 'Network' },
    agi: { term: 'AGI', short: 'Gateway' },
    'payment-hub': { term: 'Hub', short: 'Orchestrator' },
    ilm: { term: 'ILM', short: 'Liquidity' },
    settlement: { term: 'Sttlm', short: 'Settlement' },
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
    'external-network': { term: 'ExtNet', short: 'Réseau' },
    agi: { term: 'AGI', short: 'Passerelle' },
    'payment-hub': { term: 'Hub', short: 'Orchestrateur' },
    ilm: { term: 'ILM', short: 'Liquidité' },
    settlement: { term: 'Règlement', short: 'Règlement' },
  },
};
