const MESSAGES = [
  "Initializing Three.js renderer...",
  "Loading IFC geometry engine...",
  "Parsing building elements...",
  "Generating fragment data...",
  "Setting up hotspots...",
  "Ready."
];

export function simulateLoad(
  onProgress: (p: number) => void,
  onMessage: (msg: string) => void,
  onComplete: () => void
): void {
  let p = 0;

  function step() {
    p += Math.random() * 20 + 10;
    if (p > 100) p = 100;
    onProgress(p);
    onMessage(MESSAGES[Math.min(Math.floor(p / 20), MESSAGES.length - 1)]);
    if (p < 100) {
      setTimeout(step, 200 + Math.random() * 200);
    } else {
      setTimeout(onComplete, 400);
    }
  }

  setTimeout(step, 300);
}
