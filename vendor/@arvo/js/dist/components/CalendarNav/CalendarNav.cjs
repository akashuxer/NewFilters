"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const core = require("@arvo/core");
const Button = require("../Button/Button.cjs");
const IconButton = require("../IconButton/IconButton.cjs");
const EM_DASH = "—";
function previousPeriod(viewMode, year, month) {
  if (viewMode === "days") {
    const d = core.addMonths(new Date(year, month, 1), -1);
    return { year: d.getFullYear(), month: d.getMonth() };
  }
  if (viewMode === "months") return { year: year - 1, month };
  return { year: year - 10, month };
}
function nextPeriod(viewMode, year, month) {
  if (viewMode === "days") {
    const d = core.addMonths(new Date(year, month, 1), 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  }
  if (viewMode === "months") return { year: year + 1, month };
  return { year: year + 10, month };
}
function periodOverlapsRange(viewMode, year, month, minDate, maxDate) {
  if (viewMode === "days") return core.monthOverlapsRange(year, month, minDate, maxDate);
  if (viewMode === "months") {
    for (let m = 0; m < 12; m += 1) {
      if (core.monthOverlapsRange(year, m, minDate, maxDate)) return true;
    }
    return false;
  }
  const start = year - (year % 10 + 10) % 10;
  for (let i = 0; i < 10; i += 1) {
    if (core.yearOverlapsRange(start + i, minDate, maxDate)) return true;
  }
  return false;
}
function canGoPrev(opts) {
  if (!opts.minDate && !opts.maxDate) return true;
  const { year, month } = previousPeriod(opts.viewMode, opts.visibleYear, opts.visibleMonth);
  return periodOverlapsRange(opts.viewMode, year, month, opts.minDate, opts.maxDate);
}
function canGoNext(opts) {
  if (!opts.minDate && !opts.maxDate) return true;
  const { year, month } = nextPeriod(opts.viewMode, opts.visibleYear, opts.visibleMonth);
  return periodOverlapsRange(opts.viewMode, year, month, opts.minDate, opts.maxDate);
}
function canGoToday(opts) {
  if (!opts.minDate && !opts.maxDate) return true;
  return core.inDateRange(/* @__PURE__ */ new Date(), opts.minDate, opts.maxDate);
}
class CalendarNav {
  constructor(element, options) {
    this._leftEl = null;
    this._rightEl = null;
    this._monthBtnLEl = null;
    this._yearBtnLEl = null;
    this._monthBtnREl = null;
    this._yearBtnREl = null;
    this._decadeLblEl = null;
    this._rangeSepEl = null;
    this._prevBtnEl = null;
    this._todayBtnEl = null;
    this._nextBtnEl = null;
    this._monthBtnL = null;
    this._yearBtnL = null;
    this._monthBtnR = null;
    this._yearBtnR = null;
    this._prevBtn = null;
    this._todayBtn = null;
    this._nextBtn = null;
    this._destroyed = false;
    this._element = element;
    this._options = {
      visibleYear: options.visibleYear,
      visibleMonth: options.visibleMonth,
      viewMode: options.viewMode ?? "days",
      variant: options.variant ?? "single",
      rangeEndYear: options.rangeEndYear ?? null,
      rangeEndMonth: options.rangeEndMonth ?? null,
      locale: options.locale ?? null,
      minDate: options.minDate ?? null,
      maxDate: options.maxDate ?? null,
      isDisabled: options.isDisabled ?? false,
      prevTooltip: options.prevTooltip ?? "Previous",
      nextTooltip: options.nextTooltip ?? "Next",
      todayTooltip: options.todayTooltip ?? "Select today",
      monthTooltip: options.monthTooltip ?? "Choose month",
      yearTooltip: options.yearTooltip ?? "Choose year",
      onPrev: options.onPrev ?? null,
      onNext: options.onNext ?? null,
      onToday: options.onToday ?? null,
      onMonthButtonClick: options.onMonthButtonClick ?? null,
      onYearButtonClick: options.onYearButtonClick ?? null,
      className: options.className ?? null,
      id: options.id ?? null
    };
    this._buildDom();
    this._mountInnerButtons();
    this._syncRootClasses();
    this._syncNavDisabled();
    this._syncPressed();
  }
  static initialize(element, options) {
    return new CalendarNav(element, options);
  }
  // -------------------------------------------------------------------------
  // DOM build
  // -------------------------------------------------------------------------
  _buildDom() {
    const root = this._element;
    root.classList.add("arvo-cal-nav");
    root.classList.add(`arvo-cal-nav--${this._options.viewMode}`);
    if (this._options.className) {
      for (const cls of this._options.className.split(/\s+/).filter(Boolean)) {
        root.classList.add(cls);
      }
    }
    if (this._options.id) root.id = this._options.id;
    this._leftEl = document.createElement("div");
    this._leftEl.className = "arvo-cal-nav__left";
    this._renderLeftZone();
    this._rightEl = document.createElement("div");
    this._rightEl.className = "arvo-cal-nav__right";
    this._prevBtnEl = document.createElement("button");
    this._prevBtnEl.classList.add("arvo-cal-nav__prev");
    this._rightEl.appendChild(this._prevBtnEl);
    this._nextBtnEl = document.createElement("button");
    this._nextBtnEl.classList.add("arvo-cal-nav__next");
    this._rightEl.appendChild(this._nextBtnEl);
    this._todayBtnEl = document.createElement("button");
    this._todayBtnEl.classList.add("arvo-cal-nav__today");
    this._rightEl.appendChild(this._todayBtnEl);
    root.appendChild(this._leftEl);
    root.appendChild(this._rightEl);
  }
  // Composes the left zone based on the current view mode AND variant:
  //   single + days   -> Month button + Year button
  //   single + months -> Year button only (clickable to zoom out to years)
  //   single + years  -> Decade span "YYYY - YYYY", non-interactive
  //   range  + days   -> Month L + Year L + em-dash + Month R + Year R
  //   range  + months -> Year L + em-dash + Year R
  //   range  + years  -> Single continuous decade span ("2020 - 2039")
  _renderLeftZone() {
    var _a, _b, _c, _d;
    if (!this._leftEl) return;
    (_a = this._monthBtnL) == null ? void 0 : _a.destroy();
    (_b = this._yearBtnL) == null ? void 0 : _b.destroy();
    (_c = this._monthBtnR) == null ? void 0 : _c.destroy();
    (_d = this._yearBtnR) == null ? void 0 : _d.destroy();
    this._monthBtnL = null;
    this._yearBtnL = null;
    this._monthBtnR = null;
    this._yearBtnR = null;
    this._monthBtnLEl = null;
    this._yearBtnLEl = null;
    this._monthBtnREl = null;
    this._yearBtnREl = null;
    this._decadeLblEl = null;
    this._rangeSepEl = null;
    this._leftEl.textContent = "";
    const mode = this._options.viewMode;
    const isRange = this._options.variant === "range";
    if (mode === "years") {
      const span = document.createElement("span");
      span.className = "arvo-cal-nav__decade-lbl";
      const label = isRange ? this._continuousDecadeLabel() : this._decadeLabel();
      span.textContent = label;
      span.setAttribute("aria-label", label);
      span.setAttribute("aria-disabled", "true");
      this._decadeLblEl = span;
      this._leftEl.appendChild(span);
      return;
    }
    const appendPair = (side) => {
      if (mode !== "months") {
        const monthBtnEl = document.createElement("button");
        monthBtnEl.classList.add("arvo-cal-nav__month-btn");
        this._leftEl.appendChild(monthBtnEl);
        if (side === "L") this._monthBtnLEl = monthBtnEl;
        else this._monthBtnREl = monthBtnEl;
      }
      const yearBtnEl = document.createElement("button");
      yearBtnEl.classList.add("arvo-cal-nav__year-btn");
      this._leftEl.appendChild(yearBtnEl);
      if (side === "L") this._yearBtnLEl = yearBtnEl;
      else this._yearBtnREl = yearBtnEl;
    };
    appendPair("L");
    if (isRange) {
      this._rangeSepEl = document.createElement("span");
      this._rangeSepEl.className = "arvo-cal-nav__range-sep";
      this._rangeSepEl.textContent = EM_DASH;
      this._rangeSepEl.setAttribute("aria-hidden", "true");
      this._leftEl.appendChild(this._rangeSepEl);
      appendPair("R");
    }
  }
  _mountInnerButtons() {
    this._mountLeftZoneButtons();
    if (!this._prevBtnEl || !this._todayBtnEl || !this._nextBtnEl) return;
    this._prevBtn = IconButton.ArvoIconButton.initialize(this._prevBtnEl, {
      variant: "tertiary",
      size: "md",
      icon: "angle-up",
      tooltip: this._options.prevTooltip,
      isDisabled: this._options.isDisabled || !canGoPrev(this._options),
      onClick: () => this._emit("cal-nav:prev", this._options.onPrev)
    });
    this._nextBtn = IconButton.ArvoIconButton.initialize(this._nextBtnEl, {
      variant: "tertiary",
      size: "md",
      icon: "angle-down",
      tooltip: this._options.nextTooltip,
      isDisabled: this._options.isDisabled || !canGoNext(this._options),
      onClick: () => this._emit("cal-nav:next", this._options.onNext)
    });
    this._todayBtn = IconButton.ArvoIconButton.initialize(this._todayBtnEl, {
      variant: "tertiary",
      size: "md",
      icon: "calendar-date-selected",
      tooltip: this._options.todayTooltip,
      isDisabled: this._options.isDisabled || !canGoToday(this._options),
      onClick: () => this._emit("cal-nav:today", this._options.onToday)
    });
  }
  // Mounts the Month/Year ArvoButton instances onto the left-zone element
  // slots created by _renderLeftZone. Called from the constructor and from
  // setViewMode / setVariant where the left zone is rebuilt.
  _mountLeftZoneButtons() {
    const monthsView = this._options.viewMode === "months";
    if (this._monthBtnLEl) {
      this._monthBtnL = Button.ArvoButton.initialize(this._monthBtnLEl, {
        variant: "tertiary",
        size: "md",
        label: this._monthLabel(this._options.visibleYear, this._options.visibleMonth),
        isDisabled: this._options.isDisabled,
        onClick: () => this._emit("cal-nav:month-btn", this._options.onMonthButtonClick)
      });
      this._monthBtnLEl.setAttribute("aria-label", this._options.monthTooltip);
      this._monthBtnLEl.setAttribute(
        "aria-pressed",
        String(monthsView)
      );
    }
    if (this._yearBtnLEl) {
      this._yearBtnL = Button.ArvoButton.initialize(this._yearBtnLEl, {
        variant: "tertiary",
        size: "md",
        label: this._yearLabel(this._options.visibleYear),
        isDisabled: this._options.isDisabled,
        onClick: () => this._emit("cal-nav:year-btn", this._options.onYearButtonClick)
      });
      this._yearBtnLEl.setAttribute("aria-label", this._options.yearTooltip);
      this._yearBtnLEl.setAttribute(
        "aria-pressed",
        String(this._options.viewMode === "years" || monthsView)
      );
    }
    const endYear = this._options.rangeEndYear ?? this._options.visibleYear;
    const endMonth = this._options.rangeEndMonth ?? this._options.visibleMonth;
    if (this._monthBtnREl) {
      this._monthBtnR = Button.ArvoButton.initialize(this._monthBtnREl, {
        variant: "tertiary",
        size: "md",
        label: this._monthLabel(endYear, endMonth),
        isDisabled: this._options.isDisabled,
        onClick: () => this._emit("cal-nav:month-btn", this._options.onMonthButtonClick)
      });
      this._monthBtnREl.setAttribute("aria-label", this._options.monthTooltip);
      this._monthBtnREl.setAttribute("aria-pressed", String(monthsView));
    }
    if (this._yearBtnREl) {
      this._yearBtnR = Button.ArvoButton.initialize(this._yearBtnREl, {
        variant: "tertiary",
        size: "md",
        label: this._yearLabel(endYear),
        isDisabled: this._options.isDisabled,
        onClick: () => this._emit("cal-nav:year-btn", this._options.onYearButtonClick)
      });
      this._yearBtnREl.setAttribute("aria-label", this._options.yearTooltip);
      this._yearBtnREl.setAttribute(
        "aria-pressed",
        String(this._options.viewMode === "years" || monthsView)
      );
    }
  }
  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------
  _effLocale() {
    return core.getUserLocale(this._options.locale ?? void 0);
  }
  _monthLabel(year, month) {
    return core.formatDate(new Date(year, month, 1), "MMMM", this._effLocale());
  }
  _yearLabel(year) {
    return String(year);
  }
  _decadeLabel() {
    const start = this._options.visibleYear - (this._options.visibleYear % 10 + 10) % 10;
    return `${start} - ${start + 9}`;
  }
  // Range variant + years view collapses both decades into a single
  // continuous label spanning the first year of the left decade to the
  // last year of the right decade (e.g. "2020 - 2039"). Mirrors React
  // CalendarNav.renderLeft / variant='range' / years.
  _continuousDecadeLabel() {
    const leftDecade = this._options.visibleYear - (this._options.visibleYear % 10 + 10) % 10;
    const endYear = this._options.rangeEndYear ?? this._options.visibleYear;
    const rightDecade = endYear - (endYear % 10 + 10) % 10;
    const firstYear = Math.min(leftDecade, rightDecade);
    const lastYear = Math.max(leftDecade, rightDecade) + 9;
    return `${firstYear} - ${lastYear}`;
  }
  _syncRootClasses() {
    if (!this._element) return;
    this._element.classList.toggle("is-disabled", this._options.isDisabled);
    for (const mode of ["days", "months", "years"]) {
      this._element.classList.toggle(
        `arvo-cal-nav--${mode}`,
        this._options.viewMode === mode
      );
    }
    this._element.classList.toggle(
      "arvo-cal-nav--range",
      this._options.variant === "range"
    );
  }
  _syncNavDisabled() {
    var _a, _b, _c, _d, _e, _f, _g;
    const disabled = this._options.isDisabled;
    (_a = this._prevBtn) == null ? void 0 : _a.disabled(disabled || !canGoPrev(this._options));
    (_b = this._nextBtn) == null ? void 0 : _b.disabled(disabled || !canGoNext(this._options));
    (_c = this._todayBtn) == null ? void 0 : _c.disabled(disabled || !canGoToday(this._options));
    (_d = this._monthBtnL) == null ? void 0 : _d.disabled(disabled);
    (_e = this._yearBtnL) == null ? void 0 : _e.disabled(disabled);
    (_f = this._monthBtnR) == null ? void 0 : _f.disabled(disabled);
    (_g = this._yearBtnR) == null ? void 0 : _g.disabled(disabled);
  }
  _syncPressed() {
    const monthsView = this._options.viewMode === "months";
    const yearsView = this._options.viewMode === "years";
    if (this._monthBtnLEl) {
      this._monthBtnLEl.setAttribute("aria-pressed", String(monthsView));
    }
    if (this._monthBtnREl) {
      this._monthBtnREl.setAttribute("aria-pressed", String(monthsView));
    }
    if (this._yearBtnLEl) {
      this._yearBtnLEl.setAttribute("aria-pressed", String(yearsView));
    }
    if (this._yearBtnREl) {
      this._yearBtnREl.setAttribute("aria-pressed", String(yearsView));
    }
  }
  _syncLabels() {
    if (this._monthBtnL) {
      this._monthBtnL.setLabel(
        this._monthLabel(this._options.visibleYear, this._options.visibleMonth)
      );
    }
    if (this._yearBtnL) {
      this._yearBtnL.setLabel(this._yearLabel(this._options.visibleYear));
    }
    const endYear = this._options.rangeEndYear ?? this._options.visibleYear;
    const endMonth = this._options.rangeEndMonth ?? this._options.visibleMonth;
    if (this._monthBtnR) {
      this._monthBtnR.setLabel(this._monthLabel(endYear, endMonth));
    }
    if (this._yearBtnR) {
      this._yearBtnR.setLabel(this._yearLabel(endYear));
    }
    if (this._decadeLblEl) {
      const label = this._options.variant === "range" ? this._continuousDecadeLabel() : this._decadeLabel();
      this._decadeLblEl.textContent = label;
      this._decadeLblEl.setAttribute("aria-label", label);
    }
  }
  _emit(name, cb) {
    var _a;
    if (this._options.isDisabled) return;
    cb == null ? void 0 : cb();
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(name, { bubbles: true })
    );
  }
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  setVisibleMonth(year, month) {
    this._options.visibleYear = year;
    this._options.visibleMonth = month;
    this._syncLabels();
    this._syncNavDisabled();
  }
  /**
   * Range variant only: update the end (right) calendar's visible period
   * without changing the left period. Triggers re-render of the right
   * label pair (or the continuous decade label in years view).
   */
  setRangeEnd(year, month) {
    this._options.rangeEndYear = year;
    this._options.rangeEndMonth = month;
    this._syncLabels();
  }
  setViewMode(mode) {
    if (this._options.viewMode === mode) return;
    this._options.viewMode = mode;
    this._renderLeftZone();
    this._mountLeftZoneButtons();
    this._syncRootClasses();
    this._syncPressed();
    this._syncNavDisabled();
  }
  disabled(state) {
    if (state === void 0) return this._options.isDisabled;
    this._options.isDisabled = state;
    this._syncRootClasses();
    this._syncNavDisabled();
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f, _g;
    if (this._destroyed) return;
    this._destroyed = true;
    (_a = this._monthBtnL) == null ? void 0 : _a.destroy();
    (_b = this._yearBtnL) == null ? void 0 : _b.destroy();
    (_c = this._monthBtnR) == null ? void 0 : _c.destroy();
    (_d = this._yearBtnR) == null ? void 0 : _d.destroy();
    (_e = this._prevBtn) == null ? void 0 : _e.destroy();
    (_f = this._todayBtn) == null ? void 0 : _f.destroy();
    (_g = this._nextBtn) == null ? void 0 : _g.destroy();
    this._monthBtnL = null;
    this._yearBtnL = null;
    this._monthBtnR = null;
    this._yearBtnR = null;
    this._prevBtn = null;
    this._todayBtn = null;
    this._nextBtn = null;
    if (this._element) {
      this._element.classList.remove("arvo-cal-nav", "is-disabled");
      this._element.textContent = "";
    }
    this._monthBtnLEl = null;
    this._yearBtnLEl = null;
    this._monthBtnREl = null;
    this._yearBtnREl = null;
    this._prevBtnEl = null;
    this._todayBtnEl = null;
    this._nextBtnEl = null;
    this._leftEl = null;
    this._rightEl = null;
    this._element = null;
  }
}
exports.CalendarNav = CalendarNav;
//# sourceMappingURL=CalendarNav.cjs.map
