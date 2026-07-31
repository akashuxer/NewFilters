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
export {
  restoreFocus,
  saveFocus
};
//# sourceMappingURL=index4.js.map
