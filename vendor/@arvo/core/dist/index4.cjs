"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function saveFocus() {
  const active = document.activeElement;
  return {
    element: active instanceof HTMLElement ? active : null
  };
}
function restoreFocus(state) {
  if (state.element && typeof state.element.focus === "function") {
    state.element.focus({ preventScroll: true });
  }
}
exports.restoreFocus = restoreFocus;
exports.saveFocus = saveFocus;
//# sourceMappingURL=index4.cjs.map
