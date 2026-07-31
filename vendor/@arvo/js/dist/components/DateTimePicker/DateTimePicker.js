import { getUserLocale, getLocaleDateFormat, getLocaleTimeFormat, pickAnchorDate, createSegmentController, splitDateTimeFormat, formatDateTime, parseDateTime, addMonths, createOverlaySurface, applyPositionToSurface, parseTime, isSameDay } from "@arvo/core";
import { ArvoFormLabel } from "../FormLabel/FormLabel.js";
import { ArvoIconButton } from "../IconButton/IconButton.js";
import { ArvoMessageAlert } from "../MessageAlert/MessageAlert.js";
import { ArvoCalendar } from "../Calendar/Calendar.js";
import { ArvoTimeDropdown } from "../TimeDropdown/TimeDropdown.js";
import { CalendarNav } from "../CalendarNav/CalendarNav.js";
let _idCounter = 0;
const ZERO_TIME = { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
function coerceDateTime(v, format, locale) {
  if (v == null) return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (typeof v === "string") {
    if (v.length === 0) return null;
    return parseDateTime(v, format, locale);
  }
  return null;
}
function normalizeTime(v) {
  const hours = Math.trunc(v.hours);
  const minutes = Math.trunc(v.minutes);
  const seconds = v.seconds == null ? 0 : Math.trunc(v.seconds);
  const milliseconds = v.milliseconds == null ? 0 : Math.trunc(v.milliseconds);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  if (seconds < 0 || seconds > 59) return null;
  if (milliseconds < 0 || milliseconds > 999) return null;
  return { hours, minutes, seconds, milliseconds };
}
function coerceTime(v, timeFormat) {
  if (v == null) return null;
  if (typeof v === "string") {
    if (v.length === 0) return null;
    return parseTime(v, timeFormat);
  }
  return normalizeTime(v);
}
function sameInstant(a, b) {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return a.getTime() === b.getTime();
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
function dayOf(d) {
  if (!d) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function totalMillis(t) {
  return ((t.hours * 60 + t.minutes) * 60 + (t.seconds ?? 0)) * 1e3 + (t.milliseconds ?? 0);
}
function laterTime(a, b) {
  if (!a) return b;
  if (!b) return a;
  return totalMillis(a) >= totalMillis(b) ? a : b;
}
function earlierTime(a, b) {
  if (!a) return b;
  if (!b) return a;
  return totalMillis(a) <= totalMillis(b) ? a : b;
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
  if (effMin && tPart && totalMillis(tPart) < totalMillis(effMin)) {
    result = mergeDateAndTime(result, effMin);
  }
  if (effMax && tPart && totalMillis(tPart) > totalMillis(effMax)) {
    result = mergeDateAndTime(result, effMax);
  }
  if (min && result.getTime() < min.getTime()) result = new Date(min.getTime());
  if (max && result.getTime() > max.getTime()) result = new Date(max.getTime());
  return result;
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
class ArvoDateTimePicker {
  constructor(element, options = {}) {
    this._committedValue = null;
    this._previewValue = null;
    this._isOpen = false;
    this._viewMode = "days";
    this._errorOverride = null;
    this._loadingOverride = null;
    this._hasTextSelected = false;
    this._preFocusValue = null;
    this._inputFocused = false;
    this._dateTouched = false;
    this._timeTouched = false;
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
    this._popoverWrapperEl = null;
    this._popoverEl = null;
    this._headerEl = null;
    this._bodyEl = null;
    this._calHostEl = null;
    this._timeHostEl = null;
    this._clearBtn = null;
    this._triggerBtn = null;
    this._errIco = null;
    this._inlineAlert = null;
    this._calNav = null;
    this._calendar = null;
    this._timeDropdown = null;
    this._segmentCtrl = null;
    this._surface = null;
    this._closingProgrammatically = false;
    this._resizeObserver = null;
    this._destroyed = false;
    this._tdSignature = "";
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
        "[ArvoDateTimePicker] initialize() requires an HTMLElement."
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
      interval: options.interval ?? 15,
      min: options.min ?? null,
      max: options.max ?? null,
      startTime: options.startTime ?? null,
      endTime: options.endTime ?? null,
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
      // DateTimePicker overrides isAutoClose default to FALSE so users can set
      // both date and time portions before the popover closes.
      isAutoClose: options.isAutoClose ?? false,
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
    this._effFormat = this._opts.format && this._opts.format.length > 0 ? this._opts.format : `${getLocaleDateFormat(this._effLocale)} ${getLocaleTimeFormat(this._effLocale)}`;
    this._timeFormat = this._resolveTimeFormat(this._effFormat);
    const initialValue = this._opts.value ?? this._opts.defaultValue ?? null;
    this._committedValue = clampToBounds(
      coerceDateTime(initialValue, this._effFormat, this._effLocale),
      this._asDate(this._opts.min),
      this._asDate(this._opts.max),
      this._asTime(this._opts.startTime),
      this._asTime(this._opts.endTime)
    );
    const base = pickAnchorDate(
      this._committedValue,
      this._asDate(this._opts.min),
      this._asDate(this._opts.max)
    );
    this._visibleYear = base.getFullYear();
    this._visibleMonth = base.getMonth();
    const idNum = ++_idCounter;
    this._id = `arvo-dtp-${idNum}`;
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
      } else if (typeof console !== "undefined") {
        console.warn(
          "[ArvoDateTimePicker] anchor did not resolve to an element; falling back to input mode."
        );
      }
    }
    this._boundInputKeyDown = this._handleInputKeyDown.bind(this);
    this._boundInputFocus = this._handleInputFocus.bind(this);
    this._boundInputBlur = this._handleInputBlur.bind(this);
    this._boundInputMouseDown = this._handleInputMouseDown.bind(this);
    this._boundInputPaste = this._handleInputPaste.bind(this);
    this._boundAnchorClick = this._handleAnchorClick.bind(this);
    this._boundAnchorKeyDown = this._handleAnchorKeyDown.bind(this);
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
    return new ArvoDateTimePicker(element, options ?? {});
  }
  // -------------------------------------------------------------------------
  // DOM construction
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
      this._labelEl.classList.add("arvo-dtp__lbl");
      root.appendChild(this._labelEl);
    }
    this._fieldEl = document.createElement("div");
    this._fieldEl.className = "arvo-dtp__field";
    this._inputEl = document.createElement("input");
    this._inputEl.type = "text";
    this._inputEl.id = this._inputId;
    this._inputEl.className = "arvo-dtp__input";
    this._inputEl.setAttribute("role", "combobox");
    this._inputEl.setAttribute("autocomplete", "off");
    this._inputEl.setAttribute("aria-haspopup", "dialog");
    this._inputEl.setAttribute("aria-expanded", "false");
    this._inputEl.setAttribute("aria-controls", this._popoverId);
    if (this._opts.placeholder) this._inputEl.placeholder = this._opts.placeholder;
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
    }
    this._fieldEl.appendChild(this._inputEl);
    this._actionsEl = document.createElement("div");
    this._actionsEl.className = "arvo-dtp__actions";
    this._fieldEl.appendChild(this._actionsEl);
    const borderEl = document.createElement("div");
    borderEl.className = "arvo-dtp__border";
    this._fieldEl.appendChild(borderEl);
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
      this._clearBtnEl.classList.add("arvo-dtp__clear-btn");
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
      this._errIcoEl.classList.add("arvo-dtp__err-ico");
      this._actionsEl.appendChild(this._errIcoEl);
    }
    if (showSep) {
      const sep = document.createElement("span");
      sep.className = "arvo-dtp__sep";
      sep.setAttribute("aria-hidden", "true");
      this._actionsEl.appendChild(sep);
    }
    if (!loading) {
      this._triggerBtnEl = document.createElement("button");
      this._triggerBtnEl.classList.add("arvo-dtp__trigger-btn");
      this._triggerBtnEl.setAttribute("aria-haspopup", "dialog");
      this._triggerBtnEl.setAttribute("aria-controls", this._popoverId);
      this._triggerBtnEl.setAttribute("aria-expanded", String(this._isOpen));
      this._actionsEl.appendChild(this._triggerBtnEl);
      this._triggerBtn = ArvoIconButton.initialize(this._triggerBtnEl, {
        variant: "tertiary",
        size: "sm",
        icon: "calendar-o",
        tooltip: "Select date and time",
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
        this._errMsgEl.classList.add("arvo-dtp__err-msg");
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
      min: this._asDate(this._opts.min),
      max: this._asDate(this._opts.max),
      commit: "blur",
      minuteInterval: this._opts.interval
    });
    this._segmentCtrl.on("commit", (payload) => {
      const next = payload.date;
      this._previewValue = null;
      this._commitValue(next);
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
      var _a;
      const next = ((_a = this._segmentCtrl) == null ? void 0 : _a.getValue().date) ?? null;
      if (next) {
        this._previewValue = clampToBounds(
          next,
          this._asDate(this._opts.min),
          this._asDate(this._opts.max),
          this._asTime(this._opts.startTime),
          this._asTime(this._opts.endTime)
        );
      } else {
        this._previewValue = null;
      }
      this._refreshInputFromController();
      this._syncLivePanels();
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
      "arvo-dtp",
      `arvo-dtp--${opts.size}`,
      `arvo-dtp--surface-${opts.surface}`,
      opts.isFullWidth && "arvo-dtp--full-width",
      opts.hasWeeks && "arvo-dtp--show-weeks",
      this._useAnchorRender && "arvo-dtp--anchor-mode",
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
      if (err != null || opts.isInvalid) this._inputEl.setAttribute("aria-invalid", "true");
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
    this._syncPopoverWrapperClasses();
  }
  /**
   * Keeps the display:contents wrapper's modifier classes in sync so the
   * `--arvo-dtp-popover-w` CSS variable cascade matches React's
   * `popoverRootClass` wrapper (`arvo-dtp`, size, --full-width, --show-weeks,
   * loading). Called from _syncRootClasses() and _buildPopover().
   */
  _syncPopoverWrapperClasses() {
    if (!this._popoverWrapperEl) return;
    const opts = this._opts;
    const loading = this._effLoading();
    const cls = [
      "arvo-dtp",
      `arvo-dtp--${opts.size}`,
      opts.isFullWidth && "arvo-dtp--full-width",
      opts.hasWeeks && "arvo-dtp--show-weeks",
      loading && "loading"
    ].filter(Boolean);
    this._popoverWrapperEl.className = cls.join(" ");
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
    return coerceDateTime(v, this._effFormat, this._effLocale);
  }
  _asTime(v) {
    return coerceTime(v, this._timeFormat);
  }
  _resolveTimeFormat(combined) {
    const split = splitDateTimeFormat(combined);
    return split.timePart && split.timePart.length > 0 ? split.timePart : getLocaleTimeFormat(this._effLocale);
  }
  // -------------------------------------------------------------------------
  // Input display updates
  // -------------------------------------------------------------------------
  _updateInputDisplay() {
    if (!this._inputEl) return;
    if (this._opts.isSegmented && this._segmentCtrl) {
      this._inputEl.value = this._segmentCtrl.getFormattedDisplay(this._inputFocused);
    } else {
      this._inputEl.value = this._committedValue ? formatDateTime(this._committedValue, this._effFormat, this._effLocale) : "";
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
  // Live preview / panel sync
  // -------------------------------------------------------------------------
  // The "live" value drives Calendar `selectedDate` and TimeDropdown `value`
  // while the isSegmented input is being edited. previewValue takes precedence
  // so the visualization tracks each digit before commit.
  _liveValue() {
    return this._previewValue ?? this._committedValue;
  }
  // Date used to compute the per-day effective time bounds for TimeDropdown.
  // Falls back to the visible month when nothing is selected so the bounds
  // remain consistent with what the user sees in the calendar.
  _liveDateForBounds() {
    return this._liveValue() ?? new Date(this._visibleYear, this._visibleMonth, 1);
  }
  // Recenter the visible month + refresh both inner views to match liveValue.
  // Called whenever previewValue / committedValue changes.
  _syncLivePanels() {
    var _a, _b;
    const live = this._liveValue();
    if (live) {
      const y = live.getFullYear();
      const m = live.getMonth();
      if (y !== this._visibleYear || m !== this._visibleMonth) {
        this._visibleYear = y;
        this._visibleMonth = m;
        (_a = this._calNav) == null ? void 0 : _a.setVisibleMonth(y, m);
        (_b = this._calendar) == null ? void 0 : _b.update({ visibleYear: y, visibleMonth: m });
      }
    }
    this._syncCalendarSelected();
    this._syncTimeDropdownValue();
  }
  _syncCalendarSelected() {
    if (!this._calendar) return;
    this._calendar.update({ selectedDate: this._liveValue() });
  }
  _buildTdSignature(liveDate, effMin, effMax) {
    const day = `${liveDate.getFullYear()}-${liveDate.getMonth()}-${liveDate.getDate()}`;
    const min = effMin ? totalMillis(effMin) : "x";
    const max = effMax ? totalMillis(effMax) : "x";
    return `${day}|${min}|${max}|${this._opts.interval}|${this._timeFormat}|${this._effLocale}`;
  }
  _syncTimeDropdownValue() {
    var _a;
    if (!this._timeHostEl) return;
    const live = this._liveValue();
    const timePart = getTimePart(live);
    const liveDate = this._liveDateForBounds();
    const effMin = getEffectiveMinTimeForDate(
      liveDate,
      this._asDate(this._opts.min),
      this._asTime(this._opts.startTime)
    );
    const effMax = getEffectiveMaxTimeForDate(
      liveDate,
      this._asDate(this._opts.max),
      this._asTime(this._opts.endTime)
    );
    const disabled = this._opts.isDisabled || this._opts.isReadOnly || this._effLoading();
    const signature = this._buildTdSignature(liveDate, effMin, effMax);
    if (this._timeDropdown && signature === this._tdSignature && timePart != null) {
      this._timeDropdown.value(timePart);
      this._timeDropdown.disabled(disabled);
      return;
    }
    (_a = this._timeDropdown) == null ? void 0 : _a.destroy();
    this._timeDropdown = ArvoTimeDropdown.initialize(this._timeHostEl, {
      value: timePart,
      format: this._timeFormat,
      locale: this._effLocale,
      interval: this._opts.interval,
      minTime: effMin,
      maxTime: effMax,
      isDisabled: disabled,
      onChange: (t) => this._handleTimeChange(t),
      onDismiss: () => this.close()
    });
    this._tdSignature = signature;
  }
  _syncCalendarVisible() {
    var _a, _b;
    (_a = this._calNav) == null ? void 0 : _a.setVisibleMonth(this._visibleYear, this._visibleMonth);
    (_b = this._calendar) == null ? void 0 : _b.update({
      visibleYear: this._visibleYear,
      visibleMonth: this._visibleMonth
    });
  }
  // -------------------------------------------------------------------------
  // Commit / change dispatch
  // -------------------------------------------------------------------------
  // Clamps, dedupes against current committed value, then fires onChange +
  // dtp:change. Returns true if the value actually changed.
  _commitValue(next) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const clamped = clampToBounds(
      next,
      this._asDate(this._opts.min),
      this._asDate(this._opts.max),
      this._asTime(this._opts.startTime),
      this._asTime(this._opts.endTime)
    );
    this._previewValue = null;
    if (sameInstant(clamped, this._committedValue)) {
      (_a = this._segmentCtrl) == null ? void 0 : _a.setValue(clamped, { silent: true });
      this._syncLivePanels();
      this._updateInputDisplay();
      return false;
    }
    this._committedValue = clamped;
    (_b = this._segmentCtrl) == null ? void 0 : _b.setValue(clamped, { silent: true });
    if (clamped) {
      this._visibleYear = clamped.getFullYear();
      this._visibleMonth = clamped.getMonth();
      (_c = this._calNav) == null ? void 0 : _c.setVisibleMonth(this._visibleYear, this._visibleMonth);
      (_d = this._calendar) == null ? void 0 : _d.update({
        visibleYear: this._visibleYear,
        visibleMonth: this._visibleMonth,
        selectedDate: clamped
      });
    } else {
      (_e = this._calendar) == null ? void 0 : _e.update({ selectedDate: null });
    }
    this._syncTimeDropdownValue();
    this._updateInputDisplay();
    this._renderActions();
    this._syncRootClasses();
    const detail = {
      value: clamped,
      formattedValue: clamped ? formatDateTime(clamped, this._effFormat, this._effLocale) : ""
    };
    (_g = (_f = this._opts).onChange) == null ? void 0 : _g.call(_f, detail);
    (_h = this._element) == null ? void 0 : _h.dispatchEvent(
      new CustomEvent("dtp:change", {
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
   * Click-to-segment. Mirrors the DatePicker implementation; see that file
   * for the rAF rationale.
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
      this._previewValue = null;
      this._syncLivePanels();
    } else {
      const parsed = parseDateTime(
        ((_a = this._inputEl) == null ? void 0 : _a.value) ?? "",
        this._effFormat,
        this._effLocale
      );
      if (parsed) this._commitValue(parsed);
      else this._updateInputDisplay();
    }
    if (this._hasTextSelected) {
      this._hasTextSelected = false;
      this._syncRootClasses();
    }
    (_c = (_b = this._opts).onBlur) == null ? void 0 : _c.call(_b);
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
        this._previewValue = null;
        this._syncLivePanels();
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
        const changed = !sameInstant(before, this._committedValue);
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
      const parsed = parseDateTime(
        ((_a = this._inputEl) == null ? void 0 : _a.value) ?? "",
        this._effFormat,
        this._effLocale
      );
      if (parsed) {
        const before = this._committedValue;
        const changed = this._commitValue(parsed);
        if (this._isOpen && this._opts.isAutoClose && changed && !sameInstant(before, this._committedValue)) {
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
    this._popoverEl.className = "arvo-dtp__popover";
    this._popoverEl.id = this._popoverId;
    this._popoverEl.setAttribute("role", "dialog");
    this._popoverEl.setAttribute("aria-label", "Choose a date and time");
    this._popoverEl.setAttribute("aria-modal", "false");
    this._popoverEl.style.position = "fixed";
    this._popoverEl.style.top = "0";
    this._popoverEl.style.left = "0";
    this._popoverEl.style.margin = "0";
    if ((_a = this._opts.popoverProps) == null ? void 0 : _a.width) {
      this._popoverEl.style.width = this._opts.popoverProps.width;
    }
    this._calHostEl = document.createElement("div");
    this._calHostEl.className = "arvo-dtp__cal";
    this._headerEl = document.createElement("div");
    this._headerEl.className = "arvo-dtp__header";
    this._bodyEl = document.createElement("div");
    this._bodyEl.className = "arvo-dtp__cal-grid";
    this._calHostEl.appendChild(this._headerEl);
    this._calHostEl.appendChild(this._bodyEl);
    this._timeHostEl = document.createElement("div");
    this._timeHostEl.className = "arvo-dtp__time";
    this._popoverEl.appendChild(this._calHostEl);
    this._popoverEl.appendChild(this._timeHostEl);
    this._popoverWrapperEl = document.createElement("div");
    this._popoverWrapperEl.style.display = "contents";
    this._syncPopoverWrapperClasses();
    document.body.appendChild(this._popoverWrapperEl);
    this._calNav = CalendarNav.initialize(this._headerEl, {
      visibleYear: this._visibleYear,
      visibleMonth: this._visibleMonth,
      viewMode: this._viewMode === "days" || this._viewMode === "months" || this._viewMode === "years" ? this._viewMode : "days",
      locale: this._effLocale,
      minDate: dayOf(this._asDate(this._opts.min)),
      maxDate: dayOf(this._asDate(this._opts.max)),
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
      selectedDate: this._liveValue(),
      minDate: dayOf(this._asDate(this._opts.min)),
      maxDate: dayOf(this._asDate(this._opts.max)),
      onCellSelect: (payload) => this._handleCalCellSelect(payload),
      onMonthChange: (p) => {
        this._visibleYear = p.year;
        this._visibleMonth = p.month;
        this._syncCalendarVisible();
      },
      onViewModeChange: (p) => this._setViewMode(p.mode),
      onDismiss: () => this.close()
    });
    this._syncTimeDropdownValue();
  }
  _handleCalCellSelect(payload) {
    var _a;
    const { date, mode } = payload;
    if (!date) return;
    if (mode === "days") {
      const currentTime = getTimePart(this._committedValue) ?? this._asTime(this._opts.startTime) ?? ZERO_TIME;
      const merged = mergeDateAndTime(date, currentTime);
      const clamped = clampToBounds(
        merged,
        this._asDate(this._opts.min),
        this._asDate(this._opts.max),
        this._asTime(this._opts.startTime),
        this._asTime(this._opts.endTime)
      );
      if (clamped) {
        (_a = this._segmentCtrl) == null ? void 0 : _a.setValue(clamped, { silent: true });
        this._commitValue(clamped);
        this._refreshInputFromController();
      }
      this._dateTouched = true;
      if (this._opts.isAutoClose && this._timeTouched) this.close();
      return;
    }
    this._visibleYear = date.getFullYear();
    this._visibleMonth = date.getMonth();
    if (mode === "months") this._setViewMode("days");
    else if (mode === "years") this._setViewMode("months");
    else this._syncCalendarVisible();
  }
  _handleTimeChange(time) {
    var _a;
    const baseDate = this._committedValue ?? /* @__PURE__ */ new Date();
    const merged = mergeDateAndTime(baseDate, time);
    const clamped = clampToBounds(
      merged,
      this._asDate(this._opts.min),
      this._asDate(this._opts.max),
      this._asTime(this._opts.startTime),
      this._asTime(this._opts.endTime)
    );
    if (clamped) {
      (_a = this._segmentCtrl) == null ? void 0 : _a.setValue(clamped, { silent: true });
      this._commitValue(clamped);
      this._refreshInputFromController();
    }
    this._timeTouched = true;
    if (this._opts.isAutoClose && this._dateTouched) this.close();
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
   * Custom order: calendarCell -> timeOption -> prev -> month -> year -> next
   * -> today. Both ArvoCalendar and ArvoTimeDropdown use roving tabindex, so
   * the single `[tabindex="0"]` element in each set is found by selector.
   * Initial focus is set imperatively to the selected (or today) calendar cell
   * after the engine positions the panel -- see open() rAF block.
   */
  _getOrderedPopoverElements() {
    const root = this._popoverEl;
    if (!root) return [];
    const calendarCell = root.querySelector(
      '.arvo-cal__cell[tabindex="0"]'
    );
    const timeOption = root.querySelector(
      '.arvo-tdrop__opt[tabindex="0"]'
    );
    const prev = root.querySelector(".arvo-cal-nav__prev");
    const monthBtn = root.querySelector(".arvo-cal-nav__month-btn");
    const yearBtn = root.querySelector(".arvo-cal-nav__year-btn");
    const next = root.querySelector(".arvo-cal-nav__next");
    const today = root.querySelector(".arvo-cal-nav__today");
    return [calendarCell, timeOption, prev, monthBtn, yearBtn, next, today];
  }
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  open() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    if (this._destroyed) return;
    if (this._isOpen) return;
    if (this._opts.isDisabled || this._opts.isReadOnly || this._effLoading()) {
      if (typeof console !== "undefined") {
        console.warn(
          "[ArvoDateTimePicker] open() ignored while disabled / readOnly / loading."
        );
      }
      return;
    }
    if (((_b = (_a = this._opts).onOpen) == null ? void 0 : _b.call(_a)) === false) return;
    const ev = new CustomEvent("dtp:open", { bubbles: true, cancelable: true });
    const proceed = (_c = this._element) == null ? void 0 : _c.dispatchEvent(ev);
    if (proceed === false) return;
    this._isOpen = true;
    this._buildPopover();
    const center = pickAnchorDate(
      this._committedValue,
      this._asDate(this._opts.min),
      this._asDate(this._opts.max)
    );
    this._visibleYear = center.getFullYear();
    this._visibleMonth = center.getMonth();
    this._viewMode = "days";
    (_d = this._calNav) == null ? void 0 : _d.setViewMode("days");
    (_e = this._calNav) == null ? void 0 : _e.setVisibleMonth(this._visibleYear, this._visibleMonth);
    (_f = this._calendar) == null ? void 0 : _f.update({
      visibleYear: this._visibleYear,
      visibleMonth: this._visibleMonth,
      viewMode: "days",
      selectedDate: this._committedValue
    });
    this._syncTimeDropdownValue();
    this._dateTouched = false;
    this._timeTouched = false;
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
        mount: {
          // The engine appends _popoverEl to the display:contents wrapper on
          // open and removes it on close. The wrapper itself stays on
          // document.body permanently (invisible) so the modifier-class cascade
          // is always available when the engine re-mounts on the next open.
          target: () => this._popoverWrapperEl ?? document.body,
          removeOnClose: true
        },
        position: {
          placement: this._opts.placement,
          gap: ((_g = this._opts.popoverProps) == null ? void 0 : _g.offset) ?? 4,
          apply: (pos, surfaceEl) => {
            applyPositionToSurface(pos, surfaceEl);
            surfaceEl.style.visibility = "";
          }
        },
        focus: {
          mode: "trap",
          initialFocus: "none",
          // initial focus set imperatively via rAF below
          returnFocus: false,
          // picker manages focus return manually
          getOrderedElements: () => this._getOrderedPopoverElements()
        },
        transition: "fade",
        transitionDuration: 150,
        // The engine writes aria-haspopup / aria-controls / aria-expanded on
        // the trigger element. axe rejects aria-haspopup on a generic <div>
        // (aria-allowed-attr), and the picker already wires the canonical
        // combobox ARIA on the role="combobox" <input> (input mode) and on the
        // anchor element (anchor mode) in _renderDomInput / _renderDomAnchor /
        // _syncRootClasses. Disable the engine writes so there is a single
        // source of truth -- same strategy as DatePicker + TimePicker.
        triggerAria: false,
        onClose: this._handleEngineClose
      });
    } else if (this._surface) {
      this._surface.setTrigger(
        (this._useAnchorRender ? this._anchorEl : this._fieldEl) ?? null
      );
    }
    void ((_h = this._surface) == null ? void 0 : _h.open());
    this._syncRootClasses();
    (_i = this._triggerBtn) == null ? void 0 : _i.selected(true);
    (_j = this._triggerBtnEl) == null ? void 0 : _j.setAttribute("aria-expanded", "true");
    const focusTarget = pickAnchorDate(
      this._committedValue,
      this._asDate(this._opts.min),
      this._asDate(this._opts.max)
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
    const ev = new CustomEvent("dtp:close", { bubbles: true, cancelable: true });
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
      coerced = parseDateTime(v, this._effFormat, this._effLocale);
      if (coerced == null && v.length > 0) {
        if (typeof console !== "undefined") {
          console.warn(
            `[ArvoDateTimePicker] value(): unparseable string "${v}"; value unchanged.`
          );
        }
        return;
      }
    } else {
      return;
    }
    this._commitValue(coerced);
  }
  formattedValue() {
    return this._committedValue ? formatDateTime(this._committedValue, this._effFormat, this._effLocale) : "";
  }
  clear() {
    var _a;
    (_a = this._segmentCtrl) == null ? void 0 : _a.setValue(null, { silent: true });
    this._commitValue(null);
  }
  disabled(state) {
    var _a, _b, _c;
    if (state === void 0) return this._opts.isDisabled;
    if (state === this._opts.isDisabled) return;
    this._opts.isDisabled = state;
    if (state && this._isOpen) this.close();
    (_a = this._calNav) == null ? void 0 : _a.disabled(state);
    (_b = this._triggerBtn) == null ? void 0 : _b.disabled(state || this._opts.isReadOnly);
    (_c = this._timeDropdown) == null ? void 0 : _c.disabled(state || this._opts.isReadOnly || this._effLoading());
    this._renderActions();
    this._syncRootClasses();
  }
  setError(message) {
    this._errorOverride = message === false ? null : message;
    this._renderActions();
    this._renderInlineError();
    this._syncRootClasses();
  }
  setLoading(loading) {
    var _a;
    this._loadingOverride = loading;
    if (loading && this._isOpen) this.close();
    (_a = this._timeDropdown) == null ? void 0 : _a.disabled(this._opts.isDisabled || this._opts.isReadOnly || loading);
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
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
    (_j = this._timeDropdown) == null ? void 0 : _j.destroy();
    this._timeDropdown = null;
    (_k = this._popoverEl) == null ? void 0 : _k.remove();
    this._popoverEl = null;
    this._headerEl = null;
    this._bodyEl = null;
    this._calHostEl = null;
    this._timeHostEl = null;
    (_l = this._popoverWrapperEl) == null ? void 0 : _l.remove();
    this._popoverWrapperEl = null;
    if (this._inputEl) {
      this._inputEl.removeEventListener("keydown", this._boundInputKeyDown);
      this._inputEl.removeEventListener("focus", this._boundInputFocus);
      this._inputEl.removeEventListener("blur", this._boundInputBlur);
      this._inputEl.removeEventListener("mousedown", this._boundInputMouseDown);
      this._inputEl.removeEventListener("paste", this._boundInputPaste);
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
    this._anchorEl = null;
    this._element = null;
  }
}
export {
  ArvoDateTimePicker
};
//# sourceMappingURL=DateTimePicker.js.map
