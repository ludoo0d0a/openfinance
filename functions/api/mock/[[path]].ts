/**
 * A mock ASPSP speaking Berlin Group NextGenPSD2.
 *
 * The point is not fidelity — it is that the awkward parts behave awkwardly.
 * A consent does not become valid on the first poll. Reading balances without a
 * Consent-ID fails the way a real bank fails. Payment status walks
 * RCVD → ACTC → ACSP → ACSC over several calls instead of jumping to success.
 * Code that survives this mock has a chance against a real sandbox.
 */

interface Env {
  PSD2_STATE?: KVNamespace;
  MOCK_ASPSP_NAME?: string;
  MOCK_ASPSP_BIC?: string;
}

interface ConsentState {
  id: string;
  status: 'received' | 'valid' | 'expired';
  polls: number;
  createdAt: string;
  validUntil: string;
  frequencyPerDay: number;
  used: number;
}

interface PaymentState {
  id: string;
  product: string;
  status: 'RCVD' | 'ACTC' | 'ACSP' | 'ACSC' | 'RJCT';
  polls: number;
  amount: string;
  currency: string;
  creditorIban: string;
}

// Fallback when no KV namespace is bound. Per-isolate, which is fine for a demo
// and honest about its limits: a cold start resets the world.
const memory = new Map<string, string>();

const ACCOUNTS = [
  {
    resourceId: 'acc-3f9a2b7e',
    iban: 'FR7630006000011234567890189',
    currency: 'EUR',
    name: 'Compte courant',
    product: 'Compte de dépôt',
    cashAccountType: 'CACC',
    ownerName: 'Marie Lefebvre',
  },
  {
    resourceId: 'acc-8d1c4f60',
    iban: 'FR7630006000011234567890265',
    currency: 'EUR',
    name: 'Livret',
    product: 'Épargne',
    cashAccountType: 'SVGS',
    ownerName: 'Marie Lefebvre',
  },
];

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const segments = (Array.isArray(params.path) ? params.path : [params.path]).filter(Boolean) as string[];
  const method = request.method;
  const store = makeStore(env);

  // ── Consents ────────────────────────────────────────────────────────────
  if (method === 'POST' && eq(segments, ['v1', 'consents'])) {
    const body = await safeJson(request);
    if (!body || typeof body !== 'object' || !('access' in body)) {
      return tppError(400, 'FORMAT_ERROR', 'access', 'The access object is mandatory on a consent request.');
    }

    const frequency = Number((body as Record<string, unknown>).frequencyPerDay ?? 4);
    const recurring = Boolean((body as Record<string, unknown>).recurringIndicator);
    if (!recurring && frequency > 1) {
      return tppError(
        400,
        'FORMAT_ERROR',
        'frequencyPerDay',
        'frequencyPerDay must be 1 when recurringIndicator is false. Real ASPSPs disagree about this — do not rely on the ones that accept it.',
      );
    }

    const id = crypto.randomUUID();
    const consent: ConsentState = {
      id,
      status: 'received',
      polls: 0,
      createdAt: new Date().toISOString(),
      validUntil: String((body as Record<string, unknown>).validUntil ?? addDays(90)),
      frequencyPerDay: frequency,
      used: 0,
    };
    await store.put(`consent:${id}`, consent);

    return json(
      {
        consentStatus: 'received',
        consentId: id,
        _links: {
          scaRedirect: { href: `https://sca.mock.local/auth/${id}` },
          self: { href: `/v1/consents/${id}` },
          status: { href: `/v1/consents/${id}/status` },
        },
      },
      201,
    );
  }

  if (segments[0] === 'v1' && segments[1] === 'consents' && segments[2]) {
    const consent = await store.get<ConsentState>(`consent:${segments[2]}`);
    if (!consent) return tppError(403, 'CONSENT_UNKNOWN', 'consentId', 'No consent with that id at this ASPSP.');

    if (method === 'DELETE') {
      await store.delete(`consent:${consent.id}`);
      return new Response(null, { status: 204 });
    }

    if (segments[3] === 'status' && method === 'GET') {
      // Two polls before the PSU "finishes" authenticating. Clients that assume
      // a single poll is enough break here, which is the lesson.
      consent.polls += 1;
      if (consent.polls >= 3 && consent.status === 'received') consent.status = 'valid';
      await store.put(`consent:${consent.id}`, consent);
      return json({ consentStatus: consent.status });
    }

    if (method === 'GET') {
      return json({
        consentStatus: consent.status,
        access: { accounts: ACCOUNTS.map((a) => ({ iban: a.iban, currency: a.currency })) },
        recurringIndicator: true,
        validUntil: consent.validUntil,
        frequencyPerDay: consent.frequencyPerDay,
        lastActionDate: consent.createdAt.slice(0, 10),
      });
    }
  }

  // ── Accounts ────────────────────────────────────────────────────────────
  if (segments[0] === 'v1' && segments[1] === 'accounts' && method === 'GET') {
    const guard = await requireValidConsent(request, store);
    if (guard) return guard;

    if (!segments[2]) {
      return json({
        accounts: ACCOUNTS.map((a) => ({
          ...a,
          bic: env.MOCK_ASPSP_BIC ?? 'DEMOFRPPXXX',
          _links: {
            balances: { href: `/v1/accounts/${a.resourceId}/balances` },
            transactions: { href: `/v1/accounts/${a.resourceId}/transactions` },
          },
        })),
      });
    }

    const account = ACCOUNTS.find((a) => a.resourceId === segments[2]);
    if (!account) return tppError(404, 'RESOURCE_UNKNOWN', 'accountId', 'resourceIds are consent-scoped. Re-list accounts.');

    if (segments[3] === 'balances') {
      return json({
        account: { iban: account.iban },
        balances: [
          {
            balanceType: 'closingBooked',
            balanceAmount: { currency: 'EUR', amount: '4820.35' },
            referenceDate: new Date().toISOString().slice(0, 10),
          },
          {
            balanceType: 'expected',
            balanceAmount: { currency: 'EUR', amount: '3570.35' },
            lastChangeDateTime: new Date().toISOString(),
          },
        ],
      });
    }

    if (segments[3] === 'transactions') {
      return json({
        account: { iban: account.iban },
        transactions: {
          booked: [
            {
              transactionId: 'txn-9001',
              endToEndId: 'E2E-2026-0842',
              bookingDate: '2026-08-12',
              valueDate: '2026-08-13',
              transactionAmount: { currency: 'EUR', amount: '-1250.00' },
              creditorName: 'Atelier Rousseau SARL',
              creditorAccount: { iban: 'DE89370400440532013000' },
              remittanceInformationUnstructured: 'Facture 2026-0842',
              bankTransactionCode: 'PMNT-ICDT-ESCT',
            },
            {
              transactionId: 'txn-9002',
              bookingDate: '2026-08-11',
              valueDate: '2026-08-11',
              transactionAmount: { currency: 'EUR', amount: '2400.00' },
              debtorName: 'SFEIR LUXEMBOURG',
              remittanceInformationUnstructured: 'Salaire juillet',
              bankTransactionCode: 'PMNT-RCDT-SALA',
            },
          ],
          pending: [
            {
              transactionId: 'txn-9003',
              valueDate: '2026-08-13',
              transactionAmount: { currency: 'EUR', amount: '-84.90' },
              creditorName: 'Librairie Gallimard',
            },
          ],
          _links: { account: { href: `/v1/accounts/${account.resourceId}` } },
        },
      });
    }

    return json({ ...account, _links: { balances: { href: `/v1/accounts/${account.resourceId}/balances` } } });
  }

  // ── Payments ────────────────────────────────────────────────────────────
  if (segments[0] === 'v1' && segments[1] === 'payments' && segments[2]) {
    const product = segments[2];

    if (method === 'POST' && !segments[3]) {
      const body = (await safeJson(request)) as Record<string, unknown> | null;
      const problem = validatePaymentBody(body);
      if (problem) return problem;

      const amount = body!.instructedAmount as Record<string, string>;
      const creditor = body!.creditorAccount as Record<string, string>;
      const id = crypto.randomUUID();

      const payment: PaymentState = {
        id,
        product,
        status: 'RCVD',
        polls: 0,
        amount: amount.amount,
        currency: amount.currency,
        creditorIban: creditor.iban,
      };
      await store.put(`payment:${id}`, payment);

      return json(
        {
          transactionStatus: 'RCVD',
          paymentId: id,
          _links: {
            scaRedirect: { href: `https://sca.mock.local/auth/pay/${id}` },
            self: { href: `/v1/payments/${product}/${id}` },
            status: { href: `/v1/payments/${product}/${id}/status` },
          },
        },
        201,
      );
    }

    if (segments[3]) {
      const payment = await store.get<PaymentState>(`payment:${segments[3]}`);
      if (!payment) return tppError(404, 'RESOURCE_UNKNOWN', 'paymentId', 'No payment with that id.');

      if (method === 'DELETE') {
        await store.delete(`payment:${payment.id}`);
        return json({ transactionStatus: 'CANC' }, 200);
      }

      if (segments[4] === 'status' && method === 'GET') {
        // The status ladder, one rung per poll. An IBAN ending 0000 always
        // rejects with AC01, so error paths can be exercised on demand.
        payment.polls += 1;
        if (payment.creditorIban.endsWith('0000')) {
          payment.status = 'RJCT';
        } else {
          const ladder: PaymentState['status'][] = ['RCVD', 'ACTC', 'ACSP', 'ACSC'];
          payment.status = ladder[Math.min(payment.polls, ladder.length - 1)];
        }
        await store.put(`payment:${payment.id}`, payment);

        return json(
          payment.status === 'RJCT'
            ? { transactionStatus: 'RJCT', psuMessage: 'Creditor account unknown. The clearing layer would report AC01.' }
            : { transactionStatus: payment.status },
        );
      }

      if (method === 'POST' && segments[4] === 'authorisations') {
        return json(
          {
            authorisationId: crypto.randomUUID(),
            scaStatus: 'received',
            scaMethods: [
              { authenticationType: 'PUSH_OTP', authenticationMethodId: 'app-push', name: 'Bank app notification' },
              { authenticationType: 'SMS_OTP', authenticationMethodId: 'sms', name: 'SMS code' },
            ],
          },
          201,
        );
      }

      if (method === 'PUT' && segments[4] === 'authorisations' && segments[5]) {
        const body = (await safeJson(request)) as Record<string, unknown> | null;
        const chosen = body?.authenticationMethodId;
        if (chosen !== 'app-push' && chosen !== 'sms') {
          return tppError(
            400,
            'SCA_METHOD_UNKNOWN',
            'authenticationMethodId',
            'Only echo an authenticationMethodId that appeared in scaMethods.',
          );
        }
        return json({ scaStatus: 'scaMethodSelected', chosenScaMethod: { authenticationMethodId: chosen } });
      }

      if (method === 'GET') {
        return json({
          transactionStatus: payment.status,
          instructedAmount: { currency: payment.currency, amount: payment.amount },
          creditorAccount: { iban: payment.creditorIban },
        });
      }
    }
  }

  // ── Funds confirmation ──────────────────────────────────────────────────
  if (method === 'POST' && eq(segments, ['v1', 'funds-confirmations'])) {
    const body = (await safeJson(request)) as Record<string, unknown> | null;
    const amount = body?.instructedAmount as Record<string, string> | undefined;
    if (!amount?.amount) {
      return tppError(400, 'FORMAT_ERROR', 'instructedAmount', 'instructedAmount is mandatory.');
    }
    // Nothing but the boolean, ever.
    return json({ fundsAvailable: Number(amount.amount) <= 3570.35 });
  }

  return json(
    {
      tppMessages: [
        {
          category: 'ERROR',
          code: 'RESOURCE_UNKNOWN',
          text: `No mock endpoint for ${method} /${segments.join('/')}.`,
        },
      ],
      supported: [
        'POST /v1/consents',
        'GET /v1/consents/{consentId}',
        'GET /v1/consents/{consentId}/status',
        'DELETE /v1/consents/{consentId}',
        'GET /v1/accounts',
        'GET /v1/accounts/{accountId}/balances',
        'GET /v1/accounts/{accountId}/transactions',
        'POST /v1/payments/{product}',
        'GET /v1/payments/{product}/{paymentId}',
        'GET /v1/payments/{product}/{paymentId}/status',
        'POST /v1/payments/{product}/{paymentId}/authorisations',
        'PUT /v1/payments/{product}/{paymentId}/authorisations/{authorisationId}',
        'DELETE /v1/payments/{product}/{paymentId}',
        'POST /v1/funds-confirmations',
      ],
    },
    404,
  );
};

function validatePaymentBody(body: Record<string, unknown> | null): Response | null {
  if (!body) return tppError(400, 'FORMAT_ERROR', '/', 'Body must be JSON.');

  const amount = body.instructedAmount as Record<string, unknown> | undefined;
  if (!amount) return tppError(400, 'FORMAT_ERROR', 'instructedAmount', 'instructedAmount is mandatory.');
  if (typeof amount.amount !== 'string') {
    return tppError(
      400,
      'FORMAT_ERROR',
      'instructedAmount.amount',
      'Amount must be a string. A JSON number is a spec violation even where it is tolerated.',
    );
  }
  if (!/^\d+\.\d{2}$/.test(amount.amount)) {
    return tppError(400, 'FORMAT_ERROR', 'instructedAmount.amount', 'Amount must use a dot separator and two decimals.');
  }

  const creditor = body.creditorAccount as Record<string, unknown> | undefined;
  if (!creditor?.iban || typeof creditor.iban !== 'string') {
    return tppError(400, 'FORMAT_ERROR', 'creditorAccount.iban', 'creditorAccount.iban is mandatory for SEPA products.');
  }
  if (!isPlausibleIban(creditor.iban)) {
    return tppError(400, 'FORMAT_ERROR', 'creditorAccount.iban', 'IBAN fails the mod-97 check.');
  }
  if (!body.creditorName) {
    return tppError(400, 'FORMAT_ERROR', 'creditorName', 'creditorName is mandatory and is what Verification of Payee checks.');
  }

  return null;
}

/** ISO 13616 mod-97. Worth doing client-side too — it costs nothing. */
function isPlausibleIban(iban: string): boolean {
  const value = iban.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(value)) return false;

  const rearranged = value.slice(4) + value.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));

  let remainder = 0;
  for (const digit of numeric) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

async function requireValidConsent(request: Request, store: Store): Promise<Response | null> {
  const consentId = request.headers.get('Consent-ID');
  if (!consentId) {
    return tppError(
      401,
      'CONSENT_INVALID',
      'Consent-ID',
      'Send the Consent-ID header. Berlin Group carries the consent in a header, not the path.',
    );
  }

  const consent = await store.get<ConsentState>(`consent:${consentId}`);
  if (!consent) return tppError(403, 'CONSENT_UNKNOWN', 'Consent-ID', 'Unknown consent.');
  if (consent.status !== 'valid') {
    return tppError(
      401,
      'CONSENT_INVALID',
      'Consent-ID',
      `Consent is "${consent.status}". Poll /status until it reports valid — the PSU has to authenticate first.`,
    );
  }

  consent.used += 1;
  if (consent.used > consent.frequencyPerDay) {
    await store.put(`consent:${consent.id}`, consent);
    return tppError(429, 'ACCESS_EXCEEDED', 'Consent-ID', `frequencyPerDay of ${consent.frequencyPerDay} is used up for today.`);
  }
  await store.put(`consent:${consent.id}`, consent);
  return null;
}

interface Store {
  get<T>(key: string): Promise<T | null>;
  put(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
}

function makeStore(env: Env): Store {
  const kv = env.PSD2_STATE;
  return {
    async get<T>(key: string): Promise<T | null> {
      const raw = kv ? await kv.get(key) : (memory.get(key) ?? null);
      return raw ? (JSON.parse(raw) as T) : null;
    },
    async put(key: string, value: unknown): Promise<void> {
      const raw = JSON.stringify(value);
      if (kv) await kv.put(key, raw, { expirationTtl: 3600 });
      else memory.set(key, raw);
    },
    async delete(key: string): Promise<void> {
      if (kv) await kv.delete(key);
      else memory.delete(key);
    },
  };
}

function eq(segments: string[], expected: string[]): boolean {
  return segments.length === expected.length && segments.every((s, i) => s === expected[i]);
}

async function safeJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function tppError(status: number, code: string, path: string, text: string): Response {
  return json({ tppMessages: [{ category: 'ERROR', code, path, text }] }, status);
}
