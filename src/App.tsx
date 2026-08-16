import { Navigate, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { HomeView } from '@/views/HomeView';
import { StandardView } from '@/views/StandardView';
import { FlowView } from '@/views/FlowView';
import { MessageView } from '@/views/MessageView';
import { SampleView } from '@/views/SampleView';
import { MapView } from '@/views/MapView';
import { TryEditorView } from '@/views/TryEditorView';
import { GlossaryView } from '@/views/GlossaryView';
import { AboutView } from '@/views/AboutView';
import { NotFoundView } from '@/views/NotFoundView';
import { PaymentExplorerView } from '@/views/PaymentExplorerView';
import { SchemeView } from '@/views/SchemeView';
import { InfrastructureView } from '@/views/InfrastructureView';
import { VersionCompareView } from '@/views/VersionCompareView';
import { DebugQuizView } from '@/views/DebugQuizView';
import { codeByValue } from '@/data/glossary';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomeView />} />
        <Route path="payment/:paymentId" element={<PaymentExplorerView />} />
        <Route path="scheme/:schemeId" element={<SchemeView />} />
        <Route path="infrastructure/:infrastructureId" element={<InfrastructureView />} />
        <Route path="compare/:short" element={<VersionCompareView />} />
        <Route path="quiz/debug-reject" element={<DebugQuizView />} />
        <Route path="wero" element={<Navigate to="/payment/wero" replace />} />
        <Route path="message/:slug" element={<MessageAlias />} />
        <Route path="map" element={<MapView />} />
        <Route path="try" element={<TryEditorView />} />
        <Route path="glossary" element={<GlossaryView />} />
        <Route path="about" element={<AboutView />} />
        <Route path="thesaurus" element={<PreserveQuery to="/glossary" />} />
        <Route path="standards/:standardId" element={<StandardView />} />
        <Route path="flows/:flowId" element={<FlowView />} />
        <Route path="messages/:short" element={<MessageView />} />
        <Route path="samples/:sampleId" element={<SampleView />} />
        <Route path="codes" element={<CodesToGlossary />} />
        <Route path="standards" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundView />} />
      </Route>
    </Routes>
  );
}

function MessageAlias() {
  const { slug } = useParams();
  const short = (slug ?? '').replace(/-/g, '.');
  return <Navigate to={`/messages/${short}`} replace />;
}

function PreserveQuery({ to }: { to: string }) {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
}

/** Old registry URLs land on the glossary, filtered to codes. */
function CodesToGlossary() {
  const [params] = useSearchParams();
  const next = new URLSearchParams();
  next.set('category', 'code');
  const family = params.get('family');
  const q = params.get('q');
  if (family) next.set('family', family);
  if (q) {
    next.set('q', q);
    const entry = codeByValue(q);
    if (entry) next.set('id', entry.id);
  }
  return <Navigate to={`/glossary?${next.toString()}`} replace />;
}
