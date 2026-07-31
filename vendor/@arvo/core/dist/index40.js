const LONG_PRESS_MOVE_TOLERANCE_PX = 10;
function isContextMenuKey(event) {
  if (event.key === "ContextMenu") return true;
  if (event.shiftKey && event.key === "F10") return true;
  return false;
}
function resolveInvoker(raw, selector, target) {
  if (!(raw instanceof Element)) {
    return selector ? null : target;
  }
  if (!selector) {
    return target;
  }
  const match = raw.closest(selector);
  if (!(match instanceof HTMLElement)) return null;
  if (!target.contains(match)) return null;
  return match;
}
function anchorFromPointerEvent(event) {
  return { kind: "point", x: event.clientX, y: event.clientY };
}
function anchorFromElement(element) {
  return { kind: "element", element };
}
function createContextMenuController(options) {
  const {
    target,
    contextSelector,
    resolveContext,
    onRequest,
    longPressMs = 0,
    keyboard = true
  } = options;
  let destroyed = false;
  let longPressTimer;
  let longPressStartX = 0;
  let longPressStartY = 0;
  let longPressInvoker = null;
  let longPressTouchId = null;
  function dispatch(request, nativeEvent) {
    if (destroyed) return;
    let prevented = false;
    const helpers = {
      preventDefault: () => {
        if (prevented) return;
        prevented = true;
        nativeEvent == null ? void 0 : nativeEvent.preventDefault();
      }
    };
    const ret = onRequest(request, helpers);
    const finalize = (decision) => {
      if (decision === true) helpers.preventDefault();
    };
    if (ret && typeof ret.then === "function") {
      ret.then(finalize, () => {
      });
    } else {
      finalize(ret);
    }
  }
  function buildRequest(invoker, anchor, modality, originalEvent) {
    const context = resolveContext ? resolveContext(invoker) : null;
    return { context, invoker, anchor, modality, originalEvent };
  }
  function handleContextMenu(event) {
    if (destroyed) return;
    const invoker = resolveInvoker(event.target, contextSelector, target);
    if (!invoker) return;
    const hasPoint = Number.isFinite(event.clientX) && Number.isFinite(event.clientY);
    const anchor = hasPoint ? anchorFromPointerEvent(event) : anchorFromElement(invoker);
    dispatch(buildRequest(invoker, anchor, "pointer", event), event);
  }
  function handleKeyDown(event) {
    if (destroyed || !keyboard) return;
    if (!isContextMenuKey(event)) return;
    const active = target.ownerDocument.activeElement instanceof HTMLElement ? target.ownerDocument.activeElement : null;
    const candidate = active && target.contains(active) ? active : event.target;
    const invoker = resolveInvoker(candidate, contextSelector, target);
    if (!invoker) return;
    dispatch(
      buildRequest(invoker, anchorFromElement(invoker), "keyboard", event),
      event
    );
  }
  function clearLongPress() {
    if (longPressTimer !== void 0) {
      clearTimeout(longPressTimer);
      longPressTimer = void 0;
    }
    longPressInvoker = null;
    longPressTouchId = null;
  }
  function handleTouchStart(event) {
    if (destroyed || longPressMs <= 0) return;
    if (event.touches.length !== 1) {
      clearLongPress();
      return;
    }
    const touch = event.touches[0];
    const invoker = resolveInvoker(event.target, contextSelector, target);
    if (!invoker) return;
    longPressInvoker = invoker;
    longPressStartX = touch.clientX;
    longPressStartY = touch.clientY;
    longPressTouchId = touch.identifier;
    longPressTimer = setTimeout(() => {
      longPressTimer = void 0;
      const inv = longPressInvoker;
      if (!inv) return;
      dispatch(
        buildRequest(
          inv,
          { kind: "point", x: longPressStartX, y: longPressStartY },
          "touch",
          event
        ),
        event
      );
      clearLongPress();
    }, longPressMs);
  }
  function handleTouchMove(event) {
    if (destroyed || longPressTimer === void 0) return;
    let touch = null;
    for (let i = 0; i < event.changedTouches.length; i++) {
      if (event.changedTouches[i].identifier === longPressTouchId) {
        touch = event.changedTouches[i];
        break;
      }
    }
    if (!touch) return;
    const dx = touch.clientX - longPressStartX;
    const dy = touch.clientY - longPressStartY;
    if (dx * dx + dy * dy > LONG_PRESS_MOVE_TOLERANCE_PX * LONG_PRESS_MOVE_TOLERANCE_PX) {
      clearLongPress();
    }
  }
  function handleTouchEndOrCancel() {
    clearLongPress();
  }
  target.addEventListener("contextmenu", handleContextMenu);
  if (keyboard) {
    target.addEventListener("keydown", handleKeyDown);
  }
  if (longPressMs > 0) {
    target.addEventListener("touchstart", handleTouchStart, {
      passive: true
    });
    target.addEventListener("touchmove", handleTouchMove, {
      passive: true
    });
    target.addEventListener("touchend", handleTouchEndOrCancel);
    target.addEventListener("touchcancel", handleTouchEndOrCancel);
  }
  return {
    request(init) {
      if (destroyed) return;
      const invoker = init.invoker ?? target;
      const modality = init.modality ?? "pointer";
      const fakeEvent = init.originalEvent ?? {
        preventDefault: () => {
        }
      };
      dispatch(
        {
          context: init.context ?? (resolveContext ? resolveContext(invoker) : null),
          invoker,
          anchor: init.anchor,
          modality,
          originalEvent: fakeEvent
        },
        fakeEvent
      );
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      clearLongPress();
      target.removeEventListener("contextmenu", handleContextMenu);
      if (keyboard) {
        target.removeEventListener("keydown", handleKeyDown);
      }
      if (longPressMs > 0) {
        target.removeEventListener("touchstart", handleTouchStart);
        target.removeEventListener("touchmove", handleTouchMove);
        target.removeEventListener("touchend", handleTouchEndOrCancel);
        target.removeEventListener("touchcancel", handleTouchEndOrCancel);
      }
    }
  };
}
export {
  createContextMenuController
};
//# sourceMappingURL=index40.js.map
