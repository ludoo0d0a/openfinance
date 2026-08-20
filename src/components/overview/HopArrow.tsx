import { ArrowRight } from 'lucide-react';

export function HopArrow({ label }: { label: string }) {
  return (
    <div className="flex w-12 shrink-0 flex-col items-center justify-center gap-1 self-center sm:w-14">
      <ArrowRight size={16} className="text-ink" aria-hidden />
      <span className="font-mono text-[9px] text-violet">{label}</span>
    </div>
  );
}
