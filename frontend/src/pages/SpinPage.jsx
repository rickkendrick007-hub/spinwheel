import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import Wheel from '../components/Wheel';
import LoadingState from '../components/LoadingState';
import ResultCard from '../components/ResultCard';
import { getFingerprint } from '../lib/fingerprint';
import { playSpinSound, playWinSound } from '../lib/audio';
import { captureNode, shareCapture } from '../lib/capture';

function generateRotation(angle) {
  const fullTurns = 360 * (6 + Math.floor(Math.random() * 2));
  return fullTurns + angle;
}

export default function SpinPage() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, invalid: false, offers: [], accessGrant: null, error: '' });
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toast, setToast] = useState('');
  const fingerprintRef = useRef('');
  const resultRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function claim() {
      try {
        const fingerprint = await getFingerprint();
        fingerprintRef.current = fingerprint;
        const data = await api.claimLink({ token, fingerprint });
        if (!active) return;
        setState({ loading: false, invalid: false, offers: data.offers, accessGrant: data.accessGrant, error: '' });
      } catch (error) {
        if (!active) return;
        setState({ loading: false, invalid: true, offers: [], accessGrant: null, error: error.message });
      }
    }

    claim();
    return () => {
      active = false;
    };
  }, [token]);

  const metrics = useMemo(
    () => [
      ['Protection', 'Refresh and device reuse blocked'],
      ['Validation', 'Backend claim + final spin verification'],
      ['Capture', 'Share-ready screenshot export']
    ],
    []
  );

  async function handleSpin() {
    if (spinning || !state.accessGrant) return;
    setSpinning(true);
    playSpinSound(soundEnabled);

    try {
      const data = await api.spin({
        token,
        accessGrant: state.accessGrant,
        fingerprint: fingerprintRef.current
      });
      const targetRotation = generateRotation(data.result.spinAngle);
      setRotation(targetRotation);
      setTimeout(() => {
        setResult(data.result);
        playWinSound(soundEnabled);
        confetti({
          particleCount: 120,
          spread: 72,
          origin: { y: 0.62 },
          colors: ['#d9a34b', '#8aa255', '#8a5a25', '#f0d6a2']
        });
        setSpinning(false);
      }, 6300);
    } catch (error) {
      setToast(error.message);
      setSpinning(false);
    }
  }

  async function handleDownload() {
    if (!resultRef.current) return;
    await captureNode(resultRef.current, `spin-result-${token}.png`);
    setToast('Screenshot downloaded.');
  }

  async function handleShare() {
    if (!resultRef.current) return;
    try {
      await shareCapture(resultRef.current, `spin-result-${token}.png`);
      setToast('Share sheet opened.');
    } catch (error) {
      setToast(error.message);
    }
  }

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  if (state.loading) {
    return <LoadingState />;
  }

  if (state.invalid) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="metric-card rounded-[32px] p-8 text-center sm:p-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-3xl text-red-300">
            ×
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-red-300/80">Access denied</p>
          <h2 className="mt-4 text-3xl font-semibold text-white">Link already used or expired</h2>
          <p className="mx-auto mt-4 max-w-xl text-stone-300">
            This secure spin token has either already been claimed, used, or opened in another session. Generate a fresh link from the admin dashboard to try again.
          </p>
          <p className="mt-5 text-sm text-stone-500">{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
      <section className="space-y-6">
        <div className="metric-card rounded-[30px] p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold/80">Secure reward spin</p>
              <h2 className="mt-2 text-4xl font-semibold text-white">Your offer wheel is ready</h2>
              <p className="mt-3 max-w-2xl text-stone-300">
                This link is locked to the current browser session. Do not refresh the page before spinning.
              </p>
            </div>
            <button
              onClick={() => setSoundEnabled((value) => !value)}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-stone-200 hover:border-gold/25"
            >
              Sound: {soundEnabled ? 'On' : 'Off'}
            </button>
          </div>
          <Wheel offers={state.offers} rotation={rotation} />
          <div className="mt-8 flex justify-center items-center">
            <button
              onClick={handleSpin}
              disabled={spinning || Boolean(result)}
              className="rounded-full bg-gradient-to-r from-electric via-[#8aa255] to-gold px-7 py-3 text-base font-bold text-slate-950 shadow-gold"
            >
              {spinning ? 'Spinning…' : result ? 'Spin Complete' : 'Spin the Wheel'}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="metric-card rounded-[30px] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/70">Offers on this wheel</p>
          <div className="mt-5 grid gap-3">
            {state.offers.map((offer, index) => (
              <div key={`${offer.title}-${index}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: offer.color }} />
                  <div>
                    <p className="font-medium text-white">{offer.title}</p>
                    <p className="text-sm text-stone-400">{offer.subtitle || 'Premium promotional reward'}</p>
                  </div>
                </div>
                <span className="text-xs uppercase tracking-[0.24em] text-stone-500">#{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <ResultCard ref={resultRef} result={result} />
              <div className="flex flex-col gap-3 sm:flex-row">
                <button onClick={handleDownload} className="rounded-full bg-gradient-to-r from-electric via-[#8aa255] to-gold px-5 py-3 font-semibold text-slate-950 shadow-gold">
                  Capture & Download Result
                </button>
                <button onClick={handleShare} className="rounded-full border border-white/10 px-5 py-3 font-semibold text-white hover:border-gold/25">
                  Share Screenshot
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 right-6 z-50 rounded-full border border-white/10 bg-[#0b0908]/95 px-5 py-3 text-sm text-white shadow-glow"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
