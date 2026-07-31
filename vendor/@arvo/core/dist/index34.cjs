"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const FLIP_DURATION_MS = 180;
function getItemIndex(items, el) {
  return items.indexOf(el);
}
function findClosestItem(items, pointer, axis, threshold) {
  const t = Math.min(Math.max(threshold, 0), 0.5);
  for (let i = 0; i < items.length; i++) {
    const rect = items[i].getBoundingClientRect();
    const lead = axis === "y" ? rect.top : rect.left;
    const size = axis === "y" ? rect.height : rect.width;
    const swap = lead + size * t;
    if (pointer < swap) return { index: i, position: "before" };
  }
  if (items.length > 0) {
    return { index: items.length - 1, position: "after" };
  }
  return null;
}
function getOrCreateLiveRegion() {
  let region = document.getElementById("arvo-sortable-live");
  if (!region) {
    region = document.createElement("div");
    region.id = "arvo-sortable-live";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "true");
    Object.assign(region.style, {
      position: "absolute",
      width: "1px",
      height: "1px",
      overflow: "hidden",
      clip: "rect(0 0 0 0)",
      whiteSpace: "nowrap"
    });
    document.body.appendChild(region);
  }
  return region;
}
function announce(region, message) {
  region.textContent = "";
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}
function createSortableList(container, options) {
  const {
    itemSelector,
    handleSelector,
    axis = "y",
    getGroupOf,
    allowCrossGroup = false,
    dragThreshold = 0,
    overlapThreshold = 0.5,
    lockCrossAxisToContainer = false,
    getDragBounds,
    onPreview,
    onCommit,
    onCancel,
    ghostClass = "arvo-sortable--ghost",
    draggingClass = "arvo-sortable--dragging"
  } = options;
  let state = null;
  let pending = null;
  let destroyed = false;
  function getItems() {
    return Array.from(container.querySelectorAll(itemSelector));
  }
  function getGroupItems(items, group) {
    if (!getGroupOf || group === null) return items;
    return items.filter((item) => getGroupOf(item) === group);
  }
  function flipSiblings(prevRects) {
    prevRects.forEach((prevRect, el) => {
      if (el === (state == null ? void 0 : state.sourceItem)) return;
      const nextRect = el.getBoundingClientRect();
      const delta = axis === "y" ? prevRect.top - nextRect.top : prevRect.left - nextRect.left;
      if (delta === 0) return;
      el.style.transition = "none";
      el.style.transform = axis === "y" ? `translateY(${delta}px)` : `translateX(${delta}px)`;
      void el.offsetWidth;
      requestAnimationFrame(() => {
        el.style.transition = `transform ${FLIP_DURATION_MS}ms var(--arvo-ease-simple, ease)`;
        el.style.transform = "";
        window.setTimeout(() => {
          el.style.transition = "";
          el.style.transform = "";
        }, FLIP_DURATION_MS + 20);
      });
    });
  }
  function startDrag(item, clientX, clientY) {
    if (state) return;
    const items = getItems();
    const index = getItemIndex(items, item);
    if (index === -1) return;
    const group = (getGroupOf == null ? void 0 : getGroupOf(item)) ?? null;
    const rect = item.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const parent = item.parentElement;
    const nextSibling = item.nextElementSibling;
    const clone = item.cloneNode(true);
    clone.classList.add(draggingClass);
    clone.removeAttribute("id");
    Object.assign(clone.style, {
      position: "fixed",
      zIndex: "10000",
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      pointerEvents: "none",
      margin: "0"
    });
    document.body.appendChild(clone);
    item.classList.add(ghostClass);
    const liveRegion = getOrCreateLiveRegion();
    const crossAxisOffsetInContainer = axis === "y" ? rect.left - containerRect.left : rect.top - containerRect.top;
    state = {
      sourceItem: item,
      sourceIndex: index,
      sourceGroup: group,
      sourceParent: parent,
      sourceNextSibling: nextSibling,
      clone,
      sourceWidth: rect.width,
      sourceHeight: rect.height,
      currentIndex: index,
      currentGroup: group,
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
      crossAxisOffsetInContainer,
      liveRegion
    };
    container.classList.add("is-dragging");
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerCancel);
    document.addEventListener("keydown", onKeydownDuringDrag);
    if (lockCrossAxisToContainer) {
      window.addEventListener("scroll", onScrollDuringDrag, true);
    }
  }
  function syncCloneCrossAxis() {
    if (!state || !lockCrossAxisToContainer) return;
    const containerRect = container.getBoundingClientRect();
    if (axis === "y") {
      state.clone.style.left = `${containerRect.left + state.crossAxisOffsetInContainer}px`;
    } else {
      state.clone.style.top = `${containerRect.top + state.crossAxisOffsetInContainer}px`;
    }
  }
  function moveDrag(clientX, clientY) {
    if (!state) return;
    let primary = axis === "y" ? clientY - state.offsetY : clientX - state.offsetX;
    let clampedPointer = axis === "y" ? clientY : clientX;
    const bounds = (getDragBounds == null ? void 0 : getDragBounds(state.sourceItem)) ?? null;
    if (bounds) {
      const size = axis === "y" ? state.sourceHeight : state.sourceWidth;
      const minLead = bounds.min;
      const maxLead = bounds.max - size;
      if (maxLead >= minLead) {
        const before = primary;
        primary = Math.max(minLead, Math.min(maxLead, primary));
        if (primary === minLead && before < minLead) {
          clampedPointer = minLead - 1;
        } else if (primary === maxLead && before > maxLead) {
          clampedPointer = maxLead + size + 1;
        } else {
          clampedPointer += primary - before;
        }
      }
    }
    if (axis === "y") {
      state.clone.style.top = `${primary}px`;
    } else {
      state.clone.style.left = `${primary}px`;
    }
    syncCloneCrossAxis();
    const items = getItems();
    const pointer = clampedPointer;
    const target = findClosestItem(items, pointer, axis, overlapThreshold);
    if (!target) return;
    const targetItem = items[target.index];
    if (targetItem === state.sourceItem) return;
    const targetGroup = (getGroupOf == null ? void 0 : getGroupOf(targetItem)) ?? null;
    if (!allowCrossGroup && getGroupOf && state.sourceGroup !== null) {
      if (targetGroup !== state.sourceGroup) return;
    }
    const prevRects = /* @__PURE__ */ new Map();
    for (const it of items) {
      prevRects.set(it, it.getBoundingClientRect());
    }
    const targetParent = targetItem.parentElement;
    if (!targetParent) return;
    const insertBefore = target.position === "before" ? targetItem : targetItem.nextSibling;
    const alreadyThere = state.sourceItem.parentElement === targetParent && state.sourceItem.nextSibling === insertBefore;
    if (alreadyThere) return;
    targetParent.insertBefore(state.sourceItem, insertBefore);
    flipSiblings(prevRects);
    const newItems = getItems();
    const newIndex = newItems.indexOf(state.sourceItem);
    if (newIndex !== state.currentIndex || targetGroup !== state.currentGroup) {
      state.currentIndex = newIndex;
      state.currentGroup = targetGroup;
      onPreview == null ? void 0 : onPreview(state.sourceIndex, newIndex);
    }
  }
  function commitDrag() {
    if (!state) return;
    const { sourceItem, sourceIndex, sourceGroup } = state;
    const finalItems = getItems();
    const currentIndex = finalItems.indexOf(sourceItem);
    const currentGroup = (getGroupOf == null ? void 0 : getGroupOf(sourceItem)) ?? null;
    cleanupDrag();
    if (sourceIndex !== currentIndex || sourceGroup !== currentGroup) {
      const groupItems = getGroupItems(getItems(), currentGroup);
      const posInGroup = groupItems.indexOf(sourceItem) + 1;
      announce(
        getOrCreateLiveRegion(),
        `Moved item to position ${posInGroup} of ${groupItems.length}`
      );
      onCommit == null ? void 0 : onCommit(sourceIndex, currentIndex, sourceGroup, currentGroup);
    }
  }
  function cancelDrag() {
    if (!state) return;
    if (state.sourceParent) {
      state.sourceParent.insertBefore(state.sourceItem, state.sourceNextSibling);
    }
    cleanupDrag();
    onCancel == null ? void 0 : onCancel();
  }
  function cleanupDrag() {
    if (!state) return;
    state.sourceItem.classList.remove(ghostClass);
    state.clone.remove();
    const items = getItems();
    for (const it of items) {
      if (it.style.transform) it.style.transform = "";
      if (it.style.transition) it.style.transition = "";
    }
    container.classList.remove("is-dragging");
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerCancel);
    document.removeEventListener("keydown", onKeydownDuringDrag);
    if (lockCrossAxisToContainer) {
      window.removeEventListener("scroll", onScrollDuringDrag, true);
    }
    state = null;
  }
  function cleanupPending() {
    if (!pending) return;
    document.removeEventListener("pointermove", onPendingPointerMove);
    document.removeEventListener("pointerup", onPendingPointerUp);
    document.removeEventListener("pointercancel", onPendingPointerCancel);
    pending = null;
  }
  function onPointerDown(e) {
    var _a, _b;
    if (destroyed) return;
    const target = e.target;
    let handleEl = null;
    if (handleSelector) {
      handleEl = target.closest(handleSelector);
      if (!handleEl) return;
    }
    const item = target.closest(itemSelector);
    if (!item || !container.contains(item)) return;
    if (dragThreshold > 0) {
      pending = {
        item,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        pointerTarget: target
      };
      document.addEventListener("pointermove", onPendingPointerMove);
      document.addEventListener("pointerup", onPendingPointerUp);
      document.addEventListener("pointercancel", onPendingPointerCancel);
      return;
    }
    e.preventDefault();
    (_b = (_a = e.target).setPointerCapture) == null ? void 0 : _b.call(_a, e.pointerId);
    startDrag(item, e.clientX, e.clientY);
  }
  function onPendingPointerMove(e) {
    var _a, _b;
    if (!pending || e.pointerId !== pending.pointerId) return;
    const primaryDelta = axis === "y" ? Math.abs(e.clientY - pending.startY) : Math.abs(e.clientX - pending.startX);
    const crossDelta = axis === "y" ? Math.abs(e.clientX - pending.startX) : Math.abs(e.clientY - pending.startY);
    const tripped = primaryDelta >= dragThreshold;
    if (!tripped) return;
    if (crossDelta > primaryDelta * 1.5) return;
    e.preventDefault();
    const { item } = pending;
    (_b = (_a = pending.pointerTarget) == null ? void 0 : _a.setPointerCapture) == null ? void 0 : _b.call(_a, pending.pointerId);
    cleanupPending();
    startDrag(item, e.clientX, e.clientY);
    moveDrag(e.clientX, e.clientY);
  }
  function onPendingPointerUp(_e) {
    cleanupPending();
  }
  function onPendingPointerCancel(_e) {
    cleanupPending();
  }
  function onPointerMove(e) {
    moveDrag(e.clientX, e.clientY);
  }
  function onScrollDuringDrag(_e) {
    syncCloneCrossAxis();
  }
  function onPointerUp(_e) {
    commitDrag();
  }
  function onPointerCancel(_e) {
    cancelDrag();
  }
  function onKeydownDuringDrag(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      cancelDrag();
    }
  }
  function onKeydownForReorder(e) {
    if (destroyed || state) return;
    if (!e.ctrlKey && !e.metaKey) return;
    const decKey = axis === "y" ? "ArrowUp" : "ArrowLeft";
    const incKey = axis === "y" ? "ArrowDown" : "ArrowRight";
    if (e.key !== decKey && e.key !== incKey) return;
    const target = e.target;
    const handle = handleSelector ? target.closest(handleSelector) : null;
    if (handleSelector && !handle) return;
    const item = target.closest(itemSelector);
    if (!item || !container.contains(item)) return;
    e.preventDefault();
    const items = getItems();
    const index = getItemIndex(items, item);
    if (index === -1) return;
    const group = (getGroupOf == null ? void 0 : getGroupOf(item)) ?? null;
    const direction = e.key === decKey ? -1 : 1;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const targetItem = items[newIndex];
    const targetGroup = (getGroupOf == null ? void 0 : getGroupOf(targetItem)) ?? null;
    if (!allowCrossGroup && getGroupOf && group !== null) {
      if (targetGroup !== group) return;
    }
    const groupItems = getGroupItems(items, targetGroup ?? group);
    const posInGroup = groupItems.indexOf(targetItem) + 1;
    const directionLabel = axis === "y" ? direction === -1 ? "up" : "down" : direction === -1 ? "left" : "right";
    announce(
      getOrCreateLiveRegion(),
      `Moved item ${directionLabel} to position ${posInGroup} of ${groupItems.length}`
    );
    onCommit == null ? void 0 : onCommit(index, newIndex, group, targetGroup);
  }
  container.addEventListener("pointerdown", onPointerDown);
  container.addEventListener("keydown", onKeydownForReorder);
  return {
    destroy() {
      destroyed = true;
      cleanupPending();
      if (state) cancelDrag();
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("keydown", onKeydownForReorder);
    },
    isDragging() {
      return state !== null;
    }
  };
}
exports.createSortableList = createSortableList;
//# sourceMappingURL=index34.cjs.map
