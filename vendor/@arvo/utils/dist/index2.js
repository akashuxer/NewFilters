function formatCharCount(current, maxLength) {
  if (maxLength == null) {
    return String(current);
  }
  const maxStr = String(maxLength);
  const currentStr = String(current).padStart(maxStr.length, "0");
  return `${currentStr}/${maxLength}`;
}
function createCharCounter(options = {}) {
  const el = document.createElement("span");
  el.className = "arvo-char-counter";
  el.textContent = formatCharCount(0, options.maxLength ?? null);
  return el;
}
function updateCharCounter(el, current, maxLength) {
  el.textContent = formatCharCount(current, maxLength);
}
export {
  createCharCounter,
  formatCharCount,
  updateCharCounter
};
//# sourceMappingURL=index2.js.map
