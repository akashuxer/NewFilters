import { computePosition } from "./index15.js";
import { overlayHub } from "./index18.js";
import { enter, exit } from "./index13.js";
import { prefersReducedMotion } from "./index14.js";
import { formatShortcutDisplay } from "./index12.js";
const DEFAULT_CONFIG = {
  enabled: true,
  hoverDelay: 500,
  hideDelay: 0,
  gap: 4,
  defaultPlacement: "bottom-center"
};
const VALID_TOOLTIP_PLACEMENTS = /* @__PURE__ */ new Set([
  "top-start",
  "top-center",
  "top-end",
  "bottom-start",
  "bottom-center",
  "bottom-end",
  "left-start",
  "left-center",
  "left-end",
  "right-start",
  "right-center",
  "right-end"
]);
function normalizePlacement(requested, fallback) {
  if (requested && VALID_TOOLTIP_PLACEMENTS.has(requested)) return requested;
  return fallback;
}
const TIP_ID = "arvo-tip";
const OVERLAY_ID = "arvo-tooltip-overlay";
const FADE_DURATION = 120;
let _uid = 0;
function nextId() {
  return `${TIP_ID}-${++_uid}`;
}
function createTooltipManager(deps) {
  let _config = { ...DEFAULT_CONFIG };
  const _hub = (deps == null ? void 0 : deps.hub) ?? overlayHub;
  let _el = null;
  let _txtEl = null;
  let _shortcutEl = null;
  const _tipId = nextId();
  let _visible = false;
  let _currentAnchor = null;
  let _showTimer = null;
  let _hideTimer = null;
  let _escHandler = null;
  let _animating = false;
  let _abortHide = false;
  function ensureElement() {
    if (_el) return _el;
    _el = document.createElement("div");
    _el.className = "arvo-tip";
    _el.setAttribute("role", "tooltip");
    _el.id = _tipId;
    _el.style.position = "absolute";
    _el.style.display = "none";
    _txtEl = document.createElement("span");
    _txtEl.className = "arvo-tip__txt";
    _el.appendChild(_txtEl);
    _shortcutEl = document.createElement("span");
    _shortcutEl.className = "arvo-tip__shortcut";
    _shortcutEl.style.display = "none";
    _el.appendChild(_shortcutEl);
    const container = _hub.getContainer();
    container.appendChild(_el);
    return _el;
  }
  function clearTimers() {
    if (_showTimer != null) {
      clearTimeout(_showTimer);
      _showTimer = null;
    }
    if (_hideTimer != null) {
      clearTimeout(_hideTimer);
      _hideTimer = null;
    }
  }
  function scheduleHide() {
    if (_hideTimer != null) return;
    _hideTimer = setTimeout(() => {
      _hideTimer = null;
      doHide();
    }, _config.hideDelay);
  }
  function attachEscListener() {
    if (_escHandler) return;
    _escHandler = (e) => {
      if (e.key === "Escape" && _visible) {
        doHide();
        if (document.activeElement && document.activeElement !== document.body) {
          try {
            if (document.activeElement.matches(":focus-visible")) {
              document.activeElement.blur();
            }
          } catch {
          }
        }
      }
    };
    document.addEventListener("keydown", _escHandler, true);
  }
  function detachEscListener() {
    if (_escHandler) {
      document.removeEventListener("keydown", _escHandler, true);
      _escHandler = null;
    }
  }
  function updateContent(content, shortcut) {
    if (_txtEl) _txtEl.textContent = content;
    if (_shortcutEl) {
      const display = shortcut ? formatShortcutDisplay(shortcut) : "";
      if (display) {
        _shortcutEl.textContent = display;
        _shortcutEl.style.display = "";
      } else {
        _shortcutEl.textContent = "";
        _shortcutEl.style.display = "none";
      }
    }
  }
  function positionTooltip(anchor, el, options) {
    const placement = normalizePlacement(options.placement, _config.defaultPlacement);
    const result = computePosition(anchor, el, {
      placement,
      gap: _config.gap,
      // Tooltips intentionally cascade to adjacent (perpendicular) sides
      // when neither the requested side nor its opposite fits. Documented
      // in `descriptors/tooltip.json`. ArvoRichTooltip mirrors this.
      flip: "any"
    });
    el.style.translate = `${Math.round(result.x)}px ${Math.round(result.y)}px`;
    el.style.top = "0";
    el.style.left = "0";
    el.setAttribute(
      "data-arvo-side",
      result.placement.startsWith("top") ? "top" : result.placement.startsWith("left") ? "left" : result.placement.startsWith("right") ? "right" : "bottom"
    );
  }
  async function doShow(options) {
    if (_visible && _currentAnchor === options.anchor) {
      updateContent(options.content, options.shortcut);
      return;
    }
    if (_animating) {
      _abortHide = true;
      _animating = false;
      if (_el) {
        _el.style.display = "";
        _el.style.opacity = "";
      }
    }
    const el = ensureElement();
    if (_visible && _currentAnchor && _currentAnchor !== options.anchor) {
      removeAriaFromAnchor(_currentAnchor);
    }
    updateContent(options.content, options.shortcut);
    el.style.display = "";
    el.style.opacity = "0";
    positionTooltip(options.anchor, el, options);
    if (!options.suppressAria) {
      setAriaOnAnchor(options.anchor);
    }
    _currentAnchor = options.anchor;
    _visible = true;
    if (!_hub.isOpen(OVERLAY_ID)) {
      _hub.open({
        id: OVERLAY_ID,
        type: "tooltip",
        element: el,
        triggerElement: options.anchor,
        priority: 0,
        config: { autoCloseOnOutsideClick: false }
      });
    }
    attachEscListener();
    el.style.opacity = "";
    if (!prefersReducedMotion()) {
      _animating = true;
      await enter({ element: el, type: "fade", duration: FADE_DURATION });
      _animating = false;
    }
  }
  async function doHide() {
    clearTimers();
    if (!_visible || !_el) return;
    if (_currentAnchor) {
      removeAriaFromAnchor(_currentAnchor);
    }
    _visible = false;
    if (!prefersReducedMotion() && !_animating) {
      _animating = true;
      _abortHide = false;
      await exit({ element: _el, type: "fade", duration: FADE_DURATION });
      if (_abortHide) {
        _abortHide = false;
        return;
      }
      _animating = false;
    }
    if (_el) _el.style.display = "none";
    _currentAnchor = null;
    if (_hub.isOpen(OVERLAY_ID)) {
      _hub.close(OVERLAY_ID);
    }
    detachEscListener();
  }
  function setAriaOnAnchor(anchor) {
    const existing = anchor.getAttribute("aria-describedby");
    if (existing) {
      if (!existing.split(/\s+/).includes(_tipId)) {
        anchor.setAttribute("aria-describedby", `${existing} ${_tipId}`);
      }
    } else {
      anchor.setAttribute("aria-describedby", _tipId);
    }
  }
  function removeAriaFromAnchor(anchor) {
    const existing = anchor.getAttribute("aria-describedby");
    if (!existing) return;
    const ids = existing.split(/\s+/).filter((id) => id !== _tipId);
    if (ids.length > 0) {
      anchor.setAttribute("aria-describedby", ids.join(" "));
    } else {
      anchor.removeAttribute("aria-describedby");
    }
  }
  const manager = {
    configure(config) {
      _config = { ..._config, ...config };
    },
    getConfig() {
      return { ..._config };
    },
    show(options) {
      if (!_config.enabled) return;
      clearTimers();
      const delay = options.trigger === "focus" ? 0 : _config.hoverDelay;
      if (delay <= 0) {
        doShow(options);
      } else {
        _showTimer = setTimeout(() => {
          _showTimer = null;
          doShow(options);
        }, delay);
      }
    },
    hide(immediate = false) {
      if (_showTimer != null) {
        clearTimeout(_showTimer);
        _showTimer = null;
      }
      if (immediate) {
        clearTimers();
        doHide();
      } else {
        scheduleHide();
      }
    },
    isVisible() {
      return _visible;
    },
    getElement() {
      return _el;
    },
    destroy() {
      clearTimers();
      detachEscListener();
      if (_currentAnchor) {
        removeAriaFromAnchor(_currentAnchor);
      }
      if (_hub.isOpen(OVERLAY_ID)) {
        _hub.close(OVERLAY_ID);
      }
      if (_el) {
        _el.remove();
        _el = null;
        _txtEl = null;
        _shortcutEl = null;
      }
      _visible = false;
      _currentAnchor = null;
      _animating = false;
    }
  };
  return manager;
}
const tooltipManager = createTooltipManager();
export {
  createTooltipManager,
  tooltipManager
};
//# sourceMappingURL=index38.js.map
