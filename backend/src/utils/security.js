import crypto from 'crypto';

export function hashValue(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function createRandomSecret(size = 48) {
  return crypto.randomBytes(size).toString('hex');
}

export function createSpinToken() {
  return crypto.randomBytes(18).toString('hex');
}

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || 'unknown';
}

export function weightedPick(offers) {
  const totalWeight = offers.reduce((sum, item) => sum + Number(item.weight || 0), 0);
  const threshold = Math.random() * totalWeight;
  let running = 0;

  for (let index = 0; index < offers.length; index += 1) {
    running += Number(offers[index].weight || 0);
    if (threshold <= running) {
      return { offer: offers[index], index };
    }
  }

  return { offer: offers[offers.length - 1], index: offers.length - 1 };
}
