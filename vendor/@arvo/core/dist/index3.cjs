"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "[tabindex]",
  '[contenteditable]:not([contenteditable="false"])'
].join(",");
const TABBABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]:not([contenteditable="false"])'
].join(",");
function isNotInert(el) {
  if (el.hidden) return false;
  if (el.getAttribute("aria-hidden") === "true") return false;
  if (el.hasAttribute("inert")) return false;
  return true;
}
function isFocusable(element) {
  if (!isNotInert(element)) return false;
  if (element.hasAttribute("disabled")) return false;
  return element.matches(FOCUSABLE_SELECTOR);
}
function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(TABBABLE_SELECTOR)
  ).filter((el) => isNotInert(el) && !el.hasAttribute("disabled"));
}
function getFirstFocusable(container) {
  const elements = getFocusableElements(container);
  return elements[0] ?? null;
}
function getLastFocusable(container) {
  const elements = getFocusableElements(container);
  return elements[elements.length - 1] ?? null;
}
exports.getFirstFocusable = getFirstFocusable;
exports.getFocusableElements = getFocusableElements;
exports.getLastFocusable = getLastFocusable;
exports.isFocusable = isFocusable;
//# sourceMappingURL=index3.cjs.map
