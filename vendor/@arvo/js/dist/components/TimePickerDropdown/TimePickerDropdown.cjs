"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const core = require("@arvo/core");
const TimeDropdown = require("../TimeDropdown/TimeDropdown.cjs");
function normalizeTime(v) {
  const hours = Math.trunc(v.hours);
  const minutes = Math.trunc(v.minutes);
  const seconds = v.seconds == null ? void 0 : Math.trunc(v.seconds);
  const milliseconds = v.milliseconds == null ? void 0 : Math.trunc(v.milliseconds);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  if (seconds != null && (seconds < 0 || seconds > 59)) return null;
  if (milliseconds != null && (milliseconds < 0 || milliseconds > 999)) return null;
  const out = { hours, minutes };
  if (seconds != null) out.seconds = seconds;
  if (milliseconds != null) out.milliseconds = milliseconds;
  if (v.timezone != null) out.timezone = v.timezone;
  return out;
}
function timeFromDate(date) {
  if (Number.isNaN(date.getTime())) return null;
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    milliseconds: date.getMilliseconds()
  };
}
function coerceTime(v, format) {
  if (v == null) return null;
  if (v instanceof Date) return timeFromDate(v);
  if (typeof v === "string") return v.length === 0 ? null : core.parseTime(v, format);
  return normalizeTime(v);
}
function totalMs(v) {
  return ((v.hours * 60 + v.minutes) * 60 + (v.seconds ?? 0)) * 1e3 + (v.milliseconds ?? 0);
}
function clampToRange(v, min, max) {
  if (!v) return null;
  if (min && totalMs(v) < totalMs(min)) return { ...min };
  if (max && totalMs(v) > totalMs(max)) return { ...max };
  return v;
}
let _idCounter = 0;
const _ArvoTimePickerDropdown = class _ArvoTimePickerDropdown {
  constructor(trigger, options) {
    this._popoverEl = null;
    this._bodyEl = null;
    this._timeDropdownHostEl = null;
    this._timeDropdown = null;
    this._surface = null;
    this._committedValue = null;
    this._isOpen = false;
    this._destroyed = false;
    this._closingProgrammatically = false;
    this._handleTriggerClick = (e) => {
      if (e.defaultPrevented) return;
      this.toggle();
    };
    this._handleTriggerKeyDown = (e) => {
      if (e.altKey && e.key === "ArrowDown") {
        e.preventDefault();
        if (!this._isOpen) this.open();
        return;
      }
      if (e.altKey && e.key === "ArrowUp") {
        e.preventDefault();
        if (this._isOpen) this.close();
        return;
      }
      if (e.key === "Escape") {
        if (this._isOpen) {
          e.preventDefault();
          this.close();
        }
        return;
      }
    };
    this._handleEngineClose = () => {
      var _a, _b;
      if (this._closingProgrammatically) return;
      if (!this._isOpen) return;
      this._isOpen = false;
      if (this._trigger) {
        this._trigger.setAttribute("aria-expanded", "false");
      }
      (_b = (_a = this._opts).onOpenChange) == null ? void 0 : _b.call(_a, false);
    };
    this._trigger = trigger;
    this._id = `arvo-tp-drop-${++_idCounter}`;
    const placement = (options == null ? void 0 : options.placement) && _ArvoTimePickerDropdown.PLACEMENTS.includes(options.placement) ? options.placement : _ArvoTimePickerDropdown.DEFAULTS.placement;
    this._opts = {
      ..._ArvoTimePickerDropdown.DEFAULTS,
      ...options,
      placement,
      value: options == null ? void 0 : options.value,
      defaultValue: (options == null ? void 0 : options.defaultValue) ?? null,
      popoverProps: (options == null ? void 0 : options.popoverProps) ?? null,
      onChange: (options == null ? void 0 : options.onChange) ?? null,
      onOpen: (options == null ? void 0 : options.onOpen) ?? null,
      onClose: (options == null ? void 0 : options.onClose) ?? null,
      onOpenChange: (options == null ? void 0 : options.onOpenChange) ?? null
    };
    this._effLocale = this._opts.locale ?? core.getUserLocale();
    this._effFormat = this._opts.format ?? core.getLocaleTimeFormat(this._effLocale);
    const initialRaw = this._opts.value !== void 0 ? this._opts.value : this._opts.defaultValue;
    this._committedValue = clampToRange(
      coerceTime(initialRaw, this._effFormat),
      this._asTime(this._opts.minTime),
      this._asTime(this._opts.maxTime)
    );
    this._bindTrigger();
    if (this._opts.defaultOpen && !this._opts.isDisabled) {
      queueMicrotask(() => this.open());
    }
  }
  static initialize(trigger, options) {
    return new _ArvoTimePickerDropdown(trigger, options);
  }
  _bindTrigger() {
    if (!this._trigger) return;
    this._trigger.addEventListener("click", this._handleTriggerClick);
    this._trigger.addEventListener("keydown", this._handleTriggerKeyDown);
  }
  _unbindTrigger() {
    if (!this._trigger) return;
    this._trigger.removeEventListener("click", this._handleTriggerClick);
    this._trigger.removeEventListener("keydown", this._handleTriggerKeyDown);
  }
  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------
  _asTime(v) {
    if (v == null) return null;
    if (typeof v === "string") return v.length === 0 ? null : core.parseTime(v, this._effFormat);
    return normalizeTime(v);
  }
  _buildPopover() {
    var _a;
    if (this._popoverEl) return;
    this._popoverEl = document.createElement("div");
    this._popoverEl.className = "arvo-tp-drop";
    this._popoverEl.id = this._id;
    this._popoverEl.setAttribute("role", "dialog");
    this._popoverEl.setAttribute("aria-label", this._opts.ariaLabel);
    this._popoverEl.setAttribute("aria-modal", "false");
    this._popoverEl.style.position = "fixed";
    this._popoverEl.style.top = "0";
    this._popoverEl.style.left = "0";
    this._popoverEl.style.margin = "0";
    if ((_a = this._opts.popoverProps) == null ? void 0 : _a.width) {
      this._popoverEl.style.width = this._opts.popoverProps.width;
    }
    this._bodyEl = document.createElement("div");
    this._bodyEl.className = "arvo-tp-drop__body";
    this._popoverEl.appendChild(this._bodyEl);
    this._timeDropdownHostEl = document.createElement("div");
    this._bodyEl.appendChild(this._timeDropdownHostEl);
    this._timeDropdown = this._createTimeDropdown(this._timeDropdownHostEl);
  }
  _createTimeDropdown(host) {
    return TimeDropdown.ArvoTimeDropdown.initialize(host, {
      value: this._committedValue,
      format: this._effFormat,
      locale: this._effLocale,
      interval: this._opts.interval,
      minTime: this._asTime(this._opts.minTime),
      maxTime: this._asTime(this._opts.maxTime),
      isDisabled: this._opts.isDisabled,
      onChange: (time) => {
        const clamped = clampToRange(
          time,
          this._asTime(this._opts.minTime),
          this._asTime(this._opts.maxTime)
        );
        this._handleCommit(clamped);
        if (this._opts.isAutoClose) this.close();
      },
      onDismiss: () => this.close()
    });
  }
  _syncTimeDropdownValue(value) {
    if (!this._timeDropdown) return;
    if (value) {
      this._timeDropdown.value(value);
      return;
    }
    if (!this._timeDropdownHostEl) return;
    this._timeDropdown.destroy();
    this._timeDropdown = this._createTimeDropdown(this._timeDropdownHostEl);
  }
  _handleCommit(next) {
    var _a, _b;
    this._committedValue = next;
    const formatted = next ? core.formatTime(next, this._effFormat) : "";
    (_b = (_a = this._opts).onChange) == null ? void 0 : _b.call(_a, { value: next, formattedValue: formatted });
    this._dispatch("tp-drop:change", { value: next, formattedValue: formatted });
  }
  _dispatch(name, detail = {}) {
    if (!this._trigger) return true;
    const ev = new CustomEvent(name, { bubbles: true, cancelable: true, detail });
    return this._trigger.dispatchEvent(ev);
  }
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  open() {
    var _a, _b, _c, _d, _e, _f, _g;
    if (this._destroyed) return;
    if (this._isOpen) return;
    if (this._opts.isDisabled) return;
    if (((_b = (_a = this._opts).onOpen) == null ? void 0 : _b.call(_a)) === false) return;
    if (!this._dispatch("tp-drop:open")) return;
    this._isOpen = true;
    this._buildPopover();
    this._syncTimeDropdownValue(this._committedValue);
    if (this._popoverEl) {
      this._popoverEl.style.visibility = "hidden";
    }
    if (!this._surface && this._popoverEl) {
      this._surface = core.createOverlaySurface({
        id: this._id,
        surface: this._popoverEl,
        type: "dropdown",
        priority: 20,
        trigger: this._trigger,
        zIndex: (_c = this._opts.popoverProps) == null ? void 0 : _c.zIndex,
        mount: {
          target: document.body,
          removeOnClose: true
        },
        position: {
          placement: this._opts.placement,
          gap: ((_d = this._opts.popoverProps) == null ? void 0 : _d.offset) ?? 4,
          apply: (pos, surfaceEl) => {
            core.applyPositionToSurface(pos, surfaceEl);
            surfaceEl.style.visibility = "";
          }
        },
        focus: {
          mode: "trap",
          initialFocus: "none",
          returnFocus: false,
          getOrderedElements: () => {
            const root = this._popoverEl;
            if (!root) return [];
            return [root.querySelector('[tabindex="0"]')];
          }
        },
        transition: "fade",
        transitionDuration: 150,
        triggerAria: { haspopup: "dialog" },
        onClose: this._handleEngineClose
      });
    } else if (this._surface) {
      this._surface.setTrigger(this._trigger);
    }
    void ((_e = this._surface) == null ? void 0 : _e.open());
    if (this._trigger) {
      this._trigger.setAttribute("aria-expanded", "true");
    }
    (_g = (_f = this._opts).onOpenChange) == null ? void 0 : _g.call(_f, true);
    requestAnimationFrame(() => {
      var _a2, _b2;
      (_b2 = (_a2 = this._popoverEl) == null ? void 0 : _a2.querySelector('[tabindex="0"]')) == null ? void 0 : _b2.focus({
        preventScroll: true
      });
    });
  }
  close() {
    var _a, _b, _c, _d, _e;
    if (this._destroyed) return;
    if (!this._isOpen) return;
    if (((_b = (_a = this._opts).onClose) == null ? void 0 : _b.call(_a)) === false) return;
    if (!this._dispatch("tp-drop:close")) return;
    this._isOpen = false;
    this._closingProgrammatically = true;
    void ((_c = this._surface) == null ? void 0 : _c.close());
    this._closingProgrammatically = false;
    if (this._trigger) {
      this._trigger.setAttribute("aria-expanded", "false");
      this._trigger.focus({ preventScroll: true });
    }
    (_e = (_d = this._opts).onOpenChange) == null ? void 0 : _e.call(_d, false);
  }
  toggle(force) {
    const next = force === void 0 ? !this._isOpen : force;
    if (next) this.open();
    else this.close();
  }
  isOpen() {
    return this._isOpen;
  }
  value(v) {
    if (v === void 0) return this._committedValue;
    const coerced = clampToRange(
      coerceTime(v, this._effFormat),
      this._asTime(this._opts.minTime),
      this._asTime(this._opts.maxTime)
    );
    this._committedValue = coerced;
    if (this._isOpen) this._syncTimeDropdownValue(coerced);
  }
  formattedValue() {
    return this._committedValue ? core.formatTime(this._committedValue, this._effFormat) : "";
  }
  disabled(state) {
    var _a;
    if (state === void 0) return this._opts.isDisabled;
    if (this._opts.isDisabled === state) return;
    this._opts.isDisabled = state;
    (_a = this._timeDropdown) == null ? void 0 : _a.disabled(state);
    if (state && this._isOpen) this.close();
  }
  /**
   * Focus the active time option (only meaningful when open). No-op when
   * closed -- the consumer's trigger is the visible focus target while the
   * dropdown is hidden.
   */
  focus() {
    var _a, _b;
    if (!this._isOpen) return;
    (_b = (_a = this._popoverEl) == null ? void 0 : _a.querySelector('[tabindex="0"]')) == null ? void 0 : _b.focus({
      preventScroll: true
    });
  }
  destroy() {
    var _a, _b, _c, _d;
    if (this._destroyed) return;
    this._destroyed = true;
    this._unbindTrigger();
    if (this._isOpen) {
      this._isOpen = false;
      void ((_a = this._surface) == null ? void 0 : _a.close());
    }
    (_b = this._surface) == null ? void 0 : _b.destroy();
    this._surface = null;
    (_c = this._timeDropdown) == null ? void 0 : _c.destroy();
    this._timeDropdown = null;
    (_d = this._popoverEl) == null ? void 0 : _d.remove();
    this._popoverEl = null;
    this._bodyEl = null;
    this._timeDropdownHostEl = null;
    if (this._trigger) {
      this._trigger.removeAttribute("aria-haspopup");
      this._trigger.removeAttribute("aria-controls");
      this._trigger.removeAttribute("aria-expanded");
    }
    this._trigger = null;
  }
};
_ArvoTimePickerDropdown.PLACEMENTS = [
  "top-start",
  "top-end",
  "bottom-start",
  "bottom-end",
  "auto"
];
_ArvoTimePickerDropdown.DEFAULTS = {
  value: void 0,
  defaultValue: null,
  format: null,
  locale: null,
  interval: 15,
  minTime: null,
  maxTime: null,
  defaultOpen: false,
  isDisabled: false,
  isAutoClose: true,
  placement: "bottom-end",
  ariaLabel: "Choose a time",
  popoverProps: null,
  onChange: null,
  onOpen: null,
  onClose: null,
  onOpenChange: null
};
let ArvoTimePickerDropdown = _ArvoTimePickerDropdown;
exports.ArvoTimePickerDropdown = ArvoTimePickerDropdown;
//# sourceMappingURL=TimePickerDropdown.cjs.map
