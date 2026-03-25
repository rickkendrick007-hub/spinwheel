import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import LoadingState from '../components/LoadingState';

const initialOffer = { title: '', subtitle: '', color: '#d9a34b', weight: 1, active: true };

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function statusClass(status) {
  if (status === 'used') return 'text-emerald-300 border-emerald-400/20 bg-emerald-400/10';
  if (status === 'claimed') return 'text-amber-200 border-gold/20 bg-gold/10';
  return 'text-stone-200 border-white/10 bg-white/[0.04]';
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('spin_admin_token');
  const profile = JSON.parse(localStorage.getItem('spin_admin_profile') || 'null');
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [links, setLinks] = useState([]);
  const [offerForm, setOfferForm] = useState(initialOffer);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    async function load() {
      try {
        const [offersData, linksData] = await Promise.all([api.getOffers(token), api.getLinks(token)]);
        setOffers(offersData.offers);
        setLinks(linksData.links);
      } catch (error) {
        localStorage.removeItem('spin_admin_token');
        localStorage.removeItem('spin_admin_profile');
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate, token]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const summary = useMemo(() => {
    const used = links.filter((item) => item.status === 'used').length;
    const claimed = links.filter((item) => item.status === 'claimed').length;
    return {
      offers: offers.length,
      links: links.length,
      used,
      claimed
    };
  }, [offers, links]);

  async function refreshData() {
    const [offersData, linksData] = await Promise.all([api.getOffers(token), api.getLinks(token)]);
    setOffers(offersData.offers);
    setLinks(linksData.links);
  }

  async function handleOfferSubmit(event) {
    event.preventDefault();
    if (!offerForm.title.trim()) return;

    if (editingOfferId) {
      await api.updateOffer(token, editingOfferId, { ...offerForm, weight: Number(offerForm.weight) });
      setToast('Offer updated.');
    } else {
      await api.createOffer(token, { ...offerForm, weight: Number(offerForm.weight) });
      setToast('Offer created.');
    }

    setOfferForm(initialOffer);
    setEditingOfferId(null);
    await refreshData();
  }

  async function handleDeleteOffer(id) {
    if (!window.confirm('Delete this offer?')) return;
    await api.deleteOffer(token, id);
    setToast('Offer deleted.');
    await refreshData();
  }

  async function handleGenerateLinks(event) {
    event.preventDefault();
    if (!selectedOffers.length) {
      setToast('Select at least one offer first.');
      return;
    }
    await api.createLinks(token, { offerIds: selectedOffers, quantity: Number(quantity) || 1 });
    setToast('Spin links generated.');
    await refreshData();
  }

  async function handleExport() {
    const blob = await api.exportLinks(token);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'spin-link-logs.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function startEdit(offer) {
    setEditingOfferId(offer._id);
    setOfferForm({
      title: offer.title,
      subtitle: offer.subtitle,
      color: offer.color,
      weight: offer.weight,
      active: offer.active
    });
  }

  function toggleSelection(offerId) {
    setSelectedOffers((current) =>
      current.includes(offerId) ? current.filter((id) => id !== offerId) : [...current, offerId]
    );
  }

  function logout() {
    localStorage.removeItem('spin_admin_token');
    localStorage.removeItem('spin_admin_profile');
    navigate('/admin/login');
  }

  if (loading) {
    return <LoadingState title="Loading admin workspace…" subtitle="Fetching offers, links, and usage metrics." />;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Offers', summary.offers],
          ['Total links', summary.links],
          ['Used links', summary.used],
          ['Claimed / locked', summary.claimed]
        ].map(([label, value]) => (
          <div key={label} className="metric-card rounded-[28px] p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-gold/70">{label}</p>
            <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="metric-card rounded-[32px] p-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold/80">Authenticated</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Welcome, {profile?.name || 'Admin'}</h2>
              <p className="mt-2 text-stone-300">Manage offers and generate protected one-time-use links.</p>
            </div>
            <button onClick={logout} className="rounded-full border border-white/10 px-4 py-2 text-sm text-stone-300 hover:border-gold/20 hover:text-white">
              Logout
            </button>
          </div>

          <form onSubmit={handleOfferSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">Offer title</label>
              <input
                value={offerForm.title}
                onChange={(e) => setOfferForm((current) => ({ ...current, title: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white focus:border-gold/30"
                placeholder="50% Deposit Bonus"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">Description</label>
              <textarea
                value={offerForm.subtitle}
                onChange={(e) => setOfferForm((current) => ({ ...current, subtitle: e.target.value }))}
                className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white focus:border-gold/30"
                placeholder="Short description shown in the wheel result"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-300">Color</span>
                <input type="color" value={offerForm.color} onChange={(e) => setOfferForm((current) => ({ ...current, color: e.target.value }))} className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-stone-300">Weight</span>
                <input type="number" min="0.1" step="0.1" value={offerForm.weight} onChange={(e) => setOfferForm((current) => ({ ...current, weight: e.target.value }))} className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-white" />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-stone-200">
                <input type="checkbox" checked={offerForm.active} onChange={(e) => setOfferForm((current) => ({ ...current, active: e.target.checked }))} />
                Active offer
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-gradient-to-r from-electric via-[#8aa255] to-gold px-5 py-3 font-semibold text-slate-950 shadow-gold">
                {editingOfferId ? 'Update Offer' : 'Add Offer'}
              </button>
              {editingOfferId ? (
                <button type="button" onClick={() => { setEditingOfferId(null); setOfferForm(initialOffer); }} className="rounded-full border border-white/10 px-5 py-3 font-semibold text-white">
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="metric-card rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold/80">Offer library</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Current offers</h2>
            </div>
          </div>
          <div className="space-y-3">
            {offers.length ? (
              offers.map((offer) => (
                <div key={offer._id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 h-4 w-4 rounded-full" style={{ backgroundColor: offer.color }} />
                      <div>
                        <h3 className="font-semibold text-white">{offer.title}</h3>
                        <p className="mt-1 text-sm text-stone-300">{offer.subtitle || '—'}</p>
                        <p className="mt-3 text-xs uppercase tracking-[0.24em] text-stone-500">Weight {offer.weight} · {offer.active ? 'Active' : 'Inactive'}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => toggleSelection(offer._id)} className={`rounded-full px-4 py-2 text-sm font-medium ${selectedOffers.includes(offer._id) ? 'bg-gold text-slate-950' : 'border border-white/10 text-white'}`}>
                        {selectedOffers.includes(offer._id) ? 'Selected' : 'Select'}
                      </button>
                      <button onClick={() => startEdit(offer)} className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteOffer(offer._id)} className="rounded-full border border-red-400/25 px-4 py-2 text-sm font-medium text-red-200">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-stone-400">No offers created yet.</div>
            )}
          </div>
        </motion.div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="metric-card rounded-[32px] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/80">Link generation</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Create one-time spin links</h2>
          <form onSubmit={handleGenerateLinks} className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-sm text-stone-300">Selected offers</p>
              <p className="mt-2 text-lg font-semibold text-white">{selectedOffers.length} linked prize(s)</p>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-300">Quantity</span>
              <input type="number" min="1" max="100" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-white" />
            </label>
            <button className="w-full rounded-full bg-gradient-to-r from-gold to-[#e2ba73] px-5 py-3 font-semibold text-slate-950 shadow-gold">
              Generate Links
            </button>
            {/* <button type="button" onClick={handleExport} className="w-full rounded-full border border-white/10 px-5 py-3 font-semibold text-white hover:border-gold/25">
              Export Usage Logs (CSV)
            </button> */}
          </form>
        </div>

        <div className="metric-card rounded-[32px] p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold/80">Generated links</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Usage log</h2>
            </div>
            <p className="text-sm text-stone-400">Track unused, claimed, and used links with timestamps.</p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <div className="max-h-[620px] overflow-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/[0.03] text-stone-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Link</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">Used</th>
                    <th className="px-4 py-3 font-medium">Winner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {links.map((link) => (
                    <tr key={link._id} className="bg-black/10 align-top">
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${statusClass(link.status)}`}>
                          {link.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <a href={link.publicUrl} target="_blank" rel="noreferrer" className="line-clamp-2 text-gold hover:text-[#e2ba73]">
                          {link.publicUrl}
                        </a>
                        <p className="mt-2 text-xs text-stone-500">Token: {link.token.slice(0, 10)}…</p>
                      </td>
                      <td className="px-4 py-4 text-stone-300">{formatDate(link.createdAt)}</td>
                      <td className="px-4 py-4 text-stone-300">{formatDate(link.usedAt || link.claimedAt)}</td>
                      <td className="px-4 py-4 text-stone-300">{link.result?.title || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {toast ? <div className="fixed bottom-6 right-6 rounded-full border border-white/10 bg-[#0b0908]/95 px-5 py-3 text-sm text-white shadow-glow">{toast}</div> : null}
    </div>
  );
}
