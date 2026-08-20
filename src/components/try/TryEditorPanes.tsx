import { FileCode2 } from 'lucide-react';
import { PayloadInspector } from '@/components/PayloadInspector';
import type { Pacs002Outcome } from '@/lib/pacsBuilder';
import { cn } from '@/lib/cn';
import { ToggleTab } from './ToggleTab';
import type { Translate } from './types';

export function TryEditorPanes({
  display008,
  pacs002,
  outcome,
  rejectReason,
  activePane,
  setActivePane,
  selectedPaths,
  onSelectPath,
  onEdit008,
  t,
}: {
  display008: string;
  pacs002: string;
  outcome: Pacs002Outcome;
  rejectReason: string;
  activePane: '008' | '002';
  setActivePane: (pane: '008' | '002') => void;
  selectedPaths: string[];
  onSelectPath: (selector: string) => void;
  onEdit008: (xml: string) => void;
  t: Translate;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-3">
      <div className="flex flex-wrap gap-px lg:hidden">
        <ToggleTab active={activePane === '008'} onClick={() => setActivePane('008')}>
          <FileCode2 size={12} aria-hidden /> pacs.008
        </ToggleTab>
        <ToggleTab active={activePane === '002'} onClick={() => setActivePane('002')}>
          <FileCode2 size={12} aria-hidden /> pacs.002
        </ToggleTab>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
        <div className={cn('min-h-[420px] lg:min-h-0', activePane !== '008' && 'hidden lg:block')}>
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
        <div className={cn('min-h-[420px] lg:min-h-0', activePane !== '002' && 'hidden lg:block')}>
          <PayloadInspector
            content={pacs002}
            format="xml"
            title={
              outcome === 'ACSC' ? t('try.title002Ack') : t('try.title002Rjct', { code: rejectReason })
            }
            description={t('try.ack002')}
            selectedPaths={selectedPaths}
            onSelectPath={onSelectPath}
          />
        </div>
      </div>
    </div>
  );
}
