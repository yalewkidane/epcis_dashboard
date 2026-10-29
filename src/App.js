import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { allRoutes } from './routes/appRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {allRoutes.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} index={r.path === '/'} />
          ))}
          {/* old dashboard URLs */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/traceability/graph" element={<Navigate to="/traceability" replace />} />
          <Route path="/traceability/timeLine" element={<Navigate to="/traceability" replace />} />
          <Route path="/dashboard/*" element={<Navigate to="/epcis" replace />} />
          <Route path="/api/*" element={<Navigate to="/console/capture" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
