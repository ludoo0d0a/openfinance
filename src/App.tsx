import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { HomeView } from '@/views/HomeView';
import { StandardView } from '@/views/StandardView';
import { FlowView } from '@/views/FlowView';
import { MessageView } from '@/views/MessageView';
import { SampleView } from '@/views/SampleView';
import { MapView } from '@/views/MapView';
import { TryEditorView } from '@/views/TryEditorView';
import { ThesaurusView } from '@/views/ThesaurusView';
import { NotFoundView } from '@/views/NotFoundView';
import { codeByValue } from '@/data/thesaurus';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomeView />} />
        <Route path="map" element={<MapView />} />
        <Route path="try" element={<TryEditorView />} />
        <Route path="thesaurus" element={<ThesaurusView />} />
        <Route path="standards/:standardId" element={<StandardView />} />
        <Route path="flows/:flowId" element={<FlowView />} />
        <Route path="messages/:short" element={<MessageView />} />
        <Route path="samples/:sampleId" element={<SampleView />} />
        <Route path="codes" element={<CodesToThesaurus />} />
        <Route path="standards" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundView />} />
      </Route>
    </Routes>
  );
}

/** Old registry URLs land on the thesaurus, filtered to codes. */
function CodesToThesaurus() {
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
  return <Navigate to={`/thesaurus?${next.toString()}`} replace />;
}
