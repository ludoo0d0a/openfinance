import { useState } from 'react';
import { Building2, Landmark, Network, UserRound, Zap, Clock } from 'lucide-react';
import { ActorBox } from '@/components/overview/ActorBox';
import { ConceptCard } from '@/components/overview/ConceptCard';
import { HopArrow } from '@/components/overview/HopArrow';
import { RoleRow } from '@/components/overview/RoleRow';
import { JargonText } from '@/components/JargonText';
import { cn } from '@/lib/cn';
import { useT } from '@/i18n';

type OverviewMode = 'regular' | 'instant' | 'sdd';

const MODES: OverviewMode[] = ['regular', 'instant', 'sdd'];

export function PaymentSystemOverview() {
  const t = useT();
  const [mode, setMode] = useState<OverviewMode>('regular');

  const isSdd = mode === 'sdd';
  const isInstant = mode === 'instant';

  const leftParty = {
    title: isSdd ? t('home.overview.partyCreditor') : t('home.overview.partyPayer'),
    roleIso: isSdd ? t('home.overview.roleCreditor') : t('home.overview.roleDebtor'),
    roleInit: t('home.overview.roleOriginator'),
    Icon: UserRound,
  };
  const leftBank = {
    title: isSdd ? t('home.overview.bankCreditor') : t('home.overview.bankDebtor'),
    sub: isSdd ? 'CdtrAgt' : 'DbtrAgt',
    Icon: Landmark,
  };
  const rightBank = {
    title: isSdd ? t('home.overview.bankDebtor') : t('home.overview.bankCreditor'),
    sub: isSdd ? 'DbtrAgt' : 'CdtrAgt',
    Icon: Landmark,
  };
  const rightParty = {
    title: isSdd ? t('home.overview.partyPayer') : t('home.overview.partyBene'),
    roleIso: isSdd ? t('home.overview.roleDebtor') : t('home.overview.roleCreditor'),
    roleInit: isSdd ? t('home.overview.rolePayer') : t('home.overview.roleBeneficiary'),
    Icon: Building2,
  };

  const csmName = isInstant
    ? t('home.overview.csmInstant')
    : isSdd
      ? t('home.overview.csmBatch')
      : t('home.overview.csmBatch');
  const csmSla = isInstant ? t('home.overview.slaInstant') : t('home.overview.slaRegular');
  const msgChain = isSdd
    ? t('home.overview.msgsSdd')
    : isInstant
      ? t('home.overview.msgsInstant')
      : t('home.overview.msgsRegular');

  const hopInit = isSdd ? 'pain.008' : 'pain.001';
  const hopClear = isSdd ? 'pacs.003' : 'pacs.008';
  const hopCredit = isInstant ? '≤10s' : isSdd ? 'debit' : 'credit';

  return (
    <section className="mt-12 border border-ink bg-surface">
      <div className="border-b border-rule px-4 py-4 sm:px-5">
        <p className="eyebrow">{t('home.overview.eyebrow')}</p>
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{t('home.overview.title')}</h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
          <JargonText text={t('home.overview.lead')} />
        </p>
      </div>

      <div className="grid gap-px border-b border-rule bg-rule sm:grid-cols-3">
        <ConceptCard
          title={t('home.overview.schemeTitle')}
          body={t('home.overview.schemeBody')}
          links={[
            { to: '/scheme/sct', label: 'SCT' },
            { to: '/scheme/sct-inst', label: 'SCT Inst' },
            { to: '/scheme/sdd', label: 'SDD' },
          ]}
        />
        <ConceptCard
          title={t('home.overview.csmTitle')}
          body={t('home.overview.csmBody')}
          links={[
            { to: '/infrastructure/step2', label: 'STEP2' },
            { to: '/infrastructure/tips', label: 'TIPS' },
            { to: '/infrastructure/rt1', label: 'RT1' },
          ]}
          accent="violet"
        />
        <ConceptCard
          title={t('home.overview.vsTitle')}
          body={t('home.overview.vsBody')}
          links={[
            { to: '/payment/sepa-credit-transfer', label: t('home.overview.linkRegular') },
            { to: '/payment/sepa-instant', label: t('home.overview.linkInstant') },
          ]}
          accent="jade"
        />
      </div>

      <div className="border-b border-rule px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">{t('home.overview.diagramEyebrow')}</p>
            <p className="mt-1 text-[14px] text-muted">{t('home.overview.diagramHint')}</p>
          </div>
          <div
            role="tablist"
            aria-label={t('home.overview.modeLabel')}
            className="flex flex-wrap border border-rule"
          >
            {MODES.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={mode === id}
                onClick={() => setMode(id)}
                className={cn(
                  'px-3 py-1.5 font-mono text-[12px] uppercase tracking-wide',
                  mode === id ? 'bg-ink text-white' : 'bg-surface text-muted hover:text-ink',
                )}
              >
                {t(`home.overview.mode.${id}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <div className="flex min-w-[720px] items-stretch gap-2">
            <ActorBox
              Icon={leftParty.Icon}
              title={leftParty.title}
              lines={[leftParty.roleIso, leftParty.roleInit]}
              tone="jade"
            />
            <HopArrow label={hopInit} />
            <ActorBox Icon={leftBank.Icon} title={leftBank.title} lines={[leftBank.sub]} tone="signal" />
            <HopArrow label={hopClear} />
            <ActorBox
              Icon={Network}
              title={t('home.overview.csmNode')}
              lines={[csmName, csmSla]}
              tone="violet"
              highlight
            />
            <HopArrow label={hopClear} />
            <ActorBox Icon={rightBank.Icon} title={rightBank.title} lines={[rightBank.sub]} tone="signal" />
            <HopArrow label={hopCredit} />
            <ActorBox
              Icon={rightParty.Icon}
              title={rightParty.title}
              lines={[rightParty.roleIso, rightParty.roleInit]}
              tone="jade"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border border-rule-soft bg-paper-raised px-3 py-2.5">
          {isInstant ? (
            <Zap size={14} className="text-jade" aria-hidden />
          ) : (
            <Clock size={14} className="text-ochre" aria-hidden />
          )}
          <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-muted">
            <JargonText text={t(`home.overview.modeLead.${mode}`)} />
          </p>
          <p className="font-mono text-[11px] text-violet">{msgChain}</p>
        </div>
      </div>

      <div className="grid gap-px bg-rule lg:grid-cols-2">
        <div className="bg-surface px-4 py-5 sm:px-5">
          <p className="eyebrow">{t('home.overview.rolesEyebrow')}</p>
          <h3 className="mt-2 text-lg font-semibold">{t('home.overview.rolesTitle')}</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            <JargonText text={t('home.overview.rolesLead')} />
          </p>
          <ul className="mt-4 space-y-3">
            <RoleRow
              iso={t('home.overview.roleDebtor')}
              isoTag="Dbtr"
              plain={t('home.overview.roleDebtorPlain')}
            />
            <RoleRow
              iso={t('home.overview.roleCreditor')}
              isoTag="Cdtr"
              plain={t('home.overview.roleCreditorPlain')}
            />
            <RoleRow
              iso={t('home.overview.roleOriginator')}
              isoTag="Orig"
              plain={t('home.overview.roleOriginatorPlain')}
            />
            <RoleRow
              iso={t('home.overview.roleBeneficiary')}
              isoTag="Bene"
              plain={t('home.overview.roleBeneficiaryPlain')}
            />
          </ul>
        </div>
        <div className="bg-surface px-4 py-5 sm:px-5">
          <p className="eyebrow">{t('home.overview.mapEyebrow')}</p>
          <h3 className="mt-2 text-lg font-semibold">{t('home.overview.mapTitle')}</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            <JargonText text={t('home.overview.mapLead')} />
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-rule font-mono text-[10px] uppercase tracking-widest text-muted">
                  <th className="py-2 pr-3 font-medium">{t('home.overview.colPayment')}</th>
                  <th className="py-2 pr-3 font-medium">{t('home.overview.colDebit')}</th>
                  <th className="py-2 pr-3 font-medium">{t('home.overview.colCredit')}</th>
                  <th className="py-2 font-medium">{t('home.overview.colStarts')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-rule-soft">
                  <td className="py-2.5 pr-3 font-medium">{t('home.overview.mode.regular')}</td>
                  <td className="py-2.5 pr-3 text-muted">{t('home.overview.mapSctDebit')}</td>
                  <td className="py-2.5 pr-3 text-muted">{t('home.overview.mapSctCredit')}</td>
                  <td className="py-2.5 text-muted">{t('home.overview.mapSctStarts')}</td>
                </tr>
                <tr className="border-b border-rule-soft">
                  <td className="py-2.5 pr-3 font-medium">{t('home.overview.mode.instant')}</td>
                  <td className="py-2.5 pr-3 text-muted">{t('home.overview.mapSctDebit')}</td>
                  <td className="py-2.5 pr-3 text-muted">{t('home.overview.mapSctCredit')}</td>
                  <td className="py-2.5 text-muted">{t('home.overview.mapSctStarts')}</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-3 font-medium">{t('home.overview.mode.sdd')}</td>
                  <td className="py-2.5 pr-3 text-muted">{t('home.overview.mapSddDebit')}</td>
                  <td className="py-2.5 pr-3 text-muted">{t('home.overview.mapSddCredit')}</td>
                  <td className="py-2.5 text-muted">{t('home.overview.mapSddStarts')}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-muted">
            <JargonText text={t('home.overview.mapFoot')} />
          </p>
        </div>
      </div>
    </section>
  );
}
