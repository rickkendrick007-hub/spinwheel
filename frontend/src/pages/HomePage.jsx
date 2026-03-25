import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-electric/20 bg-electric/10 px-4 py-2 text-sm text-electric">
          Coinexx-inspired dark fintech UI
        </div>
        <div>
          <h2 className="max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">
            Secure one-time spin links with a premium reward experience.
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Generate one-time-use wheel links, lock each session to a fingerprinted claim, and manage prizes from a sleek admin dashboard designed for desktop and mobile.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/login" className="rounded-full bg-gradient-to-r from-electric to-cyan-400 px-6 py-3 font-semibold text-slate-950 shadow-glow">
            Open Admin Panel
          </Link>
          <a href="https://coinexx.com" target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-6 py-3 font-semibold text-white hover:border-gold/50">
            View UI Inspiration
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['One-time claims', 'Immediate token claiming prevents reuse on refresh or new devices.'],
            ['Admin logging', 'Track creation, claim, and winner timestamps from one dashboard.'],
            ['Capture & share', 'Download or share screenshot-ready result cards from mobile or desktop.']
          ].map(([title, text]) => (
            <div key={title} className="metric-card">
              <p className="text-sm uppercase tracking-[0.28em] text-electric/70">Feature</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </motion.section>
      <motion.section initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="metric-card relative overflow-hidden rounded-[32px] p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(44,182,255,.22),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(245,193,91,.16),transparent_28%)]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/80">System Highlights</p>
          <div className="mt-6 grid gap-4">
            {[
              { label: 'Security logic', value: 'Fingerprint + in-memory grant + atomic backend validation' },
              { label: 'Frontend', value: 'React, Tailwind, Framer Motion, html2canvas' },
              { label: 'Backend', value: 'Express, MongoDB, JWT admin auth, CSV logs' },
              { label: 'Deploy target', value: 'Netlify frontend + Render backend + MongoDB Atlas' }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-base font-medium text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
