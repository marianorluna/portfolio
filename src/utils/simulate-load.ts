export function simulateLoad(
  messages: string[],
  onProgress: (p: number) => void,
  onMessage: (msg: string) => void,
  onComplete: () => void
): void {
  if (messages.length === 0) {
    onMessage("");
    onProgress(100);
    setTimeout(onComplete, 200);
    return;
  }

  let p = 0;

  function step() {
    p += Math.random() * 20 + 10;
    if (p > 100) p = 100;
    onProgress(p);
    onMessage(messages[Math.min(Math.floor(p / 20), messages.length - 1)]);
    if (p < 100) {
      setTimeout(step, 200 + Math.random() * 200);
    } else {
      setTimeout(onComplete, 400);
    }
  }

  setTimeout(step, 300);
}
