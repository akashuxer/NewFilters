"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const core = require("@arvo/core");
const FormLabel = require("../FormLabel/FormLabel.cjs");
const IconButton = require("../IconButton/IconButton.cjs");
const MessageAlert = require("../MessageAlert/MessageAlert.cjs");
const TimeDropdown = require("../TimeDropdown/TimeDropdown.cjs");
let _idCounter = 0;
function timeKey(v) {
  if (!v) return "";
  return `${v.hours}:${v.minutes}:${v.seconds ?? 0}:${v.milliseconds ?? 0}:${v.timezone ?? ""}`;
}
function sameTime(a, b) {
  return timeKey(a) === timeKey(b);
}
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
  if (!date || Number.isNaN(date.getTime())) return null;
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    milliseconds: date.getMilliseconds()
  };
}
function dateFromTime(v) {
  if (!v) return null;
  return new Date(2e3, 0, 1, v.hours, v.minutes, v.seconds ?? 0, v.milliseconds ?? 0);
}
function coerceTime(v, format) {
  if (v == null) return null;
  if (v instanceof Date) return timeFromDate(v);
  if (typeof v === "string") return v.length === 0 ? null : core.parseTime(v, format);
  return normalizeTime(v);
}
function parseDisplayTime(value, format, strict) {
  const parsed = core.parseTime(value, format);
  if (!parsed) return null;
  if (strict && core.formatTime(parsed, format) !== value.trim()) return null;
  return parsed;
}
function totalMilliseconds(v) {
  return ((v.hours * 60 + v.minutes) * 60 + (v.seconds ?? 0)) * 1e3 + (v.milliseconds ?? 0);
}
function clampToRange(v, min, max) {
  if (!v) return null;
  if (min && totalMilliseconds(v) < totalMilliseconds(min)) return { ...min };
  if (max && totalMilliseconds(v) > totalMilliseconds(max)) return { ...max };
  return v;
}
function resolveAnchorElement(anchor, host) {
  if (anchor === false || anchor == null) return null;
  if (anchor === true) return host;
  if (typeof anchor === "string") return document.querySelector(anchor);
  if (anchor instanceof HTMLElement) return anchor;
  return null;
}
class ArvoTimePicker {
  constructor(element, options = {}) {
    this._committedValue = null;
    this._isOpen = false;
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
    this._errIcoConnector = null;
    this._errMsgEl = null;
    this._popoverEl = null;
    this._bodyEl = null;
    this._timeDropdownHostEl = null;
    this._clearBtn = null;
    this._triggerBtn = null;
    this._errIco = null;
    this._inlineAlert = null;
    this._timeDropdown = null;
    this._segmentCtrl = null;
    this._surface = null;
    this._closingProgrammatically = false;
    this._resizeObserver = null;
    this._loadingObserver = null;
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
      throw new TypeError("[ArvoTimePicker] initialize() requires an HTMLElement.");
    }
    this._element = element;
    this._opts = {
      value: options.value,
      defaultValue: options.defaultValue ?? null,
      format: options.format ?? null,
      locale: options.locale ?? null,
      interval: options.interval ?? 15,
      minTime: options.minTime ?? null,
      maxTime: options.maxTime ?? null,
      placeholder: options.placeholder ?? null,
      label: options.label ?? null,
      contextHelp: options.contextHelp ?? null,
      variant: options.variant ?? "default",
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
      popoverProps: options.popoverProps ?? null,
      onChange: options.onChange ?? null,
      onOpen: options.onOpen ?? null,
      onClose: options.onClose ?? null,
      onBlur: options.onBlur ?? null
    };
    this._effLocale = core.getUserLocale(this._opts.locale ?? void 0);
    this._effFormat = this._opts.format || core.getLocaleTimeFormat(this._effLocale);
    this._committedValue = clampToRange(
      coerceTime(this._opts.value ?? this._opts.defaultValue, this._effFormat),
      this._asTime(this._opts.minTime),
      this._asTime(this._opts.maxTime)
    );
    const idNum = ++_idCounter;
    this._id = `arvo-tp-${idNum}`;
    this._inputId = `${this._id}-input`;
    this._labelId = `${this._id}-lbl`;
    this._errorId = `${this._id}-err`;
    this._popoverId = `${this._id}-popover`;
    const anchorRequested = this._opts.anchor !== false && this._opts.anchor != null;
    if (anchorRequested) {
      const resolved = resolveAnchorElement(this._opts.anchor, element);
      if (resolved) {
        this._useAnchorRender = true;
        this._anchorEl = resolved;
      } else if (typeof console !== "undefined") {
        console.warn("[ArvoTimePicker] anchor did not resolve to an element; falling back to input mode.");
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
    if (this._useAnchorRender) this._renderDomAnchor();
    else {
      this._renderDomInput();
      this._initSegmentController();
      this._observeActions();
    }
    this._observeParentLoading();
    this._applyWidth();
    this._syncRootClasses();
    this._updateInputDisplay();
  }
  static initialize(element, options) {
    return new ArvoTimePicker(element, options ?? {});
  }
  // -------------------------------------------------------------------------
  // DOM construction
  // -------------------------------------------------------------------------
  _renderDomInput() {
    const root = this._element;
    root.id = this._id;
    if (this._opts.label) {
      this._labelEl = FormLabel.ArvoFormLabel.initialize(null, {
        text: this._opts.label,
        for: this._inputId,
        isRequired: this._opts.isRequired,
        contextHelp: this._opts.contextHelp,
        isDisabled: this._opts.isDisabled,
        isInvalid: this._opts.isInvalid
      }).el;
      this._labelEl.id = this._labelId;
      this._labelEl.classList.add("arvo-tp__lbl");
      root.appendChild(this._labelEl);
    }
    this._fieldEl = document.createElement("div");
    this._fieldEl.className = "arvo-tp__field";
    this._inputEl = document.createElement("input");
    this._inputEl.type = "text";
    this._inputEl.id = this._inputId;
    this._inputEl.className = "arvo-tp__input";
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
    if (this._opts.isReadOnly || this._opts.isSegmented) this._inputEl.readOnly = true;
    if (this._opts.isRequired) this._inputEl.setAttribute("aria-required", "true");
    if (this._opts.isInvalid || this._effError() != null) this._inputEl.setAttribute("aria-invalid", "true");
    if (this._effLoading()) this._inputEl.setAttribute("aria-busy", "true");
    if (this._labelEl) this._inputEl.setAttribute("aria-labelledby", this._labelId);
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
    this._actionsEl.className = "arvo-tp__actions";
    this._fieldEl.appendChild(this._actionsEl);
    const border = document.createElement("div");
    border.className = "arvo-tp__border";
    this._fieldEl.appendChild(border);
    root.appendChild(this._fieldEl);
    this._renderActions();
    this._renderInlineError();
  }
  _renderDomAnchor() {
    const root = this._element;
    root.id = this._id;
    if (!this._anchorEl) return;
    this._anchorEl.setAttribute("aria-haspopup", "dialog");
    this._anchorEl.setAttribute("aria-expanded", "false");
    this._anchorEl.setAttribute("aria-controls", this._popoverId);
    this._anchorEl.addEventListener("click", this._boundAnchorClick);
    this._anchorEl.addEventListener("keydown", this._boundAnchorKeyDown);
  }
  _renderActions() {
    var _a, _b, _c, _d;
    if (!this._actionsEl) return;
    (_a = this._clearBtn) == null ? void 0 : _a.destroy();
    (_b = this._triggerBtn) == null ? void 0 : _b.destroy();
    (_c = this._errIco) == null ? void 0 : _c.destroy();
    (_d = this._errIcoConnector) == null ? void 0 : _d.destroy();
    this._clearBtn = null;
    this._triggerBtn = null;
    this._errIco = null;
    this._errIcoConnector = null;
    this._clearBtnEl = null;
    this._triggerBtnEl = null;
    this._errIcoEl = null;
    this._actionsEl.textContent = "";
    const err = this._effError();
    const loading = this._effLoading();
    const showTooltipIcon = err != null && this._opts.errorDisplay === "tooltip";
    const showClear = this._opts.isClearable === true && this._committedValue != null && !this._opts.isDisabled && !this._opts.isReadOnly && !loading && !showTooltipIcon;
    const showSep = !loading && (showClear || showTooltipIcon);
    if (showClear) {
      this._clearBtnEl = document.createElement("button");
      this._clearBtnEl.classList.add("arvo-tp__clear-btn");
      this._clearBtnEl.setAttribute("tabindex", "-1");
      this._actionsEl.appendChild(this._clearBtnEl);
      this._clearBtn = IconButton.ArvoIconButton.initialize(this._clearBtnEl, {
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
      this._errIco = MessageAlert.ArvoMessageAlert.initialize(document.createElement("div"), {
        type: "negative",
        isInline: true,
        message: err
      });
      this._errIcoEl = this._errIco.el;
      this._errIcoEl.classList.add("arvo-tp__err-ico");
      this._errIcoConnector = core.connectTooltip(core.tooltipManager, {
        anchor: this._errIcoEl,
        content: err
      });
      this._actionsEl.appendChild(this._errIcoEl);
    }
    if (showSep) {
      const sep = document.createElement("span");
      sep.className = "arvo-tp__sep";
      sep.setAttribute("aria-hidden", "true");
      this._actionsEl.appendChild(sep);
    }
    if (!loading) {
      this._triggerBtnEl = document.createElement("button");
      this._triggerBtnEl.classList.add("arvo-tp__trigger-btn");
      this._triggerBtnEl.setAttribute("aria-haspopup", "dialog");
      this._triggerBtnEl.setAttribute("aria-controls", this._popoverId);
      this._triggerBtnEl.setAttribute("aria-expanded", String(this._isOpen));
      this._actionsEl.appendChild(this._triggerBtnEl);
      this._triggerBtn = IconButton.ArvoIconButton.initialize(this._triggerBtnEl, {
        variant: "tertiary",
        size: "sm",
        icon: "clock-o",
        tooltip: "Select time",
        isDisabled: this._opts.isDisabled || this._opts.isReadOnly,
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
        this._inlineAlert = MessageAlert.ArvoMessageAlert.initialize(document.createElement("div"), {
          type: "negative",
          message: err,
          id: this._errorId
        });
        this._errMsgEl = this._inlineAlert.el;
        this._errMsgEl.classList.add("arvo-tp__err-msg");
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
    this._segmentCtrl = core.createSegmentController({
      format: this._effFormat,
      locale: this._effLocale,
      value: dateFromTime(this._committedValue),
      min: dateFromTime(this._asTime(this._opts.minTime)),
      max: dateFromTime(this._asTime(this._opts.maxTime)),
      commit: "blur",
      minuteInterval: this._opts.interval
    });
    this._segmentCtrl.on("commit", (payload) => {
      this._handleCommit(timeFromDate(payload.date));
    });
    this._segmentCtrl.on("segment", () => {
      var _a;
      const focused = ((_a = this._segmentCtrl) == null ? void 0 : _a.getFocusedSegment()) != null;
      if (focused !== this._hasTextSelected) {
        this._hasTextSelected = focused;
        this._syncRootClasses();
      }
    });
    this._segmentCtrl.on("change", () => this._refreshInputFromController());
  }
  // -------------------------------------------------------------------------
  // Resize observer + width
  // -------------------------------------------------------------------------
  _observeActions() {
    if (!this._actionsEl) return;
    this._resizeObserver = new ResizeObserver(() => this._updatePadding());
    this._resizeObserver.observe(this._actionsEl);
    this._updatePadding();
  }
  _observeParentLoading() {
    this._loadingObserver = new MutationObserver(() => this._syncLoadingState());
    this._loadingObserver.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-arvo-loading", "data-arvo-loading-ignore"]
    });
  }
  _syncLoadingState() {
    var _a;
    const loading = this._effLoading();
    if (loading && this._isOpen) this.close();
    (_a = this._timeDropdown) == null ? void 0 : _a.disabled(this._opts.isDisabled || this._opts.isReadOnly || loading);
    this._renderActions();
    this._syncRootClasses();
  }
  _updatePadding() {
    if (!this._actionsEl || !this._fieldEl) return;
    const w = this._actionsEl.offsetWidth;
    this._fieldEl.style.setProperty("--arvo-form-input-pad-r", `${w > 0 ? w + 4 : 0}px`);
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
    var _a;
    if (!this._element) return;
    const err = this._effError();
    const loading = this._effLoading();
    const classes = [
      "arvo-tp",
      `arvo-tp--${this._opts.variant}`,
      `arvo-tp--${this._opts.size}`,
      `arvo-tp--surface-${this._opts.surface}`,
      this._opts.isFullWidth && "arvo-tp--full-width",
      this._useAnchorRender && "arvo-tp--anchor-mode",
      loading && "loading",
      this._opts.isDisabled && "is-disabled",
      this._opts.isReadOnly && "is-readonly",
      err != null && "has-error",
      err != null && this._opts.errorDisplay === "tooltip" && "error-tooltip",
      this._committedValue != null && "has-value",
      this._hasTextSelected && "has-text-selected",
      this._isOpen && "open"
    ].filter(Boolean);
    this._element.className = classes.join(" ");
    if (this._inputEl) {
      this._inputEl.setAttribute("aria-expanded", String(this._isOpen));
      if (this._opts.isInvalid || err != null) this._inputEl.setAttribute("aria-invalid", "true");
      else this._inputEl.removeAttribute("aria-invalid");
      if (loading) this._inputEl.setAttribute("aria-busy", "true");
      else this._inputEl.removeAttribute("aria-busy");
      this._inputEl.disabled = this._opts.isDisabled;
      if (this._opts.isDisabled) this._inputEl.setAttribute("aria-disabled", "true");
      else this._inputEl.removeAttribute("aria-disabled");
      this._inputEl.readOnly = this._opts.isReadOnly || this._opts.isSegmented;
    }
    (_a = this._triggerBtnEl) == null ? void 0 : _a.setAttribute("aria-expanded", String(this._isOpen));
    if (this._useAnchorRender && this._anchorEl) {
      this._anchorEl.setAttribute("aria-expanded", String(this._isOpen));
    }
  }
  // -------------------------------------------------------------------------
  // Effective state accessors
  // -------------------------------------------------------------------------
  _effError() {
    if (this._errorOverride != null) return this._errorOverride;
    if (this._opts.isInvalid) return this._opts.errorMsg;
    return null;
  }
  _effLoading() {
    var _a, _b;
    const ownLoading = this._loadingOverride ?? this._opts.isLoading;
    const parentLoading = Boolean((_a = this._element) == null ? void 0 : _a.closest('[data-arvo-loading="true"]'));
    const loadingIgnored = Boolean((_b = this._element) == null ? void 0 : _b.closest('[data-arvo-loading-ignore="true"]'));
    return ownLoading || parentLoading && !loadingIgnored;
  }
  _asTime(v) {
    return coerceTime(v, this._effFormat);
  }
  // -------------------------------------------------------------------------
  // Input display updates
  // -------------------------------------------------------------------------
  _updateInputDisplay() {
    if (!this._inputEl) return;
    if (this._opts.isSegmented && this._segmentCtrl) {
      this._inputEl.value = this._segmentCtrl.getFormattedDisplay(this._inputFocused);
    } else {
      this._inputEl.value = this._committedValue ? core.formatTime(this._committedValue, this._effFormat) : "";
    }
  }
  _refreshInputFromController() {
    if (!this._inputEl || !this._segmentCtrl) return;
    this._inputEl.value = this._segmentCtrl.getFormattedDisplay(this._inputFocused);
    const preview = timeFromDate(this._segmentCtrl.getValue().date);
    if (preview && this._timeDropdown) {
      this._timeDropdown.value(clampToRange(
        preview,
        this._asTime(this._opts.minTime),
        this._asTime(this._opts.maxTime)
      ) ?? preview);
    }
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
    var _a, _b, _c, _d, _e;
    const clamped = clampToRange(next, this._asTime(this._opts.minTime), this._asTime(this._opts.maxTime));
    if (sameTime(clamped, this._committedValue)) {
      (_a = this._segmentCtrl) == null ? void 0 : _a.setValue(dateFromTime(clamped), { silent: true });
      this._syncTimeDropdownValue(clamped);
      this._updateInputDisplay();
      return false;
    }
    this._committedValue = clamped;
    (_b = this._segmentCtrl) == null ? void 0 : _b.setValue(dateFromTime(clamped), { silent: true });
    this._syncTimeDropdownValue(clamped);
    this._updateInputDisplay();
    this._renderActions();
    this._syncRootClasses();
    const detail = { value: clamped, formattedValue: clamped ? core.formatTime(clamped, this._effFormat) : "" };
    (_d = (_c = this._opts).onChange) == null ? void 0 : _d.call(_c, detail);
    (_e = this._element) == null ? void 0 : _e.dispatchEvent(new CustomEvent("tp:change", { bubbles: true, detail }));
    return true;
  }
  // -------------------------------------------------------------------------
  // Trigger / input handlers
  // -------------------------------------------------------------------------
  _handleTriggerClick() {
    if (this._effLoading() || this._opts.isDisabled || this._opts.isReadOnly) return;
    if (this._isOpen) this.close();
    else this.open();
  }
  _handleInputFocus() {
    this._inputFocused = true;
    this._preFocusValue = this._committedValue;
    if (this._opts.isSegmented && this._segmentCtrl) {
      if (this._inputEl) this._inputEl.value = this._segmentCtrl.getFormattedDisplay(true);
      this._segmentCtrl.focusSegment(0);
      this._refreshInputFromController();
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
        this._refreshInputFromController();
      }
    });
  }
  _handleInputBlur() {
    var _a, _b, _c;
    this._inputFocused = false;
    if (this._opts.isSegmented && this._segmentCtrl) {
      if (this._inputEl) this._inputEl.value = this._segmentCtrl.getFormattedDisplay(false);
    } else {
      const parsed = parseDisplayTime(
        ((_a = this._inputEl) == null ? void 0 : _a.value) ?? "",
        this._effFormat,
        this._opts.isStrictParsing
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
          if (this._inputEl) this._inputEl.value = ctrl.getFormattedDisplay(true);
          ctrl.focusSegment(0);
          this._refreshInputFromController();
        } else this._updateInputDisplay();
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
        if (this._isOpen && this._opts.isAutoClose && !sameTime(before, this._committedValue)) this.close();
        return;
      }
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Backspace", "Delete"].includes(key)) {
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
        }
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const parsed = parseDisplayTime(
        ((_a = this._inputEl) == null ? void 0 : _a.value) ?? "",
        this._effFormat,
        this._opts.isStrictParsing
      );
      if (parsed) {
        const changed = this._handleCommit(parsed);
        if (this._isOpen && this._opts.isAutoClose && changed) this.close();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      this._committedValue = this._preFocusValue;
      this._syncTimeDropdownValue(this._committedValue);
      this._updateInputDisplay();
      this._renderActions();
      this._syncRootClasses();
      if (this._isOpen) this.close();
    }
  }
  _handleInputPaste(e) {
    var _a;
    if (!this._opts.isSegmented || !this._segmentCtrl) return;
    const res = this._segmentCtrl.handlePaste(((_a = e.clipboardData) == null ? void 0 : _a.getData("text")) ?? "");
    if (res.consumed) {
      e.preventDefault();
      this._refreshInputFromController();
    }
  }
  // -------------------------------------------------------------------------
  // Anchor mode handlers
  // -------------------------------------------------------------------------
  _handleAnchorClick() {
    this._handleTriggerClick();
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
  /**
   * Builds the popover DOM once (lazy). Does NOT append to the document --
   * the OverlaySurface engine mounts + unmounts via `mount.target` /
   * `mount.removeOnClose` on each open/close cycle (mirrors the React portal
   * pattern where `isMounted` gates the portal render).
   */
  _buildPopover() {
    var _a;
    if (this._popoverEl) return;
    this._popoverEl = document.createElement("div");
    this._popoverEl.className = "arvo-tp__popover";
    this._popoverEl.id = this._popoverId;
    this._popoverEl.setAttribute("role", "dialog");
    this._popoverEl.setAttribute("aria-label", "Choose a time");
    this._popoverEl.setAttribute("aria-modal", "false");
    this._popoverEl.style.position = "fixed";
    this._popoverEl.style.top = "0";
    this._popoverEl.style.left = "0";
    this._popoverEl.style.margin = "0";
    if ((_a = this._opts.popoverProps) == null ? void 0 : _a.width) {
      this._popoverEl.style.width = this._opts.popoverProps.width;
    }
    this._bodyEl = document.createElement("div");
    this._bodyEl.className = "arvo-tp__body";
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
      isDisabled: this._opts.isDisabled || this._opts.isReadOnly || this._effLoading(),
      onChange: (time) => {
        const clamped = clampToRange(time, this._asTime(this._opts.minTime), this._asTime(this._opts.maxTime));
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
  /**
   * Tab cycle inside the popover (mirrors React's `getOrderedPopoverElements`).
   * ArvoTimeDropdown uses roving tabindex; the single `[tabindex="0"]` element
   * is the current time item. Initial focus is set imperatively after the
   * engine positions the panel -- see open() rAF block.
   */
  _getOrderedPopoverElements() {
    const root = this._popoverEl;
    if (!root) return [];
    const timeItem = root.querySelector('[tabindex="0"]');
    return [timeItem];
  }
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  open() {
    var _a, _b, _c, _d, _e, _f, _g;
    if (this._destroyed) return;
    if (this._isOpen) return;
    if (this._opts.isDisabled || this._opts.isReadOnly || this._effLoading()) {
      if (typeof console !== "undefined") {
        console.warn("[ArvoTimePicker] open() ignored while disabled / readOnly / loading.");
      }
      return;
    }
    if (((_b = (_a = this._opts).onOpen) == null ? void 0 : _b.call(_a)) === false) return;
    const ev = new CustomEvent("tp:open", { bubbles: true, cancelable: true });
    if (((_c = this._element) == null ? void 0 : _c.dispatchEvent(ev)) === false) return;
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
        trigger: (this._useAnchorRender ? this._anchorEl : this._fieldEl) ?? null,
        mount: {
          // The engine appends to body on open and removes on close, mirroring
          // the React portal's isMounted gate (the popover is only in the DOM
          // while the surface is open; the SCSS display: flex rule applies
          // unconditionally and requires no ancestor .open selector gate).
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
          // initial focus set imperatively via rAF below
          returnFocus: false,
          // picker manages focus return manually
          getOrderedElements: () => this._getOrderedPopoverElements()
        },
        transition: "fade",
        transitionDuration: 150,
        // The engine writes aria-haspopup / aria-controls / aria-expanded on
        // the trigger element (the field div in input mode, the anchor in
        // anchor mode). axe rejects aria-haspopup on a generic <div>
        // (aria-allowed-attr), and the picker already wires the canonical
        // combobox ARIA on the role="combobox" <input> (input mode) and on
        // the anchor element (anchor mode). Disable the engine writes so
        // there is a single source of truth -- same strategy as DatePicker.
        triggerAria: false,
        onClose: this._handleEngineClose
      });
    } else if (this._surface) {
      this._surface.setTrigger(
        (this._useAnchorRender ? this._anchorEl : this._fieldEl) ?? null
      );
    }
    void ((_e = this._surface) == null ? void 0 : _e.open());
    this._syncRootClasses();
    (_f = this._triggerBtn) == null ? void 0 : _f.selected(true);
    (_g = this._triggerBtnEl) == null ? void 0 : _g.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => {
      var _a2, _b2;
      (_b2 = (_a2 = this._popoverEl) == null ? void 0 : _a2.querySelector('[tabindex="0"]')) == null ? void 0 : _b2.focus({ preventScroll: true });
    });
  }
  close() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (this._destroyed) return;
    if (!this._isOpen) return;
    if (((_b = (_a = this._opts).onClose) == null ? void 0 : _b.call(_a)) === false) return;
    const ev = new CustomEvent("tp:close", { bubbles: true, cancelable: true });
    if (((_c = this._element) == null ? void 0 : _c.dispatchEvent(ev)) === false) return;
    this._isOpen = false;
    this._closingProgrammatically = true;
    void ((_d = this._surface) == null ? void 0 : _d.close());
    this._closingProgrammatically = false;
    this._syncRootClasses();
    (_e = this._triggerBtn) == null ? void 0 : _e.selected(false);
    (_f = this._triggerBtnEl) == null ? void 0 : _f.setAttribute("aria-expanded", "false");
    if (this._useAnchorRender) (_g = this._anchorEl) == null ? void 0 : _g.focus();
    else (_h = this._inputEl) == null ? void 0 : _h.focus({ preventScroll: true });
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
    if (arguments.length === 0) return this._committedValue;
    const coerced = clampToRange(this._asTime(v), this._asTime(this._opts.minTime), this._asTime(this._opts.maxTime));
    this._handleCommit(coerced);
  }
  formattedValue() {
    return this._committedValue ? core.formatTime(this._committedValue, this._effFormat) : "";
  }
  clear() {
    var _a;
    (_a = this._segmentCtrl) == null ? void 0 : _a.setValue(null, { silent: true });
    this._handleCommit(null);
  }
  disabled(state) {
    var _a;
    if (state === void 0) return this._opts.isDisabled;
    if (state === this._opts.isDisabled) return;
    this._opts.isDisabled = state;
    if (state && this._isOpen) this.close();
    (_a = this._timeDropdown) == null ? void 0 : _a.disabled(state || this._opts.isReadOnly || this._effLoading());
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
    var _a;
    (_a = this._useAnchorRender ? this._anchorEl : this._inputEl) == null ? void 0 : _a.focus();
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    if (this._destroyed) return;
    this._destroyed = true;
    (_a = this._surface) == null ? void 0 : _a.destroy();
    this._surface = null;
    this._isOpen = false;
    (_b = this._resizeObserver) == null ? void 0 : _b.disconnect();
    this._resizeObserver = null;
    (_c = this._loadingObserver) == null ? void 0 : _c.disconnect();
    this._loadingObserver = null;
    (_d = this._segmentCtrl) == null ? void 0 : _d.destroy();
    this._segmentCtrl = null;
    (_e = this._clearBtn) == null ? void 0 : _e.destroy();
    this._clearBtn = null;
    (_f = this._triggerBtn) == null ? void 0 : _f.destroy();
    this._triggerBtn = null;
    (_g = this._errIco) == null ? void 0 : _g.destroy();
    this._errIco = null;
    (_h = this._errIcoConnector) == null ? void 0 : _h.destroy();
    this._errIcoConnector = null;
    (_i = this._inlineAlert) == null ? void 0 : _i.destroy();
    this._inlineAlert = null;
    (_j = this._timeDropdown) == null ? void 0 : _j.destroy();
    this._timeDropdown = null;
    (_k = this._popoverEl) == null ? void 0 : _k.remove();
    this._popoverEl = null;
    this._timeDropdownHostEl = null;
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
    this._element = null;
    this._anchorEl = null;
    this._labelEl = null;
    this._fieldEl = null;
    this._inputEl = null;
    this._actionsEl = null;
    this._clearBtnEl = null;
    this._triggerBtnEl = null;
    this._errIcoEl = null;
    this._errMsgEl = null;
    this._bodyEl = null;
  }
}
exports.ArvoTimePicker = ArvoTimePicker;
//# sourceMappingURL=TimePicker.cjs.map
