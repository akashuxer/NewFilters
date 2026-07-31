"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function prefersReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function onReducedMotionChange(callback) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {
    };
  }
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  function handler(event) {
    callback(event.matches);
  }
  mql.addEventListener("change", handler);
  return () => mql.removeEventListener("change", handler);
}
exports.onReducedMotionChange = onReducedMotionChange;
exports.prefersReducedMotion = prefersReducedMotion;
//# sourceMappingURL=index14.cjs.map
