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

export interface Iso20022Message {
  /** Fully versioned id used in the XML Document namespace */
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
