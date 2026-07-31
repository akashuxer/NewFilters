import { getUserLocale, getLocaleDateFormat, pickAnchorDate, addMonths, formatDate, createOverlaySurface, applyPositionToSurface, parseDate } from "@arvo/core";
import { ArvoCalendar } from "../Calendar/Calendar.js";
import { CalendarNav } from "../CalendarNav/CalendarNav.js";
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
class ArvoCalendarRangeDropdown {
  constructor(trigger, options) {
    this._popoverEl = null;
    this._bodyEl = null;
    this._headerEl = null;
    this._calLeftEl = null;
    this._calRightEl = null;
    this._calLeft = null;
    this._calRight = null;
    this._nav = null;
    this._surface = null;
    this._draftFirstSet = false;
    this._activeSide = "start";
    this._hoverDate = null;
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
    this._handleEngineClose = () => {
      var _a, _b;
      if (this._closingProgrammatically) return;
      if (!this._isOpen) return;
      this._isOpen = false;
      if (this._trigger) this._trigger.setAttribute("aria-expanded", "false");
      (_b = (_a = this._opts).onOpenChange) == null ? void 0 : _b.call(_a, false);
    };
    this._trigger = trigger;
    this._id = `arvo-cal-rng-drop-${++_idCounter}`;
    this._opts = {
      weekStart: 0,
      hasWeeks: true,
      isDisabled: false,
      isAutoClose: true,
      placement: "bottom-end",
      ...options ?? {}
    };
    this._effLocale = this._opts.locale ?? getUserLocale();
    this._effFormat = this._opts.format ?? getLocaleDateFormat(this._effLocale);
    const minDate = asDate(this._opts.minDate, this._effFormat, this._effLocale);
    const maxDate = asDate(this._opts.maxDate, this._effFormat, this._effLocale);
    const start = clampDate(
      coerceDate(this._opts.startValue, this._effFormat, this._effLocale),
      minDate,
      maxDate
    );
    const end = clampDate(
      coerceDate(this._opts.endValue, this._effFormat, this._effLocale),
      minDate,
      maxDate
    );
    this._appliedRange = { start, end };
    this._draftRange = { start, end };
    this._draftFirstSet = !!(start && !end);
    this._activeSide = start && !end ? "end" : "start";
    const anchor = pickAnchorDate(start ?? end, minDate, maxDate);
    this._leftYear = anchor.getFullYear();
    this._leftMonth = anchor.getMonth();
    this._bindTrigger();
    if (this._opts.defaultOpen && !this._opts.isDisabled) {
      queueMicrotask(() => this.open());
    }
  }
  static initialize(trigger, options) {
    return new ArvoCalendarRangeDropdown(trigger, options);
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
  // Popover
  // -------------------------------------------------------------------------
  _buildPopover() {
    var _a;
    if (this._popoverEl) return;
    this._popoverEl = document.createElement("div");
    this._popoverEl.className = this._opts.hasWeeks ? "arvo-cal-rng-drop arvo-cal-rng-drop--show-weeks arvo-cal-rng-drop--absolute" : "arvo-cal-rng-drop arvo-cal-rng-drop--absolute";
    this._popoverEl.id = this._id;
    this._popoverEl.setAttribute("role", "dialog");
    this._popoverEl.setAttribute(
      "aria-label",
      this._opts.ariaLabel ?? "Choose a date range"
    );
    this._popoverEl.setAttribute("aria-modal", "false");
    this._popoverEl.style.position = "fixed";
    this._popoverEl.style.top = "0";
    this._popoverEl.style.left = "0";
    this._popoverEl.style.margin = "0";
    if ((_a = this._opts.popoverProps) == null ? void 0 : _a.width) {
      this._popoverEl.style.width = this._opts.popoverProps.width;
    }
    this._headerEl = document.createElement("div");
    this._headerEl.className = "arvo-cal-rng-drop__header";
    this._popoverEl.appendChild(this._headerEl);
    const minDateResolved = asDate(this._opts.minDate, this._effFormat, this._effLocale);
    const maxDateResolved = asDate(this._opts.maxDate, this._effFormat, this._effLocale);
    const right = this._visibleFor("right");
    this._nav = CalendarNav.initialize(this._headerEl, {
      variant: "range",
      visibleYear: this._leftYear,
      visibleMonth: this._leftMonth,
      rangeEndYear: right.year,
      rangeEndMonth: right.month,
      viewMode: this._navViewMode(),
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
    this._bodyEl = document.createElement("div");
    this._bodyEl.className = "arvo-cal-rng-drop__body";
    this._popoverEl.appendChild(this._bodyEl);
    this._calLeftEl = document.createElement("div");
    this._calLeftEl.className = "arvo-cal-rng-drop__cal";
    this._calRightEl = document.createElement("div");
    this._calRightEl.className = "arvo-cal-rng-drop__cal";
    this._bodyEl.appendChild(this._calLeftEl);
    this._bodyEl.appendChild(this._calRightEl);
    this._mountCalendarColumn(this._calLeftEl, "left");
    this._mountCalendarColumn(this._calRightEl, "right");
    this._refreshCalendars();
  }
  _mountCalendarColumn(host, side) {
    const minDateResolved = asDate(this._opts.minDate, this._effFormat, this._effLocale);
    const maxDateResolved = asDate(this._opts.maxDate, this._effFormat, this._effLocale);
    const visible = this._visibleFor(side);
    const cal = ArvoCalendar.initialize(host, {
      ...this._opts.calendarProps ?? void 0,
      visibleYear: visible.year,
      visibleMonth: visible.month,
      viewMode: this._viewMode,
      locale: this._effLocale,
      weekStart: this._opts.weekStart,
      hasWeeks: this._opts.hasWeeks,
      rangeStart: this._draftRange.start,
      rangeEnd: this._draftRange.end,
      hoverDate: this._hoverDate,
      isRangeComplete: !!(this._draftRange.start && this._draftRange.end),
      minDate: minDateResolved,
      maxDate: maxDateResolved,
      onCellSelect: (p) => this._handleCellSelect(p),
      onCellHover: (p) => this._handleCellHover(p),
      // Keyboard navigation inside either grid emits onMonthChange. The
      // LEFT calendar's nav directly drives `_leftYear`/`_leftMonth`; the
      // RIGHT calendar shifts the left period back by one full period so
      // the right column lands on the requested period (same delta as
      // `_visibleFor('right')`, just inverted). Mirrors ArvoDateRangePicker.
      onMonthChange: side === "left" ? (p) => {
        this._leftYear = p.year;
        this._leftMonth = p.month;
        this._refreshCalendars();
      } : (p) => {
        if (this._viewMode === "months" || this._viewMode === "quarters") {
          this._leftYear = p.year - 1;
          this._leftMonth = p.month;
        } else if (this._viewMode === "years") {
          this._leftYear = p.year - 10;
          this._leftMonth = p.month;
        } else {
          const d = addMonths(new Date(p.year, p.month, 1), -1);
          this._leftYear = d.getFullYear();
          this._leftMonth = d.getMonth();
        }
        this._refreshCalendars();
      },
      onViewModeChange: (p) => this._setViewMode(p.mode),
      onDismiss: () => this.close()
    });
    if (side === "left") this._calLeft = cal;
    else this._calRight = cal;
  }
  // CalendarNav only accepts 'days' / 'months' / 'years' (the wider
  // ArvoCalendar viewMode union also includes 'quarters' / 'members').
  // Coerce so unsupported values render the days-style header.
  _navViewMode() {
    return this._viewMode === "months" || this._viewMode === "years" ? this._viewMode : "days";
  }
  _visibleFor(side) {
    if (side === "left") return { year: this._leftYear, month: this._leftMonth };
    if (this._viewMode === "months" || this._viewMode === "quarters") {
      return { year: this._leftYear + 1, month: this._leftMonth };
    }
    if (this._viewMode === "years") {
      return { year: this._leftYear + 10, month: this._leftMonth };
    }
    const next = addMonths(new Date(this._leftYear, this._leftMonth, 1), 1);
    return { year: next.getFullYear(), month: next.getMonth() };
  }
  // Shared header handlers -- single Prev / Next / Today cluster steps
  // BOTH calendars together (rightVisible is derived from leftYear /
  // leftMonth + viewMode). Step unit matches viewMode.
  _handleHeaderPrev() {
    if (this._viewMode === "days") {
      const d = addMonths(new Date(this._leftYear, this._leftMonth, 1), -1);
      this._leftYear = d.getFullYear();
      this._leftMonth = d.getMonth();
    } else if (this._viewMode === "months") {
      this._leftYear -= 1;
    } else if (this._viewMode === "years") {
      this._leftYear -= 10;
    }
    this._refreshCalendars();
  }
  _handleHeaderNext() {
    if (this._viewMode === "days") {
      const d = addMonths(new Date(this._leftYear, this._leftMonth, 1), 1);
      this._leftYear = d.getFullYear();
      this._leftMonth = d.getMonth();
    } else if (this._viewMode === "months") {
      this._leftYear += 1;
    } else if (this._viewMode === "years") {
      this._leftYear += 10;
    }
    this._refreshCalendars();
  }
  _handleHeaderToday() {
    const today = /* @__PURE__ */ new Date();
    this._leftYear = today.getFullYear();
    this._leftMonth = today.getMonth();
    this._refreshCalendars();
  }
  _setViewMode(mode) {
    if (this._viewMode === mode) return;
    this._viewMode = mode;
    this._refreshCalendars();
  }
  _refreshCalendars() {
    var _a, _b;
    const left = this._visibleFor("left");
    const right = this._visibleFor("right");
    if (this._nav) {
      this._nav.setRangeEnd(right.year, right.month);
      this._nav.setVisibleMonth(left.year, left.month);
      this._nav.setViewMode(this._navViewMode());
    }
    const sharedPatch = {
      rangeStart: this._draftRange.start,
      rangeEnd: this._draftRange.end,
      hoverDate: this._hoverDate,
      isRangeComplete: !!(this._draftRange.start && this._draftRange.end),
      viewMode: this._viewMode
    };
    (_a = this._calLeft) == null ? void 0 : _a.update({
      ...sharedPatch,
      visibleYear: left.year,
      visibleMonth: left.month
    });
    (_b = this._calRight) == null ? void 0 : _b.update({
      ...sharedPatch,
      visibleYear: right.year,
      visibleMonth: right.month
    });
  }
  _handleCellSelect(payload) {
    if (!payload.date) return;
    if (payload.mode !== "days") {
      this._leftYear = payload.date.getFullYear();
      this._leftMonth = payload.date.getMonth();
      if (payload.mode === "months") this._setViewMode("days");
      else if (payload.mode === "years") this._setViewMode("months");
      else this._refreshCalendars();
      return;
    }
    const date = payload.date;
    if (!this._draftFirstSet) {
      this._draftRange = { start: date, end: null };
      this._draftFirstSet = true;
      this._activeSide = "end";
      this._refreshCalendars();
      return;
    }
    let start;
    let end;
    if (this._draftRange.start && date.getTime() < this._draftRange.start.getTime()) {
      start = date;
      end = this._draftRange.start;
    } else {
      start = this._draftRange.start ?? date;
      end = date;
    }
    this._draftRange = { start, end };
    this._draftFirstSet = false;
    this._activeSide = "start";
    this._hoverDate = null;
    this._commitRange(start, end);
    this._refreshCalendars();
    if (this._opts.isAutoClose) this.close();
  }
  _handleCellHover(payload) {
    if (!this._draftFirstSet) return;
    if (!payload.date) {
      this._hoverDate = null;
    } else {
      this._hoverDate = payload.date;
    }
    this._refreshCalendars();
  }
  _commitRange(start, end) {
    var _a, _b;
    this._appliedRange = { start, end };
    const formatted = {
      start: formatDate(start, this._effFormat, this._effLocale),
      end: formatDate(end, this._effFormat, this._effLocale)
    };
    (_b = (_a = this._opts).onChange) == null ? void 0 : _b.call(_a, {
      start,
      end,
      formatted,
      mode: "absolute"
    });
    this._dispatch("cal-rng-drop:change", {
      start,
      end,
      formatted,
      mode: "absolute"
    });
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
    if (!this._dispatch("cal-rng-drop:open")) return;
    this._isOpen = true;
    this._buildPopover();
    this._draftRange = { ...this._appliedRange };
    this._draftFirstSet = !!(this._appliedRange.start && !this._appliedRange.end);
    this._activeSide = this._draftFirstSet ? "end" : "start";
    this._hoverDate = null;
    const minDate = asDate(this._opts.minDate, this._effFormat, this._effLocale);
    const maxDate = asDate(this._opts.maxDate, this._effFormat, this._effLocale);
    const center = pickAnchorDate(
      this._appliedRange.start ?? this._appliedRange.end,
      minDate,
      maxDate
    );
    this._leftYear = center.getFullYear();
    this._leftMonth = center.getMonth();
    this._refreshCalendars();
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
      const minDate2 = asDate(this._opts.minDate, this._effFormat, this._effLocale);
      const maxDate2 = asDate(this._opts.maxDate, this._effFormat, this._effLocale);
      const target = pickAnchorDate(this._appliedRange.start, minDate2, maxDate2);
      (_a2 = this._calLeft) == null ? void 0 : _a2.focusCell(target);
    });
  }
  close() {
    var _a, _b, _c, _d, _e;
    if (this._destroyed) return;
    if (!this._isOpen) return;
    if (((_b = (_a = this._opts).onClose) == null ? void 0 : _b.call(_a)) === false) return;
    if (!this._dispatch("cal-rng-drop:close")) return;
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
  range(v) {
    if (v === void 0) return { ...this._appliedRange };
    const minDate = asDate(this._opts.minDate, this._effFormat, this._effLocale);
    const maxDate = asDate(this._opts.maxDate, this._effFormat, this._effLocale);
    this._appliedRange = {
      start: clampDate(v.start, minDate, maxDate),
      end: clampDate(v.end, minDate, maxDate)
    };
    this._draftRange = { ...this._appliedRange };
    this._draftFirstSet = false;
    this._activeSide = "start";
    if (this._isOpen) this._refreshCalendars();
  }
  /**
   * Imperative active-side hint used by parent pickers' segmented inputs to
   * pre-position the cursor on the calendar before the next click.
   */
  setActiveSide(side) {
    this._activeSide = side;
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
    const minDate = asDate(this._opts.minDate, this._effFormat, this._effLocale);
    const maxDate = asDate(this._opts.maxDate, this._effFormat, this._effLocale);
    const target = pickAnchorDate(this._appliedRange.start, minDate, maxDate);
    (_a = this._calLeft) == null ? void 0 : _a.focusCell(target);
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
    (_c = this._calLeft) == null ? void 0 : _c.destroy();
    (_d = this._calRight) == null ? void 0 : _d.destroy();
    (_e = this._nav) == null ? void 0 : _e.destroy();
    this._calLeft = null;
    this._calRight = null;
    this._nav = null;
    (_f = this._popoverEl) == null ? void 0 : _f.remove();
    this._popoverEl = null;
    this._bodyEl = null;
    this._headerEl = null;
    this._calLeftEl = null;
    this._calRightEl = null;
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
    const cells = Array.from(root.querySelectorAll('.arvo-cal__cell[tabindex="0"]'));
    const navs = Array.from(root.querySelectorAll(".arvo-cal-nav__prev, .arvo-cal-nav__next"));
    return [...cells, ...navs];
  }
}
function clampDate(v, min, max) {
  if (v == null) return null;
  if (min && v.getTime() < min.getTime()) return new Date(min.getTime());
  if (max && v.getTime() > max.getTime()) return new Date(max.getTime());
  return v;
}
export {
  ArvoCalendarRangeDropdown
};
//# sourceMappingURL=CalendarRangeDropdown.js.map
