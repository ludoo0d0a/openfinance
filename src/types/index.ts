/**
 * Domain model for the explorer.
 *
 * Two worlds meet in PSD2 tooling and the app keeps them distinct:
 *  - the *API layer* a TPP talks to (Berlin Group, STET, UK Open Banking …) — JSON over HTTPS
 *  - the *clearing layer* the ASPSP talks to (ISO 20022 pacs/pain/camt) — XML over the CSM
 * A flow can cross both, which is exactly what makes debugging hard.
 */

export type BusinessArea = 'pain' | 'pacs' | 'camt' | 'acmt' | 'auth' | 'remt';

export type Layer = 'api' | 'clearing';

/** ISO 20022 message identifier, e.g. pacs.008.001.08 */
export interface MessageIdParts {
  /** Business area: pacs, pain, camt … */
  area: string;
  /** Message identifier within the area: 008 */
  identifier: string;
  /** Message variant (flavour): 001 */
  variant: string;
  /** Version: 08 */
  version: string;
  /** True when the string parsed cleanly */
  valid: boolean;
  /** Short form without variant/version: pacs.008 */
  short: string;
  raw: string;
}

/**
 * One schema revision of a message (SWIFT / ISO successive versions).
 * Example: pacs.008.001.08 vs pacs.008.001.10 vs pacs.008.001.13 —
 * same business message, different XSD / usage-guideline baseline per market.
 */
export type MessageVersionStatus = 'current' | 'legacy' | 'upcoming';

export interface MessageVersion {
  /** Fully versioned id used in the Document xmlns */
  id: string;
  /** Catalogue / XSD type name when it differs (e.g. FIToFICustomerCreditTransferV10) */
  schemaName: string;
  status: MessageVersionStatus;
  /**
   * Markets / exchange zones that mandate or commonly run this revision
   * (SEPA SCT, SCT Inst, CBPR+, SIC, TARGET2, …).
   */
  markets: string[];
  notes: Record<Locale, string>;
}

export interface Iso20022Message {
  /** Fully versioned id used in the XML Document namespace (canonical / default) */
  id: string;
  /** pacs.008 — the form humans actually say out loud */
  short: string;
  name: string;
  area: BusinessArea;
  /** Who sends it to whom */
  direction: 'customer-to-bank' | 'bank-to-customer' | 'bank-to-bank' | 'bank-to-csm';
  purpose: string;
  /** Root element under <Document> */
  rootElement: string;
  /** Elements a validator should insist on. Not a substitute for the XSD. */
  requiredPaths: string[];
  /** Flow ids this message appears in */
  flows: string[];
  tags: string[];
  /**
   * Declinations managed by SWIFT and ISO. When omitted, the single `id` is
   * treated as the only known revision.
   */
  versions?: MessageVersion[];
}

export interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  /** Consent / token scope needed */
  scope?: string;
}

export interface StandardApi {
  id: string;
  name: string;
  /** AIS, PIS, PIIS, CBPII … */
  role: string;
  summary: string;
  endpoints: Endpoint[];
}

export interface Standard {
  id: string;
  name: string;
  publisher: string;
  region: string;
  version: string;
  status: 'current' | 'maintained' | 'superseded';
  summary: string;
  /** What a TPP has to get right at the transport layer */
  security: {
    clientAuth: string;
    messageSigning: string;
    tokens: string;
    certificates: string;
  };
  scaApproaches: string[];
  apis: StandardApi[];
  docsUrl: string;
  /** Things that bite integrators. Written from experience, not from the spec index. */
  gotchas: string[];
}

export type ActorId = 'psu' | 'tpp' | 'aspsp' | 'sca' | 'csm' | 'beneficiary' | 'rail' | 'scheme';

/** UI language for bilingual catalog overlays (glossary, flows, …). */
export type Locale = 'en' | 'fr';

export interface Actor {
  id: ActorId;
  label: string;
  sublabel: string;
}

export interface FlowStep {
  n: number;
  from: ActorId;
  to: ActorId;
  layer: Layer;
  label: string;
  detail: string;
  method?: Endpoint['method'];
  path?: string;
  httpStatus?: number;
  /** ISO 20022 message short id, when this step is a clearing message */
  messageShort?: string;
  /** Sample payload id to load into the inspector */
  sampleId?: string;
  /** Reason / status codes that can surface at this step */
  codes?: string[];
  /** Headers worth calling out */
  headers?: string[];
}

export interface Flow {
  id: string;
  name: string;
  standardId: string;
  category:
    | 'account-information'
    | 'payment-initiation'
    | 'funds-confirmation'
    | 'clearing'
    | 'exception'
    | 'scheme';
  summary: string;
  /** Why you'd read this flow */
  useCase: string;
  actors: ActorId[];
  steps: FlowStep[];
  tags: string[];
}

export interface Sample {
  id: string;
  label: string;
  format: 'xml' | 'json';
  /** Message short id for XML samples */
  messageShort?: string;
  standardId?: string;
  description: string;
  content: string;
}

export type CodeFamily =
  | 'iso-tx-status'
  | 'iso-status-reason'
  | 'bg-error'
  | 'stet-error'
  | 'ukob-error'
  | 'sca-status'
  | 'consent-status'
  | 'scheme-status';

export interface CodeEntry {
  code: string;
  family: CodeFamily;
  name: string;
  description: string;
  severity: 'info' | 'success' | 'pending' | 'error';
  /** HTTP status the API layer maps this to, where applicable */
  http?: number;
  /** What to actually do about it */
  action?: string;
}

/** Result shape returned by POST /api/validate */
export interface ValidationResult {
  wellFormed: boolean;
  messageShort: string | null;
  detectedNamespace: string | null;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  stats: { elements: number; depth: number; bytes: number };
}

export interface ValidationIssue {
  path: string;
  rule: string;
  message: string;
}

/** Short bilingual catalog string (payments / schemes / infrastructures). */
export type LocalizedText = Record<Locale, string>;

export type RelationType =
  | 'uses_message'
  | 'settles_on'
  | 'defined_by'
  | 'initiated_via'
  | 'related_message'
  | 'variant_of';

export type CatalogEntityKind = 'payment' | 'scheme' | 'infrastructure' | 'message' | 'organization';

/** `kind:id` e.g. payment:sepa-instant, message:pacs.008 */
export type EntityRef = `${CatalogEntityKind}:${string}`;

export interface CatalogRelation {
  type: RelationType;
  from: EntityRef;
  to: EntityRef;
}

export type PaymentKind = 'credit-transfer' | 'instant' | 'wallet' | 'direct-debit' | 'card' | 'cross-border';
export type InitiationChannel = 'bank' | 'pisp' | 'wero' | 'merchant' | 'creditor';
export type PaymentOutcome = 'happy' | 'reject' | 'timeout';
export type ExplorerLevel = 'simple' | 'expert';
export type PaymentActorId = 'payer' | 'bankA' | 'csm' | 'bankB' | 'beneficiary' | 'scheme' | 'merchant' | 'acquirer';
export type CountryId = 'FR' | 'DE' | 'CH';

export interface SourceRef {
  name: string;
  url: string;
  lastUpdated: string;
}

export interface PaymentHop {
  id: string;
  from: PaymentActorId;
  to: PaymentActorId;
  messageShort?: string;
  simpleText: LocalizedText;
  expertLabel: LocalizedText;
  tOffset?: LocalizedText;
  sla?: LocalizedText;
  /** Must point at a real Flow when the hop mirrors catalog clearing. */
  flowId?: string;
  step?: number;
  sampleId?: string;
  outcomes: PaymentOutcome[];
  rails?: string[];
  initiation?: InitiationChannel[];
  /** When set, hop only appears for these payer countries. */
  countries?: CountryId[];
}

export interface PaymentStory {
  /** Fixed pedagogical corridor, e.g. €100 France → Germany. */
  amountLabel: LocalizedText;
  fromCountry: CountryId;
  toCountry: CountryId;
  headline: LocalizedText;
}

export interface Payment {
  id: string;
  kind: PaymentKind;
  name: LocalizedText;
  summary: LocalizedText;
  schemeId: string;
  infrastructureIds: string[];
  defaultRailId: string;
  messageShorts: string[];
  actors: PaymentActorId[];
  hops: PaymentHop[];
  relatedFlowIds: string[];
  initiationChannels: InitiationChannel[];
  comparePaymentId?: string;
  /** Optional fixed story the timeline tells (MVP “€100 FR→DE”). */
  story?: PaymentStory;
  /** Countries offered in the country picker for this payment. */
  countryIds?: CountryId[];
  defaultCountryId?: CountryId;
  sources: SourceRef[];
  disclaimer: LocalizedText;
}

export interface CountryContext {
  id: CountryId;
  name: LocalizedText;
  /** Preferred default rail when the payment allows it. */
  preferredRailId?: string;
  cutoffNote: LocalizedText;
  reachabilityNote: LocalizedText;
  exceptionNote: LocalizedText;
}

export interface Scheme {
  id: string;
  name: LocalizedText;
  operator: string;
  summary: LocalizedText;
  explorePaymentId: string;
  sources: SourceRef[];
}

export interface Infrastructure {
  id: string;
  name: LocalizedText;
  operator: string;
  region: string;
  currency: string;
  summary: LocalizedText;
  usedFor: LocalizedText;
  relatedMessageShorts: string[];
  /** Node on /map when set */
  mapFlowHref?: string;
  sources: SourceRef[];
}
