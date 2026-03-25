import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');
  const isSpin = location.pathname.startsWith('/spin');
  const hasAdminToken = Boolean(localStorage.getItem('spin_admin_token'));

  function handleAdminClick() {
    navigate(hasAdminToken ? '/admin/dashboard' : '/admin/login');
  }

  return (
    <div className="min-h-screen bg-hero text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="glass mb-8 rounded-full px-5 py-4 shadow-glow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link to={hasAdminToken ? '/admin/dashboard' : '/admin/login'} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-electric via-[#8aa255] to-gold text-lg font-black text-slate-950 shadow-gold">
                S
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.34em] text-gold/80">Reward Suite</p>
                <h1 className="text-xl font-semibold text-white">{import.meta.env.VITE_APP_NAME || 'SpinWheel'}</h1>
              </div>
            </Link>
            {!isSpin ? (
              <nav className="flex items-center gap-3 text-sm text-slate-300">
                <button
                  onClick={handleAdminClick}
                  className="rounded-full bg-gradient-to-r from-electric via-[#8aa255] to-gold px-5 py-2.5 font-semibold text-slate-950 shadow-gold"
                >
                  {isAdmin || hasAdminToken ? 'Admin Panel' : 'Admin Login'}
                </button>
              </nav>
            ) : null}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
