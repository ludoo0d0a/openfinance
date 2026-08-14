# Contributing

## Getting set up

```bash
nvm use
npm install
npm run dev:full
```

`dev:full` runs Vite behind Wrangler on `:8788` so the Pages Functions are reachable. Plain `npm run dev` is faster but
`/api/*` returns 404.

## The bar for catalog content

The catalog is the product. Anyone can restate a specification; the value here is in the parts that are true but not
written down.

- **Gotchas should come from experience.** "X-Request-ID must be a UUID" is in the spec. "Log it, it is the only handle
  support desks accept" is not, and that is the sentence worth adding.
- **Every code needs an `action`.** The description says what the code means. The action says whether a retry is
  legitimate. People open the glossary for the second one.
- **Say when banks disagree with the spec.** `recurringIndicator=false` with `frequencyPerDay>1` is invalid and widely
  accepted. Both halves matter.
- **Keep samples synthetic.** Test IBANs, BICs ending `XXX`, invented names. Never paste a real payload, redacted or
  otherwise.

## Adding things

| To add | Edit | Notes |
| --- | --- | --- |
| A message | `src/data/iso20022.ts` | `requiredPaths` are the elements whose absence causes rejections you have actually seen, not the full XSD |
| A sample | `src/data/samples.ts` | Namespace must match the catalog entry's `id`, and the payload must satisfy its own `requiredPaths` — CI checks both |
| A flow | `src/data/flows.ts` | Steps numbered from 1 with no gaps. Every actor a step touches must be in `actors` or its arrow falls back to the last lane |
| A glossary term | `src/data/glossaryEntries.ts` (EU/UK) or `src/data/glossaryMastercard.ts` | Bilingual EN/FR name and definition; cite `sources` when aligned with a public glossary |
| A code | `src/data/codes.ts` | Unique within its family; merged into the glossary as `category: 'code'` |
| A standard | `src/data/standards.ts` | Endpoints are indexed individually and become searchable |

No UI changes are needed for any of these. Views are derived from the data.

## Before you open a PR

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

`tests/catalog.test.ts` is the one that will catch you: it verifies every cross-reference between flows, samples,
messages and glossary codes, checks step numbering, and confirms each XML sample declares the namespace its catalog
entry expects.

## Style

- No new dependencies without a reason in the PR description. The current list is deliberately short.
- Comments explain *why*, not *what*. If a line needs a comment to say what it does, rename something instead.
- Tailwind utilities in JSX; add to `src/styles/index.css` only for genuinely reusable patterns.
- Colour comes from the status tokens. If you need a new colour, say which ISO status or layer it represents.
