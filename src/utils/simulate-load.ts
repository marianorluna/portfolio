export function simulateLoad(
  messages: string[],
  onProgress: (p: number) => void,
  onMessage: (msg: string) => void,
  onComplete: () => void
): void {
  if (messages.length === 0) {
    onMessage("");
    onProgress(100);
    setTimeout(onComplete, 80);
    return;
  }

  let p = 0;

  function step() {
    p += Math.random() * 20 + 10;
    if (p > 100) p = 100;
    onProgress(p);
    onMessage(messages[Math.min(Math.floor(p / 20), messages.length - 1)]);
    if (p < 100) {
      setTimeout(step, 60 + Math.random() * 60);
    } else {
      setTimeout(onComplete, 100);
    }
  }

  setTimeout(step, 80);
}
