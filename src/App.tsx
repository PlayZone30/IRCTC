import { Route, Routes } from 'react-router-dom';
import { routeDefs, PlaceholderFor } from '@/routes';

function App() {
  return (
    <Routes>
      {routeDefs.map((r) => (
        <Route key={r.path} path={r.path} element={<PlaceholderFor title={r.title} />} />
      ))}
    </Routes>
  );
}

export default App;
