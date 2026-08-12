import { parseMessageId } from '@/lib/messageId';
import { AREA_LABELS } from '@/data/iso20022';

interface Props {
  id: string;
  size?: 'sm' | 'lg';
}

/**
 * An ISO 20022 identifier is four independent facts jammed into one string,
 * and treating it as opaque text is how people end up sending v08 payloads to
 * a v09 endpoint. The plate pulls it apart and labels each cell.
 */
export function MessageIdPlate({ id, size = 'lg' }: Props) {
  const parts = parseMessageId(id);

  if (!parts.valid) {
    return (
      <div className="inline-flex items-center gap-2 border border-vermillion bg-vermillion-soft px-3 py-2">
        <span className="font-mono text-sm text-vermillion">{id || 'empty'}</span>
        <span className="eyebrow text-vermillion">not an ISO 20022 id</span>
      </div>
    );
  }

  const cells = [
    { value: parts.area, label: 'area' },
    { value: parts.identifier, label: 'message' },
  ];
  if (parts.variant) cells.push({ value: parts.variant, label: 'variant' });
  if (parts.version) cells.push({ value: parts.version, label: 'version' });

  const valueSize = size === 'lg' ? 'id-plate-value' : 'font-mono text-base leading-none font-medium tnum';
  const pad = size === 'lg' ? '' : 'px-2 py-1.5';

  return (
    <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
      <div className="id-plate">
        {cells.map((cell) => (
          <div key={cell.label} className={`id-plate-cell ${pad}`}>
            <span className={valueSize}>{cell.value}</span>
            <span className="id-plate-label">{cell.label}</span>
          </div>
        ))}
      </div>
      {size === 'lg' && (
        <p className="pb-1 text-sm text-muted">
          {AREA_LABELS[parts.area] ?? 'Unknown business area'}
        </p>
      )}
    </div>
  );
}
