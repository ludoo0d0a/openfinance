import type { CodeEntry, CodeFamily, Iso20022Message, Locale } from '@/types';
import { CODES } from './codes';
import { GLOSSARY_ENTRIES } from './glossaryEntries';
import { GLOSSARY_MASTERCARD } from './glossaryMastercard';
import { ISO_MESSAGES } from './iso20022';
import type { GlossaryCategory, GlossaryEntry } from './glossaryTypes';

export type {
  GlossaryCategory,
  GlossaryEntry,
  GlossaryLink,
  GlossarySource,
  GlossarySourceId,
} from './glossaryTypes';
export { GLOSSARY_SOURCES, g } from './glossaryTypes';

/** Bilingual overlays for codes that already had a glossary entry. */
const CODE_OVERLAYS: Record<string, Partial<GlossaryEntry>> = {
  mtch: {
    name: { en: 'Match', fr: 'Correspondance' },
    aliases: { en: ['match', 'VoP match'], fr: ['match', 'correspondance VoP'] },
    definition: {
      en: 'VoP outcome: the typed payee name matches the account holder. Safe to proceed with the credit transfer.',
      fr: 'Résultat VoP : le nom saisi correspond au titulaire du compte. On peut poursuivre le virement en sécurité.',
    },
    seeAlso: ['vop', 'cmtc', 'nmtc'],
  },
  cmtc: {
    name: { en: 'Close match', fr: 'Correspondance proche' },
    aliases: {
      en: ['close match', 'CMTC'],
      fr: ['correspondance proche', 'quasi-correspondance', 'CMTC'],
    },
    definition: {
      en: 'VoP outcome: not an exact match, but a close one. The report returns the suggested legal name. The PSU must see it and confirm before the payment continues.',
      fr: 'Résultat VoP : pas une correspondance exacte, mais proche. Le rapport renvoie le nom légal suggéré. Le PSU doit le voir et confirmer avant de poursuivre le paiement.',
    },
    seeAlso: ['vop', 'mtch', 'nmtc'],
  },
  nmtc: {
    name: { en: 'No match', fr: 'Aucune correspondance' },
    aliases: {
      en: ['no match', 'mismatch', 'NMTC'],
      fr: ['aucune correspondance', 'non-correspondance', 'mismatch', 'NMTC'],
    },
    definition: {
      en: 'VoP outcome: the name does not match the account. The PSU may still proceed after an explicit risk acceptance; log that consent for liability.',
      fr: 'Résultat VoP : le nom ne correspond pas au compte. Le PSU peut quand même continuer après acceptation explicite du risque ; journalisez ce consentement pour la responsabilité.',
    },
    seeAlso: ['vop', 'mtch', 'cmtc'],
  },
};

export function slugCodeId(code: string): string {
  return code.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function entryFromCode(c: CodeEntry): GlossaryEntry {
  const id = slugCodeId(c.code);
  const overlay = CODE_OVERLAYS[id];
  return {
    id,
    term: c.code,
    name: overlay?.name ?? { en: c.name, fr: c.name },
    aliases: overlay?.aliases ?? { en: [c.name], fr: [c.name] },
    category: 'code',
    definition: overlay?.definition ?? { en: c.description, fr: c.description },
    seeAlso: overlay?.seeAlso,
    family: c.family,
    severity: c.severity,
    http: c.http,
    action: c.action,
  };
}

function humanizeIsoName(name: string): string {
  return name
    .replace(/V\d+$/, '')
    .replace(/FIToFI/g, 'FIToFI ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/FIToFI /g, 'FI to FI ')
    .replace(/\s+/g, ' ')
    .trim();
}

function messageLinks(short: string, extra?: GlossaryEntry['links']): GlossaryEntry['links'] {
  return [{ label: short, href: `/messages/${short}` }, ...(extra ?? [])];
}

/** Bilingual overlays for ISO messages merged from `iso20022.ts`. */
const MESSAGE_OVERLAYS: Record<string, Partial<GlossaryEntry>> = {
  'pain-001': {
    name: { en: 'Customer Credit Transfer Initiation', fr: 'Initiation de virement client' },
    aliases: { en: ['pain.001', 'credit transfer initiation'], fr: ['pain.001', 'initiation de virement'] },
    definition: {
      en: 'Customer-to-bank instruction to move money. In PSD2 this is what a bulk or file payment body actually contains; the debtor bank turns it into a pacs.008.',
      fr: 'Instruction client-banque pour déplacer de l’argent. En PSD2, c’est le contenu réel d’un paiement fichier ou de masse ; la banque du débiteur le transforme en pacs.008.',
    },
    seeAlso: ['pain', 'pain-002', 'pacs-008', 'iso-20022'],
  },
  'pain-002': {
    name: { en: 'Customer Payment Status Report', fr: 'Rapport de statut de paiement client' },
    aliases: { en: ['pain.002', 'payment status report'], fr: ['pain.002', 'rapport de statut'] },
    definition: {
      en: 'The bank telling the initiator what happened to a pain.001. Group, payment-information and transaction statuses are all optional — parsers must handle three nesting levels.',
      fr: 'La banque indique à l’initiateur ce qu’il est advenu d’un pain.001. Les statuts groupe, payment-information et transaction sont tous optionnels — le parseur doit gérer trois niveaux.',
    },
    seeAlso: ['pain', 'pain-001', 'pacs-002'],
  },
  'pain-008': {
    name: { en: 'Customer Direct Debit Initiation', fr: 'Initiation de prélèvement client' },
    aliases: { en: ['pain.008', 'direct debit initiation', 'SDD initiation'], fr: ['pain.008', 'initiation de prélèvement'] },
    definition: {
      en: 'SEPA Direct Debit collection instruction. Carries the mandate reference and sequence type that drive R-transaction handling.',
      fr: 'Instruction de collecte de prélèvement SEPA. Porte la référence de mandat et le type de séquence qui pilotent les R-transactions.',
    },
    seeAlso: ['pain', 'sdd', 'iso-20022'],
  },
  'pain-013': {
    name: { en: 'Creditor Payment Activation Request', fr: 'Demande d’activation de paiement créancier' },
    aliases: { en: ['pain.013', 'request to pay', 'RTP', 'SRTP'], fr: ['pain.013', 'request-to-pay', 'RTP'] },
    definition: {
      en: 'Request-to-Pay: the creditor asks the debtor to authorise a payment — the ISO underpinning of SRTP and of most PISP-at-checkout products.',
      fr: 'Request-to-Pay : le créancier demande au débiteur d’autoriser un paiement — le socle ISO du SRTP et de la plupart des PISP en checkout.',
    },
    seeAlso: ['pain', 'pain-014', 'pis'],
  },
  'pain-014': {
    name: { en: 'Creditor Payment Activation Request Status Report', fr: 'Rapport de statut de demande d’activation de paiement' },
    aliases: { en: ['pain.014', 'RTP status'], fr: ['pain.014', 'statut RTP'] },
    definition: {
      en: 'The answer to a pain.013 — accepted, rejected or pending.',
      fr: 'La réponse à un pain.013 — accepté, rejeté ou en attente.',
    },
    seeAlso: ['pain', 'pain-013'],
  },
  'pacs-008': {
    name: { en: 'FI to FI Customer Credit Transfer', fr: 'Virement client interbancaire' },
    aliases: { en: ['pacs.008', 'interbank credit transfer', 'FIToFICstmrCdtTrf'], fr: ['pacs.008', 'virement interbancaire'] },
    definition: {
      en: 'The interbank credit transfer. Everything a PISP initiates eventually becomes one of these. SWIFT and ISO publish successive schema versions; each market picks one via its usage guideline (EPC SEPA, CBPR+, SIC…).',
      fr: 'Le virement interbancaire. Tout ce qu’un PISP initie finit par en devenir un. SWIFT et ISO publient des révisions de schéma successives ; chaque marché en choisit une via son usage guideline (EPC SEPA, CBPR+, SIC…).',
    },
    seeAlso: ['pacs', 'pacs-002', 'pain-001', 'sct', 'sct-inst', 'iso-20022'],
  },
  'pacs-002': {
    name: { en: 'FI to FI Payment Status Report', fr: 'Rapport de statut de paiement interbancaire' },
    aliases: { en: ['pacs.002', 'status report', 'ack'], fr: ['pacs.002', 'rapport de statut', 'ack'] },
    definition: {
      en: 'The clearing answer. Under SEPA Instant this is the message you wait on inside a 10-second window, and TxSts=ACSC is the only thing that means settled. Pair its schema version with the pacs.008 you acknowledged.',
      fr: 'La réponse de compensation. En SEPA Instant, c’est le message attendu dans une fenêtre de 10 secondes, et TxSts=ACSC est le seul statut qui signifie réglé. Alignez sa version de schéma sur le pacs.008 acquitté.',
    },
    seeAlso: ['pacs', 'pacs-008', 'pacs-028', 'acsc', 'rjct'],
  },
  'pacs-004': {
    name: { en: 'Payment Return', fr: 'Retour de paiement' },
    aliases: { en: ['pacs.004', 'return', 'R-transaction'], fr: ['pacs.004', 'retour', 'R-transaction'] },
    definition: {
      en: 'Money going back. Used for returns after settlement and as the positive answer to a recall. Carries RtrRsnInf with the original reason code.',
      fr: 'L’argent qui revient. Utilisé pour les retours après règlement et comme réponse positive à un recall. Porte RtrRsnInf avec le code motif d’origine.',
    },
    seeAlso: ['pacs', 'camt-056', 'camt-029'],
  },
  'pacs-009': {
    name: { en: 'Financial Institution Credit Transfer', fr: 'Virement entre institutions financières' },
    aliases: { en: ['pacs.009', 'cover payment', 'FI credit transfer'], fr: ['pacs.009', 'virement FI', 'cover'] },
    definition: {
      en: 'Bank-to-bank transfer where both parties are financial institutions — cover payments and liquidity moves.',
      fr: 'Virement banque-banque où les deux parties sont des institutions financières — paiements de couverture et mouvements de liquidité.',
    },
    seeAlso: ['pacs', 'pacs-008'],
  },
  'pacs-028': {
    name: { en: 'FI to FI Payment Status Request', fr: 'Demande de statut de paiement interbancaire' },
    aliases: { en: ['pacs.028', 'status request', 'investigation'], fr: ['pacs.028', 'demande de statut', 'investigation'] },
    definition: {
      en: 'Asking the other side what happened when no pacs.002 arrived. The polite version of a payment investigation — never re-initiate blindly after an instant timeout.',
      fr: 'Demander à la contrepartie ce qui s’est passé quand aucun pacs.002 n’est arrivé. La version polie d’une investigation — ne jamais réémettre à l’aveugle après un timeout instantané.',
    },
    seeAlso: ['pacs', 'pacs-002', 'pacs-008', 'sct-inst'],
  },
  'camt-052': {
    name: { en: 'Bank to Customer Account Report', fr: 'Relevé de compte intra-journalier' },
    aliases: { en: ['camt.052', 'intraday report', 'account report'], fr: ['camt.052', 'relevé intra-journalier'] },
    definition: {
      en: 'Intraday account report. Berlin Group lets an ASPSP return this instead of JSON from GET /transactions when you ask for it in the Accept header.',
      fr: 'Relevé de compte intra-journalier. Berlin Group permet à un ASPSP de renvoyer ceci à la place du JSON de GET /transactions si vous le demandez dans Accept.',
    },
    seeAlso: ['camt', 'camt-053', 'camt-054', 'ais'],
  },
  'camt-053': {
    name: { en: 'Bank to Customer Statement', fr: 'Relevé de compte de fin de journée' },
    aliases: { en: ['camt.053', 'end-of-day statement', 'statement'], fr: ['camt.053', 'relevé de fin de journée'] },
    definition: {
      en: 'End-of-day statement. Closing booked balance is authoritative; intraday reports are not.',
      fr: 'Relevé de fin de journée. Le solde comptabilisé de clôture fait foi ; les relevés intra-journaliers non.',
    },
    seeAlso: ['camt', 'camt-052', 'camt-054'],
  },
  'camt-054': {
    name: { en: 'Bank to Customer Debit Credit Notification', fr: 'Notification de débit / crédit' },
    aliases: { en: ['camt.054', 'credit notification', 'debit notification'], fr: ['camt.054', 'notification de crédit'] },
    definition: {
      en: 'Real-time credit or debit notification. What a merchant listens to in order to release goods on an instant payment.',
      fr: 'Notification de débit ou crédit en temps réel. Ce qu’un commerçant écoute pour libérer la marchandise sur un paiement instantané.',
    },
    seeAlso: ['camt', 'camt-053', 'pacs-008', 'sct-inst'],
  },
  'camt-056': {
    name: { en: 'FI to FI Payment Cancellation Request', fr: 'Demande d’annulation de paiement interbancaire' },
    aliases: { en: ['camt.056', 'recall', 'cancellation request'], fr: ['camt.056', 'recall', 'demande d’annulation'] },
    definition: {
      en: 'The recall. Asks the creditor bank to send the money back, quoting a CancellationReason such as DUPL, TECH or FRAD.',
      fr: 'Le recall. Demande à la banque du créancier de renvoyer les fonds, en citant un motif d’annulation tel que DUPL, TECH ou FRAD.',
    },
    seeAlso: ['camt', 'camt-029', 'pacs-004', 'frad'],
  },
  'camt-029': {
    name: { en: 'Resolution of Investigation', fr: 'Résolution d’investigation' },
    aliases: { en: ['camt.029', 'investigation resolution'], fr: ['camt.029', 'résolution d’investigation'] },
    definition: {
      en: 'The answer to a camt.056 or camt.026. Negative answers carry a RejectionReason; positive ones are followed by a pacs.004. The camt.029 alone moves no money.',
      fr: 'La réponse à un camt.056 ou camt.026. Les réponses négatives portent un RejectionReason ; les positives sont suivies d’un pacs.004. Le camt.029 seul ne déplace aucun fonds.',
    },
    seeAlso: ['camt', 'camt-056', 'pacs-004', 'camt-026'],
  },
  'camt-055': {
    name: { en: 'Customer Payment Cancellation Request', fr: 'Demande d’annulation de paiement client' },
    aliases: { en: ['camt.055', 'customer cancellation'], fr: ['camt.055', 'annulation client'] },
    definition: {
      en: 'A customer asking its own bank to cancel a pain.001 it already sent. Maps onto DELETE /v1/payments in Berlin Group.',
      fr: 'Un client demandant à sa banque d’annuler un pain.001 déjà envoyé. Correspond au DELETE /v1/payments Berlin Group.',
    },
    seeAlso: ['camt', 'pain-001', 'camt-056'],
  },
  'camt-026': {
    name: { en: 'Unable to Apply', fr: 'Impossible d’appliquer' },
    aliases: { en: ['camt.026', 'unable to apply'], fr: ['camt.026', 'unable to apply'] },
    definition: {
      en: 'A payment arrived but cannot be applied — missing or unusable remittance information. Opens an investigation case.',
      fr: 'Un paiement est arrivé mais ne peut pas être appliqué — informations de remise manquantes ou inutilisables. Ouvre un dossier d’investigation.',
    },
    seeAlso: ['camt', 'camt-029', 'camt-087'],
  },
  'camt-087': {
    name: { en: 'Request to Modify Payment', fr: 'Demande de modification de paiement' },
    aliases: { en: ['camt.087', 'modify payment'], fr: ['camt.087', 'modification de paiement'] },
    definition: {
      en: 'Asking for a field to be corrected rather than the payment returned — usually a beneficiary detail.',
      fr: 'Demander la correction d’un champ plutôt que le retour du paiement — en général un détail bénéficiaire.',
    },
    seeAlso: ['camt', 'camt-026', 'camt-029', 'pacs-004'],
  },
  'acmt-023': {
    name: { en: 'Identification Verification Request', fr: 'Demande de vérification d’identité' },
    aliases: { en: ['acmt.023', 'VoP request'], fr: ['acmt.023', 'demande VoP'] },
    definition: {
      en: 'ISO 20022 message that carries the Verification of Payee request: the payee name as typed by the PSU and the IBAN to check. Do not normalise the name before sending — that defeats the check.',
      fr: 'Message ISO 20022 portant la demande de Verification of Payee : le nom du bénéficiaire tel que saisi par le PSU et l’IBAN à contrôler. Ne normalisez pas le nom avant envoi — cela annule l’intérêt du contrôle.',
    },
    seeAlso: ['vop', 'acmt-024', 'acmt', 'iso-20022'],
    links: messageLinks('acmt.023', [{ label: 'Sample', href: '/samples/acmt-023-vop' }]),
  },
  'acmt-024': {
    name: { en: 'Identification Verification Report', fr: 'Rapport de vérification d’identité' },
    aliases: { en: ['acmt.024', 'VoP report', 'VoP response'], fr: ['acmt.024', 'rapport VoP', 'réponse VoP'] },
    definition: {
      en: 'ISO 20022 answer to a VoP request. Carries MTCH, CMTC (with the suggested legal name) or NMTC. Close-match UX must show the suggested name; no-match requires explicit PSU risk acceptance.',
      fr: 'Réponse ISO 20022 à une demande VoP. Porte MTCH, CMTC (avec le nom légal suggéré) ou NMTC. Sur close-match, l’UX doit afficher le nom suggéré ; sur no-match, le PSU doit accepter explicitement le risque.',
    },
    seeAlso: ['vop', 'acmt-023', 'mtch', 'cmtc', 'nmtc'],
    links: messageLinks('acmt.024', [{ label: 'Sample', href: '/samples/acmt-024-vop-report' }]),
  },
};

function entryFromMessage(m: Iso20022Message): GlossaryEntry {
  const id = slugCodeId(m.short);
  const overlay = MESSAGE_OVERLAYS[id];
  const enName = overlay?.name?.en ?? humanizeIsoName(m.name);
  const frName = overlay?.name?.fr ?? enName;
  return {
    id,
    term: m.short,
    name: overlay?.name ?? { en: enName, fr: frName },
    aliases: overlay?.aliases ?? { en: [m.short, m.name], fr: [m.short, frName] },
    category: 'message',
    definition: overlay?.definition ?? { en: m.purpose, fr: m.purpose },
    seeAlso: overlay?.seeAlso ?? [m.area, 'iso-20022'],
    links: overlay?.links ?? messageLinks(m.short),
  };
}

/**
 * Payments / Open Finance glossary. English is the working language of the
 * catalog; French names and definitions sit on the same entries.
 * Status and error codes from `codes.ts` are merged in as category `code`.
 * ISO messages from `iso20022.ts` are merged in as category `message`.
 */
export const GLOSSARY: GlossaryEntry[] = [
  ...GLOSSARY_ENTRIES,
  ...GLOSSARY_MASTERCARD,
  ...ISO_MESSAGES.map(entryFromMessage),
  ...CODES.map(entryFromCode),
];

export const GLOSSARY_CODES = GLOSSARY.filter((e) => e.category === 'code');
export const GLOSSARY_MESSAGES = GLOSSARY.filter((e) => e.category === 'message');

export const CODE_FAMILIES = [
  'iso-tx-status',
  'iso-status-reason',
  'bg-error',
  'stet-error',
  'ukob-error',
  'sca-status',
  'consent-status',
  'scheme-status',
] as const satisfies readonly CodeFamily[];

export const GLOSSARY_CATEGORY_LABELS: Record<GlossaryCategory, Record<Locale, string>> = {
  concept: { en: 'Concept', fr: 'Concept' },
  regulation: { en: 'Regulation', fr: 'Réglementation' },
  message: { en: 'Message', fr: 'Message' },
  code: { en: 'Code', fr: 'Code' },
  scheme: { en: 'Scheme', fr: 'Schéma' },
};

export function glossaryById(id: string): GlossaryEntry | undefined {
  return GLOSSARY.find((e) => e.id === id);
}

export function codeByValue(code: string): GlossaryEntry | undefined {
  const q = code.toLowerCase();
  return GLOSSARY_CODES.find((e) => e.term.toLowerCase() === q);
}

export function glossaryHref(entry: Pick<GlossaryEntry, 'id' | 'category'>): string {
  return entry.category === 'code'
    ? `/glossary?category=code&id=${encodeURIComponent(entry.id)}`
    : `/glossary?id=${encodeURIComponent(entry.id)}`;
}

export function localizeGlossaryEntry(entry: GlossaryEntry, locale: Locale) {
  return {
    ...entry,
    displayName: entry.name[locale] ?? entry.name.en,
    displayDefinition: entry.definition[locale] ?? entry.definition.en,
    displayAliases: entry.aliases[locale] ?? entry.aliases.en,
    categoryLabel: GLOSSARY_CATEGORY_LABELS[entry.category][locale],
  };
}

/**
 * Rank a glossary hit: 0 exact term, 1 exact alias/name, 2 prefix, 3 contains
 * in term/name/alias, 4 definition/action. Null = no match.
 */
export function glossaryMatchRank(entry: GlossaryEntry, query: string): number | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const term = entry.term.toLowerCase();
  const names = [entry.name.en, entry.name.fr].map((s) => s.toLowerCase());
  const aliases = [...entry.aliases.en, ...entry.aliases.fr].map((s) => s.toLowerCase());
  const labels = [term, entry.id.toLowerCase(), ...names, ...aliases];

  if (term === q || entry.id.toLowerCase() === q) return 0;
  if (names.includes(q) || aliases.includes(q)) return 1;
  if (labels.some((s) => s.startsWith(q))) return 2;
  if (labels.some((s) => s.includes(q))) return 3;

  const body = [entry.definition.en, entry.definition.fr, entry.action ?? '', entry.family ?? '']
    .join(' ')
    .toLowerCase();
  if (body.includes(q)) return 4;
  return null;
}

/** Glossary page + ⌘K share this matcher. Results are best-match first. */
export function searchGlossary(query: string): GlossaryEntry[] {
  const q = query.trim();
  if (!q) return [];
  return GLOSSARY.map((e) => ({ e, rank: glossaryMatchRank(e, q) }))
    .filter((x): x is { e: GlossaryEntry; rank: number } => x.rank !== null)
    .sort((a, b) => a.rank - b.rank || a.e.term.localeCompare(b.e.term))
    .map((x) => x.e);
}
