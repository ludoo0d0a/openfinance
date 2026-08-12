import { STANDARDS } from '../../src/data/standards';
import { ISO_MESSAGES } from '../../src/data/iso20022';
import { FLOWS } from '../../src/data/flows';
import { CODES } from '../../src/data/codes';
import { ALL_SAMPLES } from '../../src/data/samples';

/**
 * The catalog as data, so the same content can back a CLI, a CI check or
 * someone else's tooling without scraping the UI.
 *
 *   GET /api/catalog                     summary
 *   GET /api/catalog?section=codes       full code registry
 *   GET /api/catalog?section=codes&family=iso-status-reason
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
      const codes = family ? CODES.filter((c) => c.family === family) : CODES;
      return respond(id ? codes.filter((c) => c.code.toLowerCase() === id.toLowerCase()) : codes, cache);
    }

    case 'samples': {
      if (id) return respond(ALL_SAMPLES.filter((s) => s.id === id), cache);
      // Payloads are large; the index omits them.
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
            codes: CODES.length,
            samples: ALL_SAMPLES.length,
          },
          standards: STANDARDS.map((s) => ({ id: s.id, name: s.name, region: s.region, version: s.version })),
          flows: FLOWS.map((f) => ({ id: f.id, name: f.name, category: f.category, steps: f.steps.length })),
          messages: ISO_MESSAGES.map((m) => ({ short: m.short, id: m.id, name: m.name })),
          sections: ['standards', 'messages', 'flows', 'codes', 'samples'],
        },
        cache,
      );
  }
};

function respond(body: unknown, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body, null, 2), { status: 200, headers });
}
