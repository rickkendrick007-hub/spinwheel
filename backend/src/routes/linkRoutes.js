import { Router } from 'express';
import { SpinLink } from '../models/SpinLink.js';
import { Offer } from '../models/Offer.js';
import { requireAdmin } from '../middleware/auth.js';
import { config } from '../config.js';
import {
  createRandomSecret,
  createSpinToken,
  getClientIp,
  hashValue,
  weightedPick
} from '../utils/security.js';

const router = Router();

router.get('/admin/links', requireAdmin, async (req, res) => {
  const links = await SpinLink.find().sort({ createdAt: -1 }).lean();
  res.json({
    links: links.map((item) => ({
      ...item,
      publicUrl: `${config.clientBaseUrl}/spin/${item.token}`
    }))
  });
});

router.get('/admin/links/export', requireAdmin, async (req, res) => {
  const links = await SpinLink.find().sort({ createdAt: -1 }).lean();
  const lines = [
    ['token', 'status', 'createdAt', 'claimedAt', 'usedAt', 'winner', 'publicUrl'].join(',')
  ];

  links.forEach((item) => {
    const winner = item.result?.title || '';
    const row = [
      item.token,
      item.status,
      item.createdAt || '',
      item.claimedAt || '',
      item.usedAt || '',
      JSON.stringify(winner),
      `${config.clientBaseUrl}/spin/${item.token}`
    ];
    lines.push(row.join(','));
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="spin-link-logs.csv"');
  res.send(lines.join('\n'));
});

router.post('/admin/links', requireAdmin, async (req, res) => {
  const { offerIds, quantity = 1 } = req.body || {};
  const normalizedIds = Array.isArray(offerIds) ? offerIds.filter(Boolean) : [];

  if (!normalizedIds.length) {
    return res.status(400).json({ message: 'Select at least one offer' });
  }

  const offers = await Offer.find({ _id: { $in: normalizedIds }, active: true }).lean();
  if (!offers.length) {
    return res.status(400).json({ message: 'No active offers found' });
  }

  const snapshot = offers.map((offer) => ({
    offerId: offer._id,
    title: offer.title,
    subtitle: offer.subtitle,
    color: offer.color,
    weight: offer.weight
  }));

  const docs = Array.from({ length: Math.max(1, Number(quantity || 1)) }).map(() => ({
    token: createSpinToken(),
    status: 'unused',
    offersSnapshot: snapshot,
    createdBy: req.admin._id
  }));

  const created = await SpinLink.insertMany(docs);
  res.status(201).json({
    links: created.map((item) => ({
      ...item.toObject(),
      publicUrl: `${config.clientBaseUrl}/spin/${item.token}`
    }))
  });
});

router.post('/public/claim', async (req, res) => {
  const { token, fingerprint } = req.body || {};

  if (!token || !fingerprint) {
    return res.status(400).json({ message: 'Missing token or fingerprint' });
  }

  const accessGrant = createRandomSecret(24);
  const claimed = await SpinLink.findOneAndUpdate(
    { token, status: 'unused' },
    {
      $set: {
        status: 'claimed',
        claimedAt: new Date(),
        fingerprintHash: hashValue(fingerprint),
        claimIp: getClientIp(req),
        claimUserAgent: req.headers['user-agent'] || 'unknown',
        accessGrantHash: hashValue(accessGrant)
      }
    },
    { new: true }
  ).lean();

  if (!claimed) {
    return res.status(410).json({ message: 'Link already used or expired' });
  }

  res.json({
    token: claimed.token,
    accessGrant,
    offers: claimed.offersSnapshot,
    status: claimed.status
  });
});

router.post('/public/spin', async (req, res) => {
  const { token, accessGrant, fingerprint } = req.body || {};

  if (!token || !accessGrant || !fingerprint) {
    return res.status(400).json({ message: 'Invalid spin request' });
  }

  const link = await SpinLink.findOne({ token }).lean();
  if (!link || link.status !== 'claimed') {
    return res.status(410).json({ message: 'Link already used or expired' });
  }

  const fingerprintHash = hashValue(fingerprint);
  const accessGrantHash = hashValue(accessGrant);

  if (link.fingerprintHash !== fingerprintHash || link.accessGrantHash !== accessGrantHash) {
    return res.status(403).json({ message: 'This link is locked to the original session' });
  }

  const { offer, index } = weightedPick(link.offersSnapshot);
  const segmentAngle = 360 / link.offersSnapshot.length;
  const spinAngle = 360 - (index * segmentAngle + segmentAngle / 2);

  const updateResult = await SpinLink.updateOne(
    {
      token,
      status: 'claimed',
      fingerprintHash,
      accessGrantHash
    },
    {
      $set: {
        status: 'used',
        usedAt: new Date(),
        result: {
          offerId: offer.offerId,
          title: offer.title,
          subtitle: offer.subtitle,
          color: offer.color,
          spinIndex: index,
          spinAngle
        }
      }
    }
  );

  if (!updateResult.modifiedCount) {
    return res.status(409).json({ message: 'Spin already completed' });
  }

  res.json({
    result: {
      offerId: offer.offerId,
      title: offer.title,
      subtitle: offer.subtitle,
      color: offer.color,
      spinIndex: index,
      spinAngle
    },
    offers: link.offersSnapshot
  });
});

export default router;
