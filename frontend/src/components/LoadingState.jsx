import { motion } from 'framer-motion';

export default function LoadingState({ title = 'Validating secure spin link…', subtitle = 'Binding your session to this one-time token.' }) {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-xl items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="metric-card w-full rounded-[28px] p-10 text-center">
        <div className="mx-auto mb-6 h-20 w-20 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-3 text-stone-300">{subtitle}</p>
      </motion.div>
    </div>
  );
}
