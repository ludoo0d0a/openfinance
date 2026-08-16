import { STANDARDS } from '../../src/data/standards';
import { ISO_MESSAGES } from '../../src/data/iso20022';
import { FLOWS } from '../../src/data/flows';
import { ALL_SAMPLES } from '../../src/data/samples';
import { GLOSSARY, GLOSSARY_CODES } from '../../src/data/glossary';
import { PAYMENTS } from '../../src/data/payments';
import { SCHEMES } from '../../src/data/schemes';
import { INFRASTRUCTURES } from '../../src/data/infrastructures';

/**
 * The catalog as data, so the same content can back a CLI, a CI check or
 * someone else's tooling without scraping the UI.
 *
 *   GET /api/catalog                     summary
 *   GET /api/catalog?section=codes       glossary entries with category=code
 *   GET /api/catalog?section=glossary    glossary + codes
 *   GET /api/catalog?section=thesaurus   alias of glossary
 *   GET /api/catalog?section=samples     samples without payloads
 *   GET /api/catalog?section=samples&id=pacs-008-sct   one sample with payload
 */
export const onRequestGet: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  const section = url.searchParams.get('section');
  const family = url.searchParams.get('family');
  const id = url.searchParams.get('id');

  const cache = { 'Cache-Control': 'public, max-age=300', 'Content-Type': 'application/json' };

  switch (section) {
    case 'standards':
      return respond(id ? STANDARDS.filter((s) => s.id === id) : STANDARDS, cache);

    case 'messages':
      return respond(id ? ISO_MESSAGES.filter((m) => m.short === id || m.id === id) : ISO_MESSAGES, cache);

    case 'flows':
      return respond(id ? FLOWS.filter((f) => f.id === id) : FLOWS, cache);

    case 'codes': {
      const codes = family ? GLOSSARY_CODES.filter((c) => c.family === family) : GLOSSARY_CODES;
      return respond(
        id
          ? codes.filter((c) => c.id === id || c.term.toLowerCase() === id.toLowerCase())
          : codes,
        cache,
      );
    }

    case 'glossary':
    case 'thesaurus':
      return respond(id ? GLOSSARY.filter((e) => e.id === id) : GLOSSARY, cache);

    case 'samples': {
      if (id) return respond(ALL_SAMPLES.filter((s) => s.id === id), cache);
      return respond(
        ALL_SAMPLES.map(({ content: _content, ...rest }) => rest),
        cache,
      );
    }

    default:
      return respond(
        {
          counts: {
            standards: STANDARDS.length,
            messages: ISO_MESSAGES.length,
            flows: FLOWS.length,
            codes: GLOSSARY_CODES.length,
            samples: ALL_SAMPLES.length,
            glossary: GLOSSARY.length,
            payments: PAYMENTS.length,
            schemes: SCHEMES.length,
            infrastructures: INFRASTRUCTURES.length,
          },
          standards: STANDARDS.map((s) => ({ id: s.id, name: s.name, region: s.region, version: s.version })),
          flows: FLOWS.map((f) => ({ id: f.id, name: f.name, category: f.category, steps: f.steps.length })),
          messages: ISO_MESSAGES.map((m) => ({ short: m.short, id: m.id, name: m.name })),
          payments: PAYMENTS.map((p) => ({ id: p.id, name: p.name.en })),
          schemes: SCHEMES.map((s) => ({ id: s.id, name: s.name.en })),
          infrastructures: INFRASTRUCTURES.map((i) => ({ id: i.id, name: i.name.en })),
          glossary: GLOSSARY.map((e) => ({ id: e.id, term: e.term, category: e.category })),
          sections: ['standards', 'messages', 'flows', 'codes', 'samples', 'glossary'],
        },
        cache,
      );
  }
};

function respond(body: unknown, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body, null, 2), { status: 200, headers });
}
