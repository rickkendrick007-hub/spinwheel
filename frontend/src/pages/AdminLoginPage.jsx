import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.login(form);
      localStorage.setItem('spin_admin_token', data.token);
      localStorage.setItem('spin_admin_profile', JSON.stringify(data.admin));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[72vh] max-w-xl items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="metric-card w-full rounded-[32px] p-8 sm:p-10">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/80">Admin access</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Login to dashboard</h2>
          <p className="mt-3 text-stone-300">Direct access to offers, link generation, and usage logs.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-300">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-stone-500 focus:border-gold/30"
              placeholder="admin@example.com"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-stone-300">Password</span>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none placeholder:text-stone-500 focus:border-gold/30"
              placeholder="••••••••"
            />
          </label>
          {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
          <button disabled={loading} className="w-full rounded-full bg-gradient-to-r from-electric via-[#8aa255] to-gold px-5 py-3 font-semibold text-slate-950 shadow-gold">
            {loading ? 'Signing in…' : 'Login to Dashboard'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
