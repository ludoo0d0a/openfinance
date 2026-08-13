# OpenFinance

**Live:** [openfinance.geoking.fr](https://openfinance.geoking.fr) ([pages.dev](https://openfinance.pages.dev))

Browse PSD2 and Open Finance API standards, Swiss SIC / euroSIC / SIC IP rails, Wero (EPI),
trace end-to-end payments across the API and clearing layers, inspect ISO 20022 messages, and
look up status or reason codes.

Built with React 19, Vite, Tailwind v4 and Cytoscape on the front, Cloudflare Pages Functions on
the back, deployed by GitHub Actions.

---

## Why this exists

A PSD2 payment lives two lives. On the TPP side it is JSON over HTTPS with consents, tokens and
HTTP status codes. On the bank side it is ISO 20022 XML with settlement dates and reason codes.
The same transaction, two vocabularies — and almost every hard bug lives at the seam.

This explorer holds both sides in one place, plus interoperable rails (SEPA, SIC CHF, euroSIC,
SIC Instant, Wero) and exception paths (reject, recall, instant timeout, payment cancellation).

## What's in it

| Feature | Where |
| --- | --- |
| API standards (Berlin Group, STET, UK OB, PolishAPI, Czech OBS, Swiss SPS/SIC, Wero) | `src/data/standards.ts` |
| End-to-end flows as SVG sequence diagrams | `src/data/flows.ts` + `FlowCanvas` |
| Cytoscape interop map (standards × messages × rails) | `/map` · `InteropGraph` |
| ISO 20022 messages with namespaces and mandatory elements | `src/data/iso20022.ts` |
| Sample payloads (XML / JSON), editable in place | `src/data/samples.ts` |
| Status and error codes with remediation | `src/data/codes.ts` (merged into the thesaurus) |
| Payments thesaurus (terms + codes) | `/thesaurus` · `src/data/thesaurus.ts` |
| Structural validation of ISO 20022 documents | `functions/api/validate.ts` |
| Mock ASPSP with awkward-but-realistic behaviour | `functions/api/mock/[[path]].ts` |
| Full catalog as JSON | `functions/api/catalog.ts` |

### Notable flows

- AIS consent (redirect SCA), SEPA PIS, STET, UK domestic payment, PIIS
- Clearing happy path, reject (`pacs.002` RJCT), recall (`camt.056` → `pacs.004`)
- **SCT Inst / IPR**: happy path ≤10s (TIPS), VoP-then-instant, reject-in-window, timeout + `pacs.028`, instant recall
- Verification of Payee, Wero A2A
- **SIC CHF** credit, **SIC IP** instant + timeout, **euroSIC** EUR leg
- **Payment cancellation** before settlement (`DELETE` + `camt.055`)

### The mock ASPSP

Not a faithful bank — a bank that is annoying in the ways real banks are annoying:

- a consent does not become `valid` on the first poll
- balances without `Consent-ID` fail the Berlin Group way
- payment status walks `RCVD → ACTC → ACSP → ACSC`
- `instructedAmount.amount` as a JSON number is rejected
- IBANs ending in `0000` always reject (error-path practice)

```bash
curl -X POST http://localhost:8788/api/mock/v1/consents \
  -H 'Content-Type: application/json' \
  -d '{"access":{"accounts":[{"iban":"FR7630006000011234567890189"}]},"recurringIndicator":true,"frequencyPerDay":4}'
```

### Validator limits

`POST /api/validate` checks well-formedness, namespace vs root element, mandatory elements, and
`NbOfTxs` / `CtrlSum` reconciliation. It is **not** full XSD validation — get schemas from
[iso20022.org](https://www.iso20022.org/iso-20022-message-definitions).

## Running it

Requires Node 22 (see `.nvmrc`).

```bash
npm install
npm start          # Vite :5173 + Wrangler Functions on :8788 (preferred)
npm run start:ui   # Vite only — UI works, /api/* returns 404
npm run build      # production build → dist/
npm run serve      # build then serve dist + Functions on :8788
npm run preview    # Vite preview of dist (no Functions) on :4173
```

Open **http://127.0.0.1:5173** for HMR (Vite proxies `/api/*` to :8788), or
**http://127.0.0.1:8788** for the production build served with Functions.
`npm start` rebuilds `dist/` then runs both.

```bash
npm run lint
npm run typecheck
npm run test
```

## Deploying

Cloudflare Pages project with Functions in `functions/`.

1. Create a Pages project named `openfinance` (or change `--project-name` in the workflows).
2. Add secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
3. Optionally bind KV (`PSD2_STATE`) as documented in `wrangler.toml`.

| Workflow | Trigger |
| --- | --- |
| `ci.yml` | push / PR — lint, typecheck, test, build |
| `deploy.yml` | main / manual — deploy + smoke `/` and `/api/catalog` |
| `pr-preview.yml` | same-repo PRs — preview URL comment |

Manual: `npm run deploy`.

## Architecture

```
src/
├── data/          catalog (TypeScript, CI-checked cross-refs)
├── lib/           xml, messageId, search
├── components/    FlowCanvas (SVG), InteropGraph (Cytoscape), PayloadInspector, …
├── views/         routes including /map
functions/         Cloudflare Pages Functions
```

SVG swimlanes stay the source of truth for ordered payment steps. Cytoscape answers topology:
which standards, messages and rails connect.

## Prior art

Shaped by [issettled/iso20022-issettled](https://github.com/issettled/iso20022-issettled),
Berlin Group OpenAPI specs, STET examples, and SIX Swiss Payment Standards / SIC ISO 20022
implementation guidelines. Sample payloads are synthetic.

## Licence

MIT. All IBANs, BICs, names and identifiers are synthetic.
