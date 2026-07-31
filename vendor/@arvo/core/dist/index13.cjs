"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const reducedMotion = require("./index14.cjs");
const FALLBACK_MS = 500;
const STALE_CLASSES = [
  "arvo-enter-from",
  "arvo-enter-active",
  "arvo-enter-to",
  "arvo-exit-from",
  "arvo-exit-active",
  "arvo-exit-to",
  "arvo-fade",
  "arvo-scale",
  "arvo-slide-up",
  "arvo-slide-down",
  "arvo-slide-left",
  "arvo-slide-right"
];
function clearStaleTransitionClasses(element) {
  for (const cls of STALE_CLASSES) element.classList.remove(cls);
}
function runTransition(element, phase, options) {
  return new Promise((resolve) => {
    var _a;
    if (reducedMotion.prefersReducedMotion()) {
      clearStaleTransitionClasses(element);
      if (phase === "exit") {
        const typeClass2 = `arvo-${options.type}`;
        const toClass2 = `arvo-${phase}-to`;
        element.classList.add(typeClass2, toClass2);
      }
      (_a = options.onComplete) == null ? void 0 : _a.call(options);
      resolve();
      return;
    }
    const typeClass = `arvo-${options.type}`;
    const fromClass = `arvo-${phase}-from`;
    const activeClass = `arvo-${phase}-active`;
    const toClass = `arvo-${phase}-to`;
    clearStaleTransitionClasses(element);
    element.classList.add(fromClass, typeClass);
    if (options.duration !== void 0) {
      element.style.transitionDuration = `${options.duration}ms`;
    }
    if (options.easing !== void 0) {
      element.style.transitionTimingFunction = options.easing;
    }
    void element.offsetHeight;
    element.classList.remove(fromClass);
    element.classList.add(activeClass, toClass);
    let settled = false;
    function cleanup() {
      var _a2;
      if (phase === "exit") {
        element.classList.remove(activeClass);
      } else {
        element.classList.remove(activeClass, toClass, typeClass);
      }
      if (options.duration !== void 0) {
        element.style.removeProperty("transition-duration");
      }
      if (options.easing !== void 0) {
        element.style.removeProperty("transition-timing-function");
      }
      (_a2 = options.onComplete) == null ? void 0 : _a2.call(options);
      resolve();
    }
    const onEnd = (event) => {
      if (event.target !== element || settled) return;
      settled = true;
      element.removeEventListener("transitionend", onEnd);
      window.clearTimeout(timer);
      cleanup();
    };
    element.addEventListener("transitionend", onEnd);
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      element.removeEventListener("transitionend", onEnd);
      cleanup();
    }, (options.duration ?? FALLBACK_MS) + 50);
  });
}
function enter(options) {
  return runTransition(options.element, "enter", options);
}
function exit(options) {
  return runTransition(options.element, "exit", options);
}
exports.enter = enter;
exports.exit = exit;
//# sourceMappingURL=index13.cjs.map
