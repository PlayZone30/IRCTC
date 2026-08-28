import { Route, Routes } from 'react-router-dom';
import { routeDefs, PlaceholderFor } from '@/routes';
import { AppShell } from '@/components/ui/AppShell';
import { ToastHost } from '@/components/ui/Toast';
import { DevGallery } from '@/screens/DevGallery';
import { Landing } from '@/screens/Landing';
import { Results } from '@/screens/Results';
import { Passengers } from '@/screens/Passengers';
import { Review } from '@/screens/Review';
import { NotFound } from '@/screens/NotFound';

const builtScreens: Partial<Record<(typeof routeDefs)[number]['path'], React.ReactNode>> = {
  '/': <Landing />,
  '/search': <Results />,
  '/book/passengers': <Passengers />,
  '/book/review': <Review />,
};

function App() {
  return (
    <>
      <AppShell>
        <Routes>
          {routeDefs.map((r) => (
            <Route key={r.path} path={r.path} element={builtScreens[r.path] ?? <PlaceholderFor title={r.title} />} />
          ))}
          {/* Dev-only, not part of PLAN.md §4 route map. Remove before shipping. */}
          <Route path="/__gallery" element={<DevGallery />} />
          {/* Catch-all — PLAN.md §0 rule 4: never a dead end. */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell>
      <ToastHost />
    </>
  );
}

export default App;
