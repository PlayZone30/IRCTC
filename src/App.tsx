import { Route, Routes } from 'react-router-dom';
import { routeDefs, PlaceholderFor } from '@/routes';
import { AppShell } from '@/components/ui/AppShell';
import { ToastHost } from '@/components/ui/Toast';
import { DevGallery } from '@/screens/DevGallery';

function App() {
  return (
    <>
      <AppShell>
        <Routes>
          {routeDefs.map((r) => (
            <Route key={r.path} path={r.path} element={<PlaceholderFor title={r.title} />} />
          ))}
          {/* Dev-only, not part of PLAN.md §4 route map. Remove before shipping. */}
          <Route path="/__gallery" element={<DevGallery />} />
        </Routes>
      </AppShell>
      <ToastHost />
    </>
  );
}

export default App;
