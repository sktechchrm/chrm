import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage   from './auth/login';
import RewardApp   from './pages/RewardApp';
import NotFound    from './pages/notFound';
import WorkerGuidelinePage   from './components/workerGuideline/WorkerGuidelinePage';
import WorkerGuidelineViewer from './components/workerGuideline/WorkerGuidelineViewer';

// ── Route guards ──────────────────────────────────────────────────────────────

/** Blocks unauthenticated access — redirects to 401 page */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <NotFound type="unauthorized" />;
  return <>{children}</>;
};

/** Blocks authenticated users from seeing login again */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// ── Router ────────────────────────────────────────────────────────────────────

const AppRoutes: React.FC = () => (
  <BrowserRouter basename="/rms">
    <Routes>
      <Route path="/"                       element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/dashboard"              element={<ProtectedRoute><RewardApp /></ProtectedRoute>} />
      <Route path="/worker-guide/:factoryId"        element={<WorkerGuidelinePage />} />
      {/* QR-scan route — same Viewer experience, no login required */}
      <Route path="/worker-guide/:factoryId/view"   element={<WorkerGuidelineViewer />} />
      <Route path="*"                       element={<NotFound type="notFound" />} />
    </Routes>
  </BrowserRouter>
);

// ── Root ──────────────────────────────────────────────────────────────────────

const App: React.FC = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;