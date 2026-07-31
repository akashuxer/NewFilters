import { computePosition } from "./index15.js";
function createPositionWatcher(anchor, float, options, onUpdate) {
  let rafId = null;
  let pendingSource = null;
  const isElementAnchor = typeof anchor !== "function";
  function currentAnchor() {
    return isElementAnchor ? anchor : anchor();
  }
  function schedule(source) {
    if (pendingSource === "full" || pendingSource == null) {
      pendingSource = pendingSource === "full" ? "full" : source;
    }
    if (source === "full") pendingSource = "full";
    if (rafId != null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const src = pendingSource ?? "full";
      pendingSource = null;
      onUpdate(computePosition(currentAnchor(), float, options), src);
    });
  }
  function scheduleFull() {
    schedule("full");
  }
  function scheduleFloatSize() {
    schedule("float-size");
  }
  let anchorRo = null;
  if (isElementAnchor) {
    anchorRo = new ResizeObserver(scheduleFull);
    anchorRo.observe(anchor);
  }
  const floatRo = new ResizeObserver(scheduleFloatSize);
  floatRo.observe(float);
  let containerRo = null;
  if (options.observeContainerSelector && isElementAnchor) {
    const container = anchor.closest(
      options.observeContainerSelector
    );
    if (container) {
      containerRo = new ResizeObserver(scheduleFull);
      containerRo.observe(container);
    }
  }
  function onScroll(e) {
    if (e.target instanceof Node && float.contains(e.target)) return;
    scheduleFull();
  }
  window.addEventListener("scroll", onScroll, true);
  window.addEventListener("resize", scheduleFull);
  function update() {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    pendingSource = null;
    onUpdate(computePosition(currentAnchor(), float, options), "full");
  }
  function destroy() {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    anchorRo == null ? void 0 : anchorRo.disconnect();
    floatRo.disconnect();
    containerRo == null ? void 0 : containerRo.disconnect();
    window.removeEventListener("scroll", onScroll, true);
    window.removeEventListener("resize", scheduleFull);
  }
  return { update, destroy };
}
export {
  createPositionWatcher
};
//# sourceMappingURL=index16.js.map
