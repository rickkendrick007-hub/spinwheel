import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const ResultCard = forwardRef(function ResultCard({ result }, ref) {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0d0a08] via-panel to-[#080605] p-6 shadow-[0_30px_90px_rgba(0,0,0,.72)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold/80">Winning Offer</p>
          <h3 className="mt-2 text-3xl font-semibold text-white">{result.title}</h3>
        </div>
        <div className="rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-sm font-medium text-gold">Secured</div>
      </div>
      <div className="rounded-3xl border border-white/10 p-5" style={{ background: `linear-gradient(135deg, ${result.color}26, rgba(12,9,7,0.96))` }}>
        <p className="text-lg text-stone-100">{result.subtitle || 'Your reward has been locked and logged successfully.'}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-400">Status</p>
            <p className="mt-2 font-semibold text-white">Completed</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default ResultCard;
