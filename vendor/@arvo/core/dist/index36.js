function resolveMax(max, rect) {
  return typeof max === "function" ? max(rect) : max;
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function createResizeHandle(target, options) {
  const {
    corners,
    min,
    max,
    onResize,
    onCommit,
    viewportPadding = 16,
    block = "arvo-hpop",
    host = target
  } = options;
  let dragState = null;
  let destroyed = false;
  const handleElements = [];
  const HANDLE_SVG_NS = "http://www.w3.org/2000/svg";
  function buildHandleSvg() {
    const svg = document.createElementNS(HANDLE_SVG_NS, "svg");
    svg.setAttribute("width", "11");
    svg.setAttribute("height", "11");
    svg.setAttribute("viewBox", "0 0 11 11");
    svg.setAttribute("fill", "none");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const p1 = document.createElementNS(HANDLE_SVG_NS, "path");
    p1.setAttribute("d", "M0.706787 10.7068L10.1512 0.706848");
    p1.setAttribute("stroke", "currentColor");
    p1.setAttribute("stroke-linecap", "square");
    svg.appendChild(p1);
    const p2 = document.createElementNS(HANDLE_SVG_NS, "path");
    p2.setAttribute("d", "M5.15112 10.7064L10.7067 4.82404");
    p2.setAttribute("stroke", "currentColor");
    p2.setAttribute("stroke-linecap", "square");
    svg.appendChild(p2);
    return svg;
  }
  function createHandleElement(corner) {
    const el = document.createElement("div");
    el.className = `${block}__handle ${block}__handle--${cornerToModifier(corner)}`;
    el.dataset.corner = corner;
    el.setAttribute("aria-hidden", "true");
    el.appendChild(buildHandleSvg());
    el.addEventListener("pointerdown", onPointerDown);
    return el;
  }
  function cornerToModifier(corner) {
    const map = {
      "bottom-left": "bl",
      "bottom-right": "br",
      "top-left": "tl",
      "top-right": "tr"
    };
    return map[corner];
  }
  function onPointerDown(e) {
    if (destroyed || dragState) return;
    e.preventDefault();
    e.stopPropagation();
    const handleEl = e.currentTarget;
    const corner = handleEl.dataset.corner;
    const rect = target.getBoundingClientRect();
    dragState = {
      corner,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height
    };
    target.classList.add("is-resizing");
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
  }
  function computeNewRect(e) {
    if (!dragState) return { width: 0, height: 0 };
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const maxRect = resolveMax(max, target.getBoundingClientRect());
    let newWidth = dragState.startWidth;
    let newHeight = dragState.startHeight;
    switch (dragState.corner) {
      case "bottom-right":
        newWidth = dragState.startWidth + dx;
        newHeight = dragState.startHeight + dy;
        break;
      case "bottom-left":
        newWidth = dragState.startWidth - dx;
        newHeight = dragState.startHeight + dy;
        break;
      case "top-right":
        newWidth = dragState.startWidth + dx;
        newHeight = dragState.startHeight - dy;
        break;
      case "top-left":
        newWidth = dragState.startWidth - dx;
        newHeight = dragState.startHeight - dy;
        break;
    }
    return {
      width: clamp(newWidth, min.width, maxRect.width),
      height: clamp(newHeight, min.height, maxRect.height)
    };
  }
  function onPointerMove(e) {
    if (!dragState) return;
    const rect = computeNewRect(e);
    target.style.width = `${rect.width}px`;
    target.style.height = `${rect.height}px`;
    onResize == null ? void 0 : onResize(rect);
  }
  function onPointerUp(e) {
    if (!dragState) return;
    const rect = computeNewRect(e);
    target.classList.remove("is-resizing");
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerUp);
    dragState = null;
    onCommit == null ? void 0 : onCommit(rect);
  }
  function updateVisibility() {
    if (destroyed) return;
    const rect = target.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    for (const el of handleElements) {
      const corner = el.dataset.corner;
      let visible = true;
      switch (corner) {
        case "bottom-right":
        case "top-right":
          if (vw - rect.right < viewportPadding) visible = false;
          break;
        case "bottom-left":
        case "top-left":
          if (rect.left < viewportPadding) visible = false;
          break;
      }
      switch (corner) {
        case "bottom-left":
        case "bottom-right":
          if (vh - rect.bottom < viewportPadding) visible = false;
          break;
        case "top-left":
        case "top-right":
          if (rect.top < viewportPadding) visible = false;
          break;
      }
      el.style.display = visible ? "" : "none";
    }
  }
  function onViewportChange() {
    updateVisibility();
  }
  return {
    mount() {
      for (const corner of corners) {
        const el = createHandleElement(corner);
        handleElements.push(el);
        host.appendChild(el);
      }
      updateVisibility();
      window.addEventListener("resize", onViewportChange);
      window.addEventListener("scroll", onViewportChange, true);
      return [...handleElements];
    },
    destroy() {
      destroyed = true;
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
      if (dragState) {
        target.classList.remove("is-resizing");
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointercancel", onPointerUp);
        dragState = null;
      }
      for (const el of handleElements) {
        el.removeEventListener("pointerdown", onPointerDown);
        el.remove();
      }
      handleElements.length = 0;
    },
    updateVisibility,
    isResizing() {
      return dragState !== null;
    }
  };
}
export {
  createResizeHandle
};
//# sourceMappingURL=index36.js.map
