export function RoleRow({ iso, isoTag, plain }: { iso: string; isoTag: string; plain: string }) {
  return (
    <li className="flex gap-3 border border-rule-soft px-3 py-2.5">
      <span className="w-12 shrink-0 font-mono text-[11px] text-violet">{isoTag}</span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold">{iso}</p>
        <p className="mt-0.5 text-[12px] leading-snug text-muted">{plain}</p>
      </div>
    </li>
  );
}
