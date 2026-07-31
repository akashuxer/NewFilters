"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const DEFAULT_TRIGGER_ESTIMATE = 32;
function defaultSetHidden(el, hidden) {
  if (hidden) {
    el.style.visibility = "hidden";
    el.style.position = "absolute";
    el.style.pointerEvents = "none";
  } else {
    el.style.visibility = "";
    el.style.position = "";
    el.style.pointerEvents = "";
  }
}
function setsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const v of a) {
    if (!b.has(v)) return false;
  }
  return true;
}
function createOverflowManager(options) {
  const {
    container,
    boundary = container,
    getItems,
    getTriggerWidth,
    triggerWidthEstimate = DEFAULT_TRIGGER_ESTIMATE,
    isPinned,
    getPromotedId,
    onChange,
    setHidden = defaultSetHidden
  } = options;
  let hidden = /* @__PURE__ */ new Set();
  let rafId = 0;
  let destroyed = false;
  let observer = null;
  function measure() {
    if (destroyed) return;
    const items = getItems();
    for (const { el } of items) {
      setHidden(el, false);
    }
    const boundaryRect = boundary.getBoundingClientRect();
    const triggerWidth = Math.max(0, getTriggerWidth());
    const passOne = /* @__PURE__ */ new Set();
    {
      const limit = boundaryRect.right;
      let overflowing = false;
      for (const { id, el } of items) {
        if (overflowing) {
          passOne.add(id);
          continue;
        }
        const r = el.getBoundingClientRect();
        if (r.right > limit + 0.5) {
          passOne.add(id);
          overflowing = true;
        }
      }
    }
    let next;
    if (passOne.size === 0) {
      next = passOne;
    } else {
      const reserve = triggerWidth > 0 ? triggerWidth : triggerWidthEstimate;
      const limit = boundaryRect.right - reserve;
      next = /* @__PURE__ */ new Set();
      let overflowing = false;
      for (const { id, el } of items) {
        if (overflowing) {
          next.add(id);
          continue;
        }
        const r = el.getBoundingClientRect();
        if (r.right > limit + 0.5) {
          next.add(id);
          overflowing = true;
        }
      }
    }
    if (isPinned && next.size > 0) {
      for (const id of [...next]) {
        if (isPinned(id)) next.delete(id);
      }
    }
    if (getPromotedId && next.size > 0) {
      const promotedId = getPromotedId();
      if (promotedId && next.has(promotedId)) {
        for (let i = items.length - 1; i >= 0; i--) {
          const candidate = items[i];
          if (next.has(candidate.id)) continue;
          if (isPinned == null ? void 0 : isPinned(candidate.id)) continue;
          if (candidate.id === promotedId) continue;
          next.delete(promotedId);
          next.add(candidate.id);
          break;
        }
      }
    }
    for (const { id, el } of items) {
      if (next.has(id)) setHidden(el, true);
    }
    if (!setsEqual(hidden, next)) {
      hidden = next;
      onChange(hidden);
    }
  }
  function schedule() {
    if (destroyed) return;
    if (rafId !== 0) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      measure();
    });
  }
  function refresh() {
    if (destroyed) return;
    if (rafId !== 0) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    measure();
  }
  function getHidden() {
    return new Set(hidden);
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    if (rafId !== 0) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    observer == null ? void 0 : observer.disconnect();
    observer = null;
    try {
      for (const { el } of getItems()) {
        setHidden(el, false);
      }
    } catch {
    }
  }
  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(() => schedule());
    observer.observe(boundary);
  }
  schedule();
  return { refresh, getHidden, destroy };
}
exports.createOverflowManager = createOverflowManager;
//# sourceMappingURL=index35.cjs.map
