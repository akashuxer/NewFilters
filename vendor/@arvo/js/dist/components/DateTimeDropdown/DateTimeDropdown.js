import { getUserLocale, pickAnchorDate, getLocaleDateFormat, getLocaleTimeFormat, splitDateTimeFormat, addMonths, formatDate, createOverlaySurface, applyPositionToSurface, parseTime, parseDate, isSameDay } from "@arvo/core";
import { ArvoCalendar } from "../Calendar/Calendar.js";
import { CalendarNav } from "../CalendarNav/CalendarNav.js";
import { ArvoTimeDropdown } from "../TimeDropdown/TimeDropdown.js";
function coerceDate(v, format, locale) {
  if (v == null) return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (typeof v === "string")
    return v.length === 0 ? null : parseDate(v, format, locale);
  return null;
}
function asDate(v, format, locale) {
  return coerceDate(v, format, locale);
}
function asTime(v, timeFormat) {
  if (v == null) return null;
  if (typeof v === "string")
    return v.length === 0 ? null : parseTime(v, timeFormat);
  return v;
}
function getTimePart(d) {
  if (!d || Number.isNaN(d.getTime())) return null;
  return {
    hours: d.getHours(),
    minutes: d.getMinutes(),
    seconds: d.getSeconds(),
    milliseconds: d.getMilliseconds()
  };
}
function mergeDateAndTime(d, t) {
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    t.hours,
    t.minutes,
    t.seconds ?? 0,
    t.milliseconds ?? 0
  );
}
function totalMs(t) {
  return ((t.hours * 60 + t.minutes) * 60 + (t.seconds ?? 0)) * 1e3 + (t.milliseconds ?? 0);
}
function laterTime(a, b) {
  if (!a) return b;
  if (!b) return a;
  return totalMs(a) >= totalMs(b) ? a : b;
}
function earlierTime(a, b) {
  if (!a) return b;
  if (!b) return a;
  return totalMs(a) <= totalMs(b) ? a : b;
}
function getEffectiveMinTimeForDate(date, min, startTime) {
  const onMinDay = date && min && isSameDay(date, min);
  const minPart = onMinDay ? getTimePart(min) : null;
  return laterTime(minPart, startTime);
}
function getEffectiveMaxTimeForDate(date, max, endTime) {
  const onMaxDay = date && max && isSameDay(date, max);
  const maxPart = onMaxDay ? getTimePart(max) : null;
  return earlierTime(maxPart, endTime);
}
function clampToBounds(v, min, max, startTime, endTime) {
  if (!v) return null;
  let result = new Date(v.getTime());
  if (min && result.getTime() < min.getTime()) result = new Date(min.getTime());
  if (max && result.getTime() > max.getTime()) result = new Date(max.getTime());
  const effMin = getEffectiveMinTimeForDate(result, min, startTime);
  const effMax = getEffectiveMaxTimeForDate(result, max, endTime);
  const tPart = getTimePart(result);
  if (effMin && tPart && totalMs(tPart) < totalMs(effMin)) {
    result = mergeDateAndTime(result, effMin);
  }
  if (effMax && tPart && totalMs(tPart) > totalMs(effMax)) {
    result = mergeDateAndTime(result, effMax);
  }
  if (min && result.getTime() < min.getTime()) result = new Date(min.getTime());
  if (max && result.getTime() > max.getTime()) result = new Date(max.getTime());
  return result;
}
let _idCounter = 0;
const _ArvoDateTimeDropdown = class _ArvoDateTimeDropdown {
  constructor(trigger, options) {
    this._popoverEl = null;
    this._calColEl = null;
    this._headerEl = null;
    this._calGridEl = null;
    this._timeColEl = null;
    this._sepEl = null;
    this._calendar = null;
    this._calNav = null;
    this._timeDropdown = null;
    this._surface = null;
    this._committedValue = null;
    this._previewValue = null;
    this._viewMode = "days";
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
    this._handleCalSelect = (e) => {
      const detail = e.detail;
      if (!detail || !detail.date) return;
      if (detail.mode === "days") {
        const current = this._liveValue();
        const tPart = getTimePart(current);
        const next = tPart ? mergeDateAndTime(detail.date, tPart) : detail.date;
        this._handleCommit(next);
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
      this._dispatch("dt-drop:month-change", { year: detail.year, month: detail.month });
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
    this._id = `arvo-dt-drop-${++_idCounter}`;
    const placement = (options == null ? void 0 : options.placement) && _ArvoDateTimeDropdown.PLACEMENTS.includes(options.placement) ? options.placement : _ArvoDateTimeDropdown.DEFAULTS.placement;
    this._opts = {
      ..._ArvoDateTimeDropdown.DEFAULTS,
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
    this._effFormat = this._opts.format ?? this._localeDefaultDateTimeFormat();
    this._effTimeFormat = this._splitTimeFormat();
    const initialRaw = this._opts.value !== void 0 ? this._opts.value : this._opts.defaultValue;
    this._committedValue = clampToBounds(
      coerceDate(initialRaw, this._effFormat, this._effLocale),
      asDate(this._opts.min, this._effFormat, this._effLocale),
      asDate(this._opts.max, this._effFormat, this._effLocale),
      asTime(this._opts.startTime, this._effTimeFormat),
      asTime(this._opts.endTime, this._effTimeFormat)
    );
    const anchor = pickAnchorDate(
      this._committedValue,
      asDate(this._opts.min, this._effFormat, this._effLocale),
      asDate(this._opts.max, this._effFormat, this._effLocale)
    );
    this._visibleYear = anchor.getFullYear();
    this._visibleMonth = anchor.getMonth();
    this._bindTrigger();
    if (this._opts.defaultOpen && !this._opts.isDisabled) {
      queueMicrotask(() => this.open());
    }
  }
  static initialize(trigger, options) {
    return new _ArvoDateTimeDropdown(trigger, options);
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
  // Format helpers
  // -------------------------------------------------------------------------
  _localeDefaultDateTimeFormat() {
    const date = getLocaleDateFormat(this._effLocale);
    const time = getLocaleTimeFormat(this._effLocale);
    return `${date} ${time}`;
  }
  _splitTimeFormat() {
    const split = splitDateTimeFormat(this._effFormat);
    return split.timePart || getLocaleTimeFormat(this._effLocale);
  }
  // -------------------------------------------------------------------------
  // Popover
  // -------------------------------------------------------------------------
  _liveValue() {
    return this._previewValue ?? this._committedValue;
  }
  _buildPopover() {
    var _a;
    if (this._popoverEl) return;
    this._popoverEl = document.createElement("div");
    this._popoverEl.className = this._opts.hasWeeks ? "arvo-dt-drop arvo-dt-drop--show-weeks" : "arvo-dt-drop";
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
    this._calColEl = document.createElement("div");
    this._calColEl.className = "arvo-dt-drop__cal";
    this._headerEl = document.createElement("div");
    this._headerEl.className = "arvo-dt-drop__header";
    this._calGridEl = document.createElement("div");
    this._calGridEl.className = "arvo-dt-drop__cal-grid";
    this._calColEl.appendChild(this._headerEl);
    this._calColEl.appendChild(this._calGridEl);
    this._sepEl = document.createElement("div");
    this._sepEl.className = "arvo-dt-drop__sep";
    this._timeColEl = document.createElement("div");
    this._timeColEl.className = "arvo-dt-drop__time";
    const timeHost = document.createElement("div");
    this._timeColEl.appendChild(timeHost);
    this._popoverEl.appendChild(this._calColEl);
    this._popoverEl.appendChild(this._sepEl);
    this._popoverEl.appendChild(this._timeColEl);
    const minDateResolved = asDate(this._opts.min, this._effFormat, this._effLocale);
    const maxDateResolved = asDate(this._opts.max, this._effFormat, this._effLocale);
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
    const live = this._liveValue();
    this._calendar = ArvoCalendar.initialize(this._calGridEl, {
      ...this._opts.calendarProps ?? void 0,
      visibleYear: this._visibleYear,
      visibleMonth: this._visibleMonth,
      viewMode: this._viewMode,
      locale: this._effLocale,
      weekStart: this._opts.weekStart,
      hasWeeks: this._opts.hasWeeks,
      selectedDate: live,
      minDate: minDateResolved,
      maxDate: maxDateResolved
    });
    this._calGridEl.addEventListener("cal:select", this._handleCalSelect);
    this._calGridEl.addEventListener("cal:month-change", this._handleCalMonthChange);
    this._calGridEl.addEventListener("cal:viewmode-change", this._handleCalViewModeChange);
    this._calGridEl.addEventListener("cal:dismiss", this._handleCalDismiss);
    this._timeDropdown = this._createTimeDropdown(timeHost);
  }
  _createTimeDropdown(host) {
    const live = this._liveValue();
    const minDate = asDate(this._opts.min, this._effFormat, this._effLocale);
    const maxDate = asDate(this._opts.max, this._effFormat, this._effLocale);
    const startTime = asTime(this._opts.startTime, this._effTimeFormat);
    const endTime = asTime(this._opts.endTime, this._effTimeFormat);
    return ArvoTimeDropdown.initialize(host, {
      value: live ? getTimePart(live) : null,
      format: this._effTimeFormat,
      locale: this._effLocale,
      interval: this._opts.interval,
      minTime: getEffectiveMinTimeForDate(live, minDate, startTime),
      maxTime: getEffectiveMaxTimeForDate(live, maxDate, endTime),
      isDisabled: this._opts.isDisabled,
      onChange: (time) => this._handleTimeChange(time),
      onDismiss: () => this.close()
    });
  }
  _handleTimeChange(time) {
    const base = this._liveValue() ?? /* @__PURE__ */ new Date();
    const next = mergeDateAndTime(base, time);
    this._handleCommit(next);
    if (this._opts.isAutoClose) this.close();
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
  }
  _handleHeaderNext() {
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
  }
  _handleHeaderToday() {
    const today = /* @__PURE__ */ new Date();
    this._visibleYear = today.getFullYear();
    this._visibleMonth = today.getMonth();
    this._syncCalendarVisible();
  }
  _handleCommit(next) {
    var _a, _b, _c, _d, _e;
    const minDate = asDate(this._opts.min, this._effFormat, this._effLocale);
    const maxDate = asDate(this._opts.max, this._effFormat, this._effLocale);
    const startTime = asTime(this._opts.startTime, this._effTimeFormat);
    const endTime = asTime(this._opts.endTime, this._effTimeFormat);
    const clamped = clampToBounds(next, minDate, maxDate, startTime, endTime);
    if (sameDateTime(clamped, this._committedValue)) return false;
    this._committedValue = clamped;
    this._previewValue = null;
    if (clamped) {
      this._visibleYear = clamped.getFullYear();
      this._visibleMonth = clamped.getMonth();
      (_a = this._calNav) == null ? void 0 : _a.setVisibleMonth(this._visibleYear, this._visibleMonth);
      (_b = this._calendar) == null ? void 0 : _b.update({
        visibleYear: this._visibleYear,
        visibleMonth: this._visibleMonth,
        selectedDate: clamped
      });
      const tPart = getTimePart(clamped);
      if (this._timeDropdown && tPart) this._timeDropdown.value(tPart);
    } else {
      (_c = this._calendar) == null ? void 0 : _c.update({ selectedDate: null });
    }
    const formatted = clamped ? formatDate(clamped, this._effFormat, this._effLocale) : "";
    (_e = (_d = this._opts).onChange) == null ? void 0 : _e.call(_d, { value: clamped, formattedValue: formatted });
    this._dispatch("dt-drop:change", { value: clamped, formattedValue: formatted });
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
    if (!this._dispatch("dt-drop:open")) return;
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
        this._liveValue(),
        asDate(this._opts.min, this._effFormat, this._effLocale),
        asDate(this._opts.max, this._effFormat, this._effLocale)
      );
      (_a2 = this._calendar) == null ? void 0 : _a2.focusCell(target);
    });
  }
  close() {
    var _a, _b, _c, _d, _e;
    if (this._destroyed) return;
    if (!this._isOpen) return;
    if (((_b = (_a = this._opts).onClose) == null ? void 0 : _b.call(_a)) === false) return;
    if (!this._dispatch("dt-drop:close")) return;
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
    const minDate = asDate(this._opts.min, this._effFormat, this._effLocale);
    const maxDate = asDate(this._opts.max, this._effFormat, this._effLocale);
    const startTime = asTime(this._opts.startTime, this._effTimeFormat);
    const endTime = asTime(this._opts.endTime, this._effTimeFormat);
    const coerced = clampToBounds(
      coerceDate(v, this._effFormat, this._effLocale),
      minDate,
      maxDate,
      startTime,
      endTime
    );
    this._committedValue = coerced;
    this._previewValue = null;
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
      const tPart = getTimePart(coerced);
      if (this._timeDropdown && tPart) this._timeDropdown.value(tPart);
    }
  }
  /**
   * Imperative live-preview setter for the parent picker's segmented input.
   * Updates the highlighted calendar cell + time option without committing
   * or emitting dt-drop:change.
   */
  setPreview(v) {
    var _a;
    this._previewValue = v;
    if (!this._isOpen) return;
    (_a = this._calendar) == null ? void 0 : _a.update({ selectedDate: this._liveValue() });
    const tPart = getTimePart(v);
    if (this._timeDropdown && tPart) this._timeDropdown.value(tPart);
  }
  formattedValue() {
    return this._committedValue ? formatDate(this._committedValue, this._effFormat, this._effLocale) : "";
  }
  disabled(state) {
    var _a;
    if (state === void 0) return this._opts.isDisabled;
    if (this._opts.isDisabled === state) return;
    this._opts.isDisabled = state;
    (_a = this._timeDropdown) == null ? void 0 : _a.disabled(state);
    if (state && this._isOpen) this.close();
  }
  focus() {
    var _a;
    if (!this._isOpen) return;
    const target = pickAnchorDate(
      this._liveValue(),
      asDate(this._opts.min, this._effFormat, this._effLocale),
      asDate(this._opts.max, this._effFormat, this._effLocale)
    );
    (_a = this._calendar) == null ? void 0 : _a.focusCell(target);
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f;
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
    (_e = this._timeDropdown) == null ? void 0 : _e.destroy();
    this._timeDropdown = null;
    (_f = this._popoverEl) == null ? void 0 : _f.remove();
    this._popoverEl = null;
    this._calColEl = null;
    this._headerEl = null;
    this._calGridEl = null;
    this._timeColEl = null;
    this._sepEl = null;
    if (this._trigger) {
      this._trigger.removeAttribute("aria-haspopup");
      this._trigger.removeAttribute("aria-controls");
      this._trigger.removeAttribute("aria-expanded");
    }
    this._trigger = null;
  }
  _getOrderedPopoverElements() {
    const root = this._popoverEl;
    if (!root) return [];
    const cell = root.querySelector('.arvo-cal__cell[tabindex="0"]');
    const timeItem = root.querySelector('.arvo-tdrop [tabindex="0"]');
    const prev = root.querySelector(".arvo-cal-nav__prev");
    const month = root.querySelector(".arvo-cal-nav__month-btn");
    const year = root.querySelector(".arvo-cal-nav__year-btn");
    const next = root.querySelector(".arvo-cal-nav__next");
    const today = root.querySelector(".arvo-cal-nav__today");
    return [cell, timeItem, prev, month, year, next, today];
  }
};
_ArvoDateTimeDropdown.PLACEMENTS = [
  "top-start",
  "top-end",
  "bottom-start",
  "bottom-end",
  "auto"
];
_ArvoDateTimeDropdown.DEFAULTS = {
  value: void 0,
  defaultValue: null,
  format: null,
  locale: null,
  weekStart: 0,
  hasWeeks: false,
  interval: 15,
  min: null,
  max: null,
  startTime: null,
  endTime: null,
  defaultOpen: false,
  isDisabled: false,
  isAutoClose: false,
  // dt defaults to false (date AND time)
  placement: "bottom-end",
  ariaLabel: "Choose a date and time",
  calendarProps: null,
  popoverProps: null,
  onChange: null,
  onOpen: null,
  onClose: null,
  onOpenChange: null,
  onMonthChange: null,
  onViewModeChange: null
};
let ArvoDateTimeDropdown = _ArvoDateTimeDropdown;
function sameDateTime(a, b) {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return a.getTime() === b.getTime();
}
export {
  ArvoDateTimeDropdown
};
//# sourceMappingURL=DateTimeDropdown.js.map
