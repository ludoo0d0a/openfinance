import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Building2,
  FileCode2,
  GitBranch,
  Globe2,
  Landmark,
  Layers,
  Map,
  Network,
  PencilLine,
  Search,
  ShieldCheck,
  UserRound,
  Wallet,
  Waypoints,
  Zap,
} from 'lucide-react';
import type { ActorId } from '@/types';

/** Visual vocabulary for actors — same icons in UI, sequence headers and graph nodes. */
export const ACTOR_ICON: Record<
  ActorId,
  { Icon: LucideIcon; label: string; color: string; bg: string }
> = {
  psu: { Icon: UserRound, label: 'User', color: '#0b8f63', bg: '#d5f0e5' },
  tpp: { Icon: Globe2, label: 'TPP', color: '#b26b00', bg: '#f9ecd4' },
  aspsp: { Icon: Landmark, label: 'Debtor bank', color: '#1f4fd8', bg: '#dde5fb' },
  beneficiary: { Icon: Building2, label: 'Creditor bank', color: '#1f4fd8', bg: '#dde5fb' },
  sca: { Icon: ShieldCheck, label: 'SCA', color: '#b26b00', bg: '#f9ecd4' },
  csm: { Icon: Network, label: 'CSM', color: '#5b45d6', bg: '#e4dffb' },
  rail: { Icon: Waypoints, label: 'Rail', color: '#5b45d6', bg: '#e4dffb' },
  scheme: { Icon: Wallet, label: 'Scheme', color: '#b26b00', bg: '#f9ecd4' },
};

/** Nav / section icons */
export const UI_ICONS = {
  overview: Layers,
  map: Map,
  search: Search,
  flow: GitBranch,
  entities: Waypoints,
  sequence: GitBranch,
  instant: Zap,
  xml: FileCode2,
  standard: Landmark,
  try: PencilLine,
  thesaurus: BookOpen,
} as const;

/**
 * Lucide-like SVG as a data-URI for Cytoscape node backgrounds.
 * Drawn in a padded viewBox so the glyph sits visually centered in the box.
 */
export function actorIconDataUri(actor: ActorId): string {
  // Encode the whole SVG once — do not pre-encode `#` in the stroke or the
  // browser ends up with stroke="%230…" (invisible icon).
  const color = ACTOR_ICON[actor].color;
  const paths: Record<ActorId, string> = {
    psu: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7"/>',
    tpp: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    aspsp: '<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/>',
    beneficiary: '<path d="M6 22V9l6-5 6 5v13M10 22v-5h4v5M9 12h.01M15 12h.01"/>',
    sca: '<path d="M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z"/><path d="m9 12 2 2 4-4"/>',
    csm: '<rect x="9" y="9" width="6" height="6"/><path d="M9 12H4m16 0h-5M12 9V4m0 16v-5"/><circle cx="4" cy="12" r="1.5"/><circle cx="20" cy="12" r="1.5"/><circle cx="12" cy="4" r="1.5"/><circle cx="12" cy="20" r="1.5"/>',
    rail: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 11 15.5 7.2M8.2 13l7.3 3.8"/>',
    scheme: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 0 4H5a2 2 0 0 0 0 4h12a2 2 0 0 0 2-2v-2"/>',
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">${paths[actor]}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
