"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}
function resolveTarget(target) {
  if (!target) return null;
  if (typeof target === "string") {
    return document.querySelector(target);
  }
  return target;
}
function detectInverse(splitter, target) {
  const pos = splitter.compareDocumentPosition(target);
  return Boolean(pos & 4);
}
function measureTarget(target, orientation) {
  const rect = target.getBoundingClientRect();
  return orientation === "vertical" ? rect.width : rect.height;
}
function applyTargetSize(target, size, orientation) {
  const prop = orientation === "vertical" ? "width" : "height";
  target.style[prop] = `${size}px`;
}
const _ArvoSplitter = class _ArvoSplitter {
  constructor(element, options = {}) {
    this._handleEl = null;
    this._resolvedTargetEl = null;
    this._isDragging = false;
    this._dragStartCoord = 0;
    this._dragStartValue = 0;
    this._element = element;
    this._options = {
      ..._ArvoSplitter.DEFAULTS,
      ...options,
      value: typeof options.value === "number" ? options.value : null,
      defaultValue: typeof options.defaultValue === "number" ? options.defaultValue : null,
      inverse: typeof options.inverse === "boolean" ? options.inverse : null,
      target: options.target ?? null,
      maxSize: typeof options.maxSize === "number" ? options.maxSize : null,
      ariaLabel: options.ariaLabel ?? null,
      ariaControls: options.ariaControls ?? null,
      onResizeStart: options.onResizeStart ?? null,
      onResize: options.onResize ?? null,
      onResizeEnd: options.onResizeEnd ?? null,
      onChange: options.onChange ?? null,
      onReset: options.onReset ?? null
    };
    const effectiveMax = this._options.maxSize !== null ? this._options.maxSize : Number.MAX_SAFE_INTEGER;
    if (effectiveMax <= this._options.minSize && this._options.maxSize !== null) {
      throw new Error("[ArvoSplitter] maxSize must be greater than minSize.");
    }
    if (this._options.isResizable && !this._options.ariaLabel) {
      throw new Error(
        "[ArvoSplitter] ariaLabel is required when isResizable=true."
      );
    }
    this._resolvedTargetEl = resolveTarget(this._options.target);
    if (this._options.inverse !== null) {
      this._effectiveInverse = this._options.inverse;
    } else if (this._resolvedTargetEl) {
      this._effectiveInverse = detectInverse(element, this._resolvedTargetEl);
    } else {
      this._effectiveInverse = false;
    }
    const initial = typeof this._options.value === "number" ? this._options.value : typeof this._options.defaultValue === "number" ? this._options.defaultValue : this._resolvedTargetEl ? measureTarget(this._resolvedTargetEl, this._options.orientation) : this._options.minSize;
    this._currentValue = clamp(initial, this._options.minSize, effectiveMax);
    if (typeof this._options.defaultValue === "number") {
      this._resetTarget = clamp(
        this._options.defaultValue,
        this._options.minSize,
        effectiveMax
      );
    } else if (this._resolvedTargetEl) {
      const measured = measureTarget(
        this._resolvedTargetEl,
        this._options.orientation
      );
      this._resetTarget = clamp(
        measured > 0 ? measured : this._options.minSize,
        this._options.minSize,
        effectiveMax
      );
    } else {
      this._resetTarget = this._options.minSize;
    }
    this._boundHandlePointerDown = this._handlePointerDown.bind(this);
    this._boundHandleKeyDown = this._handleKeyDown.bind(this);
    this._boundHandleDoubleClick = this._handleDoubleClick.bind(this);
    this._boundHandlePointerMove = this._handlePointerMove.bind(this);
    this._boundHandlePointerUp = this._handlePointerUp.bind(this);
    this._render();
    this._bindEvents();
    this._applyTargetSize();
  }
  static initialize(element, options = {}) {
    return new _ArvoSplitter(element, options);
  }
  _render() {
    var _a;
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    const { orientation, isResizable, isDisabled, ariaLabel } = this._options;
    el.classList.add("arvo-spl", `arvo-spl--${orientation}`);
    if (isResizable) el.classList.add("arvo-spl--resizable");
    if (this._effectiveInverse) el.classList.add("arvo-spl--inverse");
    if (isResizable && isDisabled) {
      el.classList.add("arvo-spl--disabled", "is-disabled");
    }
    el.setAttribute("role", "separator");
    el.setAttribute("aria-orientation", orientation);
    if (isResizable) {
      el.setAttribute("aria-valuemin", String(this._options.minSize));
      if (this._options.maxSize !== null) {
        el.setAttribute("aria-valuemax", String(this._options.maxSize));
      }
      el.setAttribute("aria-valuenow", String(this._currentValue));
      if (ariaLabel) el.setAttribute("aria-label", ariaLabel);
      const ariaControls = this._options.ariaControls ?? ((_a = this._resolvedTargetEl) == null ? void 0 : _a.id) ?? null;
      if (ariaControls) el.setAttribute("aria-controls", ariaControls);
      if (isDisabled) el.setAttribute("aria-disabled", "true");
      el.tabIndex = isDisabled ? -1 : 0;
      this._handleEl = document.createElement("span");
      this._handleEl.className = "arvo-spl__handle";
      this._handleEl.setAttribute("aria-hidden", "true");
      el.appendChild(this._handleEl);
    }
  }
  _bindEvents() {
    const el = this._element;
    if (!el) return;
    if (!this._options.isResizable) return;
    el.addEventListener("pointerdown", this._boundHandlePointerDown);
    el.addEventListener("keydown", this._boundHandleKeyDown);
    el.addEventListener("dblclick", this._boundHandleDoubleClick);
  }
  _applyTargetSize() {
    if (!this._resolvedTargetEl) return;
    applyTargetSize(
      this._resolvedTargetEl,
      this._currentValue,
      this._options.orientation
    );
  }
  _handlePointerDown(event) {
    var _a, _b;
    if (this._options.isDisabled) return;
    const e = event;
    if (e.button !== 0) return;
    e.preventDefault();
    (_a = this._element) == null ? void 0 : _a.focus();
    this._isDragging = true;
    (_b = this._element) == null ? void 0 : _b.classList.add("active");
    const isVertical = this._options.orientation === "vertical";
    this._dragStartCoord = isVertical ? e.clientX : e.clientY;
    this._dragStartValue = this._currentValue;
    this._fireStart("pointer");
    window.addEventListener("pointermove", this._boundHandlePointerMove);
    window.addEventListener("pointerup", this._boundHandlePointerUp);
    window.addEventListener("pointercancel", this._boundHandlePointerUp);
  }
  _handlePointerMove(event) {
    if (!this._isDragging) return;
    const isVertical = this._options.orientation === "vertical";
    const coord = isVertical ? event.clientX : event.clientY;
    const rawDelta = coord - this._dragStartCoord;
    const delta = this._effectiveInverse ? -rawDelta : rawDelta;
    this._setValue(this._dragStartValue + delta, "pointer");
  }
  _handlePointerUp(_event) {
    var _a;
    if (!this._isDragging) return;
    this._isDragging = false;
    (_a = this._element) == null ? void 0 : _a.classList.remove("active");
    window.removeEventListener("pointermove", this._boundHandlePointerMove);
    window.removeEventListener("pointerup", this._boundHandlePointerUp);
    window.removeEventListener("pointercancel", this._boundHandlePointerUp);
    this._fireEnd("pointer");
  }
  _handleKeyDown(event) {
    if (this._options.isDisabled) return;
    const e = event;
    const { orientation, step, pageStep, minSize, maxSize } = this._options;
    const decreaseKey = orientation === "vertical" ? "ArrowLeft" : "ArrowUp";
    const increaseKey = orientation === "vertical" ? "ArrowRight" : "ArrowDown";
    let target = null;
    switch (e.key) {
      case decreaseKey:
        target = this._currentValue - step;
        break;
      case increaseKey:
        target = this._currentValue + step;
        break;
      case "PageUp":
        target = this._currentValue - pageStep;
        break;
      case "PageDown":
        target = this._currentValue + pageStep;
        break;
      case "Home":
        target = minSize;
        break;
      case "End":
        if (maxSize === null) return;
        target = maxSize;
        break;
      default:
        return;
    }
    e.preventDefault();
    this._fireStart("keyboard");
    this._setValue(target, "keyboard");
    this._fireEnd("keyboard");
  }
  _handleDoubleClick(event) {
    if (this._options.isDisabled) return;
    if (event.defaultPrevented) return;
    event.preventDefault();
    this._doReset();
  }
  _doReset() {
    var _a, _b;
    const effectiveMax = this._options.maxSize !== null ? this._options.maxSize : Number.MAX_SAFE_INTEGER;
    const next = clamp(
      this._resetTarget,
      this._options.minSize,
      effectiveMax
    );
    this._fireStart("reset");
    if (next !== this._currentValue) {
      this._setValue(next, "reset");
    }
    this._fireEnd("reset");
    const detail = { value: next };
    (_b = (_a = this._options).onReset) == null ? void 0 : _b.call(_a, detail);
    this._dispatchEvent("spl:reset", detail);
    return next;
  }
  _setValue(raw, reason) {
    var _a;
    const effectiveMax = this._options.maxSize !== null ? this._options.maxSize : Number.MAX_SAFE_INTEGER;
    const clamped = clamp(raw, this._options.minSize, effectiveMax);
    if (clamped === this._currentValue) return;
    this._currentValue = clamped;
    if (this._options.isResizable) {
      (_a = this._element) == null ? void 0 : _a.setAttribute("aria-valuenow", String(clamped));
    }
    this._applyTargetSize();
    this._fireResize(reason);
  }
  _fireStart(reason) {
    var _a, _b;
    const detail = { value: this._currentValue, reason };
    (_b = (_a = this._options).onResizeStart) == null ? void 0 : _b.call(_a, detail);
    this._dispatchEvent("spl:resize-start", detail);
  }
  _fireResize(reason) {
    var _a, _b, _c, _d;
    const detail = { value: this._currentValue, reason };
    (_b = (_a = this._options).onResize) == null ? void 0 : _b.call(_a, detail);
    (_d = (_c = this._options).onChange) == null ? void 0 : _d.call(_c, { value: this._currentValue });
    this._dispatchEvent("spl:resize", detail);
    this._dispatchEvent("spl:change", { value: this._currentValue });
  }
  _fireEnd(reason) {
    var _a, _b;
    const detail = { value: this._currentValue, reason };
    (_b = (_a = this._options).onResizeEnd) == null ? void 0 : _b.call(_a, detail);
    this._dispatchEvent("spl:resize-end", detail);
  }
  _dispatchEvent(name, detail) {
    if (!this._element) return;
    this._element.dispatchEvent(
      new CustomEvent(name, { detail, bubbles: true })
    );
  }
  // -- Public API ------------------------------------------------------------
  value(next) {
    if (typeof next === "number") {
      this._fireStart("programmatic");
      this._setValue(next, "programmatic");
      this._fireEnd("programmatic");
    }
    return this._currentValue;
  }
  disabled(state) {
    if (typeof state === "boolean" && state !== this._options.isDisabled) {
      this._options.isDisabled = state;
      const el = this._element;
      if (el && this._options.isResizable) {
        if (state) {
          el.classList.add("arvo-spl--disabled", "is-disabled");
          el.setAttribute("aria-disabled", "true");
          el.tabIndex = -1;
        } else {
          el.classList.remove("arvo-spl--disabled", "is-disabled");
          el.removeAttribute("aria-disabled");
          el.tabIndex = 0;
        }
      }
    }
    return this._options.isDisabled;
  }
  focus() {
    var _a;
    if (!this._options.isResizable) return;
    if (this._options.isDisabled) return;
    (_a = this._element) == null ? void 0 : _a.focus();
  }
  reset() {
    return this._doReset();
  }
  setTarget(target) {
    var _a, _b, _c;
    this._options.target = target;
    this._resolvedTargetEl = resolveTarget(target);
    if (this._options.inverse === null && this._element) {
      const next = this._resolvedTargetEl ? detectInverse(this._element, this._resolvedTargetEl) : false;
      if (next !== this._effectiveInverse) {
        this._effectiveInverse = next;
        if (next) this._element.classList.add("arvo-spl--inverse");
        else this._element.classList.remove("arvo-spl--inverse");
      }
    }
    if (this._options.isResizable && !this._options.ariaControls) {
      const ariaControls = ((_a = this._resolvedTargetEl) == null ? void 0 : _a.id) ?? null;
      if (ariaControls) {
        (_b = this._element) == null ? void 0 : _b.setAttribute("aria-controls", ariaControls);
      } else {
        (_c = this._element) == null ? void 0 : _c.removeAttribute("aria-controls");
      }
    }
    this._applyTargetSize();
  }
  setMinSize(min) {
    var _a;
    this._options.minSize = min;
    if (this._options.isResizable) {
      (_a = this._element) == null ? void 0 : _a.setAttribute("aria-valuemin", String(min));
    }
    const effectiveMax = this._options.maxSize !== null ? this._options.maxSize : Number.MAX_SAFE_INTEGER;
    const next = clamp(this._currentValue, min, effectiveMax);
    if (next !== this._currentValue) {
      this._setValue(next, "programmatic");
    }
  }
  setMaxSize(max) {
    var _a, _b;
    this._options.maxSize = max;
    if (this._options.isResizable) {
      if (max === null) {
        (_a = this._element) == null ? void 0 : _a.removeAttribute("aria-valuemax");
      } else {
        (_b = this._element) == null ? void 0 : _b.setAttribute("aria-valuemax", String(max));
      }
    }
    const effectiveMax = max !== null ? max : Number.MAX_SAFE_INTEGER;
    const next = clamp(this._currentValue, this._options.minSize, effectiveMax);
    if (next !== this._currentValue) {
      this._setValue(next, "programmatic");
    }
  }
  destroy() {
    const el = this._element;
    if (!el) return;
    el.removeEventListener("pointerdown", this._boundHandlePointerDown);
    el.removeEventListener("keydown", this._boundHandleKeyDown);
    el.removeEventListener("dblclick", this._boundHandleDoubleClick);
    window.removeEventListener("pointermove", this._boundHandlePointerMove);
    window.removeEventListener("pointerup", this._boundHandlePointerUp);
    window.removeEventListener("pointercancel", this._boundHandlePointerUp);
    el.textContent = "";
    el.classList.remove(
      "arvo-spl",
      "arvo-spl--vertical",
      "arvo-spl--horizontal",
      "arvo-spl--resizable",
      "arvo-spl--inverse",
      "arvo-spl--disabled",
      "is-disabled",
      "active"
    );
    el.removeAttribute("role");
    el.removeAttribute("aria-orientation");
    el.removeAttribute("aria-valuemin");
    el.removeAttribute("aria-valuemax");
    el.removeAttribute("aria-valuenow");
    el.removeAttribute("aria-label");
    el.removeAttribute("aria-controls");
    el.removeAttribute("aria-disabled");
    el.removeAttribute("tabindex");
    this._element = null;
    this._handleEl = null;
    this._resolvedTargetEl = null;
  }
};
_ArvoSplitter.ORIENTATIONS = ["vertical", "horizontal"];
_ArvoSplitter.DEFAULTS = {
  orientation: "vertical",
  isResizable: true,
  target: null,
  inverse: null,
  value: null,
  defaultValue: null,
  minSize: 0,
  maxSize: null,
  step: 16,
  pageStep: 64,
  isDisabled: false,
  ariaLabel: null,
  ariaControls: null,
  onResizeStart: null,
  onResize: null,
  onResizeEnd: null,
  onChange: null,
  onReset: null
};
let ArvoSplitter = _ArvoSplitter;
exports.ArvoSplitter = ArvoSplitter;
//# sourceMappingURL=Splitter.cjs.map
