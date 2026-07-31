import { findMemberForDate, getUserLocale, getLocaleDateFormat, pickAnchorDate, buildMemberIndex, addMonths, formatDate, createOverlaySurface, applyPositionToSurface, parseDate, isSameDay } from "@arvo/core";
import { ArvoCalendar } from "../Calendar/Calendar.js";
import { CalendarNav } from "../CalendarNav/CalendarNav.js";
function sameDay(a, b) {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return isSameDay(a, b);
}
function clampToRange(v, min, max) {
  if (v == null) return null;
  if (min && v.getTime() < min.getTime()) return new Date(min.getTime());
  if (max && v.getTime() > max.getTime()) return new Date(max.getTime());
  return v;
}
function coerceDate(v, format, locale) {
  if (v == null) return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (typeof v === "string") return v.length === 0 ? null : parseDate(v, format, locale);
  return null;
}
function asDate(v, format, locale) {
  return coerceDate(v, format, locale);
}
let _idCounter = 0;
const _ArvoCalendarDropdown = class _ArvoCalendarDropdown {
  constructor(trigger, options) {
    this._popoverEl = null;
    this._headerEl = null;
    this._bodyEl = null;
    this._calendar = null;
    this._calNav = null;
    this._surface = null;
    this._committedValue = null;
    this._viewMode = "days";
    this._isOpen = false;
    this._destroyed = false;
    this._closingProgrammatically = false;
    this._memberIndex = null;
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
    this._handleCalSelect = (e) => {
      const detail = e.detail;
      if (!detail || !detail.date) return;
      if (detail.mode === "days") {
        let next = detail.date;
        if (this._memberIndex) {
          const matched = findMemberForDate(this._memberIndex, detail.date);
          if (matched == null ? void 0 : matched.keyDate) next = matched.keyDate;
        }
        this._handleCommit(next);
        if (this._opts.isAutoClose) this.close();
        return;
      }
      this._visibleYear = detail.date.getFullYear();
      this._visibleMonth = detail.date.getMonth();
      if (detail.mode === "months") this._setViewMode("days");
      else if (detail.mode === "years") this._setViewMode("months");
      else this._syncCalendarVisible();
    };
    this._handleCalMonthChange = (e) => {
      var _a, _b;
      const detail = e.detail;
      if (!detail) return;
      this._visibleYear = detail.year;
      this._visibleMonth = detail.month;
      this._syncCalendarVisible();
      (_b = (_a = this._opts).onMonthChange) == null ? void 0 : _b.call(_a, { year: detail.year, month: detail.month });
      this._dispatch("cal-drop:month-change", { year: detail.year, month: detail.month });
    };
    this._handleCalViewModeChange = (e) => {
      const detail = e.detail;
      if (!detail) return;
      this._setViewMode(detail.mode);
    };
    this._handleCalDismiss = () => {
      this.close();
    };
    this._handleEngineClose = () => {
      var _a, _b;
      if (this._closingProgrammatically) return;
      if (!this._isOpen) return;
      this._isOpen = false;
      if (this._trigger) this._trigger.setAttribute("aria-expanded", "false");
      (_b = (_a = this._opts).onOpenChange) == null ? void 0 : _b.call(_a, false);
    };
    this._trigger = trigger;
    this._id = `arvo-cal-drop-${++_idCounter}`;
    const placement = (options == null ? void 0 : options.placement) && _ArvoCalendarDropdown.PLACEMENTS.includes(options.placement) ? options.placement : _ArvoCalendarDropdown.DEFAULTS.placement;
    this._opts = {
      ..._ArvoCalendarDropdown.DEFAULTS,
      ...options,
      placement,
      value: options == null ? void 0 : options.value,
      defaultValue: (options == null ? void 0 : options.defaultValue) ?? null,
      calendarProps: (options == null ? void 0 : options.calendarProps) ?? null,
      popoverProps: (options == null ? void 0 : options.popoverProps) ?? null,
      onChange: (options == null ? void 0 : options.onChange) ?? null,
      onOpen: (options == null ? void 0 : options.onOpen) ?? null,
      onClose: (options == null ? void 0 : options.onClose) ?? null,
      onOpenChange: (options == null ? void 0 : options.onOpenChange) ?? null,
      onMonthChange: (options == null ? void 0 : options.onMonthChange) ?? null,
      onViewModeChange: (options == null ? void 0 : options.onViewModeChange) ?? null
    };
    this._effLocale = this._opts.locale ?? getUserLocale();
    this._effFormat = this._opts.format ?? getLocaleDateFormat(this._effLocale);
    const initialRaw = this._opts.value !== void 0 ? this._opts.value : this._opts.defaultValue;
    this._committedValue = clampToRange(
      coerceDate(initialRaw, this._effFormat, this._effLocale),
      asDate(this._opts.minDate, this._effFormat, this._effLocale),
      asDate(this._opts.maxDate, this._effFormat, this._effLocale)
    );
    const anchor = pickAnchorDate(
      this._committedValue,
      asDate(this._opts.minDate, this._effFormat, this._effLocale),
      asDate(this._opts.maxDate, this._effFormat, this._effLocale)
    );
    this._visibleYear = anchor.getFullYear();
    this._visibleMonth = anchor.getMonth();
    this._memberIndex = this._buildMemberIndex();
    this._bindTrigger();
    if (this._opts.defaultOpen && !this._opts.isDisabled) {
      queueMicrotask(() => this.open());
    }
  }
  static initialize(trigger, options) {
    return new _ArvoCalendarDropdown(trigger, options);
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
  _buildMemberIndex() {
    if (!this._opts.memberData || !this._opts.frequency) return null;
    try {
      return buildMemberIndex(this._opts.memberData, {
        frequency: this._opts.frequency,
        currentMemberIndex: this._opts.currentMemberIndex
      });
    } catch {
      return null;
    }
  }
  _buildPopover() {
    var _a;
    if (this._popoverEl) return;
    this._popoverEl = document.createElement("div");
    this._popoverEl.className = this._opts.hasWeeks ? "arvo-cal-drop arvo-cal-drop--show-weeks" : "arvo-cal-drop";
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
    this._headerEl = document.createElement("div");
    this._headerEl.className = "arvo-cal-drop__header";
    this._bodyEl = document.createElement("div");
    this._bodyEl.className = "arvo-cal-drop__body";
    this._popoverEl.appendChild(this._headerEl);
    this._popoverEl.appendChild(this._bodyEl);
    const minDateResolved = asDate(this._opts.minDate, this._effFormat, this._effLocale);
    const maxDateResolved = asDate(this._opts.maxDate, this._effFormat, this._effLocale);
    this._calNav = CalendarNav.initialize(this._headerEl, {
      visibleYear: this._visibleYear,
      visibleMonth: this._visibleMonth,
      viewMode: this._viewMode === "days" || this._viewMode === "months" || this._viewMode === "years" ? this._viewMode : "days",
      locale: this._effLocale,
      minDate: minDateResolved,
      maxDate: maxDateResolved,
      isDisabled: this._opts.isDisabled,
      onPrev: () => this._handleHeaderPrev(),
      onNext: () => this._handleHeaderNext(),
      onToday: () => this._handleHeaderToday(),
      onMonthButtonClick: () => this._setViewMode(this._viewMode === "months" ? "days" : "months"),
      onYearButtonClick: () => this._setViewMode(this._viewMode === "years" ? "days" : "years")
    });
    this._calendar = ArvoCalendar.initialize(this._bodyEl, {
      ...this._opts.calendarProps ?? void 0,
      visibleYear: this._visibleYear,
      visibleMonth: this._visibleMonth,
      viewMode: this._viewMode,
      locale: this._effLocale,
      weekStart: this._opts.weekStart,
      hasWeeks: this._opts.hasWeeks,
      selectedDate: this._committedValue,
      minDate: minDateResolved,
      maxDate: maxDateResolved,
      frequency: this._opts.frequency ?? void 0,
      memberIndex: this._memberIndex,
      currentMemberIndex: this._opts.currentMemberIndex
    });
    this._bodyEl.addEventListener("cal:select", this._handleCalSelect);
    this._bodyEl.addEventListener("cal:month-change", this._handleCalMonthChange);
    this._bodyEl.addEventListener("cal:viewmode-change", this._handleCalViewModeChange);
    this._bodyEl.addEventListener("cal:dismiss", this._handleCalDismiss);
  }
  _setViewMode(mode) {
    var _a, _b, _c, _d, _e;
    this._viewMode = mode;
    if (mode === "days" || mode === "months" || mode === "years") {
      (_a = this._calNav) == null ? void 0 : _a.setVisibleMonth(this._visibleYear, this._visibleMonth);
      (_b = this._calNav) == null ? void 0 : _b.setViewMode(mode);
    }
    (_c = this._calendar) == null ? void 0 : _c.update({
      viewMode: mode,
      visibleYear: this._visibleYear,
      visibleMonth: this._visibleMonth
    });
    (_e = (_d = this._opts).onViewModeChange) == null ? void 0 : _e.call(_d, { mode });
  }
  _syncCalendarVisible() {
    var _a, _b;
    (_a = this._calNav) == null ? void 0 : _a.setVisibleMonth(this._visibleYear, this._visibleMonth);
    (_b = this._calendar) == null ? void 0 : _b.update({
      visibleYear: this._visibleYear,
      visibleMonth: this._visibleMonth
    });
  }
  _handleHeaderPrev() {
    var _a, _b;
    if (this._viewMode === "days") {
      const d = addMonths(new Date(this._visibleYear, this._visibleMonth, 1), -1);
      this._visibleYear = d.getFullYear();
      this._visibleMonth = d.getMonth();
    } else if (this._viewMode === "months") {
      this._visibleYear -= 1;
    } else if (this._viewMode === "years") {
      this._visibleYear -= 10;
    }
    this._syncCalendarVisible();
    (_b = (_a = this._opts).onMonthChange) == null ? void 0 : _b.call(_a, { year: this._visibleYear, month: this._visibleMonth });
    this._dispatch("cal-drop:month-change", {
      year: this._visibleYear,
      month: this._visibleMonth
    });
  }
  _handleHeaderNext() {
    var _a, _b;
    if (this._viewMode === "days") {
      const d = addMonths(new Date(this._visibleYear, this._visibleMonth, 1), 1);
      this._visibleYear = d.getFullYear();
      this._visibleMonth = d.getMonth();
    } else if (this._viewMode === "months") {
      this._visibleYear += 1;
    } else if (this._viewMode === "years") {
      this._visibleYear += 10;
    }
    this._syncCalendarVisible();
    (_b = (_a = this._opts).onMonthChange) == null ? void 0 : _b.call(_a, { year: this._visibleYear, month: this._visibleMonth });
    this._dispatch("cal-drop:month-change", {
      year: this._visibleYear,
      month: this._visibleMonth
    });
  }
  _handleHeaderToday() {
    var _a, _b;
    const today = /* @__PURE__ */ new Date();
    this._visibleYear = today.getFullYear();
    this._visibleMonth = today.getMonth();
    this._syncCalendarVisible();
    (_b = (_a = this._opts).onMonthChange) == null ? void 0 : _b.call(_a, { year: this._visibleYear, month: this._visibleMonth });
    this._dispatch("cal-drop:month-change", {
      year: this._visibleYear,
      month: this._visibleMonth
    });
  }
  _handleCommit(next) {
    var _a, _b, _c, _d, _e;
    const clamped = clampToRange(
      next,
      asDate(this._opts.minDate, this._effFormat, this._effLocale),
      asDate(this._opts.maxDate, this._effFormat, this._effLocale)
    );
    if (sameDay(clamped, this._committedValue)) return false;
    this._committedValue = clamped;
    if (clamped) {
      this._visibleYear = clamped.getFullYear();
      this._visibleMonth = clamped.getMonth();
      (_a = this._calNav) == null ? void 0 : _a.setVisibleMonth(this._visibleYear, this._visibleMonth);
      (_b = this._calendar) == null ? void 0 : _b.update({
        visibleYear: this._visibleYear,
        visibleMonth: this._visibleMonth,
        selectedDate: clamped
      });
    } else {
      (_c = this._calendar) == null ? void 0 : _c.update({ selectedDate: null });
    }
    const formatted = clamped ? formatDate(clamped, this._effFormat, this._effLocale) : "";
    (_e = (_d = this._opts).onChange) == null ? void 0 : _e.call(_d, { value: clamped, formattedValue: formatted });
    this._dispatch("cal-drop:change", { value: clamped, formattedValue: formatted });
    return true;
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
    if (!this._dispatch("cal-drop:open")) return;
    this._isOpen = true;
    this._buildPopover();
    if (this._popoverEl) this._popoverEl.style.visibility = "hidden";
    if (!this._surface && this._popoverEl) {
      this._surface = createOverlaySurface({
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
            applyPositionToSurface(pos, surfaceEl);
            surfaceEl.style.visibility = "";
          }
        },
        focus: {
          mode: "trap",
          initialFocus: "none",
          returnFocus: false,
          getOrderedElements: () => this._getOrderedPopoverElements()
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
    if (this._trigger) this._trigger.setAttribute("aria-expanded", "true");
    (_g = (_f = this._opts).onOpenChange) == null ? void 0 : _g.call(_f, true);
    requestAnimationFrame(() => {
      var _a2;
      const target = pickAnchorDate(
        this._committedValue,
        asDate(this._opts.minDate, this._effFormat, this._effLocale),
        asDate(this._opts.maxDate, this._effFormat, this._effLocale)
      );
      (_a2 = this._calendar) == null ? void 0 : _a2.focusCell(target);
    });
  }
  close() {
    var _a, _b, _c, _d, _e;
    if (this._destroyed) return;
    if (!this._isOpen) return;
    if (((_b = (_a = this._opts).onClose) == null ? void 0 : _b.call(_a)) === false) return;
    if (!this._dispatch("cal-drop:close")) return;
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
    var _a, _b;
    if (v === void 0) return this._committedValue;
    const coerced = clampToRange(
      coerceDate(v, this._effFormat, this._effLocale),
      asDate(this._opts.minDate, this._effFormat, this._effLocale),
      asDate(this._opts.maxDate, this._effFormat, this._effLocale)
    );
    this._committedValue = coerced;
    if (coerced) {
      this._visibleYear = coerced.getFullYear();
      this._visibleMonth = coerced.getMonth();
    }
    if (this._isOpen) {
      (_a = this._calNav) == null ? void 0 : _a.setVisibleMonth(this._visibleYear, this._visibleMonth);
      (_b = this._calendar) == null ? void 0 : _b.update({
        visibleYear: this._visibleYear,
        visibleMonth: this._visibleMonth,
        selectedDate: coerced
      });
    }
  }
  formattedValue() {
    return this._committedValue ? formatDate(this._committedValue, this._effFormat, this._effLocale) : "";
  }
  disabled(state) {
    if (state === void 0) return this._opts.isDisabled;
    if (this._opts.isDisabled === state) return;
    this._opts.isDisabled = state;
    if (state && this._isOpen) this.close();
  }
  focus() {
    var _a;
    if (!this._isOpen) return;
    const target = pickAnchorDate(
      this._committedValue,
      asDate(this._opts.minDate, this._effFormat, this._effLocale),
      asDate(this._opts.maxDate, this._effFormat, this._effLocale)
    );
    (_a = this._calendar) == null ? void 0 : _a.focusCell(target);
  }
  destroy() {
    var _a, _b, _c, _d, _e;
    if (this._destroyed) return;
    this._destroyed = true;
    this._unbindTrigger();
    if (this._isOpen) {
      this._isOpen = false;
      void ((_a = this._surface) == null ? void 0 : _a.close());
    }
    (_b = this._surface) == null ? void 0 : _b.destroy();
    this._surface = null;
    (_c = this._calendar) == null ? void 0 : _c.destroy();
    this._calendar = null;
    (_d = this._calNav) == null ? void 0 : _d.destroy();
    this._calNav = null;
    (_e = this._popoverEl) == null ? void 0 : _e.remove();
    this._popoverEl = null;
    this._headerEl = null;
    this._bodyEl = null;
    if (this._trigger) {
      this._trigger.removeAttribute("aria-haspopup");
      this._trigger.removeAttribute("aria-controls");
      this._trigger.removeAttribute("aria-expanded");
    }
    this._trigger = null;
  }
  /**
   * Tab cycle inside the popover. Mirrors the React `getOrderedElements`
   * contract: calendar cell -> prev / month / year / next / today.
   */
  _getOrderedPopoverElements() {
    const root = this._popoverEl;
    if (!root) return [];
    const cell = root.querySelector('.arvo-cal__cell[tabindex="0"]');
    const prev = root.querySelector(".arvo-cal-nav__prev");
    const month = root.querySelector(".arvo-cal-nav__month-btn");
    const year = root.querySelector(".arvo-cal-nav__year-btn");
    const next = root.querySelector(".arvo-cal-nav__next");
    const today = root.querySelector(".arvo-cal-nav__today");
    return [cell, prev, month, year, next, today];
  }
};
_ArvoCalendarDropdown.PLACEMENTS = [
  "top-start",
  "top-end",
  "bottom-start",
  "bottom-end",
  "auto"
];
_ArvoCalendarDropdown.DEFAULTS = {
  value: void 0,
  defaultValue: null,
  format: null,
  locale: null,
  weekStart: 0,
  hasWeeks: false,
  minDate: null,
  maxDate: null,
  frequency: null,
  memberData: null,
  currentMemberIndex: null,
  defaultOpen: false,
  isDisabled: false,
  isAutoClose: true,
  placement: "bottom-end",
  ariaLabel: "Choose a date",
  calendarProps: null,
  popoverProps: null,
  onChange: null,
  onOpen: null,
  onClose: null,
  onOpenChange: null,
  onMonthChange: null,
  onViewModeChange: null
};
let ArvoCalendarDropdown = _ArvoCalendarDropdown;
export {
  ArvoCalendarDropdown
};
//# sourceMappingURL=CalendarDropdown.js.map
