import { Suspense, lazy, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { HomeView } from '@/views/HomeView';
import { StandardView } from '@/views/StandardView';
import { FlowView } from '@/views/FlowView';
import { MessageView } from '@/views/MessageView';
import { SampleView } from '@/views/SampleView';
import { GlossaryView } from '@/views/GlossaryView';
import { AboutView } from '@/views/AboutView';
import { ContactView, PrivacyView } from '@/views/LegalView';
import { NotFoundView } from '@/views/NotFoundView';
import { PaymentExplorerView } from '@/views/PaymentExplorerView';
import { InfrastructureView } from '@/views/InfrastructureView';
import { VersionCompareView } from '@/views/VersionCompareView';
import { DebugQuizView } from '@/views/DebugQuizView';
import { codeByValue } from '@/data/glossary';
import { schemeById, schemeHref } from '@/data/schemes';

/** Cytoscape / live player stay client-only so catalog prerender never loads them. */
const MapView = lazy(() => import('@/views/MapView').then((m) => ({ default: m.MapView })));
const TryEditorView = lazy(() =>
  import('@/views/TryEditorView').then((m) => ({ default: m.TryEditorView })),
);
const LiveView = lazy(() => import('@/views/LiveView').then((m) => ({ default: m.LiveView })));

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="page-fluid text-muted">Loading…</div>}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomeView />} />
        <Route path="payment/:paymentId" element={<PaymentExplorerView />} />
        <Route path="scheme/:schemeId" element={<SchemeToGlossary />} />
        <Route path="infrastructure/:infrastructureId" element={<InfrastructureView />} />
        <Route path="compare/:short" element={<VersionCompareView />} />
        <Route path="quiz/debug-reject" element={<DebugQuizView />} />
        <Route path="wero" element={<Navigate to="/payment/wero" replace />} />
        <Route path="message/:slug" element={<MessageAlias />} />
        <Route
          path="map"
          element={
            <LazyPage>
              <MapView />
            </LazyPage>
          }
        />
        <Route
          path="try"
          element={
            <LazyPage>
              <TryEditorView />
            </LazyPage>
          }
        />
        <Route
          path="live"
          element={
            <LazyPage>
              <LiveView />
            </LazyPage>
          }
        />
        <Route
          path="live/:sceneId"
          element={
            <LazyPage>
              <LiveView />
            </LazyPage>
          }
        />
        <Route
          path="live/:sceneId/:scenarioId"
          element={
            <LazyPage>
              <LiveView />
            </LazyPage>
          }
        />
        <Route path="glossary" element={<GlossaryView />} />
        <Route path="about" element={<AboutView />} />
        <Route path="privacy" element={<PrivacyView />} />
        <Route path="contact" element={<ContactView />} />
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

/** Legacy scheme pages live in the glossary now. */
function SchemeToGlossary() {
  const { schemeId } = useParams();
  if (!schemeId || !schemeById(schemeId)) {
    return <Navigate to="/glossary?category=scheme" replace />;
  }
  return <Navigate to={schemeHref(schemeId)} replace />;
}
