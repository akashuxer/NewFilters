import { getUserLocale, getLocaleDateFormat, pickAnchorDate, createSegmentController, formatDate, parseDate, addMonths, createOverlaySurface, applyPositionToSurface, isSameDay } from "@arvo/core";
import { ArvoFormLabel } from "../FormLabel/FormLabel.js";
import { ArvoIconButton } from "../IconButton/IconButton.js";
import { ArvoMessageAlert } from "../MessageAlert/MessageAlert.js";
import { ArvoCalendar } from "../Calendar/Calendar.js";
import { CalendarNav } from "../CalendarNav/CalendarNav.js";
let _idCounter = 0;
function coerceDate(v, format, locale) {
  if (v == null) return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (typeof v === "string") {
    if (v.length === 0) return null;
    return parseDate(v, format, locale);
  }
  return null;
}
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
function resolveAnchorElement(anchor, host) {
  if (anchor === false || anchor == null) return null;
  if (anchor === true) return host;
  if (typeof anchor === "string") {
    if (typeof document === "undefined") return null;
    return document.querySelector(anchor);
  }
  if (anchor instanceof HTMLElement) return anchor;
  return null;
}
class ArvoDatePicker {
  constructor(element, options = {}) {
    this._committedValue = null;
    this._isOpen = false;
    this._viewMode = "days";
    this._errorOverride = null;
    this._loadingOverride = null;
    this._hasTextSelected = false;
    this._preFocusValue = null;
    this._inputFocused = false;
    this._useAnchorRender = false;
    this._anchorEl = null;
    this._labelEl = null;
    this._fieldEl = null;
    this._inputEl = null;
    this._actionsEl = null;
    this._clearBtnEl = null;
    this._triggerBtnEl = null;
    this._errIcoEl = null;
    this._errMsgEl = null;
    this._borderEl = null;
    this._popoverEl = null;
    this._headerEl = null;
    this._bodyEl = null;
    this._clearBtn = null;
    this._triggerBtn = null;
    this._errIco = null;
    this._inlineAlert = null;
    this._calNav = null;
    this._calendar = null;
    this._segmentCtrl = null;
    this._surface = null;
    this._closingProgrammatically = false;
    this._resizeObserver = null;
    this._destroyed = false;
    this._handleEngineClose = () => {
      var _a, _b, _c, _d;
      if (this._closingProgrammatically) {
        return;
      }
      if (!this._isOpen) return;
      this._isOpen = false;
      this._syncRootClasses();
      (_a = this._triggerBtn) == null ? void 0 : _a.selected(false);
      (_b = this._triggerBtnEl) == null ? void 0 : _b.setAttribute("aria-expanded", "false");
      if (this._useAnchorRender) {
        (_c = this._anchorEl) == null ? void 0 : _c.focus();
      } else {
        (_d = this._inputEl) == null ? void 0 : _d.focus({ preventScroll: true });
      }
    };
    if (!(element instanceof HTMLElement)) {
      throw new TypeError(
        "[ArvoDatePicker] initialize() requires an HTMLElement."
      );
    }
    this._element = element;
    this._opts = {
      value: options.value,
      defaultValue: options.defaultValue ?? null,
      format: options.format ?? null,
      locale: options.locale ?? null,
      weekStart: options.weekStart ?? 0,
      hasWeeks: options.hasWeeks ?? false,
      minDate: options.minDate ?? null,
      maxDate: options.maxDate ?? null,
      placeholder: options.placeholder ?? null,
      label: options.label ?? null,
      contextHelp: options.contextHelp ?? null,
      size: options.size ?? "lg",
      surface: options.surface ?? "filled",
      width: options.width ?? null,
      isFullWidth: options.isFullWidth ?? false,
      isDisabled: options.isDisabled ?? false,
      isReadOnly: options.isReadOnly ?? false,
      isRequired: options.isRequired ?? false,
      isInvalid: options.isInvalid ?? false,
      errorMsg: options.errorMsg ?? null,
      errorDisplay: options.errorDisplay ?? "inline",
      isLoading: options.isLoading ?? false,
      isClearable: options.isClearable ?? false,
      isAutoClose: options.isAutoClose ?? true,
      isStrictParsing: options.isStrictParsing ?? false,
      isSegmented: options.isSegmented ?? true,
      anchor: options.anchor ?? false,
      placement: options.placement ?? "bottom-end",
      calendarProps: options.calendarProps ?? null,
      popoverProps: options.popoverProps ?? null,
      onChange: options.onChange ?? null,
      onOpen: options.onOpen ?? null,
      onClose: options.onClose ?? null,
      onBlur: options.onBlur ?? null
    };
    this._effLocale = getUserLocale(this._opts.locale ?? void 0);
    this._effFormat = this._opts.format || getLocaleDateFormat(this._effLocale);
    const initialValue = this._opts.value ?? this._opts.defaultValue ?? null;
    this._committedValue = coerceDate(initialValue, this._effFormat, this._effLocale);
    const base = pickAnchorDate(
      this._committedValue,
      coerceDate(this._opts.minDate, this._effFormat, this._effLocale),
      coerceDate(this._opts.maxDate, this._effFormat, this._effLocale)
    );
    this._visibleYear = base.getFullYear();
    this._visibleMonth = base.getMonth();
    const idNum = ++_idCounter;
    this._id = `arvo-dp-${idNum}`;
    this._inputId = `${this._id}-input`;
    this._labelId = `${this._id}-lbl`;
    this._errorId = `${this._id}-err`;
    this._popoverId = `${this._id}-popover`;
    const anchorRequested = this._opts.anchor !== false && this._opts.anchor != null;
    if (anchorRequested) {
      const resolved = resolveAnchorElement(this._opts.anchor, this._element);
      if (resolved) {
        this._useAnchorRender = true;
        this._anchorEl = resolved;
      } else {
        if (typeof console !== "undefined") {
          console.warn(
            "[ArvoDatePicker] anchor did not resolve to an element; falling back to input mode."
          );
        }
      }
    }
    this._boundInputKeyDown = this._handleInputKeyDown.bind(this);
    this._boundInputFocus = this._handleInputFocus.bind(this);
    this._boundInputBlur = this._handleInputBlur.bind(this);
    this._boundInputMouseDown = this._handleInputMouseDown.bind(this);
    this._boundInputPaste = this._handleInputPaste.bind(this);
    this._boundInputChange = this._handleInputChange.bind(this);
    this._boundAnchorClick = this._handleAnchorClick.bind(this);
    this._boundAnchorKeyDown = this._handleAnchorKeyDown.bind(this);
    this._boundCalCellSelect = this._handleCalCellSelect.bind(this);
    this._boundCalMonthChange = this._handleCalMonthChange.bind(this);
    this._boundCalViewModeChange = this._handleCalViewModeChange.bind(this);
    this._boundCalDismiss = this._handleCalDismiss.bind(this);
    if (this._useAnchorRender) {
      this._renderDomAnchor();
    } else {
      this._renderDomInput();
      this._initSegmentController();
      this._observeActions();
    }
    this._applyWidth();
    this._syncRootClasses();
    this._updateInputDisplay();
  }
  static initialize(element, options) {
    return new ArvoDatePicker(element, options ?? {});
  }
  // -------------------------------------------------------------------------
  // DOM construction (input mode)
  // -------------------------------------------------------------------------
  _renderDomInput() {
    const root = this._element;
    root.id = this._id;
    if (this._opts.label) {
      this._labelEl = ArvoFormLabel.initialize(null, {
        text: this._opts.label,
        for: this._inputId,
        isRequired: this._opts.isRequired,
        contextHelp: this._opts.contextHelp,
        isDisabled: this._opts.isDisabled,
        isInvalid: this._opts.isInvalid
      }).el;
      this._labelEl.id = this._labelId;
      this._labelEl.classList.add("arvo-dp__lbl");
      root.appendChild(this._labelEl);
    }
    this._fieldEl = document.createElement("div");
    this._fieldEl.className = "arvo-dp__field";
    this._inputEl = document.createElement("input");
    this._inputEl.type = "text";
    this._inputEl.id = this._inputId;
    this._inputEl.className = "arvo-dp__input";
    this._inputEl.setAttribute("role", "combobox");
    this._inputEl.setAttribute("autocomplete", "off");
    this._inputEl.setAttribute("aria-haspopup", "dialog");
    this._inputEl.setAttribute("aria-expanded", "false");
    this._inputEl.setAttribute("aria-controls", this._popoverId);
    if (this._opts.placeholder) {
      this._inputEl.placeholder = this._opts.placeholder;
    }
    if (this._opts.isDisabled) {
      this._inputEl.disabled = true;
      this._inputEl.setAttribute("aria-disabled", "true");
    }
    if (this._opts.isReadOnly || this._opts.isSegmented) {
      this._inputEl.readOnly = true;
    }
    if (this._opts.isRequired) {
      this._inputEl.setAttribute("aria-required", "true");
    }
    if (this._effError() != null) {
      this._inputEl.setAttribute("aria-invalid", "true");
    }
    if (this._effLoading()) {
      this._inputEl.setAttribute("aria-busy", "true");
    }
    if (this._labelEl) {
      this._inputEl.setAttribute("aria-labelledby", this._labelId);
    }
    this._inputEl.addEventListener("keydown", this._boundInputKeyDown);
    this._inputEl.addEventListener("focus", this._boundInputFocus);
    this._inputEl.addEventListener("blur", this._boundInputBlur);
    if (this._opts.isSegmented) {
      this._inputEl.addEventListener("mousedown", this._boundInputMouseDown);
      this._inputEl.addEventListener("paste", this._boundInputPaste);
    } else {
      this._inputEl.addEventListener("input", this._boundInputChange);
    }
    this._fieldEl.appendChild(this._inputEl);
    this._actionsEl = document.createElement("div");
    this._actionsEl.className = "arvo-dp__actions";
    this._fieldEl.appendChild(this._actionsEl);
    this._borderEl = document.createElement("div");
    this._borderEl.className = "arvo-dp__border";
    this._fieldEl.appendChild(this._borderEl);
    root.appendChild(this._fieldEl);
    this._renderActions();
    this._renderInlineError();
  }
  _renderDomAnchor() {
    const root = this._element;
    root.id = this._id;
    if (this._anchorEl) {
      this._anchorEl.setAttribute("aria-haspopup", "dialog");
      this._anchorEl.setAttribute("aria-expanded", "false");
      this._anchorEl.setAttribute("aria-controls", this._popoverId);
      this._anchorEl.addEventListener("click", this._boundAnchorClick);
      this._anchorEl.addEventListener("keydown", this._boundAnchorKeyDown);
    }
  }
  // Build the actions overlay (clear + err-ico + trigger-btn). Recomputed
  // whenever value/disabled/readonly/loading/error state changes since the
  // set of visible inner buttons depends on those flags.
  _renderActions() {
    var _a, _b, _c;
    if (!this._actionsEl) return;
    (_a = this._clearBtn) == null ? void 0 : _a.destroy();
    this._clearBtn = null;
    (_b = this._triggerBtn) == null ? void 0 : _b.destroy();
    this._triggerBtn = null;
    (_c = this._errIco) == null ? void 0 : _c.destroy();
    this._errIco = null;
    this._clearBtnEl = null;
    this._triggerBtnEl = null;
    this._errIcoEl = null;
    this._actionsEl.textContent = "";
    const hasValue = this._committedValue != null;
    const disabled = this._opts.isDisabled;
    const readonly = this._opts.isReadOnly;
    const loading = this._effLoading();
    const err = this._effError();
    const showTooltipIcon = err != null && this._opts.errorDisplay === "tooltip";
    const showClear = this._opts.isClearable === true && hasValue && !disabled && !readonly && !loading && !showTooltipIcon;
    const showSep = !loading && (showClear || showTooltipIcon);
    if (showClear) {
      this._clearBtnEl = document.createElement("button");
      this._clearBtnEl.classList.add("arvo-dp__clear-btn");
      this._clearBtnEl.setAttribute("tabindex", "-1");
      this._actionsEl.appendChild(this._clearBtnEl);
      this._clearBtn = ArvoIconButton.initialize(this._clearBtnEl, {
        variant: "tertiary",
        size: "sm",
        icon: "close",
        tooltip: "Clear",
        onClick: (e) => {
          e.stopPropagation();
          this.clear();
        }
      });
    }
    if (showTooltipIcon) {
      this._errIco = ArvoMessageAlert.initialize(document.createElement("div"), {
        type: "negative",
        isInline: true,
        message: err ?? ""
      });
      this._errIcoEl = this._errIco.el;
      this._errIcoEl.classList.add("arvo-dp__err-ico");
      this._actionsEl.appendChild(this._errIcoEl);
    }
    if (showSep) {
      const sep = document.createElement("span");
      sep.className = "arvo-dp__sep";
      sep.setAttribute("aria-hidden", "true");
      this._actionsEl.appendChild(sep);
    }
    if (!loading) {
      this._triggerBtnEl = document.createElement("button");
      this._triggerBtnEl.classList.add("arvo-dp__trigger-btn");
      this._triggerBtnEl.setAttribute("aria-haspopup", "dialog");
      this._triggerBtnEl.setAttribute("aria-controls", this._popoverId);
      this._triggerBtnEl.setAttribute("aria-expanded", String(this._isOpen));
      this._actionsEl.appendChild(this._triggerBtnEl);
      this._triggerBtn = ArvoIconButton.initialize(this._triggerBtnEl, {
        variant: "tertiary",
        size: "sm",
        icon: "calendar-o",
        tooltip: "Select date",
        isDisabled: disabled || readonly,
        isSelected: this._isOpen,
        onClick: () => this._handleTriggerClick()
      });
    }
    this._updatePadding();
  }
  _renderInlineError() {
    var _a, _b, _c, _d;
    if (!this._element) return;
    const err = this._effError();
    const showInline = err != null && this._opts.errorDisplay === "inline";
    if (showInline) {
      if (!this._errMsgEl) {
        this._inlineAlert = ArvoMessageAlert.initialize(document.createElement("div"), {
          type: "negative",
          message: err,
          id: this._errorId
        });
        this._errMsgEl = this._inlineAlert.el;
        this._errMsgEl.classList.add("arvo-dp__err-msg");
        this._element.appendChild(this._errMsgEl);
      } else {
        (_a = this._inlineAlert) == null ? void 0 : _a.message(err);
      }
      (_b = this._inputEl) == null ? void 0 : _b.setAttribute("aria-describedby", this._errorId);
    } else if (this._errMsgEl) {
      (_c = this._inlineAlert) == null ? void 0 : _c.destroy();
      this._inlineAlert = null;
      this._errMsgEl.remove();
      this._errMsgEl = null;
      (_d = this._inputEl) == null ? void 0 : _d.removeAttribute("aria-describedby");
    }
  }
  // -------------------------------------------------------------------------
  // Segment controller
  // -------------------------------------------------------------------------
  _initSegmentController() {
    if (!this._opts.isSegmented) return;
    this._segmentCtrl = createSegmentController({
      format: this._effFormat,
      locale: this._effLocale,
      value: this._committedValue,
      min: this._asDate(this._opts.minDate),
      max: this._asDate(this._opts.maxDate),
      commit: "blur"
    });
    this._segmentCtrl.on("commit", (payload) => {
      const next = payload.date;
      this._handleCommit(next);
    });
    this._segmentCtrl.on("segment", () => {
      var _a;
      const focused = ((_a = this._segmentCtrl) == null ? void 0 : _a.getFocusedSegment()) ?? null;
      const newFlag = focused != null;
      if (newFlag !== this._hasTextSelected) {
        this._hasTextSelected = newFlag;
        this._syncRootClasses();
      }
    });
    this._segmentCtrl.on("change", () => {
      this._refreshInputFromController();
    });
  }
  // -------------------------------------------------------------------------
  // Resize observer (--arvo-form-input-pad-r)
  // -------------------------------------------------------------------------
  _observeActions() {
    if (!this._actionsEl) return;
    this._resizeObserver = new ResizeObserver(() => this._updatePadding());
    this._resizeObserver.observe(this._actionsEl);
    this._updatePadding();
  }
  _updatePadding() {
    if (!this._actionsEl || !this._fieldEl) return;
    const w = this._actionsEl.offsetWidth;
    const pad = w > 0 ? w + 4 : 0;
    this._fieldEl.style.setProperty("--arvo-form-input-pad-r", `${pad}px`);
  }
  _applyWidth() {
    if (!this._element) return;
    const w = this._opts.isFullWidth ? "100%" : this._opts.width;
    if (w) this._element.style.setProperty("--arvo-form-input-width", w);
    else this._element.style.removeProperty("--arvo-form-input-width");
  }
  // -------------------------------------------------------------------------
  // Class composition
  // -------------------------------------------------------------------------
  _syncRootClasses() {
    if (!this._element) return;
    const opts = this._opts;
    const err = this._effError();
    const loading = this._effLoading();
    const classes = [
      "arvo-dp",
      `arvo-dp--${opts.size}`,
      `arvo-dp--surface-${opts.surface}`,
      opts.isFullWidth && "arvo-dp--full-width",
      opts.hasWeeks && "arvo-dp--show-weeks",
      this._useAnchorRender && "arvo-dp--anchor-mode",
      loading && "loading",
      opts.isDisabled && "is-disabled",
      opts.isReadOnly && "is-readonly",
      err != null && "has-error",
      err != null && opts.errorDisplay === "tooltip" && "error-tooltip",
      this._committedValue != null && "has-value",
      this._hasTextSelected && "has-text-selected",
      this._isOpen && "open"
    ].filter(Boolean);
    this._element.className = classes.join(" ");
    if (this._inputEl) {
      this._inputEl.setAttribute("aria-expanded", String(this._isOpen));
      if (err != null) this._inputEl.setAttribute("aria-invalid", "true");
      else this._inputEl.removeAttribute("aria-invalid");
      if (loading) this._inputEl.setAttribute("aria-busy", "true");
      else this._inputEl.removeAttribute("aria-busy");
      if (opts.isDisabled) {
        this._inputEl.disabled = true;
        this._inputEl.setAttribute("aria-disabled", "true");
      } else {
        this._inputEl.disabled = false;
        this._inputEl.removeAttribute("aria-disabled");
      }
      this._inputEl.readOnly = opts.isReadOnly || opts.isSegmented;
    }
    if (this._triggerBtnEl) {
      this._triggerBtnEl.setAttribute("aria-expanded", String(this._isOpen));
    }
    if (this._useAnchorRender && this._anchorEl) {
      this._anchorEl.setAttribute("aria-expanded", String(this._isOpen));
    }
  }
  // -------------------------------------------------------------------------
  // Effective state accessors (merge override flags)
  // -------------------------------------------------------------------------
  _effError() {
    if (this._errorOverride != null) return this._errorOverride;
    if (this._opts.isInvalid) return this._opts.errorMsg;
    return null;
  }
  _effLoading() {
    return this._loadingOverride ?? this._opts.isLoading;
  }
  _asDate(v) {
    return coerceDate(v, this._effFormat, this._effLocale);
  }
  // -------------------------------------------------------------------------
  // Input display updates
  // -------------------------------------------------------------------------
  _updateInputDisplay() {
    if (!this._inputEl) return;
    if (this._opts.isSegmented && this._segmentCtrl) {
      this._inputEl.value = this._segmentCtrl.getFormattedDisplay(this._inputFocused);
    } else {
      this._inputEl.value = this._committedValue ? formatDate(this._committedValue, this._effFormat, this._effLocale) : "";
    }
  }
  _refreshInputFromController() {
    if (!this._inputEl || !this._segmentCtrl) return;
    this._inputEl.value = this._segmentCtrl.getFormattedDisplay(this._inputFocused);
    this._restoreCaretToFocusedSegment();
  }
  _restoreCaretToFocusedSegment() {
    if (!this._inputEl || !this._segmentCtrl) return;
    const seg = this._segmentCtrl.getFocusedSegment();
    if (!seg) return;
    try {
      this._inputEl.setSelectionRange(seg.startOffset, seg.endOffset);
    } catch {
    }
  }
  // -------------------------------------------------------------------------
  // Commit / change dispatch
  // -------------------------------------------------------------------------
  _handleCommit(next) {
    var _a, _b, _c, _d, _e, _f, _g;
    const clamped = clampToRange(
      next,
      this._asDate(this._opts.minDate),
      this._asDate(this._opts.maxDate)
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
    (_d = this._segmentCtrl) == null ? void 0 : _d.setValue(clamped, { silent: true });
    this._updateInputDisplay();
    this._renderActions();
    this._syncRootClasses();
    const detail = {
      value: clamped,
      formattedValue: clamped ? formatDate(clamped, this._effFormat, this._effLocale) : ""
    };
    (_f = (_e = this._opts).onChange) == null ? void 0 : _f.call(_e, detail);
    (_g = this._element) == null ? void 0 : _g.dispatchEvent(
      new CustomEvent("dp:change", {
        bubbles: true,
        cancelable: false,
        detail
      })
    );
    return true;
  }
  // -------------------------------------------------------------------------
  // Trigger / clear / input handlers
  // -------------------------------------------------------------------------
  _handleTriggerClick() {
    if (this._effLoading()) return;
    if (this._opts.isDisabled || this._opts.isReadOnly) return;
    if (this._isOpen) this.close();
    else this.open();
  }
  _handleInputFocus() {
    this._inputFocused = true;
    this._preFocusValue = this._committedValue;
    if (this._opts.isSegmented && this._segmentCtrl) {
      if (this._inputEl) {
        this._inputEl.value = this._segmentCtrl.getFormattedDisplay(true);
      }
      this._segmentCtrl.focusSegment(0);
      this._restoreCaretToFocusedSegment();
    }
  }
  /**
   * Click-to-segment: maps the mousedown caret offset to a segment index so
   * users can click on (for example) the `dd` segment in `MM/dd/yyyy` and
   * land directly on the day instead of the first segment. The browser sets
   * `selectionStart` from the click position even on readOnly inputs; we
   * defer one frame so the value is stable before reading.
   */
  _handleInputMouseDown() {
    if (!this._inputEl || !this._opts.isSegmented) return;
    const input = this._inputEl;
    requestAnimationFrame(() => {
      if (document.activeElement !== input) return;
      const ctrl = this._segmentCtrl;
      if (!ctrl) return;
      const offset = input.selectionStart ?? null;
      if (offset === null) return;
      const idx = ctrl.findSegmentForOffset(offset);
      if (idx !== null) {
        ctrl.focusSegment(idx);
        this._restoreCaretToFocusedSegment();
      }
    });
  }
  _handleInputBlur() {
    var _a, _b, _c;
    this._inputFocused = false;
    if (this._opts.isSegmented && this._segmentCtrl) {
      if (this._inputEl) {
        this._inputEl.value = this._segmentCtrl.getFormattedDisplay(false);
      }
    } else {
      const parsed = parseDate(
        ((_a = this._inputEl) == null ? void 0 : _a.value) ?? "",
        this._effFormat,
        this._effLocale
      );
      if (parsed) this._handleCommit(parsed);
      else this._updateInputDisplay();
    }
    if (this._hasTextSelected) {
      this._hasTextSelected = false;
      this._syncRootClasses();
    }
    (_c = (_b = this._opts).onBlur) == null ? void 0 : _c.call(_b);
  }
  _handleInputChange() {
  }
  _handleInputKeyDown(e) {
    var _a;
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
    if (this._opts.isSegmented && this._segmentCtrl) {
      const ctrl = this._segmentCtrl;
      const key = e.key;
      if (key === "Escape") {
        e.preventDefault();
        ctrl.handleKey({ key: "Escape" });
        if (this._inputFocused) {
          if (this._inputEl) {
            this._inputEl.value = ctrl.getFormattedDisplay(true);
          }
          ctrl.focusSegment(0);
          this._restoreCaretToFocusedSegment();
        } else {
          this._updateInputDisplay();
        }
        if (this._isOpen) this.close();
        return;
      }
      if (key === "Tab") {
        const res = ctrl.handleKey({ key: "Tab", shiftKey: e.shiftKey });
        if (res.consumed) {
          e.preventDefault();
          this._refreshInputFromController();
        }
        return;
      }
      if (key === "Enter") {
        e.preventDefault();
        const before = this._committedValue;
        ctrl.handleKey({ key: "Enter" });
        this._refreshInputFromController();
        const changed = !sameDay(before, this._committedValue);
        if (this._isOpen && this._opts.isAutoClose && changed) this.close();
        return;
      }
      if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown" || key === "Home" || key === "End" || key === "Backspace" || key === "Delete") {
        const res = ctrl.handleKey({ key });
        if (res.consumed) {
          e.preventDefault();
          this._refreshInputFromController();
        }
        return;
      }
      if (key.length === 1 && !e.ctrlKey && !e.metaKey) {
        if (/^[0-9]$/.test(key)) {
          const res = ctrl.handleDigit(key);
          if (res.consumed) {
            e.preventDefault();
            this._refreshInputFromController();
          }
          return;
        }
        if (/^[A-Za-z]$/.test(key)) {
          const res = ctrl.handleLetter(key);
          if (res.consumed) {
            e.preventDefault();
            this._refreshInputFromController();
          }
          return;
        }
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const parsed = parseDate(
        ((_a = this._inputEl) == null ? void 0 : _a.value) ?? "",
        this._effFormat,
        this._effLocale
      );
      if (parsed) {
        const before = this._committedValue;
        const changed = this._handleCommit(parsed);
        if (this._isOpen && this._opts.isAutoClose && changed && !sameDay(before, this._committedValue)) {
          this.close();
        }
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      if (this._preFocusValue !== this._committedValue) {
        this._committedValue = this._preFocusValue;
      }
      this._updateInputDisplay();
      if (this._isOpen) this.close();
      return;
    }
  }
  _handleInputPaste(e) {
    var _a;
    if (!this._opts.isSegmented || !this._segmentCtrl) return;
    const text = ((_a = e.clipboardData) == null ? void 0 : _a.getData("text")) ?? "";
    const res = this._segmentCtrl.handlePaste(text);
    if (res.consumed) {
      e.preventDefault();
      this._refreshInputFromController();
    }
  }
  // -------------------------------------------------------------------------
  // Anchor mode handlers
  // -------------------------------------------------------------------------
  _handleAnchorClick() {
    if (this._effLoading()) return;
    if (this._opts.isDisabled || this._opts.isReadOnly) return;
    if (this._isOpen) this.close();
    else this.open();
  }
  _handleAnchorKeyDown(e) {
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
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this._handleAnchorClick();
    }
  }
  // -------------------------------------------------------------------------
  // Popover lifecycle
  // -------------------------------------------------------------------------
  _buildPopover() {
    var _a;
    if (this._popoverEl) return;
    this._popoverEl = document.createElement("div");
    this._popoverEl.className = "arvo-dp__popover";
    this._popoverEl.id = this._popoverId;
    this._popoverEl.setAttribute("role", "dialog");
    this._popoverEl.setAttribute("aria-label", "Choose a date");
    this._popoverEl.setAttribute("aria-modal", "false");
    this._popoverEl.style.position = "fixed";
    this._popoverEl.style.top = "0";
    this._popoverEl.style.left = "0";
    this._popoverEl.style.margin = "0";
    if ((_a = this._opts.popoverProps) == null ? void 0 : _a.width) {
      this._popoverEl.style.width = this._opts.popoverProps.width;
    }
    this._headerEl = document.createElement("div");
    this._headerEl.className = "arvo-dp__header";
    this._bodyEl = document.createElement("div");
    this._bodyEl.className = "arvo-dp__body";
    this._popoverEl.appendChild(this._headerEl);
    this._popoverEl.appendChild(this._bodyEl);
    document.body.appendChild(this._popoverEl);
    this._calNav = CalendarNav.initialize(this._headerEl, {
      visibleYear: this._visibleYear,
      visibleMonth: this._visibleMonth,
      viewMode: this._viewMode === "days" || this._viewMode === "months" || this._viewMode === "years" ? this._viewMode : "days",
      locale: this._effLocale,
      minDate: this._asDate(this._opts.minDate),
      maxDate: this._asDate(this._opts.maxDate),
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
      minDate: this._asDate(this._opts.minDate),
      maxDate: this._asDate(this._opts.maxDate)
    });
    this._bodyEl.addEventListener("cal:select", this._boundCalCellSelect);
    this._bodyEl.addEventListener("cal:month-change", this._boundCalMonthChange);
    this._bodyEl.addEventListener("cal:viewmode-change", this._boundCalViewModeChange);
    this._bodyEl.addEventListener("cal:dismiss", this._boundCalDismiss);
  }
  _handleCalCellSelect(e) {
    const detail = e.detail;
    if (!detail || !detail.date) return;
    if (detail.mode === "days") {
      this._handleCommit(detail.date);
      if (this._opts.isAutoClose) this.close();
      return;
    }
    this._visibleYear = detail.date.getFullYear();
    this._visibleMonth = detail.date.getMonth();
    if (detail.mode === "months") this._setViewMode("days");
    else if (detail.mode === "years") this._setViewMode("months");
    else this._syncCalendarVisible();
  }
  _handleCalMonthChange(e) {
    const detail = e.detail;
    if (!detail) return;
    this._visibleYear = detail.year;
    this._visibleMonth = detail.month;
    this._syncCalendarVisible();
  }
  _handleCalViewModeChange(e) {
    const detail = e.detail;
    if (!detail) return;
    this._setViewMode(detail.mode);
  }
  _handleCalDismiss() {
    this.close();
  }
  _setViewMode(mode) {
    var _a, _b, _c;
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
  // -------------------------------------------------------------------------
  // Focus trap helpers
  // -------------------------------------------------------------------------
  /**
   * Tab cycle inside the popover (mirrors React's getOrderedPopoverElements).
   * Initial focus is set imperatively to the selected (or today) calendar
   * cell after the engine positions the panel -- see open() rAF block.
   */
  _getOrderedPopoverElements() {
    const root = this._popoverEl;
    if (!root) return [];
    const calendarCell = root.querySelector(
      '.arvo-cal__cell[tabindex="0"]'
    );
    const prev = root.querySelector(".arvo-cal-nav__prev");
    const monthBtn = root.querySelector(".arvo-cal-nav__month-btn");
    const yearBtn = root.querySelector(".arvo-cal-nav__year-btn");
    const next = root.querySelector(".arvo-cal-nav__next");
    const today = root.querySelector(".arvo-cal-nav__today");
    return [calendarCell, prev, monthBtn, yearBtn, next, today];
  }
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  open() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (this._destroyed) return;
    if (this._isOpen) return;
    if (this._opts.isDisabled || this._opts.isReadOnly || this._effLoading()) {
      if (typeof console !== "undefined") {
        console.warn(
          "[ArvoDatePicker] open() ignored while disabled / readOnly / loading."
        );
      }
      return;
    }
    if (((_b = (_a = this._opts).onOpen) == null ? void 0 : _b.call(_a)) === false) return;
    const ev = new CustomEvent("dp:open", { bubbles: true, cancelable: true });
    const proceed = (_c = this._element) == null ? void 0 : _c.dispatchEvent(ev);
    if (proceed === false) return;
    this._isOpen = true;
    this._buildPopover();
    const base = pickAnchorDate(
      this._committedValue,
      coerceDate(this._opts.minDate, this._effFormat, this._effLocale),
      coerceDate(this._opts.maxDate, this._effFormat, this._effLocale)
    );
    this._visibleYear = base.getFullYear();
    this._visibleMonth = base.getMonth();
    this._syncCalendarVisible();
    (_d = this._calendar) == null ? void 0 : _d.update({ selectedDate: this._committedValue });
    if (this._popoverEl) {
      this._popoverEl.style.visibility = "hidden";
    }
    if (!this._surface && this._popoverEl) {
      this._surface = createOverlaySurface({
        id: this._id,
        surface: this._popoverEl,
        type: "dropdown",
        priority: 20,
        trigger: (this._useAnchorRender ? this._anchorEl : this._fieldEl) ?? null,
        position: {
          placement: this._opts.placement,
          gap: ((_e = this._opts.popoverProps) == null ? void 0 : _e.offset) ?? 4,
          apply: (pos, surfaceEl) => {
            applyPositionToSurface(pos, surfaceEl);
            surfaceEl.style.visibility = "";
          }
        },
        focus: {
          mode: "trap",
          initialFocus: "none",
          returnFocus: false,
          // picker manages focus return manually
          getOrderedElements: () => this._getOrderedPopoverElements()
        },
        transition: "fade",
        transitionDuration: 150,
        // The engine writes aria-haspopup / aria-controls / aria-expanded on
        // the trigger element (the field in input mode, the anchor in
        // anchor mode). axe rejects aria-haspopup on a generic <div>
        // (aria-allowed-attr), and the picker already wires the canonical
        // combobox ARIA on the role="combobox" <input> (input mode) and on
        // the anchor element (anchor mode) in _renderDomInput /
        // _renderDomAnchor / _syncRootClasses. Disable the engine writes so
        // there's a single source of truth.
        triggerAria: false,
        onClose: this._handleEngineClose
      });
    } else if (this._surface) {
      this._surface.setTrigger(
        (this._useAnchorRender ? this._anchorEl : this._fieldEl) ?? null
      );
    }
    void ((_f = this._surface) == null ? void 0 : _f.open());
    this._syncRootClasses();
    (_g = this._triggerBtn) == null ? void 0 : _g.selected(true);
    (_h = this._triggerBtnEl) == null ? void 0 : _h.setAttribute("aria-expanded", "true");
    const focusTarget = pickAnchorDate(
      this._committedValue,
      coerceDate(this._opts.minDate, this._effFormat, this._effLocale),
      coerceDate(this._opts.maxDate, this._effFormat, this._effLocale)
    );
    requestAnimationFrame(() => {
      var _a2;
      (_a2 = this._calendar) == null ? void 0 : _a2.focusCell(focusTarget);
    });
  }
  close() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (this._destroyed) return;
    if (!this._isOpen) return;
    if (((_b = (_a = this._opts).onClose) == null ? void 0 : _b.call(_a)) === false) return;
    const ev = new CustomEvent("dp:close", { bubbles: true, cancelable: true });
    const proceed = (_c = this._element) == null ? void 0 : _c.dispatchEvent(ev);
    if (proceed === false) return;
    this._isOpen = false;
    this._closingProgrammatically = true;
    void ((_d = this._surface) == null ? void 0 : _d.close());
    this._closingProgrammatically = false;
    this._syncRootClasses();
    (_e = this._triggerBtn) == null ? void 0 : _e.selected(false);
    (_f = this._triggerBtnEl) == null ? void 0 : _f.setAttribute("aria-expanded", "false");
    if (this._useAnchorRender) {
      (_g = this._anchorEl) == null ? void 0 : _g.focus();
    } else {
      (_h = this._inputEl) == null ? void 0 : _h.focus({ preventScroll: true });
    }
  }
  toggle(force) {
    if (force === void 0) {
      if (this._isOpen) this.close();
      else this.open();
      return;
    }
    if (force && !this._isOpen) this.open();
    else if (!force && this._isOpen) this.close();
  }
  value(v) {
    if (arguments.length === 0) {
      return this._committedValue;
    }
    let coerced;
    if (v == null) {
      coerced = null;
    } else if (v instanceof Date) {
      coerced = Number.isNaN(v.getTime()) ? null : v;
    } else if (typeof v === "string") {
      coerced = parseDate(v, this._effFormat, this._effLocale);
      if (coerced == null && v.length > 0) {
        if (typeof console !== "undefined") {
          console.warn(
            `[ArvoDatePicker] value(): unparseable string "${v}"; value unchanged.`
          );
        }
        return;
      }
    } else {
      return;
    }
    this._handleCommit(coerced);
  }
  formattedValue() {
    return this._committedValue ? formatDate(this._committedValue, this._effFormat, this._effLocale) : "";
  }
  clear() {
    var _a;
    (_a = this._segmentCtrl) == null ? void 0 : _a.setValue(null, { silent: true });
    this._handleCommit(null);
  }
  disabled(state) {
    var _a, _b;
    if (state === void 0) return this._opts.isDisabled;
    if (state === this._opts.isDisabled) return;
    this._opts.isDisabled = state;
    if (state && this._isOpen) this.close();
    (_a = this._calNav) == null ? void 0 : _a.disabled(state);
    (_b = this._triggerBtn) == null ? void 0 : _b.disabled(state || this._opts.isReadOnly);
    this._renderActions();
    this._syncRootClasses();
  }
  setError(message) {
    this._errorOverride = message === false ? null : message;
    if (message === false && !this._opts.isInvalid) ;
    this._renderActions();
    this._renderInlineError();
    this._syncRootClasses();
  }
  setLoading(loading) {
    this._loadingOverride = loading;
    if (loading && this._isOpen) this.close();
    this._renderActions();
    this._syncRootClasses();
  }
  focus() {
    var _a, _b;
    if (this._useAnchorRender) {
      (_a = this._anchorEl) == null ? void 0 : _a.focus();
    } else {
      (_b = this._inputEl) == null ? void 0 : _b.focus();
    }
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    if (this._destroyed) return;
    this._destroyed = true;
    (_a = this._surface) == null ? void 0 : _a.destroy();
    this._surface = null;
    this._isOpen = false;
    (_b = this._resizeObserver) == null ? void 0 : _b.disconnect();
    this._resizeObserver = null;
    (_c = this._segmentCtrl) == null ? void 0 : _c.destroy();
    this._segmentCtrl = null;
    (_d = this._clearBtn) == null ? void 0 : _d.destroy();
    this._clearBtn = null;
    (_e = this._triggerBtn) == null ? void 0 : _e.destroy();
    this._triggerBtn = null;
    (_f = this._errIco) == null ? void 0 : _f.destroy();
    this._errIco = null;
    (_g = this._inlineAlert) == null ? void 0 : _g.destroy();
    this._inlineAlert = null;
    (_h = this._calNav) == null ? void 0 : _h.destroy();
    this._calNav = null;
    (_i = this._calendar) == null ? void 0 : _i.destroy();
    this._calendar = null;
    if (this._bodyEl) {
      this._bodyEl.removeEventListener("cal:select", this._boundCalCellSelect);
      this._bodyEl.removeEventListener("cal:month-change", this._boundCalMonthChange);
      this._bodyEl.removeEventListener("cal:viewmode-change", this._boundCalViewModeChange);
      this._bodyEl.removeEventListener("cal:dismiss", this._boundCalDismiss);
    }
    if (this._popoverEl) {
      this._popoverEl.remove();
      this._popoverEl = null;
    }
    if (this._inputEl) {
      this._inputEl.removeEventListener("keydown", this._boundInputKeyDown);
      this._inputEl.removeEventListener("focus", this._boundInputFocus);
      this._inputEl.removeEventListener("blur", this._boundInputBlur);
      this._inputEl.removeEventListener("mousedown", this._boundInputMouseDown);
      this._inputEl.removeEventListener("paste", this._boundInputPaste);
      this._inputEl.removeEventListener("input", this._boundInputChange);
    }
    if (this._useAnchorRender && this._anchorEl) {
      this._anchorEl.removeEventListener("click", this._boundAnchorClick);
      this._anchorEl.removeEventListener("keydown", this._boundAnchorKeyDown);
      this._anchorEl.removeAttribute("aria-haspopup");
      this._anchorEl.removeAttribute("aria-expanded");
      this._anchorEl.removeAttribute("aria-controls");
    }
    if (this._element) {
      this._element.textContent = "";
      this._element.className = "";
      this._element.style.removeProperty("--arvo-form-input-width");
      this._element.removeAttribute("id");
    }
    this._labelEl = null;
    this._fieldEl = null;
    this._inputEl = null;
    this._actionsEl = null;
    this._clearBtnEl = null;
    this._triggerBtnEl = null;
    this._errIcoEl = null;
    this._errMsgEl = null;
    this._borderEl = null;
    this._headerEl = null;
    this._bodyEl = null;
    this._anchorEl = null;
    this._element = null;
  }
}
export {
  ArvoDatePicker
};
//# sourceMappingURL=DatePicker.js.map
