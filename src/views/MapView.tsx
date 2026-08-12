import { InteropGraph } from '@/components/InteropGraph';

export function MapView() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
      <header className="max-w-3xl">
        <p className="eyebrow">Interop map</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Standards, messages and rails</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          A Cytoscape network of how XS2A / Open Banking standards connect to ISO 20022 messages and clearing rails
          (SEPA, SIC, euroSIC, SIC IP, Wero). Use a flow page for ordered swimlanes; use this map for the topology.
        </p>
      </header>

      <div className="mt-8">
        <InteropGraph />
      </div>
    </div>
  );
}
