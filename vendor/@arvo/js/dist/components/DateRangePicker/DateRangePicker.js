import { getUserLocale, getLocaleDateFormat, pickAnchorDate, buildMemberIndex, findMemberForDate, formatDate, isAfterDay, rollingRangeToMembers, createOverlaySurface, applyPositionToSurface, addMonths, rollingIncludedMessage, isBeforeDay, resolveCurrentMember, getAdjacentMember, createSegmentController, parseDate, isSameDay } from "@arvo/core";
import { ArvoFormLabel } from "../FormLabel/FormLabel.js";
import { ArvoIconButton } from "../IconButton/IconButton.js";
import { ArvoButton } from "../Button/Button.js";
import { ArvoButtonGroup } from "../ButtonGroup/ButtonGroup.js";
import { ArvoSwitch } from "../Switch/Switch.js";
import { ArvoMessageAlert } from "../MessageAlert/MessageAlert.js";
import { ArvoNumberInput } from "../NumberInput/NumberInput.js";
import { ArvoCalendar } from "../Calendar/Calendar.js";
let _idCounter = 0;
const EM_DASH = "—";
const RIGHT_ARROW = "→";
const ZERO_ROLLING = { startOffset: 0, endOffset: 0 };
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
function sameRange(a, b) {
  return sameDay(a.start, b.start) && sameDay(a.end, b.end);
}
function sameRolling(a, b) {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return a.startOffset === b.startOffset && a.endOffset === b.endOffset;
}
function clampToBounds(v, min, max) {
  if (v == null) return null;
  if (min && v.getTime() < min.getTime()) return new Date(min.getTime());
  if (max && v.getTime() > max.getTime()) return new Date(max.getTime());
  return v;
}
function orderedRange(a, b) {
  return isAfterDay(a, b) ? [b, a] : [a, b];
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
class ArvoDateRangePicker {
  constructor(element, options = {}) {
    this._appliedRange = { start: null, end: null };
    this._draftRange = { start: null, end: null };
    this._draftFirstSet = false;
    this._hoverDate = null;
    this._appliedRolling = null;
    this._draftRolling = { ...ZERO_ROLLING };
    this._memberToggle = false;
    this._tab = "absolute";
    this._isOpen = false;
    this._viewMode = "days";
    this._errorOverride = null;
    this._loadingOverride = null;
    this._memberIndex = null;
    this._useAnchorRender = false;
    this._anchorEl = null;
    this._labelEl = null;
    this._fieldEl = null;
    this._inputEl = null;
    this._endInputEl = null;
    this._valueEl = null;
    this._arrowEl = null;
    this._segDividerEl = null;
    this._startCtrl = null;
    this._endCtrl = null;
    this._focusedSide = null;
    this._actionsEl = null;
    this._clearBtnEl = null;
    this._triggerBtnEl = null;
    this._errIcoEl = null;
    this._errMsgEl = null;
    this._borderEl = null;
    this._popoverEl = null;
    this._modeAnnouncerEl = null;
    this._headerEl = null;
    this._bodyEl = null;
    this._footerEl = null;
    this._calLeftHostEl = null;
    this._calRightHostEl = null;
    this._calSepEl = null;
    this._tilePanelEl = null;
    this._mtgScrollEl = null;
    this._mtgGridEl = null;
    this._rollingSettingEl = null;
    this._rollingStartHostEl = null;
    this._rollingEndHostEl = null;
    this._infoAlertHostEl = null;
    this._currentIndEl = null;
    this._switchHostEl = null;
    this._tabsHostEl = null;
    this._prevBtnEl = null;
    this._nextBtnEl = null;
    this._todayBtnEl = null;
    this._clearBtn = null;
    this._triggerBtn = null;
    this._errIco = null;
    this._inlineAlert = null;
    this._infoAlert = null;
    this._calLeft = null;
    this._calRight = null;
    this._switch = null;
    this._tabs = null;
    this._rollingStart = null;
    this._rollingEnd = null;
    this._prevBtn = null;
    this._nextBtn = null;
    this._todayBtn = null;
    this._saveBtn = null;
    this._cancelBtn = null;
    this._calNavLeftZoneEl = null;
    this._monthBtnL = null;
    this._yearBtnL = null;
    this._monthBtnR = null;
    this._yearBtnR = null;
    this._calNavLeftEl = null;
    this._calNavRightEl = null;
    this._calNavEmDashEl = null;
    this._periodLblPrimaryEl = null;
    this._periodLblSecondaryEl = null;
    this._periodSepEl = null;
    this._firstVisibleMember = null;
    this._lastVisibleMember = null;
    this._mtgScrollResizeObserver = null;
    this._boundMtgScroll = null;
    this._mtgScrollRafId = null;
    this._resizeObserver = null;
    this._popoverWrapperEl = null;
    this._surface = null;
    this._closingProgrammatically = false;
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
        (_c = this._anchorEl) == null ? void 0 : _c.focus({ preventScroll: true });
      } else {
        (_d = this._inputEl) == null ? void 0 : _d.focus({ preventScroll: true });
      }
    };
    if (!(element instanceof HTMLElement)) {
      throw new TypeError(
        "[ArvoDateRangePicker] initialize() requires an HTMLElement."
      );
    }
    this._element = element;
    this._opts = {
      startValue: options.startValue,
      endValue: options.endValue,
      format: options.format ?? null,
      locale: options.locale ?? null,
      weekStart: options.weekStart ?? 0,
      hasWeeks: options.hasWeeks ?? true,
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
      frequency: options.frequency ?? null,
      memberData: options.memberData ?? null,
      currentMemberIndex: options.currentMemberIndex ?? null,
      hasModeToggle: options.hasModeToggle ?? true,
      hasRolling: options.hasRolling ?? false,
      rollingPrefix: options.rollingPrefix ?? null,
      rollingValue: options.rollingValue ?? null,
      anchor: options.anchor ?? false,
      placement: options.placement ?? "bottom-end",
      calendarProps: options.calendarProps ?? null,
      popoverProps: options.popoverProps ?? null,
      onChange: options.onChange ?? null,
      onModeChange: options.onModeChange ?? null,
      onOpen: options.onOpen ?? null,
      onClose: options.onClose ?? null,
      onCancel: options.onCancel ?? null,
      onSave: options.onSave ?? null
    };
    this._effLocale = getUserLocale(this._opts.locale ?? void 0);
    this._effFormat = this._opts.format || getLocaleDateFormat(this._effLocale);
    this._memberIndex = this._buildMemberIndex();
    this._appliedRange = {
      start: clampToBounds(
        coerceDate(this._opts.startValue ?? null, this._effFormat, this._effLocale),
        this._effMinDate(),
        this._effMaxDate()
      ),
      end: clampToBounds(
        coerceDate(this._opts.endValue ?? null, this._effFormat, this._effLocale),
        this._effMinDate(),
        this._effMaxDate()
      )
    };
    this._draftRange = { ...this._appliedRange };
    this._appliedRolling = this._opts.rollingValue ?? null;
    this._draftRolling = this._opts.rollingValue ?? { ...ZERO_ROLLING };
    this._memberToggle = this._hasMemberCapability();
    this._tab = this._hasRollingCapability() && this._opts.rollingValue ? "rolling" : "absolute";
    const base = pickAnchorDate(
      this._appliedRange.start ?? this._appliedRange.end,
      this._effMinDate(),
      this._effMaxDate()
    );
    this._visibleYear = base.getFullYear();
    this._visibleMonth = base.getMonth();
    const idNum = ++_idCounter;
    this._id = `arvo-drp-${idNum}`;
    this._inputId = `${this._id}-input`;
    this._labelId = `${this._id}-lbl`;
    this._errorId = `${this._id}-err`;
    this._popoverId = `${this._id}-popover`;
    if (this._opts.anchor !== false && this._opts.anchor != null) {
      const resolved = resolveAnchorElement(this._opts.anchor, this._element);
      if (resolved) {
        this._useAnchorRender = true;
        this._anchorEl = resolved;
      } else if (typeof console !== "undefined") {
        console.warn(
          "[ArvoDateRangePicker] anchor did not resolve to an element; falling back to input mode."
        );
      }
    }
    this._boundInputKeyDown = (e) => this._handleSegKeyDown(this._segSideOf(e.currentTarget), e);
    this._boundSegFocus = (e) => this._handleSegFocus(this._segSideOf(e.currentTarget));
    this._boundSegBlur = (e) => this._handleSegBlur(this._segSideOf(e.currentTarget));
    this._boundSegMouseDown = (e) => this._handleSegMouseDown(this._segSideOf(e.currentTarget));
    this._boundSegPaste = (e) => this._handleSegPaste(this._segSideOf(e.currentTarget), e);
    this._boundPopoverKeyDown = this._handlePopoverKeyDown.bind(this);
    this._boundAnchorClick = this._handleAnchorClick.bind(this);
    this._boundAnchorKeyDown = this._handleAnchorKeyDown.bind(this);
    if (this._useAnchorRender) {
      this._renderDomAnchor();
    } else {
      this._renderDomInput();
      this._observeActions();
    }
    this._applyWidth();
    this._syncRootClasses();
    this._updateInputDisplay();
  }
  static initialize(element, options) {
    return new ArvoDateRangePicker(element, options ?? {});
  }
  // -------------------------------------------------------------------------
  // Capability helpers
  // -------------------------------------------------------------------------
  _hasMemberCapability() {
    return Boolean(
      this._opts.memberData && this._opts.memberData.length > 0 && this._opts.frequency
    );
  }
  _hasRollingCapability() {
    return Boolean(this._opts.hasRolling && this._hasMemberCapability());
  }
  _activeMode() {
    if (this._hasRollingCapability() && this._tab === "rolling") return "rolling";
    if (this._hasMemberCapability() && this._memberToggle) return "member";
    return "absolute";
  }
  _buildMemberIndex() {
    if (!this._hasMemberCapability()) return null;
    return buildMemberIndex(this._opts.memberData, {
      frequency: this._opts.frequency,
      currentMemberIndex: this._opts.currentMemberIndex ?? null
    });
  }
  _findMemberFor(date) {
    if (!date || !this._memberIndex) return null;
    return findMemberForDate(this._memberIndex, date);
  }
  /**
   * Resolve the member that owns the bucket containing `date`. Returns `null`
   * when the date is outside the configured member span (used both as a
   * validation gate and as the source of truth for input/tile display name).
   */
  _resolveMemberSnap(date) {
    if (!date || !this._memberIndex) return null;
    return findMemberForDate(this._memberIndex, date);
  }
  /**
   * Snap an arbitrary in-bucket date to the canonical edge of its member:
   *   - `start` -> member.keyDate
   *   - `end`   -> member.endDate
   * Returns `null` when the date does not match any bucket so callers can
   * revert to the previously valid value (parity with legacy behavior).
   */
  _snapDateToMember(date, edge) {
    const m = this._resolveMemberSnap(date);
    if (!m) return null;
    return edge === "start" ? m.keyDate : m.endDate;
  }
  /**
   * Effective min/max dates: when member capability is configured, the picker
   * is hard-bounded by the member span (first.keyDate .. last.endDate). User-
   * supplied min/max can only NARROW that span -- never widen past members.
   */
  _effMinDate() {
    var _a;
    const userMin = this._asDate(this._opts.minDate);
    const memberMin = ((_a = this._memberIndex) == null ? void 0 : _a.minDate) ?? null;
    if (memberMin && userMin)
      return userMin.getTime() > memberMin.getTime() ? userMin : memberMin;
    return memberMin ?? userMin;
  }
  _effMaxDate() {
    var _a;
    const userMax = this._asDate(this._opts.maxDate);
    const memberMax = ((_a = this._memberIndex) == null ? void 0 : _a.maxDate) ?? null;
    if (memberMax && userMax)
      return userMax.getTime() < memberMax.getTime() ? userMax : memberMax;
    return memberMax ?? userMax;
  }
  _effError() {
    if (this._errorOverride != null) return this._errorOverride;
    if (this._opts.isInvalid) return this._opts.errorMsg ?? null;
    return null;
  }
  _effLoading() {
    return this._loadingOverride ?? this._opts.isLoading;
  }
  _asDate(v) {
    return coerceDate(v, this._effFormat, this._effLocale);
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
        for: `${this._inputId}-start`,
        isRequired: this._opts.isRequired,
        contextHelp: this._opts.contextHelp,
        isDisabled: this._opts.isDisabled,
        // Mirror React: `has-error` flips when isInvalid OR an imperative
        // setError() override is active, so the label's invalid styling
        // tracks both signals.
        isInvalid: this._opts.isInvalid || this._effError() != null
      }).el;
      this._labelEl.id = this._labelId;
      this._labelEl.classList.add("arvo-drp__lbl");
      root.appendChild(this._labelEl);
    }
    this._fieldEl = document.createElement("div");
    this._fieldEl.className = "arvo-drp__field";
    this._valueEl = document.createElement("div");
    this._valueEl.className = "arvo-drp__value";
    this._inputEl = this._buildSegInput("start");
    this._arrowEl = document.createElement("span");
    this._arrowEl.className = "arvo-drp__arrow";
    this._arrowEl.setAttribute("aria-hidden", "true");
    this._arrowEl.textContent = RIGHT_ARROW;
    this._endInputEl = this._buildSegInput("end");
    this._valueEl.appendChild(this._inputEl);
    this._valueEl.appendChild(this._arrowEl);
    this._valueEl.appendChild(this._endInputEl);
    this._fieldEl.appendChild(this._valueEl);
    this._actionsEl = document.createElement("div");
    this._actionsEl.className = "arvo-drp__actions";
    this._fieldEl.appendChild(this._actionsEl);
    this._borderEl = document.createElement("div");
    this._borderEl.className = "arvo-drp__border";
    this._fieldEl.appendChild(this._borderEl);
    root.appendChild(this._fieldEl);
    this._renderActions();
    this._renderInlineError();
    this._updateInputDisplay();
  }
  // Builds one isSegmented date input (start | end) with shared attributes and
  // listeners. The bound handlers infer the side from the event target.
  _buildSegInput(side) {
    const input = document.createElement("input");
    input.type = "text";
    input.id = `${this._inputId}-${side}`;
    input.className = `arvo-drp__seg arvo-drp__seg--${side}`;
    input.setAttribute("role", "combobox");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("aria-haspopup", "dialog");
    input.setAttribute("aria-expanded", String(this._isOpen));
    input.setAttribute("aria-controls", this._popoverId);
    input.setAttribute("aria-label", `${this._fieldLabel()} ${side}`);
    input.readOnly = !this._isAbsoluteEditable();
    const ph = this._segPlaceholder();
    if (ph) input.placeholder = ph;
    if (this._opts.isDisabled) {
      input.disabled = true;
      input.setAttribute("aria-disabled", "true");
    }
    if (side === "start" && this._opts.isRequired) {
      input.setAttribute("aria-required", "true");
    }
    if (this._opts.isInvalid || this._effError() != null) {
      input.setAttribute("aria-invalid", "true");
    }
    if (side === "start" && this._effLoading()) input.setAttribute("aria-busy", "true");
    input.addEventListener("keydown", this._boundInputKeyDown);
    input.addEventListener("focus", this._boundSegFocus);
    input.addEventListener("blur", this._boundSegBlur);
    input.addEventListener("mousedown", this._boundSegMouseDown);
    input.addEventListener("paste", this._boundSegPaste);
    return input;
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
  // Build the actions overlay (clear + err-ico + trigger-btn).
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
    this._segDividerEl = null;
    this._actionsEl.textContent = "";
    const hasValue = this._appliedRange.start != null || this._appliedRange.end != null;
    const disabled = this._opts.isDisabled;
    const readonly = this._opts.isReadOnly;
    const loading = this._effLoading();
    const err = this._effError();
    const showTooltipIcon = err != null && this._opts.errorDisplay === "tooltip";
    const showClear = this._opts.isClearable === true && hasValue && !disabled && !readonly && !loading && !showTooltipIcon;
    const showSep = !loading && (showClear || showTooltipIcon);
    if (showClear) {
      this._clearBtnEl = document.createElement("button");
      this._clearBtnEl.classList.add("arvo-drp__clear-btn");
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
      this._errIcoEl.classList.add("arvo-drp__err-ico");
      this._actionsEl.appendChild(this._errIcoEl);
    }
    if (showSep) {
      this._segDividerEl = document.createElement("span");
      this._segDividerEl.className = "arvo-drp__seg-divider";
      this._segDividerEl.setAttribute("aria-hidden", "true");
      this._actionsEl.appendChild(this._segDividerEl);
    }
    if (!loading) {
      this._triggerBtnEl = document.createElement("button");
      this._triggerBtnEl.classList.add("arvo-drp__trigger-btn");
      this._triggerBtnEl.setAttribute("aria-haspopup", "dialog");
      this._triggerBtnEl.setAttribute("aria-controls", this._popoverId);
      this._triggerBtnEl.setAttribute("aria-expanded", String(this._isOpen));
      this._actionsEl.appendChild(this._triggerBtnEl);
      this._triggerBtn = ArvoIconButton.initialize(this._triggerBtnEl, {
        variant: "tertiary",
        size: "sm",
        icon: "calendar-o",
        tooltip: "Select start and end date",
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
        this._errMsgEl.classList.add("arvo-drp__err-msg");
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
  // Width + padding
  // -------------------------------------------------------------------------
  _applyWidth() {
    if (!this._element) return;
    const w = this._opts.isFullWidth ? "100%" : this._opts.width;
    if (w) this._element.style.setProperty("--arvo-form-input-width", w);
    else this._element.style.removeProperty("--arvo-form-input-width");
  }
  _observeActions() {
    if (!this._actionsEl) return;
    if (typeof ResizeObserver === "undefined") return;
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
  // -------------------------------------------------------------------------
  // Class composition
  // -------------------------------------------------------------------------
  _syncRootClasses() {
    if (!this._element) return;
    const opts = this._opts;
    const err = this._effError();
    const loading = this._effLoading();
    const hasValue = this._appliedRange.start != null || this._appliedRange.end != null;
    const mode = this._activeMode();
    const classes = [
      "arvo-drp",
      `arvo-drp--${opts.size}`,
      `arvo-drp--surface-${opts.surface}`,
      `arvo-drp--${mode}`,
      opts.isFullWidth && "arvo-drp--full-width",
      opts.hasWeeks && "arvo-drp--show-weeks",
      this._useAnchorRender && "arvo-drp--anchor-mode",
      loading && "loading",
      opts.isDisabled && "is-disabled",
      opts.isReadOnly && "is-readonly",
      err != null && "has-error",
      err != null && opts.errorDisplay === "tooltip" && "error-tooltip",
      hasValue && "has-value",
      this._focusedSide != null && "has-text-selected",
      this._isOpen && "open"
    ].filter(Boolean);
    this._element.className = classes.join(" ");
    for (const input of [this._inputEl, this._endInputEl]) {
      if (!input) continue;
      input.setAttribute("aria-expanded", String(this._isOpen));
      if (opts.isInvalid || err != null) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
      if (input === this._inputEl) {
        if (loading) input.setAttribute("aria-busy", "true");
        else input.removeAttribute("aria-busy");
      }
      if (opts.isDisabled) {
        input.disabled = true;
        input.setAttribute("aria-disabled", "true");
      } else {
        input.disabled = false;
        input.removeAttribute("aria-disabled");
      }
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
   * `--arvo-drp-popover-*` CSS variable cascade matches React's
   * `popoverRootClass` wrapper (`arvo-drp`, size, mode, --full-width,
   * --show-weeks, loading). Called from _syncRootClasses() and _buildPopover().
   */
  _syncPopoverWrapperClasses() {
    if (!this._popoverWrapperEl) return;
    const opts = this._opts;
    const loading = this._effLoading();
    const mode = this._activeMode();
    const cls = [
      "arvo-drp",
      `arvo-drp--${opts.size}`,
      `arvo-drp--${mode}`,
      opts.isFullWidth && "arvo-drp--full-width",
      opts.hasWeeks && "arvo-drp--show-weeks",
      // --anchor-mode is intentionally omitted here; it belongs on the field
      // root only (mirrors React's popoverRootClass which also omits it).
      loading && "loading"
    ].filter(Boolean);
    this._popoverWrapperEl.className = cls.join(" ");
  }
  // -------------------------------------------------------------------------
  // Display value
  // -------------------------------------------------------------------------
  _fieldLabel() {
    return this._opts.label ?? "Date range";
  }
  _segPlaceholder() {
    return this._opts.placeholder ?? this._effFormat;
  }
  // Segmented editing is wired only in absolute mode and only when interactive;
  // member / rolling inputs are read-only resolved labels.
  _isAbsoluteEditable() {
    return (this._opts.isSegmented ?? true) && this._activeMode() === "absolute" && !this._opts.isReadOnly && !this._opts.isDisabled;
  }
  // Read-only per-side text for member / rolling modes (or non-editable absolute).
  _baseSideText(side) {
    if (this._appliedRolling && !this._appliedRange.start && !this._appliedRange.end) {
      const off = side === "start" ? this._appliedRolling.startOffset : this._appliedRolling.endOffset;
      const prefix = this._opts.rollingPrefix ?? "";
      return off > 0 ? `${prefix} +${off}` : `${prefix} ${off}`;
    }
    const d = side === "start" ? this._appliedRange.start : this._appliedRange.end;
    if (!d) return "";
    if (this._hasMemberCapability()) {
      const m = this._findMemberFor(d);
      if (m) return m.displayName;
    }
    return formatDate(d, this._effFormat, this._effLocale);
  }
  _segSideOf(target) {
    return target === this._endInputEl ? "end" : "start";
  }
  _segCtrl(side) {
    return side === "start" ? this._startCtrl : this._endCtrl;
  }
  _segInputEl(side) {
    return side === "start" ? this._inputEl : this._endInputEl;
  }
  _initSegmentControllers() {
    const minD = this._effMinDate();
    const maxD = this._effMaxDate();
    const make = (side) => {
      const ctrl = createSegmentController({
        format: this._effFormat,
        locale: this._effLocale,
        value: side === "start" ? this._appliedRange.start : this._appliedRange.end,
        min: minD,
        max: maxD,
        commit: "blur"
      });
      ctrl.on(
        "commit",
        (p) => this._commitSide(side, p.date)
      );
      ctrl.on("segment", () => {
        this._syncSegHasTextSelected();
        this._restoreSegCaret();
      });
      ctrl.on("change", () => this._refreshSeg(side));
      return ctrl;
    };
    this._startCtrl = make("start");
    this._endCtrl = make("end");
    this._refreshSeg("start");
    this._refreshSeg("end");
  }
  _destroySegmentControllers() {
    var _a, _b;
    (_a = this._startCtrl) == null ? void 0 : _a.destroy();
    (_b = this._endCtrl) == null ? void 0 : _b.destroy();
    this._startCtrl = null;
    this._endCtrl = null;
  }
  _refreshSeg(side) {
    const ctrl = this._segCtrl(side);
    const input = this._segInputEl(side);
    if (!ctrl || !input) return;
    input.value = ctrl.getFormattedDisplay(this._focusedSide === side);
  }
  _commitSide(side, date) {
    const cur = this._appliedRange;
    let resolved = date;
    if (this._hasMemberCapability() && date != null) {
      const snapped = this._snapDateToMember(date, side);
      if (snapped == null) {
        resolved = side === "start" ? cur.start : cur.end;
        const ctrl = this._segCtrl(side);
        if (ctrl) ctrl.setValue(resolved, { silent: true });
        this._updateInputDisplay();
        return;
      }
      resolved = snapped;
    }
    const next = side === "start" ? { start: resolved, end: cur.end } : { start: cur.start, end: resolved };
    this._commitRange(next, "absolute");
  }
  _syncSegHasTextSelected() {
    var _a;
    (_a = this._element) == null ? void 0 : _a.classList.toggle("has-text-selected", this._focusedSide != null);
  }
  _restoreSegCaret() {
    if (!this._isAbsoluteEditable()) return;
    const side = this._focusedSide;
    if (!side) return;
    const ctrl = this._segCtrl(side);
    const input = this._segInputEl(side);
    if (!ctrl || !input) return;
    const seg = ctrl.getFocusedSegment();
    if (!seg) return;
    try {
      input.setSelectionRange(seg.startOffset, seg.endOffset);
    } catch {
    }
  }
  _focusEndFirst() {
    var _a, _b;
    (_a = this._endInputEl) == null ? void 0 : _a.focus();
    (_b = this._endCtrl) == null ? void 0 : _b.focusSegment(0);
  }
  _focusStartLast() {
    var _a, _b, _c;
    (_a = this._inputEl) == null ? void 0 : _a.focus();
    const segs = ((_b = this._startCtrl) == null ? void 0 : _b.getValue().segments) ?? [];
    (_c = this._startCtrl) == null ? void 0 : _c.focusSegment(Math.max(0, segs.length - 1));
  }
  _handleSegFocus(side) {
    this._focusedSide = side;
    if (!this._isAbsoluteEditable()) return;
    const ctrl = this._segCtrl(side);
    const input = this._segInputEl(side);
    if (!ctrl || !input) return;
    input.value = ctrl.getFormattedDisplay(true);
    ctrl.focusSegment(0);
    this._syncSegHasTextSelected();
    this._restoreSegCaret();
  }
  _handleSegBlur(side) {
    if (this._focusedSide === side) this._focusedSide = null;
    const input = this._segInputEl(side);
    if (input) {
      if (this._hasMemberCapability()) {
        input.value = this._baseSideText(side);
      } else {
        const ctrl = this._segCtrl(side);
        if (this._isAbsoluteEditable() && ctrl) {
          input.value = ctrl.getFormattedDisplay(false);
        }
      }
    }
    this._syncSegHasTextSelected();
  }
  /**
   * Click-to-segment. Mirrors the single-input pickers but per-side because
   * the DRP carries two segment controllers. See DatePicker.ts for the rAF
   * rationale.
   */
  _handleSegMouseDown(side) {
    if (!this._isAbsoluteEditable()) return;
    const input = this._segInputEl(side);
    if (!input) return;
    requestAnimationFrame(() => {
      if (document.activeElement !== input) return;
      const ctrl = this._segCtrl(side);
      if (!ctrl) return;
      const offset = input.selectionStart ?? null;
      if (offset === null) return;
      const idx = ctrl.findSegmentForOffset(offset);
      if (idx !== null) {
        ctrl.focusSegment(idx);
        this._restoreSegCaret();
      }
    });
  }
  _handleSegPaste(side, e) {
    var _a;
    const ctrl = this._segCtrl(side);
    if (!this._isAbsoluteEditable() || !ctrl) return;
    const text = ((_a = e.clipboardData) == null ? void 0 : _a.getData("text")) ?? "";
    const res = ctrl.handlePaste(text);
    if (res.consumed) e.preventDefault();
  }
  _updateInputDisplay() {
    var _a;
    const editable = this._isAbsoluteEditable();
    const overrideWithMemberName = this._hasMemberCapability();
    if (this._inputEl) this._inputEl.readOnly = !editable;
    if (this._endInputEl) this._endInputEl.readOnly = !editable;
    if (editable) {
      if (!this._startCtrl) {
        this._initSegmentControllers();
      } else {
        this._startCtrl.setValue(this._appliedRange.start, { silent: true });
        (_a = this._endCtrl) == null ? void 0 : _a.setValue(this._appliedRange.end, { silent: true });
      }
      if (overrideWithMemberName) {
        if (this._focusedSide !== "start" && this._inputEl) {
          this._inputEl.value = this._baseSideText("start");
        }
        if (this._focusedSide !== "end" && this._endInputEl) {
          this._endInputEl.value = this._baseSideText("end");
        }
      } else {
        if (this._focusedSide !== "start") this._refreshSeg("start");
        if (this._focusedSide !== "end") this._refreshSeg("end");
      }
    } else {
      this._destroySegmentControllers();
      if (this._inputEl) this._inputEl.value = this._baseSideText("start");
      if (this._endInputEl) this._endInputEl.value = this._baseSideText("end");
    }
  }
  // -------------------------------------------------------------------------
  // Commit / dispatch
  // -------------------------------------------------------------------------
  _commitRange(next, mode) {
    var _a, _b, _c;
    const minD = this._effMinDate();
    const maxD = this._effMaxDate();
    const clamped = {
      start: clampToBounds(next.start, minD, maxD),
      end: clampToBounds(next.end, minD, maxD)
    };
    if (clamped.start && clamped.end && isAfterDay(clamped.start, clamped.end)) {
      const [s, e] = orderedRange(clamped.start, clamped.end);
      clamped.start = s;
      clamped.end = e;
    }
    const changed = !sameRange(clamped, this._appliedRange);
    const previouslyRolling = this._appliedRolling;
    if (mode !== "rolling") {
      this._appliedRolling = null;
    }
    if (!changed && !previouslyRolling) return false;
    this._appliedRange = clamped;
    this._updateInputDisplay();
    this._renderActions();
    this._syncRootClasses();
    const formattedStart = clamped.start ? formatDate(clamped.start, this._effFormat, this._effLocale) : "";
    const formattedEnd = clamped.end ? formatDate(clamped.end, this._effFormat, this._effLocale) : "";
    const memberRange = this._hasMemberCapability() ? {
      start: this._findMemberFor(clamped.start),
      end: this._findMemberFor(clamped.end)
    } : void 0;
    const payload = {
      start: clamped.start,
      end: clamped.end,
      formatted: { start: formattedStart, end: formattedEnd },
      mode,
      memberRange
    };
    (_b = (_a = this._opts).onChange) == null ? void 0 : _b.call(_a, payload);
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(
      new CustomEvent("drp:change", {
        bubbles: true,
        cancelable: false,
        detail: payload
      })
    );
    return true;
  }
  _commitRolling(range) {
    var _a, _b, _c, _d, _e;
    if (!this._memberIndex) return false;
    const resolved = rollingRangeToMembers(this._memberIndex, range);
    const next = {
      start: ((_a = resolved.start) == null ? void 0 : _a.keyDate) ?? null,
      end: ((_b = resolved.end) == null ? void 0 : _b.keyDate) ?? null
    };
    const changed = !sameRange(next, this._appliedRange) || !sameRolling(range, this._appliedRolling);
    this._appliedRange = next;
    this._appliedRolling = range;
    this._updateInputDisplay();
    this._renderActions();
    this._syncRootClasses();
    const payload = {
      start: next.start,
      end: next.end,
      formatted: {
        start: next.start ? formatDate(next.start, this._effFormat, this._effLocale) : "",
        end: next.end ? formatDate(next.end, this._effFormat, this._effLocale) : ""
      },
      mode: "rolling",
      memberRange: { start: resolved.start, end: resolved.end },
      rollingValue: range
    };
    if (changed) {
      (_d = (_c = this._opts).onChange) == null ? void 0 : _d.call(_c, payload);
      (_e = this._element) == null ? void 0 : _e.dispatchEvent(
        new CustomEvent("drp:change", {
          bubbles: true,
          cancelable: false,
          detail: payload
        })
      );
    }
    return changed;
  }
  // -------------------------------------------------------------------------
  // Open / close
  // -------------------------------------------------------------------------
  open() {
    var _a, _b, _c, _d, _e, _f, _g;
    if (this._destroyed) return;
    if (this._isOpen) return;
    if (this._opts.isDisabled || this._effLoading() || this._opts.isReadOnly) return;
    if (((_b = (_a = this._opts).onOpen) == null ? void 0 : _b.call(_a)) === false) return;
    const evt = new CustomEvent("drp:open", { bubbles: true, cancelable: true });
    const proceed = (_c = this._element) == null ? void 0 : _c.dispatchEvent(evt);
    if (proceed === false) return;
    if (this._hasRollingCapability() && this._appliedRolling) {
      this._tab = "rolling";
      this._draftRolling = { ...this._appliedRolling };
    } else {
      this._tab = "absolute";
    }
    const center = pickAnchorDate(
      this._appliedRange.start ?? this._appliedRange.end,
      this._effMinDate(),
      this._effMaxDate()
    );
    this._visibleYear = center.getFullYear();
    this._visibleMonth = center.getMonth();
    this._viewMode = "days";
    this._draftRange = { ...this._appliedRange };
    this._draftFirstSet = false;
    this._hoverDate = null;
    this._isOpen = true;
    if (this._memberIndex && this._memberIndex.members.length > 0) {
      this._firstVisibleMember = this._memberIndex.members[0];
      const lastIndex = Math.min(2, this._memberIndex.members.length - 1);
      this._lastVisibleMember = this._memberIndex.members[lastIndex];
    } else {
      this._firstVisibleMember = null;
      this._lastVisibleMember = null;
    }
    this._buildPopover();
    this._renderPopover();
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
        // The engine writes aria-haspopup / aria-controls / aria-expanded on
        // the trigger element. The picker already wires the canonical combobox
        // ARIA on the role="combobox" inputs and on the anchor element.
        // Disable the engine writes so there is a single source of truth --
        // same strategy as DatePicker, TimePicker, and DateTimePicker.
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
  }
  close() {
    var _a, _b, _c, _d, _e, _f;
    if (this._destroyed) return;
    if (!this._isOpen) return;
    if (((_b = (_a = this._opts).onClose) == null ? void 0 : _b.call(_a)) === false) return;
    const evt = new CustomEvent("drp:close", { bubbles: true, cancelable: true });
    const proceed = (_c = this._element) == null ? void 0 : _c.dispatchEvent(evt);
    if (proceed === false) return;
    this._draftRange = { ...this._appliedRange };
    this._draftFirstSet = false;
    this._hoverDate = null;
    this._isOpen = false;
    this._closingProgrammatically = true;
    void ((_d = this._surface) == null ? void 0 : _d.close());
    this._closingProgrammatically = false;
    this._syncRootClasses();
    (_e = this._triggerBtn) == null ? void 0 : _e.selected(false);
    (_f = this._triggerBtnEl) == null ? void 0 : _f.setAttribute("aria-expanded", "false");
    const focusTarget = this._anchorEl ?? this._inputEl;
    if (focusTarget) {
      const f = focusTarget;
      requestAnimationFrame(() => f.focus({ preventScroll: true }));
    }
  }
  toggle(force) {
    if (force === void 0) {
      if (this._isOpen) this.close();
      else this.open();
    } else if (force) this.open();
    else this.close();
  }
  // -------------------------------------------------------------------------
  // Popover lifecycle
  // -------------------------------------------------------------------------
  _buildPopover() {
    var _a;
    if (this._popoverEl) return;
    this._popoverEl = document.createElement("div");
    this._popoverEl.id = this._popoverId;
    this._popoverEl.className = "arvo-drp__popover";
    this._popoverEl.setAttribute("role", "dialog");
    this._popoverEl.setAttribute("aria-label", this._popoverAriaLabel());
    this._popoverEl.setAttribute("aria-modal", "false");
    this._popoverEl.setAttribute("tabindex", "-1");
    this._popoverEl.style.position = "fixed";
    this._popoverEl.style.top = "0";
    this._popoverEl.style.left = "0";
    this._popoverEl.style.margin = "0";
    if ((_a = this._opts.popoverProps) == null ? void 0 : _a.width) {
      this._popoverEl.style.width = this._opts.popoverProps.width;
    }
    this._popoverEl.addEventListener("keydown", this._boundPopoverKeyDown);
    this._modeAnnouncerEl = document.createElement("span");
    this._modeAnnouncerEl.className = "arvo-sr-only";
    this._modeAnnouncerEl.setAttribute("aria-live", "polite");
    this._modeAnnouncerEl.setAttribute("aria-atomic", "true");
    this._popoverEl.appendChild(this._modeAnnouncerEl);
    this._headerEl = document.createElement("div");
    this._headerEl.className = "arvo-cal-nav arvo-drp__header";
    this._popoverEl.appendChild(this._headerEl);
    this._bodyEl = document.createElement("div");
    this._bodyEl.className = "arvo-drp__body";
    this._popoverEl.appendChild(this._bodyEl);
    this._popoverWrapperEl = document.createElement("div");
    this._popoverWrapperEl.style.display = "contents";
    this._syncPopoverWrapperClasses();
    document.body.appendChild(this._popoverWrapperEl);
  }
  /**
   * Destroys inner components without removing the popover shell. Called from
   * _renderPopover() before rebuilding content, and from _destroyPopover().
   */
  _destroyPopoverContent() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
    this._removeMtgVisibleTracker();
    (_a = this._calLeft) == null ? void 0 : _a.destroy();
    this._calLeft = null;
    (_b = this._calRight) == null ? void 0 : _b.destroy();
    this._calRight = null;
    this._switch = null;
    (_d = (_c = this._tabs) == null ? void 0 : _c.destroy) == null ? void 0 : _d.call(_c);
    this._tabs = null;
    (_e = this._rollingStart) == null ? void 0 : _e.destroy();
    this._rollingStart = null;
    (_f = this._rollingEnd) == null ? void 0 : _f.destroy();
    this._rollingEnd = null;
    (_g = this._prevBtn) == null ? void 0 : _g.destroy();
    this._prevBtn = null;
    (_h = this._nextBtn) == null ? void 0 : _h.destroy();
    this._nextBtn = null;
    (_i = this._todayBtn) == null ? void 0 : _i.destroy();
    this._todayBtn = null;
    (_j = this._saveBtn) == null ? void 0 : _j.destroy();
    this._saveBtn = null;
    (_k = this._cancelBtn) == null ? void 0 : _k.destroy();
    this._cancelBtn = null;
    (_l = this._monthBtnL) == null ? void 0 : _l.destroy();
    this._monthBtnL = null;
    (_m = this._yearBtnL) == null ? void 0 : _m.destroy();
    this._yearBtnL = null;
    (_n = this._monthBtnR) == null ? void 0 : _n.destroy();
    this._monthBtnR = null;
    (_o = this._yearBtnR) == null ? void 0 : _o.destroy();
    this._yearBtnR = null;
    (_p = this._infoAlert) == null ? void 0 : _p.destroy();
    this._infoAlert = null;
    (_q = this._footerEl) == null ? void 0 : _q.remove();
    this._footerEl = null;
    this._calLeftHostEl = null;
    this._calRightHostEl = null;
    this._calSepEl = null;
    this._tilePanelEl = null;
    this._mtgScrollEl = null;
    this._mtgGridEl = null;
    this._rollingSettingEl = null;
    this._rollingStartHostEl = null;
    this._rollingEndHostEl = null;
    this._infoAlertHostEl = null;
    this._currentIndEl = null;
    this._switchHostEl = null;
    this._tabsHostEl = null;
    this._prevBtnEl = null;
    this._nextBtnEl = null;
    this._todayBtnEl = null;
    this._calNavLeftZoneEl = null;
    this._calNavLeftEl = null;
    this._calNavRightEl = null;
    this._calNavEmDashEl = null;
    this._periodLblPrimaryEl = null;
    this._periodLblSecondaryEl = null;
    this._periodSepEl = null;
  }
  _destroyPopover() {
    this._destroyPopoverContent();
    if (this._popoverEl) {
      this._popoverEl.removeEventListener("keydown", this._boundPopoverKeyDown);
      this._popoverEl.remove();
      this._popoverEl = null;
    }
    this._modeAnnouncerEl = null;
    this._headerEl = null;
    this._bodyEl = null;
  }
  _popoverAriaLabel() {
    const mode = this._activeMode();
    if (mode === "rolling") return "Choose a rolling time range";
    if (mode === "member") return "Choose a time period range";
    return "Choose a date range";
  }
  // Build header + body based on active mode.
  _renderPopover() {
    var _a;
    if (!this._headerEl || !this._bodyEl) return;
    const mode = this._activeMode();
    this._syncPopoverWrapperClasses();
    this._destroyPopoverContent();
    this._headerEl.textContent = "";
    this._bodyEl.textContent = "";
    if (this._modeAnnouncerEl) {
      this._modeAnnouncerEl.textContent = mode === "rolling" ? "Rolling time range mode" : mode === "member" ? "Time period range mode" : "Date range mode";
    }
    this._renderHeader(mode);
    if (mode === "absolute") this._renderAbsoluteBody();
    else if (mode === "member") this._renderMemberBody();
    else this._renderRollingBody();
    if (mode === "rolling") this._renderFooter();
    else this._removeFooter();
    (_a = this._popoverEl) == null ? void 0 : _a.setAttribute("aria-label", this._popoverAriaLabel());
  }
  _renderHeader(mode) {
    if (!this._headerEl) return;
    this._headerEl.className = [
      "arvo-cal-nav",
      "arvo-drp__header",
      mode === "absolute" && "arvo-cal-nav--range",
      mode === "member" && "arvo-cal-nav--member",
      mode === "rolling" && "arvo-cal-nav--rolling"
    ].filter(Boolean).join(" ");
    this._calNavLeftEl = document.createElement("div");
    this._calNavLeftEl.className = "arvo-cal-nav__left";
    this._headerEl.appendChild(this._calNavLeftEl);
    if (mode === "absolute") {
      this._renderAbsoluteLeftZone();
    } else {
      this._periodLblPrimaryEl = document.createElement("span");
      this._periodLblPrimaryEl.className = "arvo-cal-nav__period-lbl";
      this._periodLblPrimaryEl.setAttribute("aria-disabled", "true");
      this._calNavLeftEl.appendChild(this._periodLblPrimaryEl);
      this._periodSepEl = document.createElement("span");
      this._periodSepEl.className = "arvo-cal-nav__range-sep";
      this._periodSepEl.setAttribute("aria-hidden", "true");
      this._periodSepEl.textContent = EM_DASH;
      this._calNavLeftEl.appendChild(this._periodSepEl);
      this._periodLblSecondaryEl = document.createElement("span");
      this._periodLblSecondaryEl.className = "arvo-cal-nav__period-lbl";
      this._periodLblSecondaryEl.setAttribute("aria-disabled", "true");
      this._calNavLeftEl.appendChild(this._periodLblSecondaryEl);
      this._syncPeriodLabels();
    }
    this._calNavRightEl = document.createElement("div");
    this._calNavRightEl.className = "arvo-cal-nav__right";
    this._headerEl.appendChild(this._calNavRightEl);
    const hasMember = this._hasMemberCapability();
    const hasRolling = this._hasRollingCapability();
    const willHaveSwitch = hasMember && this._opts.hasModeToggle;
    const willHaveNav = mode === "absolute" || mode === "member";
    const willHaveToday = mode === "absolute" && !hasMember;
    if (willHaveSwitch && willHaveNav) {
      this._maybeRenderSwitch();
      const dividerAfterSwitch = document.createElement("span");
      dividerAfterSwitch.className = "arvo-cal-nav__divider";
      dividerAfterSwitch.setAttribute("aria-hidden", "true");
      this._calNavRightEl.appendChild(dividerAfterSwitch);
    }
    if (willHaveNav) {
      this._prevBtnEl = document.createElement("button");
      this._prevBtnEl.classList.add("arvo-cal-nav__prev");
      this._calNavRightEl.appendChild(this._prevBtnEl);
      this._prevBtn = ArvoIconButton.initialize(this._prevBtnEl, {
        variant: "tertiary",
        size: "md",
        icon: "angle-up",
        tooltip: mode === "member" ? "Previous period" : "Previous month",
        isDisabled: this._opts.isDisabled,
        onClick: () => this._handlePrev()
      });
      this._nextBtnEl = document.createElement("button");
      this._nextBtnEl.classList.add("arvo-cal-nav__next");
      this._calNavRightEl.appendChild(this._nextBtnEl);
      this._nextBtn = ArvoIconButton.initialize(this._nextBtnEl, {
        variant: "tertiary",
        size: "md",
        icon: "angle-down",
        tooltip: mode === "member" ? "Next period" : "Next month",
        isDisabled: this._opts.isDisabled,
        onClick: () => this._handleNext()
      });
    }
    if (willHaveToday) {
      this._todayBtnEl = document.createElement("button");
      this._todayBtnEl.classList.add("arvo-cal-nav__today");
      this._calNavRightEl.appendChild(this._todayBtnEl);
      this._todayBtn = ArvoIconButton.initialize(this._todayBtnEl, {
        variant: "tertiary",
        size: "md",
        icon: "calendar-date-selected",
        tooltip: "Today",
        isDisabled: this._opts.isDisabled,
        onClick: () => this._handleToday()
      });
    }
    if (willHaveNav && hasRolling) {
      const dividerBeforeTabs = document.createElement("span");
      dividerBeforeTabs.className = "arvo-cal-nav__divider";
      dividerBeforeTabs.setAttribute("aria-hidden", "true");
      this._calNavRightEl.appendChild(dividerBeforeTabs);
    }
    if (hasRolling) {
      this._maybeRenderTabs();
    }
  }
  /**
   * Render the absolute-mode header left zone. Composition depends on the
   * active calendar view:
   *
   *   days   -> [Month L] [Year L] -- em-dash -- [Month R] [Year R]
   *             (4 zoom buttons; em-dash joins the two month/year pairs)
   *   months -> [Year L]            -- em-dash -- [Year R]
   *             (2 zoom buttons; year-only labels for the left and right
   *              calendars which now span +1 year apart, not the same year)
   *   years  -> [decade-lbl: "{firstYear} - {lastYear}"]
   *             (single continuous decade label spanning the FIRST year of
   *              the left decade to the LAST year of the right decade,
   *              e.g. "2020 - 2039". No em-dash or duplicate labels.)
   *
   * The right calendar's visible period is always one period after the
   * left (_rightVisible()), so the labels rendered here track that
   * relationship.
   */
  _renderAbsoluteLeftZone() {
    if (!this._calNavLeftEl) return;
    const left = this._calNavLeftEl;
    const view = this._viewMode;
    const rightVis = this._rightVisible();
    if (view === "years") {
      const leftDecade = this._visibleYear - (this._visibleYear % 10 + 10) % 10;
      const rightDecade = rightVis.year - (rightVis.year % 10 + 10) % 10;
      const firstYear = Math.min(leftDecade, rightDecade);
      const lastYear = Math.max(leftDecade, rightDecade) + 9;
      const decadeLabel = `${firstYear} - ${lastYear}`;
      const span = document.createElement("span");
      span.className = "arvo-cal-nav__decade-lbl";
      span.textContent = decadeLabel;
      span.setAttribute("aria-label", decadeLabel);
      span.setAttribute("aria-disabled", "true");
      left.appendChild(span);
      return;
    }
    if (view === "months") {
      const yearBtnHostL = document.createElement("button");
      yearBtnHostL.classList.add("arvo-cal-nav__year-btn");
      left.appendChild(yearBtnHostL);
      this._yearBtnL = ArvoButton.initialize(yearBtnHostL, {
        variant: "tertiary",
        size: "md",
        label: String(this._visibleYear),
        isDisabled: this._opts.isDisabled,
        onClick: () => this._handleYearButton()
      });
      this._calNavEmDashEl = document.createElement("span");
      this._calNavEmDashEl.className = "arvo-cal-nav__range-sep";
      this._calNavEmDashEl.setAttribute("aria-hidden", "true");
      this._calNavEmDashEl.textContent = EM_DASH;
      left.appendChild(this._calNavEmDashEl);
      const yearBtnHostR2 = document.createElement("button");
      yearBtnHostR2.classList.add("arvo-cal-nav__year-btn");
      left.appendChild(yearBtnHostR2);
      this._yearBtnR = ArvoButton.initialize(yearBtnHostR2, {
        variant: "tertiary",
        size: "md",
        label: String(rightVis.year),
        isDisabled: this._opts.isDisabled,
        onClick: () => this._handleYearButton()
      });
      return;
    }
    const monthLabel = formatDate(
      new Date(this._visibleYear, this._visibleMonth, 1),
      "MMMM",
      this._effLocale
    );
    const yearLabel = String(this._visibleYear);
    const monthBtnHost = document.createElement("button");
    monthBtnHost.classList.add("arvo-cal-nav__month-btn");
    left.appendChild(monthBtnHost);
    this._monthBtnL = ArvoButton.initialize(monthBtnHost, {
      variant: "tertiary",
      size: "md",
      label: monthLabel,
      isDisabled: this._opts.isDisabled,
      onClick: () => this._handleMonthButton()
    });
    const yearBtnHost = document.createElement("button");
    yearBtnHost.classList.add("arvo-cal-nav__year-btn");
    left.appendChild(yearBtnHost);
    this._yearBtnL = ArvoButton.initialize(yearBtnHost, {
      variant: "tertiary",
      size: "md",
      label: yearLabel,
      isDisabled: this._opts.isDisabled,
      onClick: () => this._handleYearButton()
    });
    this._calNavEmDashEl = document.createElement("span");
    this._calNavEmDashEl.className = "arvo-cal-nav__range-sep";
    this._calNavEmDashEl.setAttribute("aria-hidden", "true");
    this._calNavEmDashEl.textContent = EM_DASH;
    left.appendChild(this._calNavEmDashEl);
    const monthLabelR = formatDate(
      new Date(rightVis.year, rightVis.month, 1),
      "MMMM",
      this._effLocale
    );
    const yearLabelR = String(rightVis.year);
    const monthBtnHostR = document.createElement("button");
    monthBtnHostR.classList.add("arvo-cal-nav__month-btn");
    left.appendChild(monthBtnHostR);
    this._monthBtnR = ArvoButton.initialize(monthBtnHostR, {
      variant: "tertiary",
      size: "md",
      label: monthLabelR,
      isDisabled: this._opts.isDisabled,
      onClick: () => this._handleMonthButton()
    });
    const yearBtnHostR = document.createElement("button");
    yearBtnHostR.classList.add("arvo-cal-nav__year-btn");
    left.appendChild(yearBtnHostR);
    this._yearBtnR = ArvoButton.initialize(yearBtnHostR, {
      variant: "tertiary",
      size: "md",
      label: yearLabelR,
      isDisabled: this._opts.isDisabled,
      onClick: () => this._handleYearButton()
    });
  }
  /**
   * Refresh the period-label spans for member / rolling header. Pulled into
   * its own helper so the visible-tile tracker can update labels without
   * re-rendering the whole popover.
   */
  _syncPeriodLabels() {
    var _a, _b, _c, _d;
    if (!this._periodLblPrimaryEl || !this._periodLblSecondaryEl) return;
    const mode = this._activeMode();
    let primary = "";
    let secondary = "";
    if (mode === "rolling") {
      const resolved = this._rollingResolved();
      primary = ((_a = resolved == null ? void 0 : resolved.start) == null ? void 0 : _a.displayName) ?? "";
      secondary = ((_b = resolved == null ? void 0 : resolved.end) == null ? void 0 : _b.displayName) ?? "";
    } else {
      primary = ((_c = this._firstVisibleMember) == null ? void 0 : _c.displayName) ?? "";
      secondary = ((_d = this._lastVisibleMember) == null ? void 0 : _d.displayName) ?? "";
    }
    this._periodLblPrimaryEl.textContent = primary;
    this._periodLblPrimaryEl.setAttribute("aria-label", primary);
    this._periodLblSecondaryEl.textContent = secondary;
    this._periodLblSecondaryEl.setAttribute("aria-label", secondary);
    if (this._periodSepEl) {
      this._periodSepEl.style.display = secondary ? "" : "none";
    }
  }
  _maybeRenderSwitch() {
    if (!this._hasMemberCapability() || !this._opts.hasModeToggle) return;
    const host = this._calNavRightEl ?? this._headerEl;
    if (!host) return;
    this._switchHostEl = document.createElement("div");
    this._switchHostEl.className = "arvo-drp__hdr-switch";
    host.appendChild(this._switchHostEl);
    this._switch = ArvoSwitch.initialize(this._switchHostEl, {
      label: "Member",
      isChecked: this._memberToggle,
      onChange: (p) => this._handleMemberToggle(p.isChecked)
    });
  }
  _maybeRenderTabs() {
    if (!this._hasRollingCapability()) return;
    const host = this._calNavRightEl ?? this._headerEl;
    if (!host) return;
    this._tabsHostEl = document.createElement("div");
    this._tabsHostEl.className = "arvo-drp__hdr-tabs";
    host.appendChild(this._tabsHostEl);
    this._tabs = ArvoButtonGroup.initialize(this._tabsHostEl, {
      items: [
        { value: "absolute", label: "Absolute" },
        { value: "rolling", label: "Rolling" }
      ],
      value: this._tab,
      size: "lg",
      ariaLabel: "Absolute or Rolling range",
      onChange: (detail) => {
        const v = Array.isArray(detail.value) ? detail.value[0] : detail.value;
        if (v === "absolute" || v === "rolling") this._handleTabChange(v);
      }
    });
  }
  // -------------------------------------------------------------------------
  // Body renderers per mode
  // -------------------------------------------------------------------------
  _renderAbsoluteBody() {
    if (!this._bodyEl) return;
    const liveStart = this._draftRange.start;
    const liveEnd = this._draftRange.end ?? (this._draftFirstSet ? this._hoverDate : null);
    this._calLeftHostEl = document.createElement("div");
    this._calLeftHostEl.className = "arvo-drp__cal";
    this._bodyEl.appendChild(this._calLeftHostEl);
    this._calRightHostEl = document.createElement("div");
    this._calRightHostEl.className = "arvo-drp__cal";
    this._bodyEl.appendChild(this._calRightHostEl);
    const rightVis = this._rightVisible();
    const minD = this._effMinDate();
    const maxD = this._effMaxDate();
    const memberIndex = this._memberIndex;
    const frequency = this._opts.frequency ?? void 0;
    this._calLeft = ArvoCalendar.initialize(this._calLeftHostEl, {
      ...this._opts.calendarProps ?? void 0,
      visibleYear: this._visibleYear,
      visibleMonth: this._visibleMonth,
      viewMode: this._viewMode,
      locale: this._effLocale,
      weekStart: this._opts.weekStart,
      hasWeeks: this._opts.hasWeeks,
      rangeStart: liveStart,
      rangeEnd: liveEnd,
      hoverDate: this._hoverDate,
      isRangeComplete: !this._draftFirstSet,
      minDate: minD,
      maxDate: maxD,
      memberIndex,
      frequency,
      onCellSelect: (p) => this._handleCalendarCellSelect(p),
      onCellHover: (p) => this._handleCalendarCellHover(p),
      onMonthChange: (p) => {
        this._visibleYear = p.year;
        this._visibleMonth = p.month;
        this._renderPopover();
      },
      onViewModeChange: () => {
      },
      onDismiss: () => this.close()
    });
    this._calRight = ArvoCalendar.initialize(this._calRightHostEl, {
      ...this._opts.calendarProps ?? void 0,
      visibleYear: rightVis.year,
      visibleMonth: rightVis.month,
      viewMode: this._viewMode,
      locale: this._effLocale,
      weekStart: this._opts.weekStart,
      hasWeeks: this._opts.hasWeeks,
      rangeStart: liveStart,
      rangeEnd: liveEnd,
      hoverDate: this._hoverDate,
      isRangeComplete: !this._draftFirstSet,
      minDate: minD,
      maxDate: maxD,
      memberIndex,
      frequency,
      onCellSelect: (p) => this._handleCalendarCellSelect(p),
      onCellHover: (p) => this._handleCalendarCellHover(p),
      onMonthChange: (p) => {
        if (this._viewMode === "months") {
          this._visibleYear = p.year - 1;
          this._visibleMonth = p.month;
        } else if (this._viewMode === "years") {
          this._visibleYear = p.year - 10;
          this._visibleMonth = p.month;
        } else {
          const d = addMonths(new Date(p.year, p.month, 1), -1);
          this._visibleYear = d.getFullYear();
          this._visibleMonth = d.getMonth();
        }
        this._renderPopover();
      },
      onViewModeChange: () => {
      },
      onDismiss: () => this.close()
    });
  }
  _renderMemberBody() {
    if (!this._bodyEl) return;
    this._renderRangeCountAlert();
    this._renderTilePanel();
  }
  _renderRollingBody() {
    if (!this._bodyEl) return;
    this._rollingSettingEl = document.createElement("div");
    this._rollingSettingEl.className = "arvo-drp__rolling-setting";
    this._bodyEl.appendChild(this._rollingSettingEl);
    const row = document.createElement("div");
    row.className = "arvo-drp__rolling-row";
    this._rollingSettingEl.appendChild(row);
    const buildBlock = (labelText, idSuffix, initialVal, onChange) => {
      const block = document.createElement("div");
      block.className = "arvo-drp__rolling-block";
      const lbl = document.createElement("label");
      lbl.className = "arvo-drp__rolling-lbl";
      lbl.textContent = labelText;
      const hostId = `${this._id}-${idSuffix}`;
      lbl.setAttribute("for", hostId);
      block.appendChild(lbl);
      const host = document.createElement("div");
      host.id = hostId;
      block.appendChild(host);
      return { block, hostId };
    };
    const wireLabelToInput = (host, hostId) => {
      host.removeAttribute("id");
      const inner = host.querySelector("input");
      if (inner) inner.id = hostId;
    };
    const startBlock = buildBlock("Start", "rolling-start", this._draftRolling.startOffset);
    row.appendChild(startBlock.block);
    this._rollingStartHostEl = row.querySelector(`#${startBlock.hostId}`);
    this._rollingStart = ArvoNumberInput.initialize(this._rollingStartHostEl, {
      value: this._draftRolling.startOffset,
      prefix: this._opts.rollingPrefix ?? void 0,
      prefixTooltip: this._opts.rollingPrefix ?? void 0,
      isDisabled: this._opts.isDisabled || this._opts.isReadOnly,
      onChange: (payload) => {
        const v = payload.value == null ? 0 : payload.value;
        this._handleRollingStartChange(v);
      }
    });
    wireLabelToInput(this._rollingStartHostEl, startBlock.hostId);
    const endBlock = buildBlock("End", "rolling-end", this._draftRolling.endOffset);
    row.appendChild(endBlock.block);
    this._rollingEndHostEl = row.querySelector(`#${endBlock.hostId}`);
    this._rollingEnd = ArvoNumberInput.initialize(this._rollingEndHostEl, {
      value: this._draftRolling.endOffset,
      prefix: this._opts.rollingPrefix ?? void 0,
      prefixTooltip: this._opts.rollingPrefix ?? void 0,
      isDisabled: this._opts.isDisabled || this._opts.isReadOnly,
      onChange: (payload) => {
        const v = payload.value == null ? 0 : payload.value;
        this._handleRollingEndChange(v);
      }
    });
    wireLabelToInput(this._rollingEndHostEl, endBlock.hostId);
    this._renderRangeCountAlert();
    this._renderTilePanel();
  }
  // The "{N} of {total} members included (Current ... to Current ...)"
  // info alert is anchor-relative and only renders in rolling mode.
  // Absolute / member ranges intentionally suppress the alert.
  _renderRangeCountAlert() {
    if (!this._bodyEl || !this._memberIndex) return;
    if (this._activeMode() !== "rolling") return;
    const msg = rollingIncludedMessage(
      this._memberIndex,
      this._draftRolling,
      void 0,
      this._effLocale
    );
    if (!msg) return;
    this._infoAlertHostEl = document.createElement("div");
    this._infoAlertHostEl.className = "arvo-drp__info-alert";
    this._infoAlertHostEl.setAttribute("aria-live", "polite");
    this._bodyEl.appendChild(this._infoAlertHostEl);
    this._infoAlert = ArvoMessageAlert.initialize(
      document.createElement("div"),
      { type: "info", message: msg }
    );
    this._infoAlertHostEl.appendChild(this._infoAlert.el);
  }
  _renderTilePanel() {
    var _a, _b, _c, _d, _e, _f;
    if (!this._bodyEl || !this._memberIndex) return;
    this._tilePanelEl = document.createElement("div");
    this._tilePanelEl.className = "arvo-drp__tile-panel";
    this._bodyEl.appendChild(this._tilePanelEl);
    this._mtgScrollEl = document.createElement("div");
    this._mtgScrollEl.className = "arvo-drp__mtg-scroll";
    this._tilePanelEl.appendChild(this._mtgScrollEl);
    this._mtgGridEl = document.createElement("div");
    this._mtgGridEl.className = "arvo-drp__mtg-grid";
    this._mtgGridEl.setAttribute("role", "grid");
    this._mtgScrollEl.appendChild(this._mtgGridEl);
    const mode = this._activeMode();
    const rollingResolved = mode === "rolling" ? this._rollingResolved() : null;
    const liveStart = mode === "rolling" ? ((_a = rollingResolved == null ? void 0 : rollingResolved.start) == null ? void 0 : _a.keyDate) ?? null : this._draftRange.start;
    const liveEnd = mode === "rolling" ? ((_b = rollingResolved == null ? void 0 : rollingResolved.end) == null ? void 0 : _b.keyDate) ?? null : this._draftRange.end ?? (this._draftFirstSet ? this._hoverDate : null);
    const startKeyCmp = mode === "rolling" ? ((_c = rollingResolved == null ? void 0 : rollingResolved.start) == null ? void 0 : _c.key) ?? null : liveStart ? ((_d = this._findMemberFor(liveStart)) == null ? void 0 : _d.key) ?? null : null;
    const endKeyCmp = mode === "rolling" ? ((_e = rollingResolved == null ? void 0 : rollingResolved.end) == null ? void 0 : _e.key) ?? null : liveEnd ? ((_f = this._findMemberFor(liveEnd)) == null ? void 0 : _f.key) ?? null : null;
    for (const m of this._memberIndex.members) {
      const tile = document.createElement("div");
      const inRange = liveStart && liveEnd ? !isBeforeDay(m.keyDate, liveStart) && !isAfterDay(m.keyDate, liveEnd) : false;
      const isSelStart = startKeyCmp != null && m.key === startKeyCmp;
      const isSelEnd = endKeyCmp != null && m.key === endKeyCmp;
      const isCurrent = this._memberIndex.currentIndex != null && m.index === this._memberIndex.currentIndex;
      tile.className = [
        "arvo-drp__mtg-tile",
        inRange && "in-range",
        (isSelStart || isSelEnd) && "selected",
        isCurrent && "current-member"
      ].filter(Boolean).join(" ");
      tile.setAttribute("role", "gridcell");
      tile.setAttribute("tabindex", isCurrent ? "0" : "-1");
      tile.setAttribute("aria-selected", String(isSelStart || isSelEnd));
      tile.setAttribute("aria-label", m.displayName);
      tile.setAttribute("data-arvo-tooltip", m.displayName);
      const labelSpan = document.createElement("span");
      labelSpan.className = "arvo-drp__mtg-tile-label";
      labelSpan.textContent = m.displayName;
      tile.appendChild(labelSpan);
      tile.addEventListener("click", () => this._handleTileClick(m));
      tile.addEventListener("pointerenter", () => this._handleTileHover(m));
      tile.addEventListener("pointerleave", () => this._handleTileHover(null));
      this._mtgGridEl.appendChild(tile);
    }
    this._installMtgVisibleTracker();
  }
  /**
   * Attach a scroll listener + ResizeObserver to the active `_mtgScrollEl`
   * that recomputes the first / last fully visible tile (rAF-throttled) and
   * pushes their `displayName`s into the header period labels.
   */
  _installMtgVisibleTracker() {
    this._removeMtgVisibleTracker();
    const scroller = this._mtgScrollEl;
    if (!scroller || !this._memberIndex) return;
    const recompute = () => {
      var _a, _b;
      this._mtgScrollRafId = null;
      if (!this._mtgScrollEl || !this._memberIndex) return;
      const tiles = this._mtgScrollEl.querySelectorAll(
        ".arvo-drp__mtg-tile"
      );
      if (tiles.length === 0) return;
      const cRect = this._mtgScrollEl.getBoundingClientRect();
      let firstIdx = -1;
      let lastIdx = -1;
      for (let i = 0; i < tiles.length; i += 1) {
        const r = tiles[i].getBoundingClientRect();
        if (r.top >= cRect.top - 1 && r.bottom <= cRect.bottom + 1) {
          if (firstIdx === -1) firstIdx = i;
          lastIdx = i;
        }
      }
      if (firstIdx === -1) {
        for (let i = 0; i < tiles.length; i += 1) {
          if (tiles[i].getBoundingClientRect().bottom > cRect.top) {
            firstIdx = i;
            break;
          }
        }
        lastIdx = firstIdx;
      }
      const members = this._memberIndex.members;
      const first = firstIdx >= 0 ? members[firstIdx] ?? null : null;
      const last = lastIdx >= 0 ? members[lastIdx] ?? null : null;
      if ((first == null ? void 0 : first.key) !== ((_a = this._firstVisibleMember) == null ? void 0 : _a.key) || (last == null ? void 0 : last.key) !== ((_b = this._lastVisibleMember) == null ? void 0 : _b.key)) {
        this._firstVisibleMember = first;
        this._lastVisibleMember = last;
        this._syncPeriodLabels();
      }
    };
    this._boundMtgScroll = () => {
      if (this._mtgScrollRafId != null) return;
      this._mtgScrollRafId = requestAnimationFrame(recompute);
    };
    scroller.addEventListener("scroll", this._boundMtgScroll, { passive: true });
    if (typeof ResizeObserver !== "undefined") {
      this._mtgScrollResizeObserver = new ResizeObserver(() => {
        if (this._mtgScrollRafId != null) cancelAnimationFrame(this._mtgScrollRafId);
        this._mtgScrollRafId = requestAnimationFrame(recompute);
      });
      this._mtgScrollResizeObserver.observe(scroller);
    }
    this._mtgScrollRafId = requestAnimationFrame(recompute);
  }
  _removeMtgVisibleTracker() {
    var _a;
    if (this._mtgScrollEl && this._boundMtgScroll) {
      this._mtgScrollEl.removeEventListener("scroll", this._boundMtgScroll);
    }
    this._boundMtgScroll = null;
    (_a = this._mtgScrollResizeObserver) == null ? void 0 : _a.disconnect();
    this._mtgScrollResizeObserver = null;
    if (this._mtgScrollRafId != null) {
      cancelAnimationFrame(this._mtgScrollRafId);
      this._mtgScrollRafId = null;
    }
  }
  _renderFooter() {
    if (!this._popoverEl) return;
    this._removeFooter();
    this._footerEl = document.createElement("div");
    this._footerEl.className = "arvo-drp__footer";
    const currentLabel = this._currentMemberLabel();
    if (currentLabel) {
      this._currentIndEl = document.createElement("span");
      this._currentIndEl.className = "arvo-drp__current-ind";
      const labelText = document.createTextNode(currentLabel.label);
      const valueEl = document.createElement("span");
      valueEl.className = "arvo-drp__current-ind-value";
      valueEl.textContent = currentLabel.value;
      this._currentIndEl.appendChild(labelText);
      this._currentIndEl.appendChild(valueEl);
      this._footerEl.appendChild(this._currentIndEl);
    }
    const cancelHost = document.createElement("button");
    cancelHost.className = "arvo-drp__footer-cancel";
    this._footerEl.appendChild(cancelHost);
    this._cancelBtn = ArvoButton.initialize(cancelHost, {
      variant: "tertiary",
      size: "md",
      label: "Cancel",
      onClick: () => this._handleCancelRolling()
    });
    const saveHost = document.createElement("button");
    saveHost.className = "arvo-drp__footer-save";
    this._footerEl.appendChild(saveHost);
    this._saveBtn = ArvoButton.initialize(saveHost, {
      variant: "primary",
      size: "md",
      label: "Save",
      isDisabled: !this._rollingDirty(),
      onClick: () => this._handleSaveRolling()
    });
    this._popoverEl.appendChild(this._footerEl);
  }
  _removeFooter() {
    var _a, _b;
    if (!this._footerEl) return;
    (_a = this._saveBtn) == null ? void 0 : _a.destroy();
    this._saveBtn = null;
    (_b = this._cancelBtn) == null ? void 0 : _b.destroy();
    this._cancelBtn = null;
    this._footerEl.remove();
    this._footerEl = null;
    this._currentIndEl = null;
  }
  _rollingDirty() {
    return !sameRolling(this._draftRolling, this._appliedRolling);
  }
  _rollingResolved() {
    if (!this._memberIndex) return null;
    return rollingRangeToMembers(this._memberIndex, this._draftRolling);
  }
  _currentMemberLabel() {
    if (!this._memberIndex || !this._hasRollingCapability()) return null;
    const current = resolveCurrentMember(this._memberIndex);
    if (!current) return null;
    const f = this._opts.frequency;
    const periodWord = f === "day" ? "Day" : f === "week" ? "Week" : f === "month" ? "Month" : f === "quarter" ? "Quarter" : "Year";
    const prefix = this._opts.rollingPrefix ? ` (${this._opts.rollingPrefix})` : "";
    return {
      label: `Current ${periodWord}${prefix}: `,
      value: current.displayName
    };
  }
  /**
   * Visible period shown by the RIGHT calendar in absolute mode. Always one
   * full period after the left calendar so the dual layout reads as
   * continuous (no duplicates):
   *   days   -> next month
   *   months -> next year
   *   years  -> next decade
   */
  _rightVisible() {
    if (this._viewMode === "months") {
      return { year: this._visibleYear + 1, month: this._visibleMonth };
    }
    if (this._viewMode === "years") {
      return { year: this._visibleYear + 10, month: this._visibleMonth };
    }
    const d = addMonths(new Date(this._visibleYear, this._visibleMonth, 1), 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  }
  // -------------------------------------------------------------------------
  // Interaction handlers
  // -------------------------------------------------------------------------
  _handleTriggerClick() {
    if (this._effLoading()) return;
    if (this._opts.isDisabled || this._opts.isReadOnly) return;
    if (this._isOpen) this.close();
    else this.open();
  }
  _handleSegKeyDown(side, e) {
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
    if (!this._isAbsoluteEditable()) {
      if (e.key === "Escape" && this._isOpen) {
        e.preventDefault();
        this.close();
      }
      return;
    }
    const ctrl = this._segCtrl(side);
    if (!ctrl) return;
    const key = e.key;
    const segs = ctrl.getValue().segments;
    const focused = ctrl.getFocusedSegment();
    const lastIdx = segs.length - 1;
    if (key === "Escape") {
      e.preventDefault();
      ctrl.handleKey({ key: "Escape" });
      if (this._focusedSide === side) {
        const input = this._segInputEl(side);
        if (input) input.value = ctrl.getFormattedDisplay(true);
        ctrl.focusSegment(0);
      }
      if (this._isOpen) this.close();
      return;
    }
    if (key === "ArrowRight" && side === "start" && focused && focused.index === lastIdx) {
      e.preventDefault();
      this._focusEndFirst();
      return;
    }
    if (key === "ArrowLeft" && side === "end" && focused && focused.index === 0) {
      e.preventDefault();
      this._focusStartLast();
      return;
    }
    if (key === "Tab") {
      const res = ctrl.handleKey({ key: "Tab", shiftKey: e.shiftKey });
      if (res.consumed) e.preventDefault();
      return;
    }
    if (key === "Enter") {
      e.preventDefault();
      ctrl.handleKey({ key: "Enter" });
      if (this._isOpen && (this._opts.isAutoClose ?? true)) this.close();
      return;
    }
    if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown" || key === "Home" || key === "End" || key === "Backspace" || key === "Delete") {
      const res = ctrl.handleKey({ key });
      if (res.consumed) e.preventDefault();
      return;
    }
    if (key.length === 1 && !e.ctrlKey && !e.metaKey) {
      if (/^[0-9]$/.test(key)) {
        const wasLast = side === "start" && focused != null && focused.index === lastIdx;
        const res = ctrl.handleDigit(key);
        if (res.consumed) e.preventDefault();
        if (res.advance && wasLast) this._focusEndFirst();
        return;
      }
      if (/^[A-Za-z]$/.test(key)) {
        const res = ctrl.handleLetter(key);
        if (res.consumed) e.preventDefault();
        return;
      }
    }
  }
  _handlePopoverKeyDown(e) {
    if (e.key !== "Escape") return;
    e.preventDefault();
    if (this._activeMode() === "rolling") {
      this._handleCancelRolling();
    } else {
      this.close();
    }
  }
  _handleAnchorClick() {
    if (this._opts.isDisabled || this._effLoading() || this._opts.isReadOnly) return;
    if (this._isOpen) this.close();
    else this.open();
  }
  _handleAnchorKeyDown(e) {
    if (e.altKey && e.key === "ArrowDown") {
      e.preventDefault();
      if (!this._isOpen) this.open();
    } else if (e.altKey && e.key === "ArrowUp") {
      e.preventDefault();
      if (this._isOpen) this.close();
    } else if (e.key === "Escape") {
      if (this._isOpen) {
        e.preventDefault();
        this.close();
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this._handleAnchorClick();
    }
  }
  _handleMemberToggle(checked) {
    var _a, _b, _c;
    this._memberToggle = checked;
    this._draftFirstSet = false;
    this._hoverDate = null;
    this._draftRange = { ...this._appliedRange };
    const newMode = checked ? "member" : "absolute";
    (_b = (_a = this._opts).onModeChange) == null ? void 0 : _b.call(_a, { mode: newMode });
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(
      new CustomEvent("drp:mode-change", {
        bubbles: true,
        cancelable: true,
        detail: { mode: newMode }
      })
    );
    this._updateInputDisplay();
    this._renderPopover();
    this._syncRootClasses();
  }
  _handleTabChange(next) {
    var _a, _b, _c;
    if (next === this._tab) return;
    this._tab = next;
    if (next === "rolling") {
      this._draftRolling = this._appliedRolling ?? { ...ZERO_ROLLING };
    } else {
      this._draftRange = { ...this._appliedRange };
      this._memberToggle = false;
    }
    this._draftFirstSet = false;
    this._hoverDate = null;
    const newMode = next === "rolling" ? "rolling" : this._memberToggle ? "member" : "absolute";
    (_b = (_a = this._opts).onModeChange) == null ? void 0 : _b.call(_a, { mode: newMode });
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(
      new CustomEvent("drp:mode-change", {
        bubbles: true,
        cancelable: true,
        detail: { mode: newMode }
      })
    );
    this._updateInputDisplay();
    this._renderPopover();
    this._syncRootClasses();
  }
  _handleCalendarCellSelect(payload) {
    var _a, _b;
    const { date, mode } = payload;
    if (!date) return;
    if (mode !== "days") {
      this._visibleYear = date.getFullYear();
      this._visibleMonth = date.getMonth();
      if (mode === "months") this._viewMode = "days";
      else if (mode === "years") this._viewMode = "months";
      this._renderPopover();
      return;
    }
    const memberCapable = this._hasMemberCapability();
    const firstClick = !this._draftFirstSet;
    const startCandidate = memberCapable ? this._snapDateToMember(date, "start") : date;
    const endCandidate = memberCapable ? this._snapDateToMember(date, "end") : date;
    if (memberCapable && firstClick && !startCandidate) return;
    if (memberCapable && !firstClick && !startCandidate && !endCandidate) return;
    if (firstClick) {
      const next = startCandidate ?? date;
      this._draftRange = { start: next, end: null };
      this._draftFirstSet = true;
      this._hoverDate = next;
      (_a = this._calLeft) == null ? void 0 : _a.update({
        rangeStart: this._draftRange.start,
        rangeEnd: null,
        hoverDate: this._hoverDate,
        isRangeComplete: false
      });
      (_b = this._calRight) == null ? void 0 : _b.update({
        rangeStart: this._draftRange.start,
        rangeEnd: null,
        hoverDate: this._hoverDate,
        isRangeComplete: false
      });
      return;
    }
    const first = this._draftRange.start ?? date;
    if (memberCapable) {
      const firstMember = this._resolveMemberSnap(first);
      const clickMember = this._resolveMemberSnap(date);
      if (!firstMember || !clickMember) return;
      let startMember;
      let endMember;
      if (firstMember.keyDate.getTime() <= clickMember.keyDate.getTime()) {
        startMember = firstMember;
        endMember = clickMember;
      } else {
        startMember = clickMember;
        endMember = firstMember;
      }
      const corrected = this._enforceDistinctMembers(startMember, endMember);
      if (!corrected) return;
      this._draftRange = {
        start: corrected.start.keyDate,
        end: corrected.end.endDate
      };
    } else {
      const [s, e] = orderedRange(first, date);
      this._draftRange = { start: s, end: e };
    }
    this._draftFirstSet = false;
    this._hoverDate = null;
    this._commitRange(this._draftRange, this._activeMode());
    if (this._opts.isAutoClose && this._activeMode() !== "rolling") this.close();
  }
  /**
   * Auto-correct a member-mode range whose start and end resolve to the same
   * bucket. Tries to push end forward to the next bucket; if there is no
   * next, pulls start back to the previous bucket. Returns the corrected
   * pair, or the original pair when the dataset only has a single member.
   */
  _enforceDistinctMembers(startMember, endMember) {
    if (!this._memberIndex) return null;
    if (startMember.key !== endMember.key) {
      return { start: startMember, end: endMember };
    }
    const next = getAdjacentMember(this._memberIndex, startMember, "next");
    if (next) return { start: startMember, end: next };
    const prev = getAdjacentMember(this._memberIndex, startMember, "prev");
    if (prev) return { start: prev, end: endMember };
    return { start: startMember, end: endMember };
  }
  _handleCalendarCellHover(payload) {
    var _a, _b;
    if (!this._draftFirstSet) return;
    this._hoverDate = payload.date ?? null;
    (_a = this._calLeft) == null ? void 0 : _a.update({ hoverDate: this._hoverDate });
    (_b = this._calRight) == null ? void 0 : _b.update({ hoverDate: this._hoverDate });
  }
  _handleTileClick(m) {
    if (this._activeMode() === "rolling") return;
    if (!this._draftFirstSet) {
      this._draftRange = { start: m.keyDate, end: null };
      this._draftFirstSet = true;
      this._hoverDate = m.keyDate;
      this._refreshTileSelectionClasses();
      return;
    }
    const firstStart = this._draftRange.start;
    const firstMember = firstStart ? this._resolveMemberSnap(firstStart) : null;
    if (!firstMember) {
      this._draftRange = { start: m.keyDate, end: null };
      this._draftFirstSet = true;
      this._hoverDate = m.keyDate;
      this._refreshTileSelectionClasses();
      return;
    }
    let startMember;
    let endMember;
    if (firstMember.keyDate.getTime() <= m.keyDate.getTime()) {
      startMember = firstMember;
      endMember = m;
    } else {
      startMember = m;
      endMember = firstMember;
    }
    const corrected = this._enforceDistinctMembers(startMember, endMember);
    if (!corrected) return;
    this._draftRange = {
      start: corrected.start.keyDate,
      end: corrected.end.endDate
    };
    this._draftFirstSet = false;
    this._hoverDate = null;
    this._commitRange(this._draftRange, "member");
    if (this._opts.isAutoClose) this.close();
  }
  _handleTileHover(m) {
    if (!this._draftFirstSet) return;
    this._hoverDate = (m == null ? void 0 : m.keyDate) ?? null;
    this._refreshTileSelectionClasses();
  }
  /**
   * In-place refresh of `.in-range`, `.selected`, and `aria-selected` on the
   * existing tile elements. Called from hover (draft-end preview), rolling
   * stepper changes, and any other path that mutates the live start / end
   * without changing the member list itself. The `.current-member` class is
   * derived from `currentIndex` (which is static while the popover is open)
   * so it's set once at tile-creation time in `_renderTilePanel`.
   */
  _refreshTileSelectionClasses() {
    var _a, _b, _c, _d, _e, _f;
    if (!this._mtgGridEl || !this._memberIndex) return;
    const mode = this._activeMode();
    const rollingResolved = mode === "rolling" ? this._rollingResolved() : null;
    const liveStart = mode === "rolling" ? ((_a = rollingResolved == null ? void 0 : rollingResolved.start) == null ? void 0 : _a.keyDate) ?? null : this._draftRange.start;
    const liveEnd = mode === "rolling" ? ((_b = rollingResolved == null ? void 0 : rollingResolved.end) == null ? void 0 : _b.keyDate) ?? null : this._draftRange.end ?? (this._draftFirstSet ? this._hoverDate : null);
    const startKeyCmp = mode === "rolling" ? ((_c = rollingResolved == null ? void 0 : rollingResolved.start) == null ? void 0 : _c.key) ?? null : liveStart ? ((_d = this._findMemberFor(liveStart)) == null ? void 0 : _d.key) ?? null : null;
    const endKeyCmp = mode === "rolling" ? ((_e = rollingResolved == null ? void 0 : rollingResolved.end) == null ? void 0 : _e.key) ?? null : liveEnd ? ((_f = this._findMemberFor(liveEnd)) == null ? void 0 : _f.key) ?? null : null;
    const tiles = this._mtgGridEl.querySelectorAll(
      ".arvo-drp__mtg-tile"
    );
    let i = 0;
    for (const m of this._memberIndex.members) {
      const tile = tiles[i++];
      if (!tile) continue;
      const inRange = liveStart && liveEnd ? !isBeforeDay(m.keyDate, liveStart) && !isAfterDay(m.keyDate, liveEnd) : false;
      const isSelStart = startKeyCmp != null && m.key === startKeyCmp;
      const isSelEnd = endKeyCmp != null && m.key === endKeyCmp;
      const isSelected = isSelStart || isSelEnd;
      tile.classList.toggle("in-range", inRange);
      tile.classList.toggle("selected", isSelected);
      tile.setAttribute("aria-selected", String(isSelected));
    }
  }
  _handleRollingStartChange(v) {
    let next = { ...this._draftRolling, startOffset: v };
    if (next.startOffset > next.endOffset) next = { ...next, endOffset: v };
    this._draftRolling = next;
    this._refreshRollingDerived();
  }
  _handleRollingEndChange(v) {
    let next = { ...this._draftRolling, endOffset: v };
    if (next.endOffset < next.startOffset) next = { ...next, startOffset: v };
    this._draftRolling = next;
    this._refreshRollingDerived();
  }
  _refreshRollingDerived() {
    var _a, _b;
    this._refreshInfoAlert();
    this._refreshTileSelectionClasses();
    if (this._saveBtn) {
      this._saveBtn.disabled(!this._rollingDirty());
    }
    (_a = this._rollingStart) == null ? void 0 : _a.value(this._draftRolling.startOffset);
    (_b = this._rollingEnd) == null ? void 0 : _b.value(this._draftRolling.endOffset);
  }
  _refreshInfoAlert() {
    if (!this._memberIndex) return;
    if (this._activeMode() !== "rolling") return;
    const msg = rollingIncludedMessage(
      this._memberIndex,
      this._draftRolling,
      void 0,
      this._effLocale
    );
    if (msg && this._infoAlert) {
      this._infoAlert.message(msg);
    }
  }
  _handleSaveRolling() {
    var _a, _b, _c;
    if (!this._hasRollingCapability()) return;
    this._commitRolling({ ...this._draftRolling });
    (_b = (_a = this._opts).onSave) == null ? void 0 : _b.call(_a);
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(
      new CustomEvent("drp:save", { bubbles: true, cancelable: false, detail: {} })
    );
    this.close();
  }
  _handleCancelRolling() {
    var _a, _b, _c;
    (_b = (_a = this._opts).onCancel) == null ? void 0 : _b.call(_a);
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(
      new CustomEvent("drp:cancel", { bubbles: true, cancelable: false, detail: {} })
    );
    this._draftRolling = this._appliedRolling ?? { ...ZERO_ROLLING };
    this.close();
  }
  // -------------------------------------------------------------------------
  // Calendar nav (absolute mode) buttons
  // -------------------------------------------------------------------------
  /**
   * Toggle the months zoom level. Mirrors the React DRP: clicking the month
   * button while already in months view returns to days. The right
   * calendar's visible period is recomputed by _rightVisible() based on the
   * new view mode so it stays continuous with the left.
   */
  _handleMonthButton() {
    this._setViewMode(this._viewMode === "months" ? "days" : "months");
  }
  /**
   * Toggle the years zoom level. Same semantics as _handleMonthButton.
   */
  _handleYearButton() {
    this._setViewMode(this._viewMode === "years" ? "days" : "years");
  }
  _setViewMode(mode) {
    if (this._viewMode === mode) return;
    this._viewMode = mode;
    this._renderPopover();
  }
  _handlePrev() {
    if (this._mtgScrollEl && (this._activeMode() === "member" || this._activeMode() === "rolling")) {
      const page = this._mtgScrollEl.clientHeight || 240;
      this._mtgScrollEl.scrollBy({ top: -page, behavior: "smooth" });
      return;
    }
    if (this._viewMode === "months") {
      this._visibleYear -= 1;
    } else if (this._viewMode === "years") {
      this._visibleYear -= 10;
    } else {
      const d = addMonths(new Date(this._visibleYear, this._visibleMonth, 1), -1);
      this._visibleYear = d.getFullYear();
      this._visibleMonth = d.getMonth();
    }
    this._renderPopover();
  }
  _handleNext() {
    if (this._mtgScrollEl && (this._activeMode() === "member" || this._activeMode() === "rolling")) {
      const page = this._mtgScrollEl.clientHeight || 240;
      this._mtgScrollEl.scrollBy({ top: page, behavior: "smooth" });
      return;
    }
    if (this._viewMode === "months") {
      this._visibleYear += 1;
    } else if (this._viewMode === "years") {
      this._visibleYear += 10;
    } else {
      const d = addMonths(new Date(this._visibleYear, this._visibleMonth, 1), 1);
      this._visibleYear = d.getFullYear();
      this._visibleMonth = d.getMonth();
    }
    this._renderPopover();
  }
  _handleToday() {
    const today = /* @__PURE__ */ new Date();
    this._visibleYear = today.getFullYear();
    this._visibleMonth = today.getMonth();
    this._viewMode = "days";
    this._renderPopover();
  }
  // -------------------------------------------------------------------------
  // Focus trap tab-order
  // -------------------------------------------------------------------------
  /**
   * Build the Tab cycle for the active popover mode. Mirrors the React
   * focus-trap order. Disabled buttons (e.g. rolling Save when clean) are
   * filtered out so the cycle never deadlocks.
   */
  _getOrderedPopoverElements() {
    const root = this._popoverEl;
    if (!root) return [];
    const calendarCells = Array.from(
      root.querySelectorAll('.arvo-cal__cell[tabindex="0"]')
    );
    const firstTile = root.querySelector(
      '.arvo-drp__mtg-tile[tabindex="0"]'
    );
    const monthBtns = Array.from(
      root.querySelectorAll(".arvo-cal-nav__month-btn")
    );
    const yearBtns = Array.from(
      root.querySelectorAll(".arvo-cal-nav__year-btn")
    );
    const interleavedMY = [];
    const pairs = Math.max(monthBtns.length, yearBtns.length);
    for (let i = 0; i < pairs; i += 1) {
      if (monthBtns[i]) interleavedMY.push(monthBtns[i]);
      if (yearBtns[i]) interleavedMY.push(yearBtns[i]);
    }
    const prev = root.querySelector(".arvo-cal-nav__prev");
    const next = root.querySelector(".arvo-cal-nav__next");
    const today = root.querySelector(".arvo-cal-nav__today");
    const switchEl = root.querySelector(
      ".arvo-drp__hdr-switch input"
    );
    const tabBtns = Array.from(
      root.querySelectorAll(".arvo-drp__hdr-tabs button[data-value]")
    );
    const rollingInputs = Array.from(
      root.querySelectorAll(".arvo-drp__rolling-block input")
    );
    const footerCancel = root.querySelector(
      ".arvo-drp__footer-cancel"
    );
    const footerSave = root.querySelector(
      ".arvo-drp__footer-save"
    );
    let raw;
    if (rollingInputs.length > 0) {
      raw = [
        ...tabBtns,
        ...rollingInputs,
        footerCancel,
        footerSave
      ];
    } else if (firstTile) {
      raw = [firstTile, switchEl, prev, next, ...tabBtns];
    } else {
      raw = [
        ...calendarCells,
        prev,
        ...interleavedMY,
        next,
        today,
        switchEl,
        ...tabBtns
      ];
    }
    return raw.filter((el) => {
      if (!el) return false;
      const native = el;
      if (native.disabled === true) return false;
      if (el.hasAttribute("disabled")) return false;
      if (el.getAttribute("aria-disabled") === "true") return false;
      return true;
    });
  }
  range(v) {
    if (v === void 0) return { ...this._appliedRange };
    const minD = this._effMinDate();
    const maxD = this._effMaxDate();
    this._appliedRange = {
      start: clampToBounds(v.start, minD, maxD),
      end: clampToBounds(v.end, minD, maxD)
    };
    this._updateInputDisplay();
    this._renderActions();
    this._syncRootClasses();
  }
  memberRange(v) {
    var _a, _b;
    if (v === void 0) {
      return {
        start: this._findMemberFor(this._appliedRange.start),
        end: this._findMemberFor(this._appliedRange.end)
      };
    }
    this._appliedRange = {
      start: ((_a = v.start) == null ? void 0 : _a.keyDate) ?? null,
      end: ((_b = v.end) == null ? void 0 : _b.keyDate) ?? null
    };
    this._updateInputDisplay();
    this._renderActions();
    this._syncRootClasses();
  }
  rolling(v) {
    var _a, _b;
    if (v === void 0) return this._appliedRolling;
    this._appliedRolling = v;
    this._draftRolling = { ...v };
    if (this._memberIndex) {
      const resolved = rollingRangeToMembers(this._memberIndex, v);
      this._appliedRange = {
        start: ((_a = resolved.start) == null ? void 0 : _a.keyDate) ?? null,
        end: ((_b = resolved.end) == null ? void 0 : _b.keyDate) ?? null
      };
    }
    this._updateInputDisplay();
    this._renderActions();
    this._syncRootClasses();
  }
  mode(m) {
    if (m === void 0) return this._activeMode();
    if (m === "rolling") {
      if (this._hasRollingCapability()) this._tab = "rolling";
    } else {
      this._tab = "absolute";
      this._memberToggle = m === "member" && this._hasMemberCapability();
    }
    this._updateInputDisplay();
    this._syncRootClasses();
  }
  memberToggle(v) {
    if (v === void 0) return this._memberToggle;
    this._memberToggle = Boolean(v);
    this._updateInputDisplay();
    this._syncRootClasses();
  }
  clear() {
    this._commitRange({ start: null, end: null }, this._activeMode());
    this._appliedRolling = null;
    this._updateInputDisplay();
    this._renderActions();
    this._syncRootClasses();
  }
  disabled(state) {
    if (state === void 0) return this._opts.isDisabled;
    this._opts.isDisabled = state;
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
    this._loadingOverride = loading;
    this._renderActions();
    this._syncRootClasses();
    if (loading && this._isOpen) this.close();
  }
  focus() {
    var _a, _b;
    if (this._useAnchorRender) (_a = this._anchorEl) == null ? void 0 : _a.focus();
    else (_b = this._inputEl) == null ? void 0 : _b.focus();
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f, _g;
    if (this._destroyed) return;
    this._destroyed = true;
    (_a = this._surface) == null ? void 0 : _a.destroy();
    this._surface = null;
    this._isOpen = false;
    (_b = this._resizeObserver) == null ? void 0 : _b.disconnect();
    this._resizeObserver = null;
    this._destroyPopover();
    (_c = this._popoverWrapperEl) == null ? void 0 : _c.remove();
    this._popoverWrapperEl = null;
    for (const input of [this._inputEl, this._endInputEl]) {
      if (!input) continue;
      input.removeEventListener("keydown", this._boundInputKeyDown);
      input.removeEventListener("focus", this._boundSegFocus);
      input.removeEventListener("blur", this._boundSegBlur);
      input.removeEventListener("mousedown", this._boundSegMouseDown);
      input.removeEventListener("paste", this._boundSegPaste);
    }
    this._destroySegmentControllers();
    if (this._useAnchorRender && this._anchorEl) {
      this._anchorEl.removeEventListener("click", this._boundAnchorClick);
      this._anchorEl.removeEventListener("keydown", this._boundAnchorKeyDown);
      this._anchorEl.removeAttribute("aria-haspopup");
      this._anchorEl.removeAttribute("aria-expanded");
      this._anchorEl.removeAttribute("aria-controls");
    }
    (_d = this._clearBtn) == null ? void 0 : _d.destroy();
    (_e = this._triggerBtn) == null ? void 0 : _e.destroy();
    (_f = this._errIco) == null ? void 0 : _f.destroy();
    (_g = this._inlineAlert) == null ? void 0 : _g.destroy();
    if (this._element) {
      this._element.textContent = "";
      this._element.removeAttribute("class");
      this._element.removeAttribute("id");
      this._element.style.removeProperty("--arvo-form-input-width");
    }
    this._labelEl = null;
    this._fieldEl = null;
    this._inputEl = null;
    this._endInputEl = null;
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
  ArvoDateRangePicker
};
//# sourceMappingURL=DateRangePicker.js.map
