import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  Building2,
  Clock,
  Coins,
  FileCode2,
  Hash,
  MessageSquareText,
  Network,
  UserRound,
  Zap,
} from 'lucide-react';
import type { DateOnlyPreset, DateTimePreset } from '@/lib/relativeDates';

export const SECTION_ICONS: Record<string, LucideIcon> = {
  money: Coins,
  ids: Hash,
  debtor: UserRound,
  creditor: Building2,
  remittance: MessageSquareText,
  timing: Clock,
  clearing: Network,
  document: FileCode2,
  grphdr: Hash,
  pmtid: Hash,
  pmttp: Zap,
  tx: Coins,
  status: BadgeCheck,
};

export const DATE_ONLY_PRESETS: { id: DateOnlyPreset; labelKey: string }[] = [
  { id: 'yesterday', labelKey: 'try.dateYesterday' },
  { id: 'today', labelKey: 'try.dateToday' },
  { id: 'tomorrow', labelKey: 'try.dateTomorrow' },
];

export const DATE_TIME_PRESETS: { id: DateTimePreset; labelKey: string }[] = [
  { id: 'now', labelKey: 'try.dateNow' },
  { id: 'minus1h', labelKey: 'try.dateMinus1h' },
  { id: 'plus1h', labelKey: 'try.datePlus1h' },
  { id: 'minus1d', labelKey: 'try.dateMinus1d' },
  { id: 'plus1d', labelKey: 'try.datePlus1d' },
  { id: 'startToday', labelKey: 'try.dateStartToday' },
  { id: 'noonToday', labelKey: 'try.dateNoonToday' },
];
