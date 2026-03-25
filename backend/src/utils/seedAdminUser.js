import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { config } from '../config.js';

export async function ensureAdminUser() {
  const existing = await Admin.findOne({ email: config.adminEmail.toLowerCase() });
  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash(config.adminPassword, 10);
  const admin = await Admin.create({
    name: config.adminName,
    email: config.adminEmail.toLowerCase(),
    passwordHash
  });

  console.log(`Seeded admin user: ${admin.email}`);
  return admin;
}
