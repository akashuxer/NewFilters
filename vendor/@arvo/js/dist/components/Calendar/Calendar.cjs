"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const core = require("@arvo/core");
function quarterOf(monthIdx) {
  return Math.floor(monthIdx / 3) + 1;
}
function decadeStart(year) {
  return year - (year % 10 + 10) % 10;
}
function dayCompare(a, b) {
  if (a.getFullYear() !== b.getFullYear()) return a.getFullYear() - b.getFullYear();
  if (a.getMonth() !== b.getMonth()) return a.getMonth() - b.getMonth();
  return a.getDate() - b.getDate();
}
function dayKey(date) {
  const y = String(date.getFullYear()).padStart(4, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function orderedRange(a, b) {
  return dayCompare(a, b) <= 0 ? [a, b] : [b, a];
}
function colsForView(mode) {
  switch (mode) {
    case "days":
      return 7;
    case "months":
    case "years":
      return 4;
    case "quarters":
      return 4;
    case "members":
      return 8;
  }
}
function isTypeaheadKey(e) {
  if (e.altKey || e.ctrlKey || e.metaKey) return false;
  return e.key.length === 1 && /\S/.test(e.key);
}
class ArvoCalendar {
  constructor(element, options) {
    this._now = /* @__PURE__ */ new Date();
    this._lastNowKey = "";
    this._gridEl = null;
    this._weekdayHeaderRowEl = null;
    this._rowEls = [];
    this._rowWeekEls = [];
    this._cellMap = /* @__PURE__ */ new Map();
    this._cellOrder = [];
    this._preferredDay = null;
    this._focusRequested = false;
    this._focusRafId = null;
    this._typeAheadBuf = "";
    this._typeAheadTimer = null;
    this._warnedMembersView = false;
    this._handleCellClick = (e) => {
      const target = e.currentTarget;
      if (!target) return;
      const key = target.getAttribute("data-arvo-key");
      if (!key) return;
      const cell = this._cellOrder.find((c) => c.key === key);
      if (!cell || cell.placeholder || cell.isDisabled) return;
      this._setFocusedKey(cell.key);
      if (cell.member) {
        this._emitCellSelect({ member: cell.member });
      } else if (cell.date) {
        this._emitCellSelect({ date: cell.date });
      }
    };
    this._handleCellPointerEnter = (e) => {
      if (!this._rangeMode() || this._options.isRangeComplete) return;
      const target = e.currentTarget;
      if (!target) return;
      const key = target.getAttribute("data-arvo-key");
      if (!key) return;
      const cell = this._cellOrder.find((c) => c.key === key);
      if (!cell || cell.placeholder || cell.isDisabled || !cell.date) return;
      this._emitCellHover({ date: cell.date });
    };
    this._element = element;
    this._options = { ...options };
    this._locale = core.getUserLocale(this._options.locale);
    this._refreshNow(true);
    this._boundHandleKeyDown = this._handleKeyDown.bind(this);
    this._boundHandleGridPointerLeave = this._handleGridPointerLeave.bind(this);
    this._boundHandlePointerOver = this._handlePointerOver.bind(this);
    this._boundHandlePointerOut = this._handlePointerOut.bind(this);
    this._boundHandleFocusIn = this._handleFocusIn.bind(this);
    this._boundHandleFocusOut = this._handleFocusOut.bind(this);
    this._focusedKey = computeInitialFocusKey({
      viewMode: this._options.viewMode ?? "days",
      visibleYear: this._options.visibleYear,
      visibleMonth: this._options.visibleMonth,
      weekStart: this._options.weekStart ?? 0,
      selectedDate: this._options.selectedDate ?? null,
      selectedMember: this._options.selectedMember ?? null,
      memberIndex: this._options.memberIndex ?? null,
      minDate: this._options.minDate ?? null,
      maxDate: this._options.maxDate ?? null,
      now: this._now
    });
    this._buildSkeleton();
    this._attachListeners();
    this._render();
  }
  static initialize(element, options) {
    return new ArvoCalendar(element, options);
  }
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  // Move roving focus to the matching cell. The next animation frame focuses
  // the underlying DOM node so the new tabindex=0 is in place first.
  focusCell(target) {
    const viewMode = this._viewMode();
    const key = target instanceof Date ? keyForDateInView(viewMode, target, this._options.memberIndex ?? null) : target.key;
    this._setFocusedKey(key);
    this._focusRequested = true;
    if (this._focusRafId != null) cancelAnimationFrame(this._focusRafId);
    this._focusRafId = requestAnimationFrame(() => {
      this._focusRafId = null;
      const el = this._cellMap.get(this._focusedKey) ?? null;
      el == null ? void 0 : el.focus();
    });
  }
  // Restore focus to the currently-focused cell (e.g. after parent overlay
  // returns focus). No-op if no cell has been focused yet.
  restoreFocus() {
    const el = this._cellMap.get(this._focusedKey) ?? null;
    el == null ? void 0 : el.focus();
  }
  // Request a view-mode change. Mirrors React: emits a cancellable event and
  // calls the callback; the parent is expected to apply via update().
  setViewMode(mode) {
    this._emitViewModeChange(mode);
  }
  // Advance one period in the current view.
  next() {
    const next = stepVisiblePeriod({
      viewMode: this._viewMode(),
      visibleYear: this._options.visibleYear,
      visibleMonth: this._options.visibleMonth,
      direction: 1
    });
    this._emitMonthChange(next.year, next.month);
  }
  // Back one period in the current view.
  prev() {
    const next = stepVisiblePeriod({
      viewMode: this._viewMode(),
      visibleYear: this._options.visibleYear,
      visibleMonth: this._options.visibleMonth,
      direction: -1
    });
    this._emitMonthChange(next.year, next.month);
  }
  // Snap visible period to today's date.
  today() {
    const today = /* @__PURE__ */ new Date();
    this._emitMonthChange(today.getFullYear(), today.getMonth());
  }
  // Bulk update. Calendar is fully driven by its options (parity with the
  // React component which is fully prop-driven); consumers push a partial
  // and the grid re-renders against the cached cell nodes. This single
  // setter is preferred over a dozen per-option setters because the calendar
  // has 17+ dynamic options and most consumer updates touch several at once.
  update(partial) {
    const prev = this._options;
    this._options = { ...prev, ...partial };
    if ("locale" in partial && partial.locale !== prev.locale) {
      this._locale = core.getUserLocale(this._options.locale);
    }
    this._refreshNow();
    this._render();
  }
  destroy() {
    if (this._focusRafId != null) {
      cancelAnimationFrame(this._focusRafId);
      this._focusRafId = null;
    }
    if (this._typeAheadTimer) {
      clearTimeout(this._typeAheadTimer);
      this._typeAheadTimer = null;
    }
    this._detachListeners();
    core.tooltipManager.hide(true);
    if (this._element) {
      this._element.textContent = "";
      this._element.removeAttribute("role");
      this._element.removeAttribute("aria-label");
      this._element.classList.remove(
        "arvo-cal",
        "arvo-cal--days",
        "arvo-cal--months",
        "arvo-cal--quarters",
        "arvo-cal--years",
        "arvo-cal--members",
        "arvo-cal--show-weeks",
        "arvo-cal--range"
      );
    }
    this._gridEl = null;
    this._weekdayHeaderRowEl = null;
    this._rowEls = [];
    this._rowWeekEls = [];
    this._cellMap.clear();
    this._cellOrder = [];
    this._element = null;
  }
  // -------------------------------------------------------------------------
  // Skeleton: build once on initialize. The grid container and its top-level
  // children persist for the lifetime of the instance; only the cells inside
  // are rebuilt/diff-updated.
  // -------------------------------------------------------------------------
  _buildSkeleton() {
    const el = this._element;
    el.classList.add("arvo-cal");
    el.setAttribute("role", "application");
    this._gridEl = document.createElement("div");
    this._gridEl.className = "arvo-cal__grid";
    this._gridEl.setAttribute("role", "grid");
    el.appendChild(this._gridEl);
  }
  _attachListeners() {
    if (!this._gridEl) return;
    this._gridEl.addEventListener("keydown", this._boundHandleKeyDown);
    this._gridEl.addEventListener("pointerleave", this._boundHandleGridPointerLeave);
    this._gridEl.addEventListener("pointerover", this._boundHandlePointerOver);
    this._gridEl.addEventListener("pointerout", this._boundHandlePointerOut);
    this._gridEl.addEventListener("focusin", this._boundHandleFocusIn);
    this._gridEl.addEventListener("focusout", this._boundHandleFocusOut);
  }
  _detachListeners() {
    if (!this._gridEl) return;
    this._gridEl.removeEventListener("keydown", this._boundHandleKeyDown);
    this._gridEl.removeEventListener("pointerleave", this._boundHandleGridPointerLeave);
    this._gridEl.removeEventListener("pointerover", this._boundHandlePointerOver);
    this._gridEl.removeEventListener("pointerout", this._boundHandlePointerOut);
    this._gridEl.removeEventListener("focusin", this._boundHandleFocusIn);
    this._gridEl.removeEventListener("focusout", this._boundHandleFocusOut);
  }
  // -------------------------------------------------------------------------
  // Render: classes, aria-label, then the cell grid via row/cell reuse.
  // -------------------------------------------------------------------------
  _render() {
    if (!this._element || !this._gridEl) return;
    this._renderRootClasses();
    this._renderAriaLabel();
    this._renderGrid();
    this._renderRovingTabindex();
  }
  _renderRootClasses() {
    const el = this._element;
    const viewMode = this._viewMode();
    const rangeMode = this._rangeMode();
    const hasWeeks = !!this._options.hasWeeks;
    el.classList.remove(
      "arvo-cal--days",
      "arvo-cal--months",
      "arvo-cal--quarters",
      "arvo-cal--years",
      "arvo-cal--members"
    );
    el.classList.add(`arvo-cal--${viewMode}`);
    el.classList.toggle("arvo-cal--show-weeks", hasWeeks);
    el.classList.toggle("arvo-cal--range", rangeMode);
  }
  _renderAriaLabel() {
    if (!this._element) return;
    const label = buildRootAriaLabel({
      viewMode: this._viewMode(),
      visibleYear: this._options.visibleYear,
      visibleMonth: this._options.visibleMonth,
      locale: this._locale
    });
    this._element.setAttribute("aria-label", label);
  }
  _renderGrid() {
    if (!this._gridEl) return;
    const viewMode = this._viewMode();
    const cols = colsForView(viewMode);
    const cells = this._buildCells(viewMode);
    this._cellOrder = cells;
    if (viewMode === "days") {
      this._renderWeekdayHeader();
    } else if (this._weekdayHeaderRowEl) {
      this._weekdayHeaderRowEl.remove();
      this._weekdayHeaderRowEl = null;
    }
    const usedKeys = /* @__PURE__ */ new Set();
    if (viewMode === "days") {
      this._renderDayRows(cells, usedKeys);
    } else {
      this._renderPeriodRows(cells, cols, usedKeys);
    }
    for (const [key, cellEl] of this._cellMap) {
      if (!usedKeys.has(key)) {
        cellEl.remove();
        this._cellMap.delete(key);
      }
    }
    const totalSelectable = cells.filter((c) => !c.placeholder).length;
    const dataRows = totalSelectable === 0 ? 0 : Math.ceil(cells.length / cols);
    const rowCount = viewMode === "days" ? dataRows + 1 : dataRows;
    const colCount = viewMode === "days" && this._options.hasWeeks ? cols + 1 : cols;
    if (rowCount > 0) {
      this._gridEl.setAttribute("aria-rowcount", String(rowCount));
    } else {
      this._gridEl.removeAttribute("aria-rowcount");
    }
    if (colCount > 0) {
      this._gridEl.setAttribute("aria-colcount", String(colCount));
    } else {
      this._gridEl.removeAttribute("aria-colcount");
    }
    const selectable = cells.filter((c) => !c.placeholder && !c.isDisabled);
    if (selectable.length > 0) {
      const inList = selectable.some((c) => c.key === this._focusedKey);
      if (!inList) {
        const preferDay = this._preferredDay;
        this._preferredDay = null;
        let fallback = null;
        if (preferDay != null) {
          const sameDay = selectable.find(
            (c) => c.date && c.date.getDate() === preferDay
          );
          if (sameDay) fallback = sameDay.key;
        }
        if (fallback == null) fallback = pickFallbackFocusKey(selectable);
        if (fallback != null) this._focusedKey = fallback;
      }
    }
  }
  _renderWeekdayHeader() {
    if (!this._gridEl) return;
    const headers = core.getWeekdayHeaders(this._locale, this._options.weekStart ?? 0, "min");
    let row = this._weekdayHeaderRowEl;
    if (!row) {
      row = document.createElement("div");
      row.setAttribute("role", "row");
      row.className = "arvo-cal__row";
      this._weekdayHeaderRowEl = row;
    }
    const wantedChildren = [];
    if (this._options.hasWeeks) {
      let weekSlot = row.querySelector(":scope > .arvo-cal__week");
      if (!weekSlot) {
        weekSlot = document.createElement("div");
        weekSlot.setAttribute("role", "columnheader");
      }
      weekSlot.className = "arvo-cal__week arvo-cal__week--hdr";
      weekSlot.removeAttribute("aria-hidden");
      weekSlot.textContent = "Week";
      wantedChildren.push(weekSlot);
    }
    headers.forEach((label, i) => {
      const existing = row.querySelectorAll(":scope > .arvo-cal__weekday-hdr");
      let hdr = existing[i] ?? null;
      if (!hdr) {
        hdr = document.createElement("div");
        hdr.setAttribute("role", "columnheader");
        hdr.className = "arvo-cal__weekday-hdr";
      }
      if (hdr.textContent !== label) hdr.textContent = label;
      wantedChildren.push(hdr);
    });
    reconcileChildren(row, wantedChildren);
    if (this._gridEl.firstChild !== row) {
      this._gridEl.insertBefore(row, this._gridEl.firstChild);
    }
  }
  _renderDayRows(cells, usedKeys) {
    var _a;
    if (!this._gridEl) return;
    const cols = 7;
    const totalRows = 6;
    const ensureRow = (idx) => {
      let row = this._rowEls[idx];
      if (!row) {
        row = document.createElement("div");
        row.setAttribute("role", "row");
        row.className = "arvo-cal__row";
        this._rowEls[idx] = row;
      }
      return row;
    };
    const wantedRows = [];
    if (this._weekdayHeaderRowEl) wantedRows.push(this._weekdayHeaderRowEl);
    for (let w = 0; w < totalRows; w += 1) {
      const slice = cells.slice(w * cols, w * cols + cols);
      if (slice.length === 0) break;
      const row = ensureRow(w);
      const rowChildren = [];
      if (this._options.hasWeeks) {
        let weekCell = this._rowWeekEls[w];
        if (!weekCell) {
          weekCell = document.createElement("div");
          weekCell.className = "arvo-cal__week";
          weekCell.setAttribute("aria-hidden", "true");
          this._rowWeekEls[w] = weekCell;
        }
        const firstDate = ((_a = slice.find((c) => c.date)) == null ? void 0 : _a.date) ?? null;
        const text = firstDate ? core.formatWeekNumber(core.getWeekNumber(firstDate)) : "";
        if (weekCell.textContent !== text) weekCell.textContent = text;
        rowChildren.push(weekCell);
      }
      for (const cell of slice) {
        const cellEl = this._upsertCell(cell, "days");
        usedKeys.add(cell.key);
        rowChildren.push(cellEl);
      }
      reconcileChildren(row, rowChildren);
      wantedRows.push(row);
    }
    const bodyRowCount = wantedRows.length - (this._weekdayHeaderRowEl ? 1 : 0);
    while (this._rowEls.length > bodyRowCount) {
      const extra = this._rowEls.pop();
      extra == null ? void 0 : extra.remove();
    }
    while (this._rowWeekEls.length > bodyRowCount) {
      const extra = this._rowWeekEls.pop();
      extra == null ? void 0 : extra.remove();
    }
    reconcileChildren(this._gridEl, wantedRows);
  }
  _renderPeriodRows(cells, cols, usedKeys) {
    if (!this._gridEl) return;
    const ensureRow = (idx) => {
      let row = this._rowEls[idx];
      if (!row) {
        row = document.createElement("div");
        row.setAttribute("role", "row");
        row.className = "arvo-cal__row";
        this._rowEls[idx] = row;
      }
      return row;
    };
    const wantedRows = [];
    const rowCount = cells.length === 0 ? 0 : Math.ceil(cells.length / cols);
    const viewMode = this._viewMode();
    for (let r = 0; r < rowCount; r += 1) {
      const slice = cells.slice(r * cols, r * cols + cols);
      const row = ensureRow(r);
      const rowChildren = [];
      for (const cell of slice) {
        const cellEl = this._upsertCell(cell, viewMode);
        usedKeys.add(cell.key);
        rowChildren.push(cellEl);
      }
      reconcileChildren(row, rowChildren);
      wantedRows.push(row);
    }
    while (this._rowEls.length > rowCount) {
      const extra = this._rowEls.pop();
      extra == null ? void 0 : extra.remove();
    }
    if (this._rowWeekEls.length > 0) {
      for (const slot of this._rowWeekEls) slot.remove();
      this._rowWeekEls = [];
    }
    reconcileChildren(this._gridEl, wantedRows);
  }
  // Create or update the cell element for a given CalendarCell. The key
  // identifies the cell across renders so the focused node persists.
  _upsertCell(cell, viewMode) {
    let el = this._cellMap.get(cell.key) ?? null;
    if (cell.placeholder) {
      if (!el) {
        el = document.createElement("div");
        this._cellMap.set(cell.key, el);
      }
      el.className = "arvo-cal__cell";
      el.setAttribute("aria-hidden", "true");
      el.removeAttribute("role");
      el.removeAttribute("tabindex");
      el.removeAttribute("aria-selected");
      el.removeAttribute("aria-disabled");
      el.removeAttribute("aria-current");
      el.removeAttribute("aria-label");
      el.removeAttribute("data-arvo-tooltip");
      el.textContent = "";
      return el;
    }
    if (!el) {
      el = document.createElement("div");
      el.setAttribute("role", "gridcell");
      el.addEventListener("click", this._handleCellClick);
      el.addEventListener("pointerenter", this._handleCellPointerEnter);
      this._cellMap.set(cell.key, el);
    } else if (!el.hasAttribute("role")) {
      el.setAttribute("role", "gridcell");
      el.addEventListener("click", this._handleCellClick);
      el.addEventListener("pointerenter", this._handleCellPointerEnter);
    }
    el.removeAttribute("aria-hidden");
    el.setAttribute("data-arvo-key", cell.key);
    const classes = ["arvo-cal__cell"];
    if (cell.isSelected) classes.push("selected");
    if (cell.isInRange) classes.push("in-range");
    if (cell.isRangeStart) classes.push("range-start");
    if (cell.isRangeEnd) classes.push("range-end");
    if (cell.isOutside) classes.push("outside-month");
    if (cell.isToday) classes.push("today");
    if (cell.isCurrentMember) classes.push("current-member");
    if (cell.isKeyHighlight) classes.push("key-highlight");
    if (cell.isDisabled) classes.push("is-disabled");
    if (cell.isPreview) classes.push("preview");
    el.className = classes.join(" ");
    if (cell.isSelected) el.setAttribute("aria-selected", "true");
    else el.removeAttribute("aria-selected");
    if (cell.isDisabled) el.setAttribute("aria-disabled", "true");
    else el.removeAttribute("aria-disabled");
    if (cell.isToday) {
      el.setAttribute("aria-current", viewMode === "days" ? "date" : "true");
    } else if (cell.isCurrentMember) {
      el.setAttribute("aria-current", "true");
    } else {
      el.removeAttribute("aria-current");
    }
    el.setAttribute("aria-label", cell.ariaLabel);
    if (cell.tooltip) el.setAttribute("data-arvo-tooltip", cell.tooltip);
    else el.removeAttribute("data-arvo-tooltip");
    let labelSpan = el.querySelector(":scope > .arvo-cal__cell-label");
    if (!labelSpan) {
      labelSpan = document.createElement("span");
      labelSpan.className = "arvo-cal__cell-label";
      el.appendChild(labelSpan);
    }
    if (labelSpan.textContent !== cell.label) labelSpan.textContent = cell.label;
    let subSpan = el.querySelector(":scope > .arvo-cal__cell-sublabel");
    if (cell.subLabel) {
      if (!subSpan) {
        subSpan = document.createElement("span");
        subSpan.className = "arvo-cal__cell-sublabel";
        el.appendChild(subSpan);
      }
      if (subSpan.textContent !== cell.subLabel) subSpan.textContent = cell.subLabel;
    } else if (subSpan) {
      subSpan.remove();
    }
    return el;
  }
  // Apply tabindex=0 to the focused cell and tabindex=-1 to all other
  // selectable cells. Placeholder cells stay tabindex-less.
  _renderRovingTabindex() {
    for (const cell of this._cellOrder) {
      if (cell.placeholder) continue;
      const el = this._cellMap.get(cell.key);
      if (!el) continue;
      el.setAttribute("tabindex", cell.key === this._focusedKey ? "0" : "-1");
    }
  }
  // -------------------------------------------------------------------------
  // Cell builders -- mirror React exactly.
  // -------------------------------------------------------------------------
  _buildCells(viewMode) {
    switch (viewMode) {
      case "days":
        return buildDaysCells({
          visibleYear: this._options.visibleYear,
          visibleMonth: this._options.visibleMonth,
          weekStart: this._options.weekStart ?? 0,
          hasOutsideDays: this._options.hasOutsideDays ?? false,
          locale: this._locale,
          selectedDate: this._options.selectedDate ?? null,
          rangeStart: this._options.rangeStart ?? null,
          rangeEnd: this._options.rangeEnd ?? null,
          hoverDate: this._options.hoverDate ?? null,
          isRangeComplete: !!this._options.isRangeComplete,
          minDate: this._options.minDate ?? null,
          maxDate: this._options.maxDate ?? null,
          memberIndex: this._options.memberIndex ?? null,
          now: this._now
        });
      case "months":
        return buildMonthsCells({
          visibleYear: this._options.visibleYear,
          locale: this._locale,
          selectedDate: this._options.selectedDate ?? null,
          minDate: this._options.minDate ?? null,
          maxDate: this._options.maxDate ?? null,
          memberIndex: this._options.memberIndex ?? null,
          frequency: this._options.frequency,
          now: this._now
        });
      case "quarters":
        return buildQuartersCells({
          visibleYear: this._options.visibleYear,
          selectedDate: this._options.selectedDate ?? null,
          minDate: this._options.minDate ?? null,
          maxDate: this._options.maxDate ?? null,
          now: this._now
        });
      case "years":
        return buildYearsCells({
          visibleYear: this._options.visibleYear,
          hasOutsideDays: this._options.hasOutsideDays ?? false,
          selectedDate: this._options.selectedDate ?? null,
          minDate: this._options.minDate ?? null,
          maxDate: this._options.maxDate ?? null,
          now: this._now
        });
      case "members": {
        const memberIndex = this._options.memberIndex ?? null;
        const frequency = this._options.frequency;
        if (!memberIndex || !frequency) {
          if (!this._warnedMembersView && typeof console !== "undefined") {
            console.warn(
              "[ArvoCalendar] members view requires memberIndex + frequency options."
            );
            this._warnedMembersView = true;
          }
          return [];
        }
        return buildMembersCells({
          visibleYear: this._options.visibleYear,
          visibleMonth: this._options.visibleMonth,
          frequency,
          memberIndex,
          currentMemberIndex: this._options.currentMemberIndex ?? null,
          selectedMember: this._options.selectedMember ?? null,
          locale: this._locale,
          minDate: this._options.minDate ?? null,
          maxDate: this._options.maxDate ?? null
        });
      }
    }
  }
  _handleGridPointerLeave() {
    if (!this._rangeMode() || this._options.isRangeComplete) return;
    this._emitCellHover({ date: void 0 });
  }
  _handlePointerOver(e) {
    const resolved = this._resolveTooltipAnchor(e.target);
    if (!resolved) return;
    core.tooltipManager.show({
      anchor: resolved.anchor,
      content: resolved.content,
      trigger: "hover"
    });
  }
  _handlePointerOut(e) {
    var _a;
    const related = e.relatedTarget ?? null;
    const cellEl = (_a = e.target) == null ? void 0 : _a.closest(
      ".arvo-cal__cell[data-arvo-tooltip]"
    );
    if (!cellEl) return;
    if (related && cellEl.contains(related)) return;
    core.tooltipManager.hide();
  }
  _handleFocusIn(e) {
    const resolved = this._resolveTooltipAnchor(e.target);
    if (!resolved) return;
    core.tooltipManager.show({
      anchor: resolved.anchor,
      content: resolved.content,
      trigger: "focus"
    });
  }
  _handleFocusOut() {
    core.tooltipManager.hide(true);
  }
  _resolveTooltipAnchor(target) {
    if (!(target instanceof Element)) return null;
    const cellEl = target.closest(
      ".arvo-cal__cell[data-arvo-tooltip]"
    );
    if (!cellEl) return null;
    const content = cellEl.getAttribute("data-arvo-tooltip");
    if (!content) return null;
    return { anchor: cellEl, content };
  }
  // -------------------------------------------------------------------------
  // Keyboard handling
  // -------------------------------------------------------------------------
  _handleKeyDown(e) {
    var _a;
    const isKeyboardEnabled = this._options.isKeyboardEnabled !== false;
    if (!isKeyboardEnabled) return;
    if (e.key === "Escape") {
      e.preventDefault();
      this._emitDismiss();
      return;
    }
    if (e.altKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      const mode = zoomViewMode(this._viewMode(), e.key === "ArrowDown" ? "in" : "out");
      if (mode) {
        e.preventDefault();
        this._emitViewModeChange(mode);
      }
      return;
    }
    const viewMode = this._viewMode();
    if (viewMode === "months" && isTypeaheadKey(e)) {
      e.preventDefault();
      const ch = e.key.toLowerCase();
      this._typeAheadBuf = `${this._typeAheadBuf}${ch}`;
      if (this._typeAheadTimer) clearTimeout(this._typeAheadTimer);
      this._typeAheadTimer = setTimeout(() => {
        this._typeAheadBuf = "";
        this._typeAheadTimer = null;
      }, 500);
      const names = core.getMonthNames(this._locale, "full");
      const match = names.findIndex(
        (n) => n.toLowerCase().startsWith(this._typeAheadBuf)
      );
      if (match >= 0) {
        const target = this._cellOrder.find(
          (c) => c.key === `${this._options.visibleYear}-${match}` && !c.isDisabled
        );
        if (target) this._setFocusedKey(target.key);
      }
      return;
    }
    const cells = this._cellOrder;
    const currentIdx = cells.findIndex((c) => c.key === this._focusedKey);
    if (currentIdx < 0) return;
    const cols = colsForView(viewMode);
    const findSelectable = (start, step) => {
      let i = start;
      while (i >= 0 && i < cells.length) {
        const c = cells[i];
        if (!c.placeholder && !c.isDisabled) return i;
        i += step;
      }
      return -1;
    };
    const moveBy = (offset) => {
      if (offset === 0 || cells.length === 0) return null;
      const step = offset > 0 ? 1 : -1;
      const target = currentIdx + offset;
      if (target < 0 || target >= cells.length) return null;
      const landed = findSelectable(target, step);
      if (landed < 0) return null;
      const cell = cells[landed];
      this._setFocusedKey(cell.key);
      return cell;
    };
    const extendIfShift = (cell) => {
      if (!cell || !this._rangeMode() || !e.shiftKey) return;
      if (cell.member) this._emitCellSelect({ member: cell.member });
      else if (cell.date) this._emitCellSelect({ date: cell.date });
    };
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        extendIfShift(moveBy(-1));
        return;
      case "ArrowRight":
        e.preventDefault();
        extendIfShift(moveBy(1));
        return;
      case "ArrowUp":
        e.preventDefault();
        extendIfShift(moveBy(-cols));
        return;
      case "ArrowDown":
        e.preventDefault();
        extendIfShift(moveBy(cols));
        return;
      case "Home": {
        e.preventDefault();
        const rowStart = Math.floor(currentIdx / cols) * cols;
        const landed = findSelectable(rowStart, 1);
        if (landed >= 0 && landed < rowStart + cols && landed < cells.length) {
          this._setFocusedKey(cells[landed].key);
        }
        return;
      }
      case "End": {
        e.preventDefault();
        const rowStart = Math.floor(currentIdx / cols) * cols;
        const rowEnd = Math.min(rowStart + cols - 1, cells.length - 1);
        const landed = findSelectable(rowEnd, -1);
        if (landed >= rowStart) this._setFocusedKey(cells[landed].key);
        return;
      }
      case "PageUp":
      case "PageDown": {
        e.preventDefault();
        const direction = e.key === "PageDown" ? 1 : -1;
        const useYearStep = viewMode === "days" && e.shiftKey;
        const next = useYearStep ? { year: this._options.visibleYear + direction, month: this._options.visibleMonth } : stepVisiblePeriod({
          viewMode,
          visibleYear: this._options.visibleYear,
          visibleMonth: this._options.visibleMonth,
          direction
        });
        const currentDate = ((_a = cells[currentIdx]) == null ? void 0 : _a.date) ?? null;
        if (currentDate && viewMode === "days") {
          this._preferredDay = currentDate.getDate();
        }
        this._focusRequested = true;
        this._emitMonthChange(next.year, next.month);
        return;
      }
      case "Enter":
      case " ":
      case "Spacebar": {
        e.preventDefault();
        const cell = cells[currentIdx];
        if (!cell || cell.placeholder || cell.isDisabled) return;
        if (cell.member) {
          this._emitCellSelect({ member: cell.member });
        } else if (cell.date) {
          this._emitCellSelect({ date: cell.date });
        }
        return;
      }
    }
  }
  // -------------------------------------------------------------------------
  // Focus / state helpers
  // -------------------------------------------------------------------------
  _setFocusedKey(key) {
    if (key === this._focusedKey) {
      this._renderRovingTabindex();
      const target2 = this._cellMap.get(key);
      if (target2 && this._focusRequested) {
        target2.focus();
      }
      return;
    }
    this._focusedKey = key;
    this._renderRovingTabindex();
    const target = this._cellMap.get(key);
    if (target && this._focusRequested) {
      target.focus();
    } else if (target && this._gridContains(document.activeElement)) {
      target.focus();
    }
  }
  _gridContains(node) {
    if (!node || !this._gridEl) return false;
    return this._gridEl.contains(node);
  }
  // Refresh the cached "now". The React useMemo recomputes when visibleYear,
  // visibleMonth, or viewMode change; we use the same change set as the key.
  _refreshNow(force) {
    const key = `${this._options.visibleYear}|${this._options.visibleMonth}|${this._viewMode()}`;
    if (force || key !== this._lastNowKey) {
      this._now = /* @__PURE__ */ new Date();
      this._lastNowKey = key;
    }
  }
  // -------------------------------------------------------------------------
  // Read accessors / convenience
  // -------------------------------------------------------------------------
  _viewMode() {
    return this._options.viewMode ?? "days";
  }
  _rangeMode() {
    return this._options.rangeStart != null || this._options.rangeEnd != null || this._options.hoverDate != null;
  }
  // -------------------------------------------------------------------------
  // Event dispatch -- mirrors the React callbacks + adds DOM CustomEvents.
  // -------------------------------------------------------------------------
  _emitCellSelect(payload) {
    var _a, _b, _c;
    const detail = { ...payload, mode: this._viewMode() };
    (_b = (_a = this._options).onCellSelect) == null ? void 0 : _b.call(_a, detail);
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(
      new CustomEvent("cal:select", { bubbles: true, detail })
    );
  }
  _emitCellHover(payload) {
    var _a, _b, _c;
    (_b = (_a = this._options).onCellHover) == null ? void 0 : _b.call(_a, payload);
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(
      new CustomEvent("cal:hover", { bubbles: true, detail: payload })
    );
  }
  // Returns true when the consumer cancelled the event via preventDefault.
  // The internal view does NOT change here -- the parent is expected to
  // call update({ viewMode }) when it accepts the change.
  _emitViewModeChange(mode) {
    var _a, _b;
    const detail = { mode };
    (_b = (_a = this._options).onViewModeChange) == null ? void 0 : _b.call(_a, detail);
    const ev = new CustomEvent("cal:viewmode-change", {
      bubbles: true,
      cancelable: true,
      detail
    });
    if (this._element) {
      return !this._element.dispatchEvent(ev);
    }
    return false;
  }
  _emitMonthChange(year, month) {
    var _a, _b, _c;
    const detail = { year, month };
    (_b = (_a = this._options).onMonthChange) == null ? void 0 : _b.call(_a, detail);
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(
      new CustomEvent("cal:month-change", { bubbles: true, detail })
    );
  }
  _emitDismiss() {
    var _a, _b, _c;
    (_b = (_a = this._options).onDismiss) == null ? void 0 : _b.call(_a);
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(
      new CustomEvent("cal:dismiss", { bubbles: true })
    );
  }
}
function reconcileChildren(parent, wantedChildren) {
  const wantedSet = new Set(wantedChildren);
  const existing = Array.from(parent.children);
  for (const node of existing) {
    if (!wantedSet.has(node)) {
      parent.removeChild(node);
    }
  }
  for (let i = 0; i < wantedChildren.length; i += 1) {
    const want = wantedChildren[i];
    const have = parent.children[i];
    if (have === want) continue;
    if (have) {
      parent.insertBefore(want, have);
    } else {
      parent.appendChild(want);
    }
  }
}
function buildDaysCells(args) {
  const {
    visibleYear,
    visibleMonth,
    weekStart,
    hasOutsideDays,
    locale,
    selectedDate,
    rangeStart,
    rangeEnd,
    hoverDate,
    isRangeComplete,
    minDate,
    maxDate,
    memberIndex,
    now
  } = args;
  const matrix = core.getMonthMatrix(visibleYear, visibleMonth, { weekStart });
  const cells = [];
  const previewBounds = (() => {
    if (isRangeComplete) return null;
    if (!rangeStart || !hoverDate) return null;
    return orderedRange(rangeStart, hoverDate);
  })();
  const rangeBounds = (() => {
    if (!rangeStart || !rangeEnd) return null;
    return orderedRange(rangeStart, rangeEnd);
  })();
  for (const week of matrix.weeks) {
    for (const day of week.days) {
      const isOutside = !day.inMonth;
      if (!hasOutsideDays && isOutside) {
        cells.push(makePlaceholder(`p-${dayKey(day.date)}`));
        continue;
      }
      const isDisabled = !core.inDateRange(day.date, minDate, maxDate);
      const isToday = core.isSameDay(day.date, now);
      const isSelected = !!selectedDate && core.isSameDay(day.date, selectedDate) || !!rangeStart && core.isSameDay(day.date, rangeStart) || !!rangeEnd && core.isSameDay(day.date, rangeEnd);
      const isRangeStart = !!rangeStart && core.isSameDay(day.date, rangeBounds ? rangeBounds[0] : rangeStart);
      const isRangeEnd = !!rangeEnd && core.isSameDay(day.date, rangeBounds ? rangeBounds[1] : rangeEnd);
      const isInRange = !!rangeBounds && core.isAfterDay(day.date, rangeBounds[0]) && core.isBeforeDay(day.date, rangeBounds[1]);
      const isPreview = !!previewBounds && core.isAfterDay(day.date, previewBounds[0]) && !core.isAfterDay(day.date, previewBounds[1]);
      let tooltip;
      let isKeyHighlight = false;
      if (memberIndex) {
        const member = core.findMemberForDate(memberIndex, day.date);
        if (member) {
          tooltip = isToday ? `${member.displayName} - Today` : member.displayName;
          if (core.isSameDay(day.date, member.keyDate)) {
            isKeyHighlight = true;
          }
        }
      }
      cells.push({
        key: dayKey(day.date),
        label: String(day.date.getDate()),
        ariaLabel: core.formatDate(day.date, "dddd, MMMM d, yyyy", locale),
        date: day.date,
        tooltip,
        isOutside,
        isToday,
        isCurrentMember: false,
        isSelected,
        isInRange,
        isRangeStart,
        isRangeEnd,
        isPreview,
        isDisabled,
        isKeyHighlight,
        placeholder: false
      });
    }
  }
  return cells;
}
function buildMonthsCells(args) {
  const {
    visibleYear,
    locale,
    selectedDate,
    minDate,
    maxDate,
    memberIndex,
    frequency,
    now
  } = args;
  const short = core.getMonthNames(locale, "abbrev");
  const full = core.getMonthNames(locale, "full");
  const cells = [];
  const keyHighlightMonths = /* @__PURE__ */ new Set();
  if (memberIndex && (frequency === "quarter" || frequency === "year")) {
    for (const member of memberIndex.members) {
      if (member.keyDate.getFullYear() === visibleYear) {
        keyHighlightMonths.add(member.keyDate.getMonth());
      }
    }
  }
  for (let m = 0; m < 12; m += 1) {
    const date = new Date(visibleYear, m, 1);
    const isDisabled = !core.monthOverlapsRange(visibleYear, m, minDate, maxDate);
    const isToday = core.isSameMonth(date, now);
    const isSelected = !!selectedDate && core.isSameYear(selectedDate, date) && selectedDate.getMonth() === m;
    cells.push({
      key: `${visibleYear}-${m}`,
      label: short[m],
      ariaLabel: `${full[m]} ${visibleYear}`,
      date,
      isOutside: false,
      isToday,
      isCurrentMember: false,
      isSelected,
      isInRange: false,
      isRangeStart: false,
      isRangeEnd: false,
      isPreview: false,
      isDisabled,
      isKeyHighlight: keyHighlightMonths.has(m),
      placeholder: false
    });
  }
  return cells;
}
function buildQuartersCells(args) {
  const { visibleYear, selectedDate, minDate, maxDate, now } = args;
  const cells = [];
  for (let q = 1; q <= 4; q += 1) {
    const startMonth = (q - 1) * 3;
    const date = new Date(visibleYear, startMonth, 1);
    const isDisabled = ![0, 1, 2].some(
      (offset) => core.monthOverlapsRange(visibleYear, startMonth + offset, minDate, maxDate)
    );
    const isToday = core.isSameQuarter(now, date);
    const isSelected = !!selectedDate && core.isSameYear(selectedDate, date) && quarterOf(selectedDate.getMonth()) === q;
    cells.push({
      key: `${visibleYear}-Q${q}`,
      label: `Q${q}`,
      ariaLabel: `Q${q} ${visibleYear}`,
      date,
      isOutside: false,
      isToday,
      isCurrentMember: false,
      isSelected,
      isInRange: false,
      isRangeStart: false,
      isRangeEnd: false,
      isPreview: false,
      isDisabled,
      isKeyHighlight: false,
      placeholder: false
    });
  }
  return cells;
}
function buildYearsCells(args) {
  const { visibleYear, hasOutsideDays, selectedDate, minDate, maxDate, now } = args;
  const start = decadeStart(visibleYear);
  const cells = [];
  for (let i = -1; i <= 10; i += 1) {
    const year = start + i;
    const isOutside = i === -1 || i === 10;
    if (!hasOutsideDays && isOutside) {
      cells.push(makePlaceholder(`p-y-${year}`));
      continue;
    }
    const date = new Date(year, 0, 1);
    const isDisabled = !core.yearOverlapsRange(year, minDate, maxDate);
    const isToday = year === now.getFullYear();
    const isSelected = !!selectedDate && selectedDate.getFullYear() === year;
    cells.push({
      key: `y-${year}`,
      label: String(year),
      ariaLabel: `${year}`,
      date,
      isOutside,
      isToday,
      isCurrentMember: false,
      isSelected,
      isInRange: false,
      isRangeStart: false,
      isRangeEnd: false,
      isPreview: false,
      isDisabled,
      isKeyHighlight: false,
      placeholder: false
    });
  }
  return cells;
}
function buildMembersCells(args) {
  const {
    visibleYear,
    visibleMonth,
    frequency,
    memberIndex,
    currentMemberIndex,
    selectedMember,
    locale,
    minDate,
    maxDate
  } = args;
  let members;
  switch (frequency) {
    case "day":
      members = core.getMembersForMonth(memberIndex, visibleYear, visibleMonth);
      break;
    case "year":
      members = core.getMembersForDecade(memberIndex, decadeStart(visibleYear));
      break;
    default:
      members = core.getMembersForYear(memberIndex, visibleYear);
      break;
  }
  return members.map((member) => {
    const isDisabled = !core.isMemberInRange(member, minDate, maxDate);
    const isCurrentMember = currentMemberIndex != null && member.index === currentMemberIndex;
    const isSelected = !!selectedMember && member.index === selectedMember.index;
    return {
      key: member.key,
      label: member.displayName,
      subLabel: formatMemberRange(member, frequency, locale),
      ariaLabel: member.displayName,
      member,
      tooltip: member.displayName,
      isOutside: false,
      isToday: false,
      isCurrentMember,
      isSelected,
      isInRange: false,
      isRangeStart: false,
      isRangeEnd: false,
      isPreview: false,
      isDisabled,
      isKeyHighlight: false,
      placeholder: false
    };
  });
}
function makePlaceholder(key) {
  return {
    key,
    label: "",
    ariaLabel: "",
    placeholder: true,
    isOutside: false,
    isToday: false,
    isCurrentMember: false,
    isSelected: false,
    isInRange: false,
    isRangeStart: false,
    isRangeEnd: false,
    isPreview: false,
    isDisabled: false,
    isKeyHighlight: false
  };
}
function buildRootAriaLabel(args) {
  const { viewMode, visibleYear, visibleMonth, locale } = args;
  switch (viewMode) {
    case "days": {
      const label = core.formatDate(new Date(visibleYear, visibleMonth, 1), "MMMM yyyy", locale);
      return `${label} calendar`;
    }
    case "months":
      return `${visibleYear} calendar`;
    case "quarters":
      return `${visibleYear} calendar`;
    case "years": {
      const start = decadeStart(visibleYear);
      return `Years ${start}-${start + 9} calendar`;
    }
    case "members":
      return "Member calendar";
  }
}
function keyForDateInView(mode, date, memberIndex) {
  switch (mode) {
    case "days":
      return dayKey(core.normalizeDate(date));
    case "months":
      return `${date.getFullYear()}-${date.getMonth()}`;
    case "quarters":
      return `${date.getFullYear()}-Q${quarterOf(date.getMonth())}`;
    case "years":
      return `y-${date.getFullYear()}`;
    case "members": {
      if (memberIndex) {
        const member = core.findMemberForDate(memberIndex, date);
        if (member) return member.key;
      }
      return dayKey(core.normalizeDate(date));
    }
  }
}
function computeInitialFocusKey(args) {
  var _a;
  const {
    viewMode,
    visibleYear,
    visibleMonth,
    weekStart,
    selectedDate,
    selectedMember,
    memberIndex,
    minDate,
    maxDate,
    now
  } = args;
  switch (viewMode) {
    case "days": {
      if (selectedDate && selectedDate.getFullYear() === visibleYear && selectedDate.getMonth() === visibleMonth && core.inDateRange(selectedDate, minDate, maxDate)) {
        return keyForDateInView("days", selectedDate, memberIndex);
      }
      if (now.getFullYear() === visibleYear && now.getMonth() === visibleMonth && core.inDateRange(now, minDate, maxDate)) {
        return keyForDateInView("days", now, memberIndex);
      }
      const matrix = core.getMonthMatrix(visibleYear, visibleMonth, { weekStart });
      for (const wk of matrix.weeks) {
        for (const d of wk.days) {
          if (d.inMonth && core.inDateRange(d.date, minDate, maxDate)) {
            return keyForDateInView("days", d.date, memberIndex);
          }
        }
      }
      return keyForDateInView("days", new Date(visibleYear, visibleMonth, 1), memberIndex);
    }
    case "months": {
      if (selectedDate && selectedDate.getFullYear() === visibleYear) {
        return `${visibleYear}-${selectedDate.getMonth()}`;
      }
      if (now.getFullYear() === visibleYear) {
        return `${visibleYear}-${now.getMonth()}`;
      }
      return `${visibleYear}-0`;
    }
    case "quarters": {
      if (selectedDate && selectedDate.getFullYear() === visibleYear) {
        return `${visibleYear}-Q${quarterOf(selectedDate.getMonth())}`;
      }
      if (now.getFullYear() === visibleYear) {
        return `${visibleYear}-Q${quarterOf(now.getMonth())}`;
      }
      return `${visibleYear}-Q1`;
    }
    case "years": {
      const start = decadeStart(visibleYear);
      if (selectedDate && selectedDate.getFullYear() >= start && selectedDate.getFullYear() < start + 10) {
        return `y-${selectedDate.getFullYear()}`;
      }
      if (now.getFullYear() >= start && now.getFullYear() < start + 10) {
        return `y-${now.getFullYear()}`;
      }
      return `y-${start}`;
    }
    case "members": {
      if (selectedMember) return selectedMember.key;
      if (memberIndex && memberIndex.currentIndex != null) {
        const m = core.findMemberByIndex(memberIndex, memberIndex.currentIndex);
        if (m) return m.key;
      }
      return ((_a = memberIndex == null ? void 0 : memberIndex.members[0]) == null ? void 0 : _a.key) ?? "";
    }
  }
}
function pickFallbackFocusKey(cells) {
  const todayCell = cells.find((c) => c.isToday);
  if (todayCell) return todayCell.key;
  if (cells.length > 0) return cells[0].key;
  return null;
}
function stepVisiblePeriod(args) {
  const { viewMode, visibleYear, visibleMonth, direction } = args;
  switch (viewMode) {
    case "days": {
      const next = core.addMonths(new Date(visibleYear, visibleMonth, 1), direction);
      return { year: next.getFullYear(), month: next.getMonth() };
    }
    case "months":
    case "quarters":
      return { year: visibleYear + direction, month: visibleMonth };
    case "years":
      return { year: visibleYear + direction * 10, month: visibleMonth };
    case "members":
      return { year: visibleYear + direction, month: visibleMonth };
  }
}
function zoomViewMode(current, direction) {
  const chain = ["days", "months", "years"];
  const idx = chain.indexOf(current);
  if (idx < 0) return null;
  const next = direction === "in" ? idx + 1 : idx - 1;
  if (next < 0 || next >= chain.length) return null;
  return chain[next];
}
function formatMemberRange(member, frequency, locale) {
  if (frequency === "day") return void 0;
  const start = core.formatDate(member.keyDate, "MMM d", locale);
  const end = core.formatDate(member.endDate, "MMM d", locale);
  return `${start} - ${end}`;
}
exports.ArvoCalendar = ArvoCalendar;
exports.default = ArvoCalendar;
//# sourceMappingURL=Calendar.cjs.map
