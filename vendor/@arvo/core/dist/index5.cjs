"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const focusable = require("./index3.cjs");
const focusRestore = require("./index4.cjs");
function createFocusTrap() {
  let _active = false;
  let _options = null;
  let _savedFocus = null;
  function resolveOrder(opts) {
    if (!opts.getOrderedElements) {
      return focusable.getFocusableElements(opts.container);
    }
    const raw = opts.getOrderedElements();
    return raw.filter(
      (el) => el != null && opts.container.contains(el)
    );
  }
  function handleKeyDown(event) {
    if (!_active || !_options) return;
    if (event.key === "Tab") {
      const focusable2 = resolveOrder(_options);
      if (focusable2.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable2[0];
      const last = focusable2[focusable2.length - 1];
      const activeEl = document.activeElement;
      if (_options.getOrderedElements) {
        const currentIdx = focusable2.findIndex(
          (el) => el === activeEl || el.contains(activeEl)
        );
        let nextIdx;
        if (currentIdx === -1) {
          nextIdx = event.shiftKey ? focusable2.length - 1 : 0;
        } else if (event.shiftKey) {
          nextIdx = currentIdx === 0 ? focusable2.length - 1 : currentIdx - 1;
        } else {
          nextIdx = currentIdx === focusable2.length - 1 ? 0 : currentIdx + 1;
        }
        event.preventDefault();
        focusable2[nextIdx].focus({ preventScroll: true });
        return;
      }
      if (!_options.container.contains(activeEl)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
        return;
      }
      if (event.shiftKey && activeEl === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && activeEl === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    }
    if (event.key === "Escape" && _options.escapeDeactivates) {
      event.preventDefault();
      trap.deactivate();
    }
  }
  function handleFocusIn(event) {
    if (!_active || !_options || _options.allowOutsideClick) return;
    const target = event.target;
    if (!_options.container.contains(target)) {
      const first = focusable.getFirstFocusable(_options.container);
      if (first) first.focus({ preventScroll: true });
    }
  }
  const trap = {
    activate(options) {
      if (_active) {
        trap.deactivate();
      }
      _options = options;
      _active = true;
      _savedFocus = focusRestore.saveFocus();
      document.addEventListener("keydown", handleKeyDown, true);
      document.addEventListener("focusin", handleFocusIn);
      if (options.initialFocus === "none") {
        return;
      }
      if (typeof options.initialFocus === "function") {
        const target = options.initialFocus();
        if (target) target.focus({ preventScroll: true });
      } else if (options.initialFocus !== void 0 && options.initialFocus !== "first" && options.initialFocus instanceof HTMLElement) {
        options.initialFocus.focus({ preventScroll: true });
      } else if (options.getOrderedElements) {
        const ordered = resolveOrder(options);
        const target = ordered[0] ?? focusable.getFirstFocusable(options.container);
        if (target) target.focus({ preventScroll: true });
      } else {
        const first = focusable.getFirstFocusable(options.container);
        if (first) first.focus({ preventScroll: true });
      }
    },
    deactivate() {
      if (!_active || !_options) return;
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", handleFocusIn);
      const explicit = _options.returnFocusTo;
      const explicitEl = typeof explicit === "function" ? explicit() : explicit ?? null;
      const shouldRestore = _options.returnFocusOnDeactivate;
      _active = false;
      _options = null;
      if (shouldRestore) {
        if (explicitEl && typeof explicitEl.focus === "function") {
          explicitEl.focus({ preventScroll: true });
        } else if (_savedFocus) {
          focusRestore.restoreFocus(_savedFocus);
        }
      }
      _savedFocus = null;
    },
    isActive() {
      return _active;
    },
    updateContainerElements() {
    }
  };
  return trap;
}
exports.createFocusTrap = createFocusTrap;
//# sourceMappingURL=index5.cjs.map
