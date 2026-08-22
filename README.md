# OpenFinance

**Live:** [openfinance.geoking.fr](https://openfinance.geoking.fr) ([pages.dev](https://openfinance.pages.dev))

Browse **Payment Explorer**: understand European payments — actors, infrastructures, ISO 20022 messages and schemes — then drill into PSD2 / SIC / Wero flows. Walk the same catalog as a consumer app on **Live showcase**, or build a `pacs.008` / `pacs.002` pair in **Try editor**.

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
| Payment Explorer (SCT, SCT Inst, Wero, SDD, Card, SWIFT) | `/` · `/payment/:id` |
| Country context FR/DE/CH · version compare · debug quiz | `/payment/sepa-instant?from=FR` · `/compare/pacs.008` · `/quiz/debug-reject` |
| Live showcase (checkout, P2P, bank inbox — catalog flows as fake apps) | `/live` · `src/data/lifeScenes.ts` |
| Try editor (`pacs.008` in, `pacs.002` ACSC/RJCT out) | `/try` |
| API standards (Berlin Group, STET, UK OB, PolishAPI, Czech OBS, Swiss SPS/SIC, Wero) | `src/data/standards.ts` |
| End-to-end flows as SVG sequence diagrams | `src/data/flows.ts` + `FlowCanvas` |
| Cytoscape interop map (standards × messages × rails) | `/map` · `InteropGraph` |
| ISO 20022 messages with namespaces and mandatory elements | `src/data/iso20022.ts` |
| Sample payloads (XML / JSON), editable in place | `src/data/samples.ts` |
| Status and error codes with remediation | `src/data/codes.ts` (merged into the glossary) |
| Payments glossary (terms, codes, schemes) | `/glossary` · `src/data/glossary.ts` (`/scheme/:id` redirects here) |
| About / glossary sources | `/about` |
| Structural validation of ISO 20022 documents | `functions/api/validate.ts` |
| Mock ASPSP with awkward-but-realistic behaviour | `functions/api/mock/[[path]].ts` · **Try it** on flow / live pages |
| Full catalog as JSON | `functions/api/catalog.ts` |

### Notable flows

- AIS consent (redirect SCA), SEPA PIS, STET, UK domestic payment, PIIS
- Clearing happy path, reject (`pacs.002` RJCT), recall (`camt.056` → `pacs.004`)
- **SCT Inst / IPR**: happy path ≤10s (TIPS), VoP-then-instant, reject-in-window, timeout + `pacs.028`, instant recall
- Verification of Payee, Wero A2A
- **SIC CHF** credit, **SIC IP** instant + timeout, **euroSIC** EUR leg
- **Payment cancellation** before settlement (`DELETE` + `camt.055`)

### Live showcase

`/live` is a walkthrough of the catalog as consumer screens (phone chrome), not a second catalog.

Five scenes: **Atelier** (shop checkout), **Nox / Stall** (subscribe or in-app purchase), **Pocket** send / receive (P2P), **Banque de Démonstration** (AIS, cancel, Swiss rails, SWIFT, hub). Each beat shows the fake UI plus the ISO / API payload underneath, with links back to the flow, payment explorer, and sample.

Scenarios are authored in `src/data/lifeScenes.ts`. CI requires every catalog flow and payment to appear at least once. Payment and sample pages deep-link into the matching beat. `/live` stays SPA-only (not prerendered, no ads).

### Try editor

`/try` builds a `pacs.008` from a form and a matching `pacs.002` (ACSC acknowledgement or RJCT + reason). Simple mode keeps a short field list with definitions under the inputs; expert mode exposes every generated leaf and syncs form ↔ XML tree. Panes can show `pacs.008`, `pacs.002`, or both; each pane validates through `/api/validate`.

### The mock ASPSP

Not a faithful bank — a bank that is annoying in the ways real banks are annoying. Flow diagrams and the live explainer expose a **Try it** panel that `fetch`es `/api/mock…` (needs Functions: `npm start` or `npm run dev:full`).

Awkward bits:

- a consent does not become `valid` on the first poll (status becomes `valid` on the third)
- `recurringIndicator=false` with `frequencyPerDay>1` is a `FORMAT_ERROR`
- balances without `Consent-ID` fail the Berlin Group way
- payment status walks `RCVD → ACTC → ACSP → ACSC` one poll at a time
- `instructedAmount.amount` must be a **string** with two decimals (`42.00`); a JSON number is rejected
- IBANs ending in `0000` always reject (`AC01`) so error paths are on demand
- `POST /v1/funds-confirmations` returns only `{ fundsAvailable }` (true if amount ≤ 3570.35)
- `DELETE` on a payment returns `CANC`

State lives in KV (`PSD2_STATE`) when bound, otherwise a per-isolate `Map` that resets on cold start.

```bash
curl -X POST http://127.0.0.1:8788/api/mock/v1/consents \
  -H 'Content-Type: application/json' \
  -H 'X-Request-ID: 00000000-0000-4000-8000-000000000001' \
  -d '{"access":{"accounts":[{"iban":"FR7630006000011234567890189"}]},"recurringIndicator":true,"frequencyPerDay":4}'
```

Also: `GET /v1/accounts`, `POST /v1/payments/{product}`, status/authorisations, `POST /v1/funds-confirmations`. Unknown paths return the supported list.

### Validator limits

`POST /api/validate` checks well-formedness, namespace vs root element, mandatory elements, and
`NbOfTxs` / `CtrlSum` reconciliation. It is **not** full XSD validation — get schemas from
[iso20022.org](https://www.iso20022.org/iso-20022-message-definitions).

## Running it

Requires Node 22 (see `.nvmrc`).

```bash
npm install
npm start          # build dist/ then Vite :5173 + Wrangler Functions on :8788 (preferred)
npm run dev:full   # same pairing without a rebuild (needs an existing dist/)
npm run start:ui   # Vite only — UI works, /api/* returns 404 (mock + validate unavailable)
npm run build      # tsc + vite + prerender catalog HTML → dist/
npm run prerender  # re-run static HTML only (needs an existing dist/)
npm run serve      # build then serve dist + Functions on :8788
npm run preview    # Vite preview of dist (no Functions) on :4173
```

Open **http://127.0.0.1:5173** for HMR (Vite proxies `/api/*` to :8788), or
**http://127.0.0.1:8788** for the production build served with Functions.
`npm start` rebuilds `dist/` then runs both. Mock **Try it** and `/api/validate` need the Functions process.

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
4. For ads, set `ADSENSE_CLIENT` / slot variables (see [AdSense](#adsense)).

| Workflow | Trigger |
| --- | --- |
| `ci.yml` | PR — verify; main / manual — verify + deploy + smoke; same-repo PRs — preview URL comment |

Manual: `npm run deploy`.

## AdSense

Covered by parent site **`geoking.fr`**. **Auto ads stay OFF** on that site (console only — this app never enables them). Monetization is **Display units only** on OpenFinance catalog pages (`PageAd`: intro + end), injected **client-side** after mount (never in prerendered HTML) and **only after** the cookie/ad consent banner choice (personalized vs `requestNonPersonalizedAds`). Tools and trust pages (`/try`, `/map`, `/live`, `/quiz`, `/privacy`, `/contact`, `/about`, 404s) get no ads. Tool URLs are prerendered as ad-free `noindex` shells so View Source is not the homepage.

`npm run build` prerenders every catalog URL so View Source is article HTML, not an empty SPA shell. **Never** add a `/* → /` rewrite in [`public/_redirects`](public/_redirects): Cloudflare applies redirects even when static HTML exists, which made every deep link look like the homepage to AdSense. Unmatched SPA routes still fall back via Pages’ default (no top-level `404.html`). `/ads.txt` is emitted from `VITE_ADSENSE_CLIENT`. Kill switch: `ADSENSE_PAUSED` in [`src/lib/ads.ts`](src/lib/ads.ts).

GitHub variables (mapped to `VITE_*` at build): `ADSENSE_CLIENT` (`ca-pub-…`), `ADSENSE_SLOT` (fallback), `ADSENSE_SLOT_INTRO`, `ADSENSE_SLOT_END`. Local: `VITE_ADSENSE_CLIENT=ca-pub-… VITE_ADSENSE_SLOT=… npm run build`. Publisher id and Privacy & messaging URL: [`adsense.manifest.json`](adsense.manifest.json). Enable Privacy & messaging for the EEA/UK/CH at that URL.

## Architecture

```
src/
├── data/          catalog (TypeScript, CI-checked cross-refs) + lifeScenes
├── lib/           xml, messageId, search, prerenderUrls, seo, ads, pacsBuilder
├── entry-server.tsx  StaticRouter render for prerender
├── components/    FlowCanvas (SVG), InteropGraph (Cytoscape), PayloadInspector,
│                  live/ (showcase), try/ (editor)
├── views/         routes including /map, /live, /try
scripts/           prerender.mts (post-vite static HTML)
functions/         Cloudflare Pages Functions (catalog, validate, mock ASPSP)
```

SVG swimlanes stay the source of truth for ordered payment steps. Cytoscape answers topology:
which standards, messages and rails connect. Live showcase replays those steps as consumer
screens without duplicating catalog prose.

## Prior art

Shaped by [issettled/iso20022-issettled](https://github.com/issettled/iso20022-issettled),
Berlin Group OpenAPI specs, STET examples, and SIX Swiss Payment Standards / SIC ISO 20022
implementation guidelines. Sample payloads are synthetic.

Glossary entries are aligned with (and link out to):

- [Open Banking UK glossary](https://www.openbanking.org.uk/glossary/)
- [Mastercard Open Finance US glossary](https://developer.mastercard.com/open-finance-us/documentation/glossary/)
- [Konsentus Open Banking & Open Finance glossary (Europe)](https://www.konsentus.com/open-banking-open-finance-glossary-europe/)
- [Deutsche Bundesbank PSD2 glossary](https://www.bundesbank.de/en/tasks/payment-systems/psd2/psd2-glossary-775962)
- [Ravelin PSD glossary (acronyms)](https://www.ravelin.com/blog/psd2-glossary-acronyms)

The same citations live on `/about` and on each glossary entry that maps onto those sources.

## Licence

[GPL-3.0](LICENSE). Copyright (C) 2026 GeoKing. All IBANs, BICs, names and identifiers are synthetic.
