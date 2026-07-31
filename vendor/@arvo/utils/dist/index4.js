const DEFAULT_BTN_MIN = 112;
function clampFooterActions(actions, options = {}) {
  const max = options.max ?? 3;
  if (!actions || actions.length === 0) return [];
  if (actions.length <= max) {
    return Array.isArray(actions) && !Object.isFrozen(actions) ? actions : Array.from(actions);
  }
  const componentName = options.componentName ?? "overlay";
  if (typeof console !== "undefined" && typeof console.warn === "function") {
    console.warn(
      `[arvo] ${componentName} footer received ${actions.length} actions; max is ${max}. Excess actions are dropped. Re-evaluate the surface or move secondary actions out of the footer.`
    );
  }
  return Array.from(actions).slice(0, max);
}
function attachOverlayFooterFit(container, options = {}) {
  const defaultMin = options.defaultBtnMin ?? DEFAULT_BTN_MIN;
  const gap = options.gap ?? 6;
  if (typeof window === "undefined" || typeof ResizeObserver === "undefined") {
    return {
      measure: () => {
      },
      destroy: () => {
      }
    };
  }
  let destroyed = false;
  let raf = 0;
  const labeledSelector = [
    ":scope > .arvo-btn:not(.arvo-btn--icon-only)",
    ":scope > .arvo-dd-btn:not(.arvo-dd-btn--icon-only)",
    ":scope > .arvo-split-btn:not(.arvo-split-btn--icon-only)"
  ].join(", ");
  function measureNow() {
    if (destroyed) return;
    const labeledBtns = Array.from(
      container.querySelectorAll(labeledSelector)
    );
    if (labeledBtns.length === 0) {
      container.style.removeProperty("--arvo-overlay-footer-btn-min");
      container.style.minWidth = "";
      return;
    }
    const previousBasis = container.style.getPropertyValue(
      "--arvo-overlay-footer-btn-min"
    );
    const previousMinWidth = container.style.minWidth;
    container.style.minWidth = "";
    container.style.setProperty("--arvo-overlay-footer-btn-min", "auto");
    let widestBtn = 0;
    labeledBtns.forEach((btn) => {
      const w = btn.offsetWidth;
      if (w > widestBtn) widestBtn = w;
    });
    if (previousBasis) {
      container.style.setProperty("--arvo-overlay-footer-btn-min", previousBasis);
    } else {
      container.style.removeProperty("--arvo-overlay-footer-btn-min");
    }
    container.style.minWidth = previousMinWidth;
    if (widestBtn === 0) return;
    const count = labeledBtns.length;
    const totalGap = Math.max(0, count - 1) * gap;
    const parent = container.parentElement;
    const parentWidth = parent && parent.clientWidth > 0 ? parent.clientWidth : container.clientWidth;
    const maxPerBtn = count > 0 ? Math.floor((parentWidth - totalGap) / count) : defaultMin;
    const next = Math.max(defaultMin, Math.min(widestBtn, maxPerBtn));
    container.style.setProperty(
      "--arvo-overlay-footer-btn-min",
      `${next}px`
    );
    const idealCluster = Math.min(count * next + totalGap, parentWidth);
    container.style.minWidth = `${idealCluster}px`;
  }
  function scheduleMeasure() {
    if (destroyed) return;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(measureNow);
  }
  const observer = new ResizeObserver(scheduleMeasure);
  observer.observe(container);
  scheduleMeasure();
  return {
    measure: measureNow,
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      container.style.removeProperty("--arvo-overlay-footer-btn-min");
      container.style.minWidth = "";
    }
  };
}
export {
  attachOverlayFooterFit,
  clampFooterActions
};
//# sourceMappingURL=index4.js.map
