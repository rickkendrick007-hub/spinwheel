import { Router } from 'express';
import { Offer } from '../models/Offer.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(requireAdmin);

router.get('/', async (req, res) => {
  const offers = await Offer.find().sort({ createdAt: -1 }).lean();
  res.json({ offers });
});

router.post('/', async (req, res) => {
  const { title, subtitle, color, weight, active } = req.body || {};
  const offer = await Offer.create({ title, subtitle, color, weight, active });
  res.status(201).json({ offer });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const offer = await Offer.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!offer) {
    return res.status(404).json({ message: 'Offer not found' });
  }
  res.json({ offer });
});

router.delete('/:id', async (req, res) => {
  const deleted = await Offer.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Offer not found' });
  }
  res.json({ success: true });
});

export default router;
