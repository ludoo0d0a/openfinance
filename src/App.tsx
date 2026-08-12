import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { HomeView } from '@/views/HomeView';
import { StandardView } from '@/views/StandardView';
import { FlowView } from '@/views/FlowView';
import { MessageView } from '@/views/MessageView';
import { CodesView } from '@/views/CodesView';
import { SampleView } from '@/views/SampleView';
import { MapView } from '@/views/MapView';
import { TryEditorView } from '@/views/TryEditorView';
import { NotFoundView } from '@/views/NotFoundView';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomeView />} />
        <Route path="map" element={<MapView />} />
        <Route path="try" element={<TryEditorView />} />
        <Route path="standards/:standardId" element={<StandardView />} />
        <Route path="flows/:flowId" element={<FlowView />} />
        <Route path="messages/:short" element={<MessageView />} />
        <Route path="samples/:sampleId" element={<SampleView />} />
        <Route path="codes" element={<CodesView />} />
        <Route path="standards" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundView />} />
      </Route>
    </Routes>
  );
}
