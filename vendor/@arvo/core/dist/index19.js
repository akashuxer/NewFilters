import { computePosition } from "./index15.js";
import { createPositionWatcher } from "./index16.js";
import { applyPositionToSurface } from "./index17.js";
import { createFocusTrap } from "./index5.js";
import { createMask } from "./index23.js";
import { enter, exit } from "./index13.js";
import { overlayHub } from "./index18.js";
import { lockPageScroll } from "./index22.js";
const DEFAULT_TRANSITION_DURATION = 150;
let _idCounter = 0;
function resolveMountTarget(target) {
  return typeof target === "function" ? target() : target;
}
function defaultApplyPosition(result, surface) {
  applyPositionToSurface(result, surface);
}
function resolveSurfaceWidth(width, trigger) {
  if (width == null) return null;
  if (width === "anchor") {
    if (!trigger) return null;
    return `${trigger.getBoundingClientRect().width}px`;
  }
  if (typeof width === "number") return `${width}px`;
  return width;
}
function createOverlaySurface(options) {
  const hub = options.hub ?? overlayHub;
  const id = options.id ?? `arvo-surface-${++_idCounter}`;
  const surface = options.surface;
  const openClass = options.openClass ?? "open";
  let _trigger = options.trigger ?? null;
  let _lockedPlacement = null;
  let _anchorPagePoint = viewportToPagePoint(options.anchorRect ?? null);
  let _isOpen = false;
  let _watcher = null;
  let _trap = null;
  let _mask = null;
  let _unlockScroll = null;
  let _closing = false;
  function viewportToPagePoint(rect) {
    if (!rect) return null;
    return { x: rect.x + window.scrollX, y: rect.y + window.scrollY };
  }
  function liveAnchorPoint() {
    if (!_anchorPagePoint) return null;
    return {
      x: _anchorPagePoint.x - window.scrollX,
      y: _anchorPagePoint.y - window.scrollY
    };
  }
  function ariaTargetEl() {
    if (options.triggerAria === false) return null;
    const aria = options.triggerAria ?? {};
    return aria.element ?? _trigger;
  }
  function wireTriggerAria() {
    if (options.triggerAria === false) return;
    const el = ariaTargetEl();
    if (!el) return;
    const aria = options.triggerAria ?? {};
    if (aria.haspopup !== false) {
      el.setAttribute(
        "aria-haspopup",
        aria.haspopup == null || aria.haspopup === true ? "true" : aria.haspopup
      );
    }
    const controls = aria.controls ?? (surface.id || void 0);
    if (controls) el.setAttribute("aria-controls", controls);
    if (aria.expanded !== false) el.setAttribute("aria-expanded", "false");
  }
  function setExpanded(expanded) {
    if (options.triggerAria === false) return;
    if ((options.triggerAria ?? {}).expanded === false) return;
    const el = ariaTargetEl();
    if (!el) return;
    el.setAttribute("aria-expanded", expanded ? "true" : "false");
  }
  function applyPosition(result) {
    var _a, _b;
    if (options.position === false) return;
    const apply = ((_a = options.position) == null ? void 0 : _a.apply) ?? defaultApplyPosition;
    apply(result, surface);
    (_b = options.onPosition) == null ? void 0 : _b.call(options, result);
  }
  function startPositioning() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    if (options.position === false) return;
    const livePoint = liveAnchorPoint();
    const anchor = _trigger ?? livePoint ?? null;
    if (!anchor) return;
    const posOpts = {
      placement: (_a = options.position) == null ? void 0 : _a.placement,
      gap: (_b = options.position) == null ? void 0 : _b.gap,
      margin: (_c = options.position) == null ? void 0 : _c.margin,
      width: (_d = options.position) == null ? void 0 : _d.width,
      boundary: (_e = options.position) == null ? void 0 : _e.boundary,
      flip: (_f = options.position) == null ? void 0 : _f.flip
    };
    const resolvedWidth = resolveSurfaceWidth((_g = options.position) == null ? void 0 : _g.width, _trigger);
    if (resolvedWidth != null) {
      surface.style.setProperty("--arvo-overlay-width", resolvedWidth);
    }
    const initial = computePosition(anchor, surface, posOpts);
    _lockedPlacement = initial.placement;
    applyPosition(initial);
    const lockOnFloatSize = ((_h = options.position) == null ? void 0 : _h.lockPlacementOnFloatResize) === true;
    const onWatcherUpdate = (_result, source) => {
      if (lockOnFloatSize && source === "float-size" && _lockedPlacement != null) {
        const lockedAnchor = _trigger ?? liveAnchorPoint() ?? null;
        if (!lockedAnchor) return;
        const locked = computePosition(lockedAnchor, surface, {
          ...posOpts,
          placement: _lockedPlacement
        });
        applyPosition(locked);
        return;
      }
      _lockedPlacement = _result.placement;
      applyPosition(_result);
    };
    if (_trigger) {
      _watcher = createPositionWatcher(
        _trigger,
        surface,
        { ...posOpts, observeContainerSelector: (_i = options.position) == null ? void 0 : _i.observeContainerSelector },
        onWatcherUpdate
      );
    } else if (_anchorPagePoint) {
      _watcher = createPositionWatcher(
        () => liveAnchorPoint() ?? { x: 0, y: 0 },
        surface,
        { ...posOpts, observeContainerSelector: (_j = options.position) == null ? void 0 : _j.observeContainerSelector },
        onWatcherUpdate
      );
    }
  }
  function activateTrap() {
    const focus = options.focus;
    if (!focus || focus.mode !== "trap") return;
    _trap = createFocusTrap();
    _trap.activate({
      container: surface,
      initialFocus: focus.initialFocus ?? "first",
      returnFocusOnDeactivate: focus.returnFocus ?? Boolean(_trigger),
      escapeDeactivates: focus.escapeDeactivates ?? false,
      allowOutsideClick: focus.allowOutsideClick ?? true,
      getOrderedElements: focus.getOrderedElements,
      // Canonical return target -- always prefer the live trigger element
      // over `saveFocus()`'s "whichever element happened to be focused at
      // activation time" capture. The latter is fragile: if the component
      // moves DOM focus AFTER activation (e.g. ActionMenu's filter search
      // input on rAF), or the trap is re-activated for any reason, the
      // saved focus drifts to the wrong element and restoreFocus targets
      // something that no longer exists on close. The function form re-
      // resolves the trigger lazily so a re-triggered surface still hits
      // the right element.
      returnFocusTo: () => _trigger
    });
  }
  function setupMask() {
    if (!options.mask) return;
    const maskOpts = options.mask === true ? {} : { ...options.mask };
    _mask = createMask(maskOpts);
    _mask.show();
    const z = hub.getZIndex(id);
    _mask.element.style.zIndex = String(z - 1);
    hub.attachMaskElement(id, _mask.element);
  }
  const surfaceApi = {
    id,
    async open() {
      var _a, _b, _c;
      if (_isOpen) return;
      _isOpen = true;
      _closing = false;
      if (options.mount) {
        const target = resolveMountTarget(options.mount.target);
        target == null ? void 0 : target.appendChild(surface);
      }
      surface.classList.add(openClass);
      setExpanded(true);
      const focusIsTrap = ((_a = options.focus) == null ? void 0 : _a.mode) === "trap";
      hub.open({
        id,
        type: options.type,
        element: surface,
        triggerElement: _trigger ?? void 0,
        priority: options.priority ?? 0,
        parentId: options.parentId,
        relation: options.relation,
        zIndex: options.zIndex,
        config: {
          autoCloseOnOutsideClick: options.closeOnOutside ?? true,
          // Avoid the hub double-trapping/painting when the engine owns it.
          managesOwnFocus: options.managesOwnFocus ?? focusIsTrap,
          managesOwnBackdrop: options.managesOwnBackdrop ?? Boolean(options.mask)
        },
        onClose: () => {
          void surfaceApi.close();
        }
      });
      if (options.surfaceRoot) {
        hub.attachWrapperElement(id, options.surfaceRoot);
      }
      startPositioning();
      setupMask();
      if (options.lockScroll) {
        _unlockScroll = lockPageScroll();
      }
      const trapAfter = (_b = options.focus) == null ? void 0 : _b.activateAfterTransition;
      if (!trapAfter) activateTrap();
      (_c = options.onOpen) == null ? void 0 : _c.call(options);
      if (options.transition) {
        await enter({
          element: surface,
          type: options.transition,
          duration: options.transitionDuration ?? DEFAULT_TRANSITION_DURATION
        });
      }
      if (trapAfter && _isOpen) activateTrap();
    },
    async close() {
      var _a, _b, _c;
      if (!_isOpen || _closing) return;
      _closing = true;
      _isOpen = false;
      _trap == null ? void 0 : _trap.deactivate();
      _trap = null;
      _watcher == null ? void 0 : _watcher.destroy();
      _watcher = null;
      _lockedPlacement = null;
      hub.attachMaskElement(id, null);
      _mask == null ? void 0 : _mask.hide();
      _mask = null;
      if (options.surfaceRoot) {
        hub.attachWrapperElement(id, null);
      }
      _unlockScroll == null ? void 0 : _unlockScroll();
      _unlockScroll = null;
      hub.close(id);
      setExpanded(false);
      (_a = options.onClose) == null ? void 0 : _a.call(options);
      if (options.transition) {
        await exit({
          element: surface,
          type: options.transition,
          duration: options.transitionDuration ?? DEFAULT_TRANSITION_DURATION,
          onComplete: () => {
            var _a2;
            surface.classList.remove(openClass);
            if ((_a2 = options.mount) == null ? void 0 : _a2.removeOnClose) surface.remove();
          }
        });
      } else {
        surface.classList.remove(openClass);
        if ((_b = options.mount) == null ? void 0 : _b.removeOnClose) surface.remove();
      }
      const returnFocus = ((_c = options.focus) == null ? void 0 : _c.returnFocus) ?? Boolean(_trigger);
      const focused = document.activeElement;
      const focusIsLost = !focused || focused === document.body || focused === document.documentElement;
      const focusIsInClosingSurface = focused != null && surface.contains(focused);
      if (returnFocus && _trigger && document.body.contains(_trigger) && document.activeElement !== _trigger && !_trigger.contains(document.activeElement) && (focusIsLost || focusIsInClosingSurface)) {
        _trigger.focus({ preventScroll: true });
      }
      _closing = false;
    },
    isOpen() {
      return _isOpen;
    },
    reposition() {
      var _a, _b, _c, _d, _e, _f;
      if (!_isOpen) return;
      if (_watcher) {
        _watcher.update();
      } else if (_anchorPagePoint && options.position !== false) {
        const livePoint = liveAnchorPoint();
        if (!livePoint) return;
        const posOpts = {
          placement: (_a = options.position) == null ? void 0 : _a.placement,
          gap: (_b = options.position) == null ? void 0 : _b.gap,
          margin: (_c = options.position) == null ? void 0 : _c.margin,
          width: (_d = options.position) == null ? void 0 : _d.width,
          boundary: (_e = options.position) == null ? void 0 : _e.boundary,
          flip: (_f = options.position) == null ? void 0 : _f.flip
        };
        applyPosition(computePosition(livePoint, surface, posOpts));
      }
    },
    setTrigger(trigger) {
      const previousTrigger = _trigger;
      _trigger = trigger;
      wireTriggerAria();
      if (_isOpen && previousTrigger !== trigger) {
        _watcher == null ? void 0 : _watcher.destroy();
        _watcher = null;
        startPositioning();
      } else if (_isOpen) {
        surfaceApi.reposition();
      }
    },
    setAnchorRect(rect) {
      const wasPoint = _anchorPagePoint != null;
      _anchorPagePoint = viewportToPagePoint(rect);
      const nowPoint = _anchorPagePoint != null;
      if (_isOpen) {
        if (!_trigger && wasPoint !== nowPoint) {
          _watcher == null ? void 0 : _watcher.destroy();
          _watcher = null;
          startPositioning();
        } else {
          surfaceApi.reposition();
        }
      }
    },
    destroy() {
      if (_isOpen) {
        _isOpen = false;
        _trap == null ? void 0 : _trap.deactivate();
        _trap = null;
        _watcher == null ? void 0 : _watcher.destroy();
        _watcher = null;
        _lockedPlacement = null;
        _mask == null ? void 0 : _mask.destroy();
        _mask = null;
        if (options.surfaceRoot) {
          hub.attachWrapperElement(id, null);
        }
        _unlockScroll == null ? void 0 : _unlockScroll();
        _unlockScroll = null;
        hub.close(id);
      }
      if (options.triggerAria !== false) {
        const el = ariaTargetEl();
        if (el) {
          el.removeAttribute("aria-haspopup");
          el.removeAttribute("aria-controls");
          el.removeAttribute("aria-expanded");
        }
      }
    }
  };
  wireTriggerAria();
  return surfaceApi;
}
export {
  createOverlaySurface
};
//# sourceMappingURL=index19.js.map
