"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const DEFAULT_CSS_VAR = { x: "--arvo-drag-x", y: "--arvo-drag-y" };
const DEFAULT_DRAGGING_CLASS = "dragging";
function clamp(value, min, max) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}
function getViewportRect() {
  return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
}
function resolveBoundsRect(bounds) {
  if (bounds === null) return null;
  if (bounds === void 0 || bounds === "viewport") return getViewportRect();
  return bounds.getRect();
}
function clampOffset(startRect, startOffset, deltaX, deltaY, boundsRect) {
  if (!boundsRect) {
    return { x: startOffset.x + deltaX, y: startOffset.y + deltaY };
  }
  const minDeltaX = boundsRect.left - startRect.left;
  const maxDeltaX = boundsRect.right - startRect.right;
  const minDeltaY = boundsRect.top - startRect.top;
  const maxDeltaY = boundsRect.bottom - startRect.bottom;
  return {
    x: startOffset.x + clamp(deltaX, minDeltaX, maxDeltaX),
    y: startOffset.y + clamp(deltaY, minDeltaY, maxDeltaY)
  };
}
function createDragHandle(options) {
  const {
    handle,
    target,
    excludeSelector,
    bounds = "viewport",
    initialOffset = { x: 0, y: 0 },
    cssVar = DEFAULT_CSS_VAR,
    draggingClass = DEFAULT_DRAGGING_CLASS,
    onDragStart,
    onDrag,
    onDragEnd
  } = options;
  let currentOffset = { ...initialOffset };
  let dragState = null;
  let destroyed = false;
  function writeOffset(offset) {
    target.style.setProperty(cssVar.x, `${offset.x}px`);
    target.style.setProperty(cssVar.y, `${offset.y}px`);
  }
  writeOffset(currentOffset);
  function shouldStart(e) {
    if (destroyed || dragState) return false;
    if (e.button !== 0 && e.pointerType === "mouse") return false;
    if (!excludeSelector) return true;
    const t = e.target;
    if (!t) return true;
    return !t.closest(excludeSelector);
  }
  function onPointerDown(e) {
    if (!shouldStart(e)) return;
    const startRect = target.getBoundingClientRect();
    dragState = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startOffset: { ...currentOffset },
      startRect
    };
    if (draggingClass) target.classList.add(draggingClass);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
    onDragStart == null ? void 0 : onDragStart(e);
  }
  function computeOffset(e) {
    if (!dragState) return currentOffset;
    const dx = e.clientX - dragState.startClientX;
    const dy = e.clientY - dragState.startClientY;
    const boundsRect = resolveBoundsRect(bounds);
    return clampOffset(
      dragState.startRect,
      dragState.startOffset,
      dx,
      dy,
      boundsRect
    );
  }
  function onPointerMove(e) {
    if (!dragState) return;
    e.preventDefault();
    currentOffset = computeOffset(e);
    writeOffset(currentOffset);
    onDrag == null ? void 0 : onDrag(currentOffset);
  }
  function onPointerUp(e) {
    if (!dragState) return;
    currentOffset = computeOffset(e);
    writeOffset(currentOffset);
    if (draggingClass) target.classList.remove(draggingClass);
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerUp);
    dragState = null;
    onDragEnd == null ? void 0 : onDragEnd(currentOffset);
  }
  handle.addEventListener("pointerdown", onPointerDown);
  return {
    isDragging() {
      return dragState !== null;
    },
    offset() {
      return { ...currentOffset };
    },
    setOffset(next) {
      const boundsRect = resolveBoundsRect(bounds);
      if (boundsRect) {
        const rect = target.getBoundingClientRect();
        const startOffset = { ...currentOffset };
        const dx = next.x - startOffset.x;
        const dy = next.y - startOffset.y;
        currentOffset = clampOffset(rect, startOffset, dx, dy, boundsRect);
      } else {
        currentOffset = { ...next };
      }
      writeOffset(currentOffset);
    },
    reset() {
      currentOffset = { x: 0, y: 0 };
      writeOffset(currentOffset);
    },
    destroy() {
      destroyed = true;
      handle.removeEventListener("pointerdown", onPointerDown);
      if (dragState) {
        if (draggingClass) target.classList.remove(draggingClass);
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointercancel", onPointerUp);
        dragState = null;
      }
    }
  };
}
exports.createDragHandle = createDragHandle;
//# sourceMappingURL=index37.cjs.map
