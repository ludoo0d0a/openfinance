import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import type { Endpoint } from '@/types';

interface Props {
  method: Endpoint['method'];
  path: string;
  body?: string;
}

interface Attempt {
  status: number;
  durationMs: number;
  headers: Record<string, string>;
  body: string;
}

/**
 * Fires the request at the mock ASPSP that ships with the app. The point is not
 * to simulate a bank faithfully — it is to let you see the shape of a real
 * response, including the error envelopes, without onboarding to a sandbox.
 */
export function TryItPanel({ method, path, body }: Props) {
  const [requestPath, setRequestPath] = useState(path);
  const [requestBody, setRequestBody] = useState(body ?? '');
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRequestPath(path);
    setRequestBody(body ?? '');
    setAttempt(null);
    setError(null);
  }, [path, body]);

  async function send() {
    setPending(true);
    setError(null);
    const started = performance.now();

    try {
      const res = await fetch(`/api/mock${requestPath}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': crypto.randomUUID(),
        },
        body: method === 'GET' || method === 'DELETE' ? undefined : requestBody || '{}',
      });

      const text = await res.text();
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        headers[k] = v;
      });

      setAttempt({
        status: res.status,
        durationMs: Math.round(performance.now() - started),
        headers,
        body: prettyJson(text),
      });
    } catch {
      setError('Could not reach the mock ASPSP. Start it with `npm run dev:full` so the Pages Functions run alongside Vite.');
    } finally {
      setPending(false);
    }
  }

  const ok = attempt && attempt.status < 400;

  return (
    <section className="panel">
      <header className="flex items-center justify-between border-b border-rule px-4 py-3">
        <div>
          <p className="eyebrow">Try it</p>
          <h3 className="text-sm font-semibold">Mock ASPSP</h3>
        </div>
        <button
          type="button"
          onClick={() => void send()}
          disabled={pending}
          className="border border-ink bg-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-ink-raised disabled:opacity-40"
        >
          {pending ? 'Sending…' : `Send ${method}`}
        </button>
      </header>

      <div className="space-y-3 px-4 py-3">
        <label className="block">
          <span className="eyebrow">Path</span>
          <input
            value={requestPath}
            onChange={(e) => setRequestPath(e.target.value)}
            className="mt-1 w-full border border-rule bg-paper-raised px-2 py-1.5 font-mono text-xs focus:outline-none"
          />
        </label>

        {method !== 'GET' && method !== 'DELETE' && (
          <label className="block">
            <span className="eyebrow">Body</span>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              rows={7}
              spellCheck={false}
              className="scroll-paper mt-1 w-full resize-y border border-rule bg-paper-raised px-2 py-1.5 font-mono text-xs focus:outline-none"
            />
          </label>
        )}

        <p className="text-[11px] leading-relaxed text-muted">
          Substitute your own ids in the path — the mock resolves any UUID-shaped consentId and advances the SCA state
          machine on each call, so polling behaves the way a real ASPSP does.
        </p>
      </div>

      {error && <p className="border-t border-rule px-4 py-3 text-xs text-vermillion">{error}</p>}

      {attempt && (
        <div className="border-t border-rule">
          <div className="flex flex-wrap items-baseline gap-3 px-4 py-2 font-mono text-[11px]">
            <span className={cn('font-semibold', ok ? 'text-jade' : 'text-vermillion')}>{attempt.status}</span>
            <span className="text-muted">{attempt.durationMs} ms</span>
            {attempt.headers['x-request-id'] && (
              <span className="truncate text-muted">x-request-id {attempt.headers['x-request-id'].slice(0, 8)}…</span>
            )}
          </div>
          <pre className="scroll-ink max-h-72 overflow-auto bg-ink p-4 font-mono text-[11px] leading-relaxed text-[#dfe5ee]">
            {attempt.body}
          </pre>
        </div>
      )}
    </section>
  );
}

function prettyJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}
