import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { config } from '../config.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const admin = await Admin.findOne({ email: String(email || '').toLowerCase() });

  if (!admin) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(String(password || ''), admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ sub: admin._id.toString(), email: admin.email }, config.jwtSecret, {
    expiresIn: '12h'
  });

  res.json({
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email
    }
  });
});

router.get('/me', requireAdmin, async (req, res) => {
  res.json({
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email
    }
  });
});

export default router;
