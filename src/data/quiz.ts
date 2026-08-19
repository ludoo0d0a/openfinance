import type { LocalizedText } from '@/types';

export interface QuizQuestion {
  id: string;
  sampleId: string;
  correctCode: string;
  options: string[];
  title: LocalizedText;
  prompt: LocalizedText;
  explanation: LocalizedText;
  explorerLink?: {
    path: string;
    label: LocalizedText;
  };
  messageLink?: {
    path: string;
    label: string;
  };
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'pacs002-ac01',
    sampleId: 'pacs-002-rejected',
    correctCode: 'AC01',
    options: ['AC01', 'AM04', 'AG01', 'AB05'],
    title: {
      en: 'Why was this pacs.002 rejected?',
      fr: 'Pourquoi ce pacs.002 a-t-il été rejeté ?',
    },
    prompt: {
      en: 'Identify the reason code in the pacs.002 rejection payload below.',
      fr: 'Identifiez le code motif dans le payload de rejet pacs.002 ci-dessous.',
    },
    explanation: {
      en: 'AC01 (IncorrectAccountNumber) indicates the IBAN does not exist at the creditor bank. Fix account data before retrying.',
      fr: 'AC01 (IncorrectAccountNumber) indique que l’IBAN n’existe pas dans la banque créancière. Corrigez les données avant de réessayer.',
    },
    explorerLink: {
      path: '/payment/sepa-instant?outcome=reject&focus=pacs.002',
      label: {
        en: 'Open Instant reject path →',
        fr: 'Ouvrir le parcours Instant rejeté →',
      },
    },
    messageLink: {
      path: '/messages/pacs.002',
      label: 'pacs.002',
    },
  },
  {
    id: 'pacs002-am04',
    sampleId: 'pacs-002-rejected-am04',
    correctCode: 'AM04',
    options: ['AC01', 'AM04', 'AG02', 'AM05'],
    title: {
      en: 'What caused this payment refusal?',
      fr: 'Quelle est la cause du refus de ce paiement ?',
    },
    prompt: {
      en: 'Read the status reason code in the XML status report.',
      fr: 'Lisez le code motif de statut dans le rapport XML.',
    },
    explanation: {
      en: 'AM04 (InsufficientFunds) means the debtor account does not have enough balance. A retry may succeed later after funding.',
      fr: 'AM04 (InsufficientFunds) signifie que le compte débiteur n’a pas assez de fonds. Un nouvel essai pourra réussir plus tard après approvisionnement.',
    },
    explorerLink: {
      path: '/payment/sepa-credit-transfer?outcome=reject',
      label: {
        en: 'Explore SEPA Credit Transfer reject flow →',
        fr: 'Explorer le flux de rejet SEPA Credit Transfer →',
      },
    },
    messageLink: {
      path: '/messages/pacs.002',
      label: 'pacs.002',
    },
  },
  {
    id: 'pacs002-ab05',
    sampleId: 'pacs-002-sct-inst-reject',
    correctCode: 'AB05',
    options: ['AB05', 'AC04', 'BE04', 'DT01'],
    title: {
      en: 'Why did this instant payment fail?',
      fr: 'Pourquoi ce paiement instantané a-t-il échoué ?',
    },
    prompt: {
      en: 'Find the ISO status reason code returned for this SCT Inst transaction.',
      fr: 'Trouvez le code motif de statut ISO renvoyé pour cette transaction SCT Inst.',
    },
    explanation: {
      en: 'AB05 (Timeout creditor agent) means the creditor bank was not reachable for SCT Inst. Do not blind-retry instant execution.',
      fr: 'AB05 (Timeout creditor agent) indique que la banque créancière n’était pas joignable pour SCT Inst. Ne réessayez pas en aveugle en instantané.',
    },
    explorerLink: {
      path: '/payment/sepa-instant?outcome=reject',
      label: {
        en: 'Explore SCT Inst timeout & reject path →',
        fr: 'Explorer le parcours de rejet/timeout SCT Inst →',
      },
    },
    messageLink: {
      path: '/messages/pacs.002',
      label: 'pacs.002',
    },
  },
  {
    id: 'bg-consent-invalid',
    sampleId: 'bg-error-consent-invalid',
    correctCode: 'CONSENT_INVALID',
    options: ['CONSENT_INVALID', 'TOKEN_EXPIRED', 'FORMAT_ERROR', 'SERVICE_BLOCKED'],
    title: {
      en: 'What error code did the Berlin Group API return?',
      fr: 'Quel code d’erreur l’API Berlin Group a-t-elle renvoyé ?',
    },
    prompt: {
      en: 'Check the error category and code inside the JSON response.',
      fr: 'Vérifiez la catégorie et le code d’erreur dans la réponse JSON.',
    },
    explanation: {
      en: 'CONSENT_INVALID (HTTP 401) occurs when the consent scope does not cover the requested resource (e.g. requesting balances under an account-list consent).',
      fr: 'CONSENT_INVALID (HTTP 401) survient quand le périmètre du consentement ne couvre pas la ressource demandée.',
    },
    explorerLink: {
      path: '/standards/berlin-group',
      label: {
        en: 'View Berlin Group standard →',
        fr: 'Voir le standard Berlin Group →',
      },
    },
  },
  {
    id: 'acmt024-cmtc',
    sampleId: 'acmt-024-vop-report',
    correctCode: 'CMTC',
    options: ['MTCH', 'CMTC', 'NMTC', 'AG01'],
    title: {
      en: 'What was the result of this Verification of Payee (VoP) check?',
      fr: 'Quel est le résultat de ce contrôle Verification of Payee (VoP) ?',
    },
    prompt: {
      en: 'Inspect the acmt.024 report reason code and verification status.',
      fr: 'Inspectez le code motif du rapport acmt.024 et le statut de vérification.',
    },
    explanation: {
      en: 'CMTC (CloseMatch) indicates a close match on the payee name. The updated name is returned so the PSU can confirm or adjust.',
      fr: 'CMTC (CloseMatch) indique une correspondance proche sur le nom du bénéficiaire. Le nom mis à jour est renvoyé pour que le PSU confirme.',
    },
    explorerLink: {
      path: '/payment/vop-instant',
      label: {
        en: 'Explore VoP + Instant flow →',
        fr: 'Explorer le flux VoP + Instant →',
      },
    },
    messageLink: {
      path: '/messages/acmt.024',
      label: 'acmt.024',
    },
  },
  {
    id: 'camt056-dupl',
    sampleId: 'camt-056-recall',
    correctCode: 'DUPL',
    options: ['DUPL', 'FRAD', 'TECH', 'CUST'],
    title: {
      en: 'What is the reason for this payment recall request?',
      fr: 'Quel est le motif de cette demande d’annulation / rappel ?',
    },
    prompt: {
      en: 'Locate the cancellation reason code in the camt.056 payload.',
      fr: 'Localisez le code motif d’annulation dans le payload camt.056.',
    },
    explanation: {
      en: 'DUPL (DuplicatePayment) is used to recall a payment sent twice by mistake. Must be raised within the SEPA duplicate window.',
      fr: 'DUPL (DuplicatePayment) est utilisé pour rappeler un virement soumis deux fois par erreur.',
    },
    explorerLink: {
      path: '/payment/sepa-instant?outcome=recall',
      label: {
        en: 'Explore recall flow →',
        fr: 'Explorer le flux de recall →',
      },
    },
    messageLink: {
      path: '/messages/camt.056',
      label: 'camt.056',
    },
  },
];
