import type { Standard } from '@/types';

/**
 * The API standards a European TPP actually has to implement against.
 * Versions reflect the last published revision at time of writing — always
 * re-check the publisher before you ship, several of these move quietly.
 */
export const STANDARDS: Standard[] = [
  {
    id: 'berlin-group',
    name: 'NextGenPSD2 XS2A Framework',
    publisher: 'The Berlin Group',
    region: 'Pan-European',
    version: '1.3.13',
    status: 'current',
    summary:
      'The de facto default across DE, AT, NL, ES, the Nordics and most of CEE. Defines AIS, PIS and PIIS as one JSON API with four interchangeable SCA approaches. Banks implement subsets, so capability discovery is part of onboarding.',
    security: {
      clientAuth: 'mTLS with a QWAC (eIDAS website certificate). The PSD2 role attributes in the certificate carry the TPP roles: PSP_AI, PSP_PI, PSP_IC.',
      messageSigning:
        'Optional per ASPSP. When required: HTTP Signature (draft-cavage-12) over Digest, X-Request-ID and TPP-Redirect-URI, sealed with a QSeal certificate passed in TPP-Signature-Certificate.',
      tokens:
        'No OAuth2 in the base profile — the consent resource itself is the authorisation. The OAuth2 SCA approach layers an authorisation-code grant on top and binds the token to the consentId.',
      certificates: 'QWAC for transport, QSealC for signatures. Both issued by a QTSP listed in the EU Trust List.',
    },
    scaApproaches: ['Redirect', 'Decoupled', 'Embedded', 'OAuth2 SCA Redirect'],
    docsUrl: 'https://www.berlin-group.org/nextgenpsd2-downloads',
    apis: [
      {
        id: 'bg-ais',
        name: 'Account Information Service',
        role: 'AIS',
        summary:
          'Consent-first. You create a consent resource, drive it through SCA, then read accounts, balances and transactions until it expires or the frequency budget runs out.',
        endpoints: [
          { method: 'POST', path: '/v1/consents', summary: 'Create an account information consent', scope: 'PSP_AI' },
          { method: 'GET', path: '/v1/consents/{consentId}', summary: 'Read consent content' },
          { method: 'GET', path: '/v1/consents/{consentId}/status', summary: 'Read consent status only' },
          { method: 'DELETE', path: '/v1/consents/{consentId}', summary: 'Revoke consent' },
          { method: 'GET', path: '/v1/accounts', summary: 'List accessible accounts' },
          { method: 'GET', path: '/v1/accounts/{accountId}/balances', summary: 'Read balances' },
          {
            method: 'GET',
            path: '/v1/accounts/{accountId}/transactions',
            summary: 'Read booked and pending transactions, or a camt.05x report',
          },
          { method: 'GET', path: '/v1/card-accounts', summary: 'List card accounts' },
          { method: 'GET', path: '/v1/trusted-beneficiaries', summary: 'Read the PSU trusted beneficiary list' },
        ],
      },
      {
        id: 'bg-pis',
        name: 'Payment Initiation Service',
        role: 'PIS',
        summary:
          'One endpoint shape covers every product. The payment-product path segment decides the payload: JSON for SEPA, pain.001 XML for bulk and periodic in several markets.',
        endpoints: [
          { method: 'POST', path: '/v1/payments/{payment-product}', summary: 'Initiate a single payment', scope: 'PSP_PI' },
          { method: 'POST', path: '/v1/bulk-payments/{payment-product}', summary: 'Initiate a bulk payment' },
          { method: 'POST', path: '/v1/periodic-payments/{payment-product}', summary: 'Initiate a standing order' },
          { method: 'GET', path: '/v1/payments/{payment-product}/{paymentId}', summary: 'Read the initiation you sent' },
          { method: 'GET', path: '/v1/payments/{payment-product}/{paymentId}/status', summary: 'Read transaction status' },
          { method: 'DELETE', path: '/v1/payments/{payment-product}/{paymentId}', summary: 'Cancel a payment' },
          {
            method: 'POST',
            path: '/v1/payments/{payment-product}/{paymentId}/authorisations',
            summary: 'Start an explicit authorisation sub-resource',
          },
          {
            method: 'PUT',
            path: '/v1/payments/{payment-product}/{paymentId}/authorisations/{authorisationId}',
            summary: 'Select SCA method or submit an authentication factor',
          },
        ],
      },
      {
        id: 'bg-piis',
        name: 'Payment Instrument Issuer Service',
        role: 'PIIS',
        summary: 'A single yes/no on funds availability for card-based instruments. No amount is returned, ever.',
        endpoints: [
          { method: 'POST', path: '/v1/funds-confirmations', summary: 'Confirm funds availability', scope: 'PSP_IC' },
        ],
      },
      {
        id: 'bg-basket',
        name: 'Signing Baskets',
        role: 'PIS',
        summary: 'Bundle several pending initiations or consents into one SCA. Optional, and unevenly implemented.',
        endpoints: [
          { method: 'POST', path: '/v1/signing-baskets', summary: 'Create a signing basket' },
          { method: 'GET', path: '/v1/signing-baskets/{basketId}/status', summary: 'Read basket status' },
        ],
      },
    ],
    gotchas: [
      'X-Request-ID must be a fresh UUID per call and is echoed back — log it, it is the only handle support desks accept.',
      'recurringIndicator=false plus frequencyPerDay>1 is invalid, but several ASPSPs accept it and then throttle you at four calls a day anyway.',
      'A consent with access.availableAccounts=allAccounts returns the account list only. Asking for balances afterwards yields CONSENT_INVALID.',
      'scaRedirect links can expire in as little as five minutes. Do not persist them.',
      'The 90-day reauthentication rule was relaxed by RTS amendment for AIS, but ASPSP behaviour still varies — handle CONSENT_EXPIRED on every read.',
    ],
  },
  {
    id: 'stet',
    name: 'STET PSD2 API',
    publisher: 'STET (French banking industry)',
    region: 'France, Belgium',
    version: '1.6.3',
    status: 'current',
    summary:
      'The French profile. Structurally closer to ISO 20022 than Berlin Group: payment requests carry creditTransferTransaction arrays that map almost one-to-one onto pain.001. HAL-style _links throughout.',
    security: {
      clientAuth: 'mTLS with a QWAC, plus OAuth2 client_credentials for AISP/PISP registration-level auth.',
      messageSigning:
        'HTTP Signature is mandatory, not optional. Sign (request-target), date, digest and x-request-id with a QSealC; the keyId is the certificate URL.',
      tokens:
        'OAuth2. client_credentials for PISP payment requests, authorization_code with the AISP scope for account access. Tokens are short-lived and refresh tokens are the norm.',
      certificates: 'QWAC + QSealC. France also expects the certificate to be reachable at the keyId URL.',
    },
    scaApproaches: ['Redirect', 'Decoupled'],
    docsUrl: 'https://www.stet.eu/en/psd2/',
    apis: [
      {
        id: 'stet-aisp',
        name: 'Account Information',
        role: 'AISP',
        summary: 'Trusted-beneficiary and account-identification endpoints alongside the usual balances and transactions.',
        endpoints: [
          { method: 'GET', path: '/v1/accounts', summary: 'List accounts covered by the consent' },
          { method: 'GET', path: '/v1/accounts/{resourceId}/balances', summary: 'Read balances' },
          { method: 'GET', path: '/v1/accounts/{resourceId}/transactions', summary: 'Read transactions' },
          { method: 'POST', path: '/v1/consents', summary: 'Push the PSU consent record to the ASPSP' },
          { method: 'GET', path: '/v1/trusted-beneficiaries', summary: 'Read whitelisted beneficiaries' },
          { method: 'GET', path: '/v1/end-user-identity', summary: 'Read PSU identity' },
        ],
      },
      {
        id: 'stet-pisp',
        name: 'Payment Request',
        role: 'PISP',
        summary:
          'A payment request is a single resource containing the whole instruction set. Confirmation is a separate POST after SCA — forget it and the payment never leaves.',
        endpoints: [
          { method: 'POST', path: '/v1/payment-requests', summary: 'Create a payment request' },
          { method: 'GET', path: '/v1/payment-requests/{paymentRequestResourceId}', summary: 'Read a payment request' },
          {
            method: 'POST',
            path: '/v1/payment-requests/{paymentRequestResourceId}/confirmation',
            summary: 'Confirm after SCA — the step everyone forgets',
          },
        ],
      },
      {
        id: 'stet-cbpii',
        name: 'Funds Coverage',
        role: 'CBPII',
        summary: 'Funds coverage check for card-based instruments.',
        endpoints: [{ method: 'POST', path: '/v1/funds-confirmations', summary: 'Check funds coverage' }],
      },
    ],
    gotchas: [
      'The confirmation POST is a distinct call. A 201 on /payment-requests means "accepted for authorisation", not "sent".',
      'HTTP Signature covers the digest of the body. Any middleware that re-serialises JSON — a pretty-printer, a proxy — breaks the signature.',
      'psuAuthenticationFactor is only present in the decoupled/embedded variants; in redirect mode it must be absent.',
      'Amounts are strings with a dot separator. Sending a JSON number is a spec violation that some ASPSPs silently round.',
    ],
  },
  {
    id: 'uk-open-banking',
    name: 'Open Banking Read/Write API',
    publisher: 'Open Banking Limited',
    region: 'United Kingdom',
    version: '4.0 (3.1.11 widely deployed)',
    status: 'current',
    summary:
      'The most prescriptive of the three, and the only one with a conformance certification programme. Everything is consent-then-resource, with FAPI-grade security and detached JWS signatures on write calls.',
    security: {
      clientAuth: 'FAPI 2.0: mTLS or private_key_jwt, with PAR and PKCE. Software statements come from the OB Directory.',
      messageSigning: 'Detached JWS in x-jws-signature on all write endpoints, signed with the signing key from the Directory.',
      tokens:
        'OAuth2 / OIDC with intent-bound consent. The consent id travels in the openbanking_intent_id claim of a signed request object.',
      certificates: 'OBWAC / OBSeal issued by the Open Banking Directory, not eIDAS.',
    },
    scaApproaches: ['Redirect', 'App-to-app redirect', 'Decoupled (CIBA)'],
    docsUrl: 'https://standards.openbanking.org.uk/',
    apis: [
      {
        id: 'ukob-aisp',
        name: 'Account and Transaction API',
        role: 'AISP',
        summary: 'The broadest data surface of any standard: statements, standing orders, direct debits, parties, offers.',
        endpoints: [
          { method: 'POST', path: '/account-access-consents', summary: 'Create an account access consent' },
          { method: 'GET', path: '/accounts', summary: 'List accounts' },
          { method: 'GET', path: '/accounts/{AccountId}/transactions', summary: 'Read transactions' },
          { method: 'GET', path: '/accounts/{AccountId}/standing-orders', summary: 'Read standing orders' },
          { method: 'GET', path: '/accounts/{AccountId}/direct-debits', summary: 'Read direct debits' },
          { method: 'GET', path: '/accounts/{AccountId}/statements', summary: 'Read statements' },
        ],
      },
      {
        id: 'ukob-pisp',
        name: 'Payment Initiation API',
        role: 'PISP',
        summary: 'Domestic, international, scheduled and file payments. Consent and payment are separate resources with matching risk blocks.',
        endpoints: [
          { method: 'POST', path: '/domestic-payment-consents', summary: 'Create a domestic payment consent' },
          {
            method: 'GET',
            path: '/domestic-payment-consents/{ConsentId}/funds-confirmation',
            summary: 'Confirm funds before submission',
          },
          { method: 'POST', path: '/domestic-payments', summary: 'Submit the payment' },
          { method: 'GET', path: '/domestic-payments/{DomesticPaymentId}', summary: 'Read payment status' },
          { method: 'POST', path: '/international-payments', summary: 'Submit an international payment' },
          { method: 'POST', path: '/file-payments', summary: 'Submit a file payment (pain.001 upload)' },
        ],
      },
      {
        id: 'ukob-vrp',
        name: 'Variable Recurring Payments',
        role: 'PISP',
        summary: 'Sweeping and commercial VRP. One SCA authorises a mandate with limits; subsequent payments need none.',
        endpoints: [
          { method: 'POST', path: '/domestic-vrp-consents', summary: 'Create a VRP consent with control parameters' },
          { method: 'POST', path: '/domestic-vrps', summary: 'Execute a payment under the mandate' },
          { method: 'GET', path: '/domestic-vrps/{DomesticVRPId}', summary: 'Read VRP payment status' },
        ],
      },
    ],
    gotchas: [
      'The consent body and the payment body must match field for field. A single differing character yields a 400 with a rules-violation code.',
      'x-idempotency-key is mandatory on POST and scoped to 24 hours. Reusing it with a different body is a 400, not a replay.',
      'x-fapi-interaction-id is your trace id and must be echoed. Generate a UUID per call.',
      'Risk.PaymentContextCode drives fraud scoring and, for some banks, limits. EcommerceGoods and BillPayment behave differently.',
    ],
  },
  {
    id: 'polish-api',
    name: 'PolishAPI',
    publisher: 'Polish Bank Association (ZBP)',
    region: 'Poland',
    version: '3.0.1',
    status: 'maintained',
    summary:
      'A distinct national standard with its own AIS/PIS/CAF split and a strong emphasis on JWS-signed request bodies. Notable for explicit page-based transaction paging.',
    security: {
      clientAuth: 'mTLS with QWAC.',
      messageSigning: 'JWS signature over the whole request body, mandatory.',
      tokens: 'OAuth2 authorization_code with a Polish-specific consent object.',
      certificates: 'eIDAS QWAC + QSealC.',
    },
    scaApproaches: ['Redirect', 'Decoupled'],
    docsUrl: 'https://polishapi.org/',
    apis: [
      {
        id: 'polish-ais',
        name: 'AIS',
        role: 'AIS',
        summary: 'Account and transaction access with cursor paging.',
        endpoints: [
          { method: 'POST', path: '/accounts/v3_0.1/getAccounts', summary: 'List accounts' },
          { method: 'POST', path: '/accounts/v3_0.1/getTransactionsDone', summary: 'Read booked transactions' },
          { method: 'POST', path: '/accounts/v3_0.1/getTransactionsPending', summary: 'Read pending transactions' },
        ],
      },
      {
        id: 'polish-pis',
        name: 'PIS',
        role: 'PIS',
        summary: 'Domestic, EEA and tax payments as separate operations.',
        endpoints: [
          { method: 'POST', path: '/payments/v3_0.1/domestic', summary: 'Domestic transfer' },
          { method: 'POST', path: '/payments/v3_0.1/EEA', summary: 'EEA transfer' },
          { method: 'POST', path: '/payments/v3_0.1/tax', summary: 'Tax payment' },
        ],
      },
    ],
    gotchas: [
      'All operations are POST, including reads. Do not assume REST verb semantics.',
      'Paging uses pageId tokens that expire; restarting a long transaction pull means starting from scratch.',
    ],
  },
  {
    id: 'czech-obs',
    name: 'Czech Open Banking Standard',
    publisher: 'Czech Banking Association',
    region: 'Czech Republic',
    version: '3.7',
    status: 'maintained',
    summary: 'Berlin Group-influenced but independently versioned, with a separate mandatory API for ATM and branch listings.',
    security: {
      clientAuth: 'mTLS with QWAC.',
      messageSigning: 'Optional per ASPSP.',
      tokens: 'OAuth2 authorization_code.',
      certificates: 'eIDAS QWAC + QSealC.',
    },
    scaApproaches: ['Redirect', 'Decoupled'],
    docsUrl: 'https://cba.cz/en/open-banking',
    apis: [
      {
        id: 'czech-ais',
        name: 'AISP',
        role: 'AIS',
        summary: 'Accounts, balances, transactions.',
        endpoints: [
          { method: 'GET', path: '/v3/accounts', summary: 'List accounts' },
          { method: 'GET', path: '/v3/accounts/{id}/transactions', summary: 'Read transactions' },
        ],
      },
    ],
    gotchas: ['Transaction ids are not stable across pages for some banks — deduplicate on amount, date and reference.'],
  },
  {
    id: 'swiss-sps',
    name: 'Swiss Payment Standards / SIC',
    publisher: 'SIX Interbank Clearing / PaCoS',
    region: 'Switzerland',
    version: 'SPS 2026 / SIC5',
    status: 'current',
    summary:
      'Customer-bank Swiss Payment Standards (pain/camt) plus the SIC, euroSIC and SIC Instant Payment rails. Fully ISO 20022; CHF settles in SIC, EUR in euroSIC, sub-10s CHF in SIC IP.',
    security: {
      clientAuth: 'Bank channel credentials or EBICS; SIC participants use SIX network access.',
      messageSigning: 'Channel-specific; interbank traffic authenticated on the SIC network.',
      tokens: 'Not an XS2A API — customer-bank exchange is file/API per bank; clearing is ISO 20022 XML.',
      certificates: 'Participant certificates via SIX; QR-bill validation is local.',
    },
    scaApproaches: ['Bank e-banking SCA', 'EBICS authorisation'],
    docsUrl: 'https://www.six-group.com/en/products-services/banking-services/payment-standardization/standards/iso-20022.html',
    apis: [
      {
        id: 'sps-customer-bank',
        name: 'Customer-bank ISO 20022',
        role: 'Customer-Bank',
        summary: 'pain.001 initiation, pain.002 status, camt.052/053/054 reporting under Swiss Payment Standards.',
        endpoints: [
          { method: 'POST', path: '/sps/pain.001', summary: 'Submit credit transfer initiation (CHF/EUR)' },
          { method: 'GET', path: '/sps/pain.002', summary: 'Receive customer payment status report' },
          { method: 'GET', path: '/sps/camt.053', summary: 'End-of-day statement' },
          { method: 'GET', path: '/sps/camt.054', summary: 'Debit/credit notification' },
        ],
      },
      {
        id: 'sic-interbank',
        name: 'SIC / euroSIC / SIC IP',
        role: 'CSM',
        summary: 'Interbank pacs messages on Swiss RTGS and instant services.',
        endpoints: [
          { method: 'POST', path: '/sic/pacs.008', summary: 'Customer credit transfer into SIC' },
          { method: 'POST', path: '/sic/pacs.009', summary: 'FI credit transfer / liquidity' },
          { method: 'POST', path: '/sic/pacs.002', summary: 'Payment status / receipt' },
          { method: 'POST', path: '/sic/pacs.004', summary: 'Payment return' },
          { method: 'POST', path: '/sic/pacs.028', summary: 'Status request' },
        ],
      },
    ],
    gotchas: [
      'QR-bill is the only retail credit-transfer remittance form; DTA is decommissioned.',
      'SIC IP targets ~10 seconds in central bank money — treat timeouts like SCT Inst, not like batch SIC.',
      'ClrSys codes and Swiss IG versions are binding for SIC participants; SEPA IGs do not apply to CHF SIC traffic.',
      'CHF amounts use Ccy="CHF"; do not reuse EUR SEPA service-level codes on SIC CHF payments.',
    ],
  },
  {
    id: 'wero',
    name: 'Wero (European Payments Initiative)',
    publisher: 'EPI Company',
    region: 'Pan-European',
    version: '1.0',
    status: 'current',
    summary:
      'Account-to-account retail payment scheme (P2P, P2Pro, online checkout) sitting above ASPSPs and SCT Instant. Not an XS2A API itself — it orchestrates wallet UX, proxy lookup and instant settlement.',
    security: {
      clientAuth: 'Scheme participant credentials; merchant integrations via PSPs.',
      messageSigning: 'Scheme-level; underlying bank rails use existing PSD2 / SCT Inst security.',
      tokens: 'Wallet session / consent inside the Wero app; bank SCA when required by the ASPSP.',
      certificates: 'Participant onboarding via EPI; ASPSP side remains eIDAS where PSD2 applies.',
    },
    scaApproaches: ['In-app authentication', 'ASPSP SCA when required'],
    docsUrl: 'https://www.epicompany.eu/',
    apis: [
      {
        id: 'wero-wallet',
        name: 'Wero wallet / merchant',
        role: 'Scheme',
        summary: 'Initiate A2A payment, resolve proxy (phone/email), confirm and settle via SCT Inst.',
        endpoints: [
          { method: 'POST', path: '/wero/v1/payments', summary: 'Create a Wero payment intent' },
          { method: 'GET', path: '/wero/v1/payments/{id}', summary: 'Read payment status' },
          { method: 'POST', path: '/wero/v1/proxy/resolve', summary: 'Resolve alias to IBAN' },
          { method: 'POST', path: '/wero/v1/payments/{id}/cancel', summary: 'Cancel before settlement' },
        ],
      },
    ],
    gotchas: [
      'Wero settles on SCT Inst (or national instant where applicable) — clearing timeouts and pacs.002 semantics still apply.',
      'Proxy resolution is not Confirmation of Payee; still run VoP where the Instant Payments Regulation requires it.',
      'Cancellation after settlement is a recall/return path, not a wallet undo.',
    ],
  },
];

export const standardById = (id: string) => STANDARDS.find((s) => s.id === id);
