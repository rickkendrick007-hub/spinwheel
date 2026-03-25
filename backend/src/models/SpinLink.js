import mongoose from 'mongoose';

const snapshotOfferSchema = new mongoose.Schema(
  {
    offerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    color: { type: String, required: true },
    weight: { type: Number, required: true }
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    offerId: mongoose.Schema.Types.ObjectId,
    title: String,
    subtitle: String,
    color: String,
    spinIndex: Number,
    spinAngle: Number
  },
  { _id: false }
);

const spinLinkSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['unused', 'claimed', 'used'],
      default: 'unused',
      index: true
    },
    offersSnapshot: { type: [snapshotOfferSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    claimedAt: Date,
    usedAt: Date,
    fingerprintHash: String,
    claimIp: String,
    claimUserAgent: String,
    accessGrantHash: String,
    result: resultSchema
  },
  { timestamps: true }
);

export const SpinLink = mongoose.model('SpinLink', spinLinkSchema);
