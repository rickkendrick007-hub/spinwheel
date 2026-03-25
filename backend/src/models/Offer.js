import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    color: { type: String, default: '#1ca4ff' },
    weight: { type: Number, default: 1, min: 0.1 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Offer = mongoose.model('Offer', offerSchema);
