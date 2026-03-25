import FingerprintJS from '@fingerprintjs/fingerprintjs';

let cached;

export async function getFingerprint() {
  if (cached) return cached;

  const agent = await FingerprintJS.load();
  const result = await agent.get();
  const screenPart = `${window.screen.width}x${window.screen.height}`;
  cached = `${result.visitorId}:${navigator.userAgent}:${screenPart}:${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
  return cached;
}
