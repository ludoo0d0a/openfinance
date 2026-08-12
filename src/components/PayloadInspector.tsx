import { useMemo, useState } from 'react';
import { parseXml, searchNodes, type XmlNode } from '@/lib/xml';
import { cn } from '@/lib/cn';
import type { ValidationResult } from '@/types';

interface Props {
  content: string;
  format: 'xml' | 'json';
  /** Shown above the payload */
  title: string;
  description?: string;
  onContentChange?: (next: string) => void;
}

type Tab = 'tree' | 'raw' | 'validate';

export function PayloadInspector({ content, format, title, description, onContentChange }: Props) {
  const [tab, setTab] = useState<Tab>('tree');
  const [filter, setFilter] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const parsed = useMemo(() => (format === 'xml' ? parseXml(content) : null), [content, format]);
  // Always evaluated so the discriminated union narrows without a null check.
  const jsonTree = useMemo(() => safeJson(format === 'json' ? content : 'null'), [content, format]);

  const matches = useMemo(() => {
    if (format !== 'xml' || !filter.trim()) return null;
    return new Set(searchNodes(parsed?.root ?? null, filter).map((n) => n.path + n.name));
  }, [format, filter, parsed]);

  // Only XML can be structurally validated, so JSON gets two tabs.
  const tabs: Tab[] = format === 'xml' ? ['tree', 'raw', 'validate'] : ['tree', 'raw'];
  const activeTab: Tab = tabs.includes(tab) ? tab : 'tree';

  async function runValidation() {
    setValidating(true);
    setValidationError(null);
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xml: content }),
      });
      if (!res.ok) throw new Error(`Validator returned ${res.status}`);
      setValidation((await res.json()) as ValidationResult);
    } catch {
      setValidationError('Validator unreachable. Run `npm run dev:full` to serve the Pages Functions alongside Vite.');
    } finally {
      setValidating(false);
    }
  }

  return (
    <section className="panel-ink flex min-h-0 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-line px-4 py-3">
        <div className="min-w-0">
          <p className="eyebrow-dark">{format === 'xml' ? 'ISO 20022 payload' : 'API payload'}</p>
          <h3 className="truncate text-sm font-semibold text-white">{title}</h3>
        </div>
        <nav className="flex shrink-0 gap-px" aria-label="Payload view">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                if (t === 'validate' && !validation && !validating) void runValidation();
              }}
              className={cn(
                'px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors',
                activeTab === t ? 'bg-white text-ink' : 'bg-ink-raised text-muted-dark hover:text-white',
              )}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      {description && <p className="border-b border-ink-line px-4 py-2.5 text-[13px] leading-relaxed text-muted-dark">{description}</p>}

      {activeTab === 'tree' && (
        <>
          <div className="border-b border-ink-line px-4 py-2">
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={format === 'xml' ? 'Filter elements, values, attributes…' : 'Filter keys and values…'}
              className="w-full bg-transparent font-mono text-xs text-white placeholder:text-muted-dark focus:outline-none"
              aria-label="Filter payload"
            />
          </div>
          <div className="scroll-ink min-h-0 flex-1 overflow-auto px-2 py-2 font-mono text-xs">
            {format === 'xml' ? (
              parsed?.wellFormed && parsed.root ? (
                <XmlTree node={parsed.root} matches={matches} filter={filter} />
              ) : (
                <p className="px-2 py-4 text-vermillion">Not well-formed: {parsed?.error}</p>
              )
            ) : jsonTree.ok ? (
              <JsonTree value={jsonTree.value} name="root" filter={filter} depth={0} />
            ) : (
              <p className="px-2 py-4 text-vermillion">Invalid JSON: {jsonTree.error}</p>
            )}
          </div>
        </>
      )}

      {activeTab === 'raw' && (
        <div className="min-h-0 flex-1">
          {onContentChange ? (
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              spellCheck={false}
              aria-label="Editable payload"
              className="scroll-ink h-full w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-[#dfe5ee] focus:outline-none"
            />
          ) : (
            <pre className="scroll-ink h-full overflow-auto p-4 text-xs leading-relaxed text-[#dfe5ee]">{content}</pre>
          )}
        </div>
      )}

      {activeTab === 'validate' && (
        <div className="scroll-ink min-h-0 flex-1 overflow-auto p-4 text-xs">
          {validating && <p className="text-muted-dark">Checking structure…</p>}
          {validationError && <p className="text-ochre">{validationError}</p>}
          {validation && <ValidationReport result={validation} />}
          <button
            type="button"
            onClick={() => void runValidation()}
            disabled={validating}
            className="mt-4 border border-ink-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-white hover:bg-ink-raised disabled:opacity-40"
          >
            Run check again
          </button>
        </div>
      )}

      <footer className="flex flex-wrap gap-x-5 gap-y-1 border-t border-ink-line px-4 py-2 font-mono text-[10px] text-muted-dark">
        {format === 'xml' && parsed && (
          <>
            <span>{parsed.stats.elements} elements</span>
            <span>depth {parsed.stats.depth}</span>
            {parsed.messageId && <span className="text-white">{parsed.messageId}</span>}
          </>
        )}
        <span>{content.length} chars</span>
        {matches && <span className="text-signal">{matches.size} matches</span>}
      </footer>
    </section>
  );
}

function XmlTree({ node, matches, filter, depth = 0 }: { node: XmlNode; matches: Set<string> | null; filter: string; depth?: number }) {
  const [open, setOpen] = useState(depth < 4);
  const hasChildren = node.children.length > 0;
  const isMatch = matches?.has(node.path + node.name) ?? false;
  const hasMatchBelow = matches ? subtreeHasMatch(node, matches) : false;

  if (matches && !isMatch && !hasMatchBelow) return null;

  return (
    <div style={{ paddingLeft: depth === 0 ? 0 : 14 }}>
      <div
        className={cn(
          'group flex items-baseline gap-1.5 rounded-none px-1.5 py-[3px]',
          isMatch && filter ? 'bg-signal/25' : 'hover:bg-ink-raised',
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={`${open ? 'Collapse' : 'Expand'} ${node.name}`}
            className="w-3 shrink-0 text-left text-muted-dark hover:text-white"
          >
            {open ? '−' : '+'}
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}

        <span className="text-[#8fb4ff]">{node.name}</span>

        {Object.entries(node.attributes)
          .filter(([k]) => !k.startsWith('xmlns'))
          .map(([k, v]) => (
            <span key={k} className="text-ochre">
              {k}=&quot;{v}&quot;
            </span>
          ))}

        {node.text !== null && <span className="text-jade">{node.text}</span>}
      </div>

      {hasChildren && open && (
        <div className="border-l border-ink-line">
          {node.children.map((child, i) => (
            <XmlTree key={`${child.path}-${i}`} node={child} matches={matches} filter={filter} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function subtreeHasMatch(node: XmlNode, matches: Set<string>): boolean {
  if (matches.has(node.path + node.name)) return true;
  return node.children.some((c) => subtreeHasMatch(c, matches));
}

function JsonTree({ value, name, filter, depth }: { value: unknown; name: string; filter: string; depth: number }) {
  const [open, setOpen] = useState(depth < 3);
  const q = filter.trim().toLowerCase();

  if (value === null || typeof value !== 'object') {
    const rendered = typeof value === 'string' ? `"${value}"` : String(value);
    const hit = q && (name.toLowerCase().includes(q) || rendered.toLowerCase().includes(q));
    if (q && !hit) return null;
    return (
      <div style={{ paddingLeft: depth * 14 }} className={cn('px-1.5 py-[3px]', hit && 'bg-signal/25')}>
        <span className="text-[#8fb4ff]">{name}</span>
        <span className="text-muted-dark">: </span>
        <span className={typeof value === 'string' ? 'text-jade' : 'text-ochre'}>{rendered}</span>
      </div>
    );
  }

  const entries = Array.isArray(value) ? value.map((v, i) => [String(i), v] as const) : Object.entries(value);

  return (
    <div>
      <div style={{ paddingLeft: depth * 14 }} className="px-1.5 py-[3px]">
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="text-muted-dark hover:text-white">
          {open ? '−' : '+'}
        </button>{' '}
        <span className="text-[#8fb4ff]">{name}</span>
        <span className="text-muted-dark">
          {' '}
          {Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`}
        </span>
      </div>
      {open &&
        entries.map(([k, v]) => <JsonTree key={k} value={v} name={k} filter={filter} depth={depth + 1} />)}
    </div>
  );
}

function ValidationReport({ result }: { result: ValidationResult }) {
  const ok = result.wellFormed && result.errors.length === 0;

  return (
    <div className="space-y-4">
      <div className={cn('border px-3 py-2', ok ? 'border-jade text-jade' : 'border-vermillion text-vermillion')}>
        <p className="font-mono text-[11px] uppercase tracking-widest">{ok ? 'Structure OK' : 'Problems found'}</p>
        <p className="mt-1 text-white">
          {result.messageShort ? `Recognised as ${result.messageShort}` : 'Message type not recognised from the namespace'}
        </p>
      </div>

      {result.errors.length > 0 && (
        <div>
          <p className="eyebrow-dark mb-2">Errors</p>
          <ul className="space-y-2">
            {result.errors.map((e, i) => (
              <li key={i} className="border-l-2 border-vermillion pl-3">
                <p className="text-white">{e.message}</p>
                <p className="text-muted-dark">
                  {e.rule} · {e.path}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.warnings.length > 0 && (
        <div>
          <p className="eyebrow-dark mb-2">Warnings</p>
          <ul className="space-y-2">
            {result.warnings.map((w, i) => (
              <li key={i} className="border-l-2 border-ochre pl-3">
                <p className="text-white">{w.message}</p>
                <p className="text-muted-dark">
                  {w.rule} · {w.path}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-muted-dark">
        This checks well-formedness, the namespace, and the elements a scheme validator would insist on. It is not a full
        XSD validation — schema files are not bundled.
      </p>
    </div>
  );
}

function safeJson(text: string): { ok: true; value: unknown; error: null } | { ok: false; value: null; error: string } {
  try {
    return { ok: true, value: JSON.parse(text), error: null };
  } catch (e) {
    return { ok: false, value: null, error: e instanceof Error ? e.message : 'parse failed' };
  }
}
