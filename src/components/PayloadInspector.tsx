import { useEffect, useMemo, useRef, useState } from 'react';
import { FileCode2, Braces } from 'lucide-react';
import { XmlTagTooltip } from '@/components/XmlTagTooltip';
import { parseXml, searchNodes, xmlElementPath, xmlSelector, type XmlNode } from '@/lib/xml';
import { tryJsonToXml, tryPrettyJson, tryXmlToJsonString, tryXmlToSourceJson } from '@/lib/isoCodec';
import { xmlTagTooltip } from '@/lib/xmlTagTooltip';
import { cn } from '@/lib/cn';
import type { ValidationResult } from '@/types';
import { useI18n, useT } from '@/i18n';

interface Props {
  content: string;
  format: 'xml' | 'json';
  /** Shown above the payload */
  title: string;
  description?: string;
  onContentChange?: (next: string) => void;
  /**
   * When true (default), expose an XML | JSON switch.
   * Editing in the alternate format is converted back to the source format.
   */
  allowAltFormat?: boolean;
  /** Prefill the tree filter (e.g. from search ?q=DbtrAgt). */
  initialFilter?: string;
  /** Selectors to highlight in the XML tree (`path` or `path@attr`). */
  selectedPaths?: string[];
  /** Click a tree row / attribute to link it back to a form field. */
  onSelectPath?: (selector: string) => void;
}

type Tab = 'tree' | 'raw' | 'validate';
type ViewFormat = 'xml' | 'json';

export function PayloadInspector({
  content,
  format,
  title,
  description,
  onContentChange,
  allowAltFormat,
  initialFilter = '',
  selectedPaths,
  onSelectPath,
}: Props) {
  const t = useT();
  const dual = allowAltFormat ?? true;
  const treeRef = useRef<HTMLDivElement>(null);
  const [viewFormat, setViewFormat] = useState<ViewFormat>('xml');
  const [tab, setTab] = useState<Tab>('tree');
  const [filter, setFilter] = useState(initialFilter);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);

  useEffect(() => {
    setViewFormat('xml');
    setConvertError(null);
    setValidation(null);
  }, [format]);

  useEffect(() => {
    setFilter(initialFilter);
    if (initialFilter.trim()) setTab('tree');
  }, [initialFilter]);

  // Clear validation when the source payload changes (e.g. new sample / form rebuild).
  useEffect(() => {
    setValidation(null);
    setConvertError(null);
  }, [content]);

  const displayContent = useMemo(() => {
    let raw: string | null;
    if (viewFormat === format) {
      raw = content;
    } else if (format === 'xml' && viewFormat === 'json') {
      const result = tryXmlToJsonString(content);
      raw = result.ok ? result.json : null;
    } else if (format === 'json' && viewFormat === 'xml') {
      const result = tryJsonToXml(content);
      raw = result.ok ? result.xml : null;
    } else {
      raw = content;
    }
    if (raw == null) return null;
    // Pretty-print JSON for the tree/raw views, but not while the user is
    // editing the source JSON — reformatting on each keystroke steals the caret.
    if (viewFormat === 'json' && !(format === 'json' && onContentChange)) {
      const pretty = tryPrettyJson(raw);
      return pretty.ok ? pretty.json : raw;
    }
    return raw;
  }, [content, format, onContentChange, viewFormat]);

  const displayError = useMemo(() => {
    if (viewFormat === format) return null;
    if (format === 'xml' && viewFormat === 'json') {
      const result = tryXmlToJsonString(content);
      return result.ok ? null : result.error;
    }
    if (format === 'json' && viewFormat === 'xml') {
      const result = tryJsonToXml(content);
      return result.ok ? null : result.error;
    }
    return null;
  }, [content, format, viewFormat]);

  const effective = displayContent ?? '';
  const effectiveFormat = viewFormat;

  const parsed = useMemo(
    () => (effectiveFormat === 'xml' && displayContent ? parseXml(displayContent) : null),
    [displayContent, effectiveFormat],
  );
  const jsonTree = useMemo(
    () => safeJson(effectiveFormat === 'json' && displayContent ? displayContent : 'null'),
    [displayContent, effectiveFormat],
  );

  const matches = useMemo(() => {
    if (effectiveFormat !== 'xml' || !filter.trim()) return null;
    return new Set(searchNodes(parsed?.root ?? null, filter).map((n) => n.path + n.name));
  }, [effectiveFormat, filter, parsed]);

  const tabs: Tab[] = format === 'xml' && viewFormat === 'xml' ? ['tree', 'raw', 'validate'] : ['tree', 'raw'];
  const activeTab: Tab = tabs.includes(tab) ? tab : 'tree';

  const selectedSet = useMemo(() => new Set(selectedPaths ?? []), [selectedPaths]);

  useEffect(() => {
    if (!selectedPaths?.length || activeTab !== 'tree' || viewFormat !== 'xml') return;
    const first = xmlElementPath(selectedPaths[0]);
    const frame = requestAnimationFrame(() => {
      const el = treeRef.current?.querySelector(`[data-xml-path="${CSS.escape(first)}"]`);
      el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedPaths, activeTab, viewFormat]);

  function handleRawChange(next: string) {
    if (!onContentChange) return;
    if (viewFormat === format) {
      onContentChange(next);
      return;
    }
    // Editing alternate format — convert back to the source format for the parent.
    if (format === 'xml' && viewFormat === 'json') {
      const result = tryJsonToXml(next);
      if (!result.ok) {
        setConvertError(result.error);
        return;
      }
      setConvertError(null);
      onContentChange(result.xml);
      return;
    }
    if (format === 'json' && viewFormat === 'xml') {
      const result = tryXmlToSourceJson(next, content);
      if (!result.ok) {
        setConvertError(result.error);
        return;
      }
      setConvertError(null);
      onContentChange(result.json);
    }
  }

  async function runValidation() {
    setValidating(true);
    setValidationError(null);
    const xml =
      format === 'xml' ? content : viewFormat === 'xml' && displayContent ? displayContent : null;
    if (!xml) {
      setValidationError('Validation needs XML. Switch to the XML view or provide an XML source.');
      setValidating(false);
      return;
    }
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xml }),
      });
      if (!res.ok) throw new Error(`Validator returned ${res.status}`);
      setValidation((await res.json()) as ValidationResult);
    } catch {
      setValidationError('Validator unreachable. Run `npm start` so Pages Functions serve /api/validate.');
    } finally {
      setValidating(false);
    }
  }

  return (
    <section className="panel-ink flex h-full min-h-[28rem] flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-line px-4 py-3">
        <div className="min-w-0">
          <p className="eyebrow-dark inline-flex items-center gap-1.5">
            {effectiveFormat === 'xml' ? <FileCode2 size={12} aria-hidden /> : <Braces size={12} aria-hidden />}
            {format === 'xml' ? t('payload.isoPayload') : t('payload.apiPayload')}
            {dual && <span className="text-muted-dark">· {effectiveFormat.toUpperCase()}</span>}
          </p>
          <h3 className="truncate text-sm font-semibold text-white">{title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {dual && (
            <div className="flex gap-px" role="group" aria-label="Payload format">
              <FormatBtn active={viewFormat === 'xml'} onClick={() => setViewFormat('xml')}>
                <FileCode2 size={11} aria-hidden /> XML
              </FormatBtn>
              <FormatBtn active={viewFormat === 'json'} onClick={() => setViewFormat('json')}>
                <Braces size={11} aria-hidden /> JSON
              </FormatBtn>
            </div>
          )}
          <nav className="flex shrink-0 gap-px" aria-label="Payload view">
            {tabs.map((tabKey) => (
              <button
                key={tabKey}
                type="button"
                onClick={() => {
                  setTab(tabKey);
                  if (tabKey === 'validate' && !validation && !validating) void runValidation();
                }}
                className={cn(
                  'px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors',
                  activeTab === tabKey ? 'bg-white text-ink' : 'bg-ink-raised text-muted-dark hover:text-white',
                )}
              >
                {tabKey === 'tree' ? t('payload.tree') : tabKey === 'raw' ? t('payload.raw') : t('payload.validate')}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {description && (
        <p className="border-b border-ink-line px-4 py-2.5 text-[13px] leading-relaxed text-muted-dark">{description}</p>
      )}
      {(displayError || convertError) && (
        <p className="border-b border-ink-line px-4 py-2 text-[12px] text-ochre">{displayError ?? convertError}</p>
      )}

      {activeTab === 'tree' && displayContent !== null && (
        <>
          <div className="border-b border-ink-line px-4 py-2">
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={
                effectiveFormat === 'xml' ? t('payload.filterXml') : t('payload.filterJson')
              }
              className="w-full bg-transparent font-mono text-xs text-white placeholder:text-muted-dark focus:outline-none"
              aria-label={t('payload.filterAria')}
            />
          </div>
          <div ref={treeRef} className="scroll-ink min-h-0 flex-1 overflow-auto px-2 py-2 font-mono text-xs">
            {effectiveFormat === 'xml' ? (
              parsed?.wellFormed && parsed.root ? (
                <XmlTree
                  node={parsed.root}
                  matches={matches}
                  filter={filter}
                  selectedPaths={selectedSet}
                  onSelectPath={onSelectPath}
                />
              ) : (
                <p className="px-2 py-4 text-vermillion">Not well-formed: {parsed?.error}</p>
              )
            ) : jsonTree.ok ? (
              <JsonTree value={jsonTree.value} name={null} filter={filter} depth={0} isLast />
            ) : (
              <p className="px-2 py-4 text-vermillion">Invalid JSON: {jsonTree.error}</p>
            )}
          </div>
        </>
      )}

      {activeTab === 'raw' && displayContent !== null && (
        <div className="min-h-0 flex-1">
          {onContentChange ? (
            <textarea
              value={effective}
              onChange={(e) => handleRawChange(e.target.value)}
              spellCheck={false}
              aria-label="Editable payload"
              className="scroll-ink h-full w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-[#dfe5ee] focus:outline-none"
            />
          ) : (
            <pre className="scroll-ink h-full overflow-auto p-4 text-xs leading-relaxed text-[#dfe5ee]">{effective}</pre>
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
            {t('payload.runAgain')}
          </button>
        </div>
      )}

      <footer className="flex flex-wrap gap-x-5 gap-y-1 border-t border-ink-line px-4 py-2 font-mono text-[10px] text-muted-dark">
        {effectiveFormat === 'xml' && parsed && (
          <>
            <span>{parsed.stats.elements} elements</span>
            <span>depth {parsed.stats.depth}</span>
            {parsed.messageId && <span className="text-white">{parsed.messageId}</span>}
          </>
        )}
        <span>{effective.length} chars</span>
        <span className="uppercase">{effectiveFormat}</span>
        {matches && <span className="text-signal">{matches.size} matches</span>}
      </footer>
    </section>
  );
}

function FormatBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest',
        active ? 'bg-white text-ink' : 'bg-ink-raised text-muted-dark hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

function XmlTree({
  node,
  matches,
  filter,
  selectedPaths,
  onSelectPath,
  depth = 0,
}: {
  node: XmlNode;
  matches: Set<string> | null;
  filter: string;
  selectedPaths: Set<string>;
  onSelectPath?: (selector: string) => void;
  depth?: number;
}) {
  const { t, locale } = useI18n();
  const rel = xmlSelector(node);
  const tagTip = xmlTagTooltip({ selector: rel, localName: node.name, t, locale });
  const ancestorOfSelection =
    selectedPaths.size > 0 &&
    [...selectedPaths].some((p) => {
      const el = xmlElementPath(p);
      return el === rel || el.startsWith(`${rel}/`);
    });
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (ancestorOfSelection) setOpen(true);
  }, [ancestorOfSelection]);

  const hasChildren = node.children.length > 0;
  const isMatch = matches?.has(node.path + node.name) ?? false;
  const hasMatchBelow = matches ? subtreeHasMatch(node, matches) : false;
  const rowSelected = selectedPaths.has(rel);
  const attrSelected = Object.keys(node.attributes).some((k) => selectedPaths.has(xmlSelector(node, k)));

  if (matches && !isMatch && !hasMatchBelow && !ancestorOfSelection) return null;

  return (
    <div style={{ paddingLeft: depth === 0 ? 0 : 14 }}>
      <div
        data-xml-path={rel}
        onClick={onSelectPath ? () => onSelectPath(rel) : undefined}
        className={cn(
          'group flex items-baseline gap-1.5 rounded-none px-1.5 py-[3px]',
          onSelectPath && 'cursor-pointer',
          rowSelected || attrSelected
            ? 'bg-signal/30 ring-1 ring-inset ring-signal'
            : isMatch && filter
              ? 'bg-signal/25'
              : 'hover:bg-ink-raised',
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            className="w-3 shrink-0 text-muted-dark"
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            {open ? '▾' : '▸'}
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <span className="text-signal">{'<'}</span>
        <XmlTagTooltip text={tagTip}>
          <span className="text-[#9ecbff]">{node.name}</span>
        </XmlTagTooltip>
        {Object.entries(node.attributes).map(([k, v]) => {
          const attrSel = xmlSelector(node, k);
          const attrTip = xmlTagTooltip({ selector: attrSel, localName: k, t, locale });
          return (
            <span
              key={k}
              className={cn('text-muted-dark', selectedPaths.has(attrSel) && 'bg-signal/40 px-0.5')}
              onClick={
                onSelectPath
                  ? (e) => {
                      e.stopPropagation();
                      onSelectPath(attrSel);
                    }
                  : undefined
              }
            >
              {' '}
              <XmlTagTooltip text={attrTip}>
                <span className="text-ochre">{k}</span>
              </XmlTagTooltip>
              =<span className="text-jade">"{v}"</span>
            </span>
          );
        })}
        <span className="text-signal">{hasChildren || node.text ? '>' : ' />'}</span>
        {node.text && !hasChildren && (
          <>
            <span className="text-[#dfe5ee]">{node.text}</span>
            <CloseTag name={node.name} tip={tagTip} />
          </>
        )}
        {hasChildren && !open && (
          <>
            <span className="text-muted-dark">…</span>
            <CloseTag name={node.name} tip={tagTip} />
          </>
        )}
      </div>
      {open && hasChildren && (
        <>
          {node.children.map((child, i) => (
            <XmlTree
              key={`${child.path}-${i}`}
              node={child}
              matches={matches}
              filter={filter}
              selectedPaths={selectedPaths}
              onSelectPath={onSelectPath}
              depth={depth + 1}
            />
          ))}
          <div className="flex items-baseline gap-1.5 px-1.5 py-[3px]">
            <span className="w-3 shrink-0" />
            <CloseTag name={node.name} tip={tagTip} />
          </div>
        </>
      )}
    </div>
  );
}

function CloseTag({ name, tip }: { name: string; tip?: string }) {
  return (
    <span>
      <span className="text-signal">{'</'}</span>
      <XmlTagTooltip text={tip}>
        <span className="text-[#9ecbff]">{name}</span>
      </XmlTagTooltip>
      <span className="text-signal">{'>'}</span>
    </span>
  );
}

function subtreeHasMatch(node: XmlNode, matches: Set<string>): boolean {
  if (matches.has(node.path + node.name)) return true;
  return node.children.some((c) => subtreeHasMatch(c, matches));
}

function JsonTree({
  value,
  name,
  filter,
  depth,
  isLast,
}: {
  value: unknown;
  name: string | null;
  filter: string;
  depth: number;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(true);
  const q = filter.trim().toLowerCase();
  const selfMatch =
    !q ||
    (name != null && name.toLowerCase().includes(q)) ||
    (value !== null && typeof value !== 'object' && String(value).toLowerCase().includes(q));
  const comma = isLast ? '' : ',';
  const rowPad = { paddingLeft: `${depth * 2}ch` };

  if (value !== null && typeof value === 'object') {
    const isArray = Array.isArray(value);
    const entries = isArray
      ? value.map((v, i) => [String(i), v] as const)
      : Object.entries(value as Record<string, unknown>);
    const childMatch = q ? entries.some(([k, v]) => jsonSubtreeMatches(k, v, q)) : true;
    if (q && !selfMatch && !childMatch) return null;

    const openBracket = isArray ? '[' : '{';
    const closeBracket = isArray ? ']' : '}';

    if (entries.length === 0) {
      return (
        <div style={rowPad} className="flex items-baseline px-1.5 py-[3px] hover:bg-ink-raised">
          <span className="mr-1.5 w-3 shrink-0" />
          <JsonKey name={name} />
          <span className="text-muted-dark">
            {openBracket}
            {closeBracket}
            {comma}
          </span>
        </div>
      );
    }

    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-baseline px-1.5 py-[3px] text-left hover:bg-ink-raised"
          style={rowPad}
        >
          <span className="mr-1.5 w-3 shrink-0 text-muted-dark">{open ? '▾' : '▸'}</span>
          <JsonKey name={name} />
          <span className="text-muted-dark">{openBracket}</span>
          {!open && (
            <span className="text-muted-dark">
              {' … '}
              {closeBracket}
              {comma}
            </span>
          )}
        </button>
        {open &&
          entries.map(([k, v], i) => (
            <JsonTree
              key={k}
              value={v}
              name={isArray ? null : k}
              filter={filter}
              depth={depth + 1}
              isLast={i === entries.length - 1}
            />
          ))}
        {open && (
          <div style={rowPad} className="flex items-baseline px-1.5 py-[3px]">
            <span className="mr-1.5 w-3 shrink-0" />
            <span className="text-muted-dark">
              {closeBracket}
              {comma}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (q && !selfMatch) return null;

  return (
    <div style={rowPad} className="flex items-baseline px-1.5 py-[3px] hover:bg-ink-raised">
      <span className="mr-1.5 w-3 shrink-0" />
      <JsonKey name={name} />
      <JsonPrimitive value={value} />
      {comma ? <span className="text-muted-dark">{comma}</span> : null}
    </div>
  );
}

function JsonKey({ name }: { name: string | null }) {
  if (name == null) return null;
  return (
    <>
      <span className="text-[#9ecbff]">{JSON.stringify(name)}</span>
      <span className="text-muted-dark">: </span>
    </>
  );
}

function JsonPrimitive({ value }: { value: unknown }) {
  if (typeof value === 'string') return <span className="text-jade">{JSON.stringify(value)}</span>;
  if (value === null) return <span className="text-ochre">null</span>;
  if (typeof value === 'boolean') return <span className="text-ochre">{String(value)}</span>;
  return <span className="text-[#dfe5ee]">{String(value)}</span>;
}

function jsonSubtreeMatches(name: string, value: unknown, q: string): boolean {
  if (name.toLowerCase().includes(q) || String(value).toLowerCase().includes(q)) return true;
  if (value && typeof value === 'object') {
    const entries = Array.isArray(value)
      ? value.map((v, i) => [String(i), v] as const)
      : Object.entries(value as Record<string, unknown>);
    return entries.some(([k, v]) => jsonSubtreeMatches(k, v, q));
  }
  return false;
}

function safeJson(content: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(content) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

function ValidationReport({ result }: { result: ValidationResult }) {
  return (
    <div className="space-y-3">
      <p className={result.errors.length === 0 ? 'text-jade' : 'text-vermillion'}>
        {result.errors.length === 0 ? 'Structural checks passed.' : `${result.errors.length} issue(s).`}
      </p>
      {result.messageShort && <p className="text-muted-dark">Detected {result.messageShort}</p>}
      {[...result.errors, ...result.warnings].map((issue, i) => (
        <div key={`${issue.path}-${i}`} className="border border-ink-line px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-dark">{issue.rule}</p>
          <p className="mt-1 text-[#dfe5ee]">{issue.message}</p>
          <p className="mt-1 font-mono text-[11px] text-muted-dark">{issue.path}</p>
        </div>
      ))}
    </div>
  );
}
