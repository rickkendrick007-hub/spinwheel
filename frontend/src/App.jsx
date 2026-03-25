import { Navigate, Routes, Route } from 'react-router-dom';
import AppShell from './components/AppShell';
import SpinPage from './pages/SpinPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function RootRedirect() {
  const token = localStorage.getItem('spin_admin_token');
  return <Navigate to={token ? '/admin/dashboard' : '/admin/login'} replace />;
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/spin/:token" element={<SpinPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Routes>
    </AppShell>
  );
}
