import { Columns2, FileCode2 } from 'lucide-react';
import { PayloadInspector } from '@/components/PayloadInspector';
import type { Pacs002Outcome } from '@/lib/pacsBuilder';
import { cn } from '@/lib/cn';
import { ToggleTab } from './ToggleTab';
import type { Translate } from './types';

export type PaneMode = '008' | '002' | 'both';

export function TryEditorPanes({
  display008,
  pacs002,
  outcome,
  rejectReason,
  paneMode,
  setPaneMode,
  selectedPaths,
  onSelectPath,
  onEdit008,
  t,
}: {
  display008: string;
  pacs002: string;
  outcome: Pacs002Outcome;
  rejectReason: string;
  paneMode: PaneMode;
  setPaneMode: (mode: PaneMode) => void;
  selectedPaths: string[];
  onSelectPath: (selector: string) => void;
  onEdit008: (xml: string) => void;
  t: Translate;
}) {
  const show008 = paneMode === '008' || paneMode === 'both';
  const show002 = paneMode === '002' || paneMode === 'both';

  return (
    <div className="flex min-h-[28rem] min-w-0 flex-col gap-3 xl:sticky xl:top-[calc(53px+1rem)] xl:h-[calc(100dvh-53px-2rem)] xl:max-h-[calc(100dvh-53px-2rem)]">
      <div className="flex flex-wrap gap-px" role="group" aria-label={t('try.paneMode')}>
        <ToggleTab active={paneMode === '008'} onClick={() => setPaneMode('008')}>
          <FileCode2 size={12} aria-hidden /> pacs.008
        </ToggleTab>
        <ToggleTab active={paneMode === '002'} onClick={() => setPaneMode('002')}>
          <FileCode2 size={12} aria-hidden /> pacs.002
        </ToggleTab>
        <ToggleTab active={paneMode === 'both'} onClick={() => setPaneMode('both')}>
          <Columns2 size={12} aria-hidden /> {t('try.paneBoth')}
        </ToggleTab>
      </div>

      <div
        className={cn(
          'grid min-h-0 flex-1 gap-3',
          paneMode === 'both' && 'lg:grid-cols-2',
        )}
      >
        {show008 && (
          <div className="min-h-[420px] min-w-0 xl:min-h-0">
            <PayloadInspector
              content={display008}
              format="xml"
              title={t('try.title008')}
              description={t('try.edit008')}
              onContentChange={onEdit008}
              selectedPaths={selectedPaths}
              onSelectPath={onSelectPath}
            />
          </div>
        )}
        {show002 && (
          <div className="min-h-[420px] min-w-0 xl:min-h-0">
            <PayloadInspector
              content={pacs002}
              format="xml"
              title={
                outcome === 'ACSC'
                  ? t('try.title002Ack')
                  : t('try.title002Rjct', { code: rejectReason })
              }
              description={t('try.ack002')}
              selectedPaths={selectedPaths}
              onSelectPath={onSelectPath}
            />
          </div>
        )}
      </div>
    </div>
  );
}
