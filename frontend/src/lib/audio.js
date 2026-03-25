function tone(frequency, duration, gain = 0.03) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const volume = context.createGain();

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  volume.gain.value = gain;

  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);

  oscillator.onended = () => context.close();
}

export function playSpinSound(enabled) {
  if (!enabled) return;
  tone(280, 0.12, 0.02);
  setTimeout(() => tone(360, 0.12, 0.02), 120);
  setTimeout(() => tone(450, 0.15, 0.02), 240);
}

export function playWinSound(enabled) {
  if (!enabled) return;
  tone(620, 0.18, 0.025);
  setTimeout(() => tone(780, 0.22, 0.025), 170);
  setTimeout(() => tone(980, 0.28, 0.03), 340);
}
