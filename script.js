const scrambleTargets = document.querySelectorAll(
  ".album-name, .album-number, .track-list li, .legal p"
);

const scrambleAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const scrambleFrameDuration = 30;
const originalMarkup = new WeakMap();
const activeFrames = new WeakMap();

const isScrambleChar = (char) => /[A-Za-z0-9]/.test(char);

const renderScrambleFrame = (element) => {
  const originalText = element.dataset.originalText ?? element.textContent;
  const scrambled = originalText
    .split("")
    .map((char) => {
      if (!isScrambleChar(char)) {
        return char;
      }

      return scrambleAlphabet[Math.floor(Math.random() * scrambleAlphabet.length)];
    })
    .join("");

  element.textContent = scrambled;
};

const startScramble = (element) => {
  const originalText = element.dataset.originalText ?? element.textContent;
  const originalHtml = originalMarkup.get(element) ?? element.innerHTML;
  element.dataset.originalText = originalText;
  originalMarkup.set(element, originalHtml);

  if (activeFrames.has(element)) {
    return;
  }

  let lastUpdate = 0;

  const tick = (timestamp) => {
    if (timestamp - lastUpdate >= scrambleFrameDuration) {
      renderScrambleFrame(element);
      lastUpdate = timestamp;
    }

    if (activeFrames.has(element)) {
      const frameId = window.requestAnimationFrame(tick);
      activeFrames.set(element, frameId);
      return;
    }
  };

  const frameId = window.requestAnimationFrame(tick);
  activeFrames.set(element, frameId);
};

const stopScramble = (element) => {
  const frameId = activeFrames.get(element);
  if (frameId) {
    window.cancelAnimationFrame(frameId);
  }

  activeFrames.delete(element);
  element.innerHTML = originalMarkup.get(element) ?? element.innerHTML;
};

scrambleTargets.forEach((element) => {
  const originalText = element.textContent;
  originalMarkup.set(element, element.innerHTML);
  element.dataset.originalText = originalText;
  element.tabIndex = 0;

  element.addEventListener("mouseenter", () => startScramble(element));
  element.addEventListener("mouseleave", () => stopScramble(element));
  element.addEventListener("focus", () => startScramble(element));
  element.addEventListener("blur", () => stopScramble(element));
});
