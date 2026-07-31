"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const BLOCK = "arvo-overlay__mask";
const HIDE_DELAY_MS = 300;
const SHOW_DELAY_MS = 10;
function resolveContainer(container) {
  if (!container) return null;
  if (typeof container === "string") {
    return document.querySelector(container);
  }
  return container;
}
function createMask(options = {}) {
  const {
    container: containerOpt,
    closeOnClick = false,
    zIndex,
    onOutside,
    animated = true,
    ariaHidden = true,
    className
  } = options;
  const el = document.createElement("div");
  el.className = BLOCK;
  if (animated) {
    el.classList.add(`${BLOCK}--animated`);
  }
  if (className) {
    el.classList.add(className);
  }
  if (ariaHidden) {
    el.setAttribute("aria-hidden", "true");
  }
  const containerEl = resolveContainer(containerOpt);
  if (containerEl) {
    el.classList.add(`${BLOCK}--scoped`);
  }
  if (zIndex != null) {
    el.style.zIndex = String(zIndex);
  }
  let pointerHandler = null;
  if (closeOnClick && onOutside) {
    pointerHandler = (e) => {
      if (e.target === el) onOutside(e);
    };
    el.addEventListener("pointerdown", pointerHandler);
  }
  let hideTimer = null;
  let showTimer = null;
  function clearTimers() {
    if (hideTimer != null) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    if (showTimer != null) {
      clearTimeout(showTimer);
      showTimer = null;
    }
  }
  const mask = {
    element: el,
    show() {
      clearTimers();
      const target = containerEl ?? document.body;
      target.appendChild(el);
      if (animated) {
        showTimer = setTimeout(() => {
          el.classList.add(`${BLOCK}--visible`);
          showTimer = null;
        }, SHOW_DELAY_MS);
      } else {
        el.classList.add(`${BLOCK}--visible`);
      }
    },
    hide() {
      clearTimers();
      el.classList.remove(`${BLOCK}--visible`);
      if (animated) {
        hideTimer = setTimeout(() => {
          el.remove();
          hideTimer = null;
        }, HIDE_DELAY_MS);
      } else {
        el.remove();
      }
    },
    destroy() {
      clearTimers();
      if (pointerHandler) {
        el.removeEventListener("pointerdown", pointerHandler);
        pointerHandler = null;
      }
      el.remove();
    }
  };
  return mask;
}
exports.createMask = createMask;
//# sourceMappingURL=index23.cjs.map
