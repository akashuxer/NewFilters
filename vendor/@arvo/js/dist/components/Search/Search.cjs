"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const core = require("@arvo/core");
const utils = require("@arvo/utils");
const Badge = require("../Badge/Badge.cjs");
const Button = require("../Button/Button.cjs");
const IconButton = require("../IconButton/IconButton.cjs");
const MessageAlert = require("../MessageAlert/MessageAlert.cjs");
const ML_DEFAULTS = {
  enabled: true,
  minRows: 1,
  maxRows: 5,
  collapseBehavior: "none",
  delimiterBehavior: "comma-to-new-row",
  delimiter: ","
};
const VALID_DELIMITER_BEHAVIORS = [
  "none",
  "comma-to-new-row",
  "comma-and-linebreak",
  "shift+enter"
];
let _idCounter = 0;
function parseValues(value, mlConfig) {
  const lines = value.split("\n");
  const { delimiterBehavior, delimiter } = mlConfig;
  if (delimiterBehavior === "none" || delimiterBehavior === "shift+enter") {
    return lines.map((s) => s.trim()).filter(Boolean);
  }
  return lines.flatMap((line) => line.split(delimiter)).map((s) => s.trim()).filter(Boolean);
}
function normalizeMultilineValue(v) {
  let out = v.replace(/\n[ \t]*\n+/g, "\n").replace(/\n{2,}/g, "\n");
  out = out.replace(/^\n+/, "");
  return out;
}
function isCursorLineEmpty(textarea) {
  const value = textarea.value;
  const cursor = textarea.selectionStart ?? value.length;
  const before = value.slice(0, cursor);
  const after = value.slice(cursor);
  const lineStart = before.lastIndexOf("\n") + 1;
  const afterBreak = after.indexOf("\n");
  const lineEnd = afterBreak === -1 ? after.length : afterBreak;
  const currentLine = before.slice(lineStart) + after.slice(0, lineEnd);
  return currentLine.trim().length === 0;
}
const _ArvoSearch = class _ArvoSearch {
  constructor(element, options) {
    this._inputEl = null;
    this._fieldEl = null;
    this._actionsEl = null;
    this._borderEl = null;
    this._icoEl = null;
    this._clearEl = null;
    this._clearBtn = null;
    this._sep1El = null;
    this._sep2El = null;
    this._shortcutEl = null;
    this._counterHostEl = null;
    this._counterBadge = null;
    this._prevEl = null;
    this._prevBtn = null;
    this._nextEl = null;
    this._nextBtn = null;
    this._submitEl = null;
    this._submitBtn = null;
    this._expandTriggerEl = null;
    this._expandTriggerBtnEl = null;
    this._expandTriggerBtn = null;
    this._errIcoEl = null;
    this._errIcoConnector = null;
    this._errMsgAlert = null;
    this._inlineAlert = null;
    this._inlineAlertEl = null;
    this._previousValue = "";
    this._errorId = "";
    this._inputId = "";
    this._shortcutCombo = null;
    this._boundShortcutHandler = null;
    this._resizeObserver = null;
    this._searchDebounceId = null;
    this._isExpanded = false;
    this._suppressAutoCollapse = false;
    this._realValueRef = null;
    this._element = element;
    const variant = (options == null ? void 0 : options.variant) && _ArvoSearch.VARIANTS.includes(options.variant) ? options.variant : _ArvoSearch.DEFAULTS.variant;
    const searchMode = (options == null ? void 0 : options.searchMode) && _ArvoSearch.SEARCH_MODES.includes(options.searchMode) ? options.searchMode : _ArvoSearch.DEFAULTS.searchMode;
    const initialValue = (options == null ? void 0 : options.value) !== void 0 ? options.value : (options == null ? void 0 : options.defaultValue) ?? _ArvoSearch.DEFAULTS.value;
    this._options = {
      ..._ArvoSearch.DEFAULTS,
      ...options,
      variant,
      searchMode,
      value: initialValue,
      width: (options == null ? void 0 : options.width) ?? null,
      errorMsg: (options == null ? void 0 : options.errorMsg) ?? null,
      shortcut: (options == null ? void 0 : options.shortcut) ?? null,
      counter: (options == null ? void 0 : options.counter) ?? null,
      onSearch: (options == null ? void 0 : options.onSearch) ?? null,
      onInput: (options == null ? void 0 : options.onInput) ?? null,
      onChange: (options == null ? void 0 : options.onChange) ?? null,
      onClear: (options == null ? void 0 : options.onClear) ?? null,
      onFocus: (options == null ? void 0 : options.onFocus) ?? null,
      onBlur: (options == null ? void 0 : options.onBlur) ?? null,
      onNext: (options == null ? void 0 : options.onNext) ?? null,
      onPrevious: (options == null ? void 0 : options.onPrevious) ?? null,
      onExpandedChange: (options == null ? void 0 : options.onExpandedChange) ?? null
    };
    this._previousValue = this._options.value;
    this._isExpanded = (options == null ? void 0 : options.isExpanded) ?? (options == null ? void 0 : options.defaultExpanded) ?? false;
    this._boundHandleInput = this._handleInput.bind(this);
    this._boundHandleFocus = this._handleFocus.bind(this);
    this._boundHandleBlur = this._handleBlur.bind(this);
    this._boundHandleKeydown = this._handleKeydown.bind(this);
    this._boundHandleClearClick = this._handleClearClick.bind(this);
    this._boundHandlePrevClick = this._handlePrevClick.bind(this);
    this._boundHandleNextClick = this._handleNextClick.bind(this);
    this._boundHandleSubmitClick = this._handleSubmitClick.bind(this);
    this._boundHandleExpandTriggerClick = this._handleExpandTriggerClick.bind(this);
    this._boundHandleExpandTriggerFocus = this._handleExpandTriggerFocus.bind(this);
    this._boundHandleRootFocusOut = this._handleRootFocusOut.bind(this);
    this._boundHandlePaste = this._handlePaste.bind(this);
    this._render();
    this._bindEvents();
    this._registerShortcut();
  }
  static initialize(element, options) {
    return new _ArvoSearch(element, options);
  }
  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    const uid = ++_idCounter;
    this._errorId = `arvo-search-err-${uid}`;
    this._inputId = `arvo-search-input-${uid}`;
    const {
      variant,
      value,
      placeholder,
      isDisabled,
      isReadOnly,
      isInvalid,
      errorMsg,
      errorDisplay,
      isClearable,
      shortcut,
      counter,
      isLoading,
      searchMode,
      hasPreviousButton,
      hasNextButton,
      expandDirection
    } = this._options;
    const useTooltipError = errorDisplay === "tooltip";
    const useInlineAlert = errorDisplay === "inline";
    const ariaLabel = this._options["aria-label"];
    const mlConfig = this._resolveMultiLineConfig();
    const effectiveClearable = mlConfig.enabled ? false : isReadOnly ? false : isClearable;
    const isExpandableFilter = variant === "expandable-filter";
    el.classList.add("arvo-search", `arvo-search--${variant}`);
    el.setAttribute("role", "search");
    if (isExpandableFilter && !this._isExpanded) el.classList.add("arvo-search--collapsed");
    if (isExpandableFilter) el.classList.add(`arvo-search--expand-${expandDirection}`);
    if (this._options.isFullWidth) el.classList.add("arvo-search--full-width");
    if (mlConfig.enabled) el.classList.add("arvo-search--multi-line");
    this._applyWidthStyle();
    if (isExpandableFilter) {
      this._expandTriggerEl = document.createElement("div");
      this._expandTriggerEl.className = "arvo-search__expand-trigger";
      this._expandTriggerBtnEl = document.createElement("button");
      this._expandTriggerBtn = IconButton.ArvoIconButton.initialize(this._expandTriggerBtnEl, {
        size: "md",
        variant: "tertiary",
        icon: "search",
        tooltip: "Open search",
        isDisabled: isDisabled || isLoading
      });
      this._expandTriggerBtnEl.setAttribute("aria-expanded", String(this._isExpanded));
      this._expandTriggerBtnEl.setAttribute("aria-controls", this._inputId);
      this._expandTriggerEl.appendChild(this._expandTriggerBtnEl);
      el.appendChild(this._expandTriggerEl);
    }
    this._fieldEl = document.createElement("div");
    this._fieldEl.className = "arvo-search__field";
    this._icoEl = document.createElement("i");
    this._icoEl.className = "arvo-search__ico o9con o9con-search";
    this._icoEl.setAttribute("aria-hidden", "true");
    this._fieldEl.appendChild(this._icoEl);
    if (mlConfig.enabled) {
      const ta = document.createElement("textarea");
      ta.id = this._inputId;
      ta.className = "arvo-search__input";
      ta.rows = 1;
      ta.value = value;
      if (placeholder) ta.placeholder = placeholder;
      ta.disabled = isDisabled;
      ta.readOnly = isReadOnly;
      ta.setAttribute("aria-multiline", "true");
      if (ariaLabel) ta.setAttribute("aria-label", ariaLabel);
      if (isReadOnly) ta.setAttribute("aria-readonly", "true");
      if (mlConfig.collapseBehavior === "summary" && this._realValueRef === null && value) {
        const values = parseValues(value, mlConfig);
        if (values.length > 1) {
          this._realValueRef = value;
          ta.value = `${values[0]}, +${values.length - 1} more`;
          el.classList.add("arvo-search--summary");
        }
      }
      this._inputEl = ta;
    } else {
      const inp = document.createElement("input");
      inp.id = this._inputId;
      inp.className = "arvo-search__input";
      inp.type = "search";
      inp.value = value;
      if (placeholder) inp.placeholder = placeholder;
      inp.disabled = isDisabled;
      inp.readOnly = isReadOnly;
      if (ariaLabel) inp.setAttribute("aria-label", ariaLabel);
      if (isReadOnly) inp.setAttribute("aria-readonly", "true");
      this._inputEl = inp;
    }
    this._fieldEl.appendChild(this._inputEl);
    this._actionsEl = document.createElement("div");
    this._actionsEl.className = "arvo-search__actions";
    if (effectiveClearable) {
      this._clearEl = document.createElement("button");
      this._clearBtn = IconButton.ArvoIconButton.initialize(this._clearEl, {
        size: "xs",
        variant: "tertiary",
        icon: "close",
        tooltip: "Clear",
        isDisabled: isDisabled || isLoading
      });
      this._clearEl.setAttribute("aria-label", "Clear");
      this._clearEl.tabIndex = -1;
      this._clearEl.classList.add("arvo-search__clear");
      this._actionsEl.appendChild(this._clearEl);
    }
    this._sep1El = document.createElement("span");
    this._sep1El.className = "arvo-search__sep arvo-search__sep--hidden";
    this._actionsEl.appendChild(this._sep1El);
    if (shortcut !== null) {
      this._shortcutEl = document.createElement("span");
      this._shortcutEl.className = "arvo-search__shortcut";
      this._shortcutEl.textContent = utils.formatShortcutDisplay(shortcut);
      this._actionsEl.appendChild(this._shortcutEl);
    }
    if (counter) {
      this._counterHostEl = document.createElement("span");
      this._counterBadge = Badge.ArvoBadge.initialize(this._counterHostEl, {
        variant: "counter",
        appearance: "outline",
        size: "md",
        semanticType: "neutral",
        counterMode: "ratio",
        hasBadgeIcon: false,
        count: counter.current,
        total: counter.total
      });
      this._counterHostEl.classList.add("arvo-search__counter");
      this._counterHostEl.setAttribute("aria-live", "polite");
      this._actionsEl.appendChild(this._counterHostEl);
    }
    if (variant === "find") {
      const hasFindButtons = hasPreviousButton || hasNextButton;
      if (hasFindButtons) {
        this._sep2El = document.createElement("span");
        this._sep2El.className = "arvo-search__sep";
        this._actionsEl.appendChild(this._sep2El);
      }
      const navDisabled = isDisabled || isLoading || isReadOnly || (counter ? counter.total === 0 : false);
      if (hasPreviousButton) {
        this._prevEl = document.createElement("button");
        this._prevBtn = IconButton.ArvoIconButton.initialize(this._prevEl, {
          size: "sm",
          variant: "tertiary",
          icon: "angle-up",
          tooltip: "Previous match",
          isDisabled: navDisabled
        });
        this._prevEl.setAttribute("aria-label", "Previous match");
        this._prevEl.classList.add("arvo-search__prev");
        this._actionsEl.appendChild(this._prevEl);
      }
      if (hasNextButton) {
        this._nextEl = document.createElement("button");
        this._nextBtn = IconButton.ArvoIconButton.initialize(this._nextEl, {
          size: "sm",
          variant: "tertiary",
          icon: "angle-down",
          tooltip: "Next match",
          isDisabled: navDisabled
        });
        this._nextEl.setAttribute("aria-label", "Next match");
        this._nextEl.classList.add("arvo-search__next");
        this._actionsEl.appendChild(this._nextEl);
      }
    }
    if (searchMode === "submit") {
      this._submitEl = document.createElement("button");
      this._submitBtn = Button.ArvoButton.initialize(this._submitEl, {
        variant: "primary",
        size: "sm",
        label: "Search",
        isDisabled: isDisabled || isLoading || isReadOnly
      });
      this._submitEl.classList.add("arvo-search__submit");
      this._actionsEl.appendChild(this._submitEl);
    }
    if (useTooltipError) {
      const tooltip = errorMsg ?? MessageAlert.ARVO_MSG_ALERT_DEFAULT_ERROR;
      this._errMsgAlert = MessageAlert.ArvoMessageAlert.initialize(document.createElement("div"), {
        type: "negative",
        isInline: true,
        message: tooltip
      });
      this._errIcoEl = this._errMsgAlert.el;
      this._errIcoEl.classList.add("arvo-search__err-ico");
      this._errIcoConnector = core.connectTooltip(core.tooltipManager, {
        anchor: this._errIcoEl,
        content: tooltip
      });
      this._actionsEl.appendChild(this._errIcoEl);
    }
    this._fieldEl.appendChild(this._actionsEl);
    this._borderEl = document.createElement("div");
    this._borderEl.className = "arvo-search__border";
    this._fieldEl.appendChild(this._borderEl);
    el.appendChild(this._fieldEl);
    if (useInlineAlert) {
      const message = errorMsg ?? MessageAlert.ARVO_MSG_ALERT_DEFAULT_ERROR;
      this._inlineAlert = MessageAlert.ArvoMessageAlert.initialize(document.createElement("div"), {
        type: "negative",
        message,
        id: this._errorId
      });
      this._inlineAlertEl = this._inlineAlert.el;
      this._inlineAlertEl.style.display = "none";
      el.appendChild(this._inlineAlertEl);
    }
    if (isDisabled) el.classList.add("is-disabled");
    if (isReadOnly && !isDisabled) el.classList.add("is-readonly");
    if (value.length > 0) el.classList.add("has-value");
    const collapsedExpandable = isExpandableFilter && !this._isExpanded;
    const effectiveInvalid = isInvalid && !collapsedExpandable;
    if (effectiveInvalid) el.classList.add("has-error");
    if (effectiveInvalid && useTooltipError) el.classList.add("error-tooltip");
    if (isLoading) el.classList.add("loading");
    if (effectiveInvalid) {
      this._inputEl.setAttribute("aria-invalid", "true");
      if (useInlineAlert) this._inputEl.setAttribute("aria-describedby", this._errorId);
    }
    if (isDisabled) {
      el.setAttribute("aria-disabled", "true");
    }
    if (isLoading) el.setAttribute("aria-busy", "true");
    if (effectiveInvalid && useInlineAlert && this._inlineAlertEl) {
      this._inlineAlertEl.style.display = "";
    }
    if (isExpandableFilter) {
      this._applyExpandableInert();
    }
    if (mlConfig.enabled && this._inputEl instanceof HTMLTextAreaElement) {
      this._autoResizeTextarea();
    }
    this._updateSeparators();
    this._updatePadding();
  }
  /**
   * Toggle the `inert` attribute on the expand-trigger and the field so the
   * currently-invisible half cannot receive Tab focus or be announced by
   * assistive tech. The visible half is left interactive.
   */
  _applyExpandableInert() {
    if (this._options.variant !== "expandable-filter") return;
    if (this._expandTriggerEl) {
      if (this._isExpanded) {
        this._expandTriggerEl.setAttribute("inert", "");
      } else {
        this._expandTriggerEl.removeAttribute("inert");
      }
    }
    if (this._fieldEl) {
      if (this._isExpanded) {
        this._fieldEl.removeAttribute("inert");
      } else {
        this._fieldEl.setAttribute("inert", "");
      }
    }
  }
  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  _bindEvents() {
    const input = this._inputEl;
    if (!input) return;
    input.addEventListener("input", this._boundHandleInput);
    input.addEventListener("focus", this._boundHandleFocus);
    input.addEventListener("blur", this._boundHandleBlur);
    input.addEventListener("keydown", this._boundHandleKeydown);
    if (this._resolveMultiLineConfig().enabled) {
      input.addEventListener("paste", this._boundHandlePaste);
    }
    if (this._clearEl) {
      this._clearEl.addEventListener("click", this._boundHandleClearClick);
    }
    if (this._prevEl) {
      this._prevEl.addEventListener("click", this._boundHandlePrevClick);
    }
    if (this._nextEl) {
      this._nextEl.addEventListener("click", this._boundHandleNextClick);
    }
    if (this._submitEl) {
      this._submitEl.addEventListener("click", this._boundHandleSubmitClick);
    }
    if (this._expandTriggerBtnEl) {
      this._expandTriggerBtnEl.addEventListener("click", this._boundHandleExpandTriggerClick);
      this._expandTriggerBtnEl.addEventListener("focus", this._boundHandleExpandTriggerFocus);
    }
    if (this._element && this._options.variant === "expandable-filter") {
      this._element.addEventListener("focusout", this._boundHandleRootFocusOut);
    }
    if (this._actionsEl) {
      this._resizeObserver = new ResizeObserver(() => {
        this._updatePadding();
      });
      this._resizeObserver.observe(this._actionsEl);
    }
  }
  _registerShortcut() {
    if (this._options.shortcut) {
      this._shortcutCombo = utils.parseShortcut(this._options.shortcut);
      this._boundShortcutHandler = this._handleShortcutKeyDown.bind(this);
      document.addEventListener("keydown", this._boundShortcutHandler, true);
    }
  }
  _handleInput(event) {
    var _a, _b, _c;
    if (this._options.isDisabled || this._options.isLoading || this._options.isReadOnly) return;
    const rawVal = this._inputEl.value;
    let val = rawVal;
    const mlConfig = this._resolveMultiLineConfig();
    if (mlConfig.enabled && (mlConfig.delimiterBehavior === "comma-to-new-row" || mlConfig.delimiterBehavior === "comma-and-linebreak") && val.includes(mlConfig.delimiter)) {
      const escapedDelimiter = mlConfig.delimiter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      val = val.replace(new RegExp(escapedDelimiter, "g"), "\n");
    }
    if (mlConfig.enabled) {
      val = normalizeMultilineValue(val);
    }
    if (val !== rawVal && this._inputEl) {
      this._inputEl.value = val;
    }
    (_a = this._element) == null ? void 0 : _a.classList.toggle("has-value", val.length > 0);
    this._options.value = val;
    if (mlConfig.enabled && this._inputEl instanceof HTMLTextAreaElement) {
      this._autoResizeTextarea();
    }
    this._dispatchEvent("search:input", { value: val });
    (_c = (_b = this._options).onInput) == null ? void 0 : _c.call(_b, event);
    if (this._options.searchMode === "input" && val.length >= this._options.minChars) {
      if (this._options.debounceMs > 0) {
        this._cancelDebounce();
        this._searchDebounceId = window.setTimeout(() => {
          this._triggerSearch();
        }, this._options.debounceMs);
      } else {
        this._triggerSearch();
      }
    }
    this._updateSeparators();
    this._updatePadding();
  }
  _handleFocus(event) {
    var _a, _b, _c;
    if (this._realValueRef !== null && this._inputEl instanceof HTMLTextAreaElement) {
      this._inputEl.value = this._realValueRef;
      this._realValueRef = null;
      (_a = this._element) == null ? void 0 : _a.classList.remove("arvo-search--summary");
      this._autoResizeTextarea();
    }
    this._updateSeparators();
    this._updatePadding();
    (_c = (_b = this._options).onFocus) == null ? void 0 : _c.call(_b, event);
  }
  _handleBlur(event) {
    var _a, _b, _c, _d, _e, _f;
    const val = ((_a = this._inputEl) == null ? void 0 : _a.value) ?? "";
    if (val !== this._previousValue) {
      this._dispatchEvent("search:change", { value: val, previousValue: this._previousValue });
      this._previousValue = val;
      (_c = (_b = this._options).onChange) == null ? void 0 : _c.call(_b, val);
    }
    const mlConfig = this._resolveMultiLineConfig();
    if (mlConfig.enabled && mlConfig.collapseBehavior === "summary" && this._realValueRef === null) {
      const values = parseValues(val, mlConfig);
      if (values.length > 1 && this._inputEl instanceof HTMLTextAreaElement) {
        this._realValueRef = val;
        this._inputEl.value = `${values[0]}, +${values.length - 1} more`;
        (_d = this._element) == null ? void 0 : _d.classList.add("arvo-search--summary");
        this._autoResizeTextarea();
      }
    }
    this._updateSeparators();
    this._updatePadding();
    (_f = (_e = this._options).onBlur) == null ? void 0 : _f.call(_e, event);
  }
  /**
   * Expand on trigger focus. Mirrors the React `onFocus={expandFromTrigger}`
   * wiring: tabbing into the collapsed trigger should expand the field (and
   * `expanded()` forwards focus to the input), keeping click and keyboard
   * entry paths identical for the expandable-filter variant.
   *
   * Sets `_suppressAutoCollapse` so the trigger's own `inert`-driven blur
   * (which happens before the rAF-scheduled input focus lands) does not
   * re-trigger our auto-collapse focusout listener.
   */
  _handleExpandTriggerFocus(_event) {
    if (this._options.variant !== "expandable-filter") return;
    if (this._isExpanded) return;
    if (this._options.isDisabled || this._options.isLoading) return;
    this._suppressAutoCollapse = true;
    this.expanded(true);
    requestAnimationFrame(() => {
      this._suppressAutoCollapse = false;
    });
  }
  /**
   * Root `focusout` listener -- expandable-filter auto-collapse. When focus
   * leaves the entire root and the field is empty, collapse back to the icon
   * trigger. A non-empty value (or an in-progress summary, whose underlying
   * `_realValueRef` is preserved) pins the field open.
   *
   * We deliberately do NOT route through `this.expanded(false)` here because
   * that path schedules a `_expandTriggerBtnEl.focus()` (used by Esc-to-
   * collapse and programmatic API calls); on auto-collapse the user has just
   * moved focus elsewhere and yanking it back to the trigger would be
   * disruptive. The state change + event + ARIA sync is replicated inline.
   */
  _handleRootFocusOut(event) {
    var _a, _b, _c, _d;
    if (this._options.variant !== "expandable-filter") return;
    if (!this._isExpanded || !this._element) return;
    if (this._suppressAutoCollapse) return;
    const next = event.relatedTarget;
    if (next && this._element.contains(next)) return;
    const liveVal = ((_a = this._inputEl) == null ? void 0 : _a.value) ?? "";
    const realVal = this._realValueRef;
    const isEmpty = !liveVal && !realVal;
    if (!isEmpty) return;
    this._isExpanded = false;
    this._element.classList.add("arvo-search--collapsed");
    (_b = this._expandTriggerBtnEl) == null ? void 0 : _b.setAttribute("aria-expanded", "false");
    this._dispatchEvent("search:collapse", {});
    (_d = (_c = this._options).onExpandedChange) == null ? void 0 : _d.call(_c, false);
    this._applyExpandableInert();
    this._syncCollapsedErrorState();
  }
  _handleKeydown(event) {
    var _a, _b, _c;
    if (this._options.isDisabled || this._options.isLoading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const mlConfig = this._resolveMultiLineConfig();
    const isExpandableFilter = this._options.variant === "expandable-filter";
    if (event.key === "Escape") {
      if (isExpandableFilter && this._isExpanded) {
        const val2 = ((_a = this._inputEl) == null ? void 0 : _a.value) ?? "";
        if (!val2) {
          this.expanded(false);
          return;
        }
      }
      const effectiveClearable = mlConfig.enabled ? false : this._options.isReadOnly ? false : this._options.isClearable;
      const val = ((_b = this._inputEl) == null ? void 0 : _b.value) ?? "";
      if (effectiveClearable && val.length > 0) {
        this.clear();
        return;
      }
      (_c = this._inputEl) == null ? void 0 : _c.blur();
      return;
    }
    if (event.key === "Enter") {
      if (this._options.variant === "find") {
        event.preventDefault();
        if (event.shiftKey) {
          if (this._options.hasPreviousButton) this.previous();
        } else {
          if (this._options.hasNextButton) this.next();
        }
        return;
      }
      if (this._options.isReadOnly) return;
      if (mlConfig.enabled) {
        const behavior = mlConfig.delimiterBehavior;
        const ta = this._inputEl;
        if (behavior === "comma-and-linebreak") {
          if (event.shiftKey) {
            event.preventDefault();
            this._cancelDebounce();
            this._triggerSearch();
          } else {
            if (ta && isCursorLineEmpty(ta)) {
              event.preventDefault();
              return;
            }
            requestAnimationFrame(() => {
              if (this._inputEl instanceof HTMLTextAreaElement) {
                this._autoResizeTextarea();
              }
              this._updatePadding();
            });
          }
          return;
        }
        if (event.shiftKey) {
          if (ta && isCursorLineEmpty(ta)) {
            event.preventDefault();
            return;
          }
          requestAnimationFrame(() => {
            if (this._inputEl instanceof HTMLTextAreaElement) {
              this._autoResizeTextarea();
            }
            this._updatePadding();
          });
          return;
        }
        event.preventDefault();
        this._cancelDebounce();
        this._triggerSearch();
        return;
      }
      event.preventDefault();
      this._cancelDebounce();
      this._triggerSearch();
    }
  }
  _handlePaste(_event) {
    requestAnimationFrame(() => {
      if (this._inputEl instanceof HTMLTextAreaElement) {
        this._autoResizeTextarea();
      }
      this._updatePadding();
    });
  }
  _handleClearClick(event) {
    var _a;
    event.preventDefault();
    event.stopPropagation();
    this.clear();
    (_a = this._inputEl) == null ? void 0 : _a.focus();
  }
  _handlePrevClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this.previous();
  }
  _handleNextClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this.next();
  }
  _handleSubmitClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this._cancelDebounce();
    this._triggerSearch();
  }
  _handleExpandTriggerClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this._suppressAutoCollapse = true;
    this.expanded(true);
    requestAnimationFrame(() => {
      this._suppressAutoCollapse = false;
    });
  }
  _handleShortcutKeyDown(event) {
    var _a, _b, _c;
    if (this._options.isDisabled || this._options.isLoading) return;
    const target = event.target;
    if (target !== this._inputEl && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)) {
      return;
    }
    if (document.activeElement === this._inputEl) return;
    const combo = this._shortcutCombo;
    if (utils.matchesShortcut(event, combo)) {
      event.preventDefault();
      event.stopPropagation();
      (_a = this._inputEl) == null ? void 0 : _a.focus();
      (_c = (_b = this._inputEl) == null ? void 0 : _b.select) == null ? void 0 : _c.call(_b);
    }
  }
  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------
  _cancelDebounce() {
    if (this._searchDebounceId !== null) {
      window.clearTimeout(this._searchDebounceId);
      this._searchDebounceId = null;
    }
  }
  _resolveMultiLineConfig() {
    const ml = this._options.isMultiLine;
    if (!ml) return { ...ML_DEFAULTS, enabled: false };
    if (ml === true) return { ...ML_DEFAULTS };
    if (typeof ml === "object" && ml.enabled) {
      let delimiterBehavior;
      if (ml.delimiterBehavior != null && VALID_DELIMITER_BEHAVIORS.includes(ml.delimiterBehavior)) {
        delimiterBehavior = ml.delimiterBehavior;
      } else if (ml.delimiter != null) {
        delimiterBehavior = "comma-to-new-row";
      } else {
        delimiterBehavior = ML_DEFAULTS.delimiterBehavior;
      }
      return {
        enabled: true,
        minRows: ml.minRows ?? ML_DEFAULTS.minRows,
        maxRows: ml.maxRows ?? ML_DEFAULTS.maxRows,
        collapseBehavior: ml.collapseBehavior ?? ML_DEFAULTS.collapseBehavior,
        delimiterBehavior,
        delimiter: ml.delimiter ?? ML_DEFAULTS.delimiter
      };
    }
    return { ...ML_DEFAULTS, enabled: false };
  }
  _autoResizeTextarea() {
    const ta = this._inputEl;
    if (!ta) return;
    const mlConfig = this._resolveMultiLineConfig();
    ta.style.height = "auto";
    const lineHeight = 20;
    const padding = 12;
    const minHeight = mlConfig.minRows * lineHeight + padding;
    const maxHeight = mlConfig.maxRows * lineHeight + padding;
    const targetHeight = Math.max(ta.scrollHeight, minHeight);
    if (targetHeight > maxHeight) {
      ta.style.height = `${maxHeight}px`;
      ta.style.overflowY = "auto";
    } else {
      ta.style.height = `${targetHeight}px`;
      ta.style.overflowY = "hidden";
    }
  }
  _triggerSearch() {
    var _a, _b, _c, _d, _e;
    const val = ((_a = this._inputEl) == null ? void 0 : _a.value) ?? "";
    const mlConfig = this._resolveMultiLineConfig();
    const detail = { value: val };
    if (mlConfig.enabled) {
      const values = parseValues(val, mlConfig);
      detail.values = values;
      this._dispatchEvent("search:search", detail);
      (_c = (_b = this._options).onSearch) == null ? void 0 : _c.call(_b, val, values);
    } else {
      this._dispatchEvent("search:search", detail);
      (_e = (_d = this._options).onSearch) == null ? void 0 : _e.call(_d, val);
    }
  }
  _applyWidthStyle() {
    if (!this._element) return;
    const effectiveWidth = this._options.isFullWidth ? "100%" : this._options.width;
    if (effectiveWidth) {
      this._element.style.setProperty("--arvo-form-input-width", effectiveWidth);
    } else {
      this._element.style.removeProperty("--arvo-form-input-width");
    }
  }
  _updatePadding() {
    if (!this._actionsEl || !this._fieldEl) return;
    const actionsWidth = this._actionsEl.offsetWidth;
    const gap = 4;
    const padR = actionsWidth > 0 ? actionsWidth + gap : 4;
    this._fieldEl.style.setProperty("--arvo-form-input-pad-r", `${padR}px`);
  }
  _updateSeparators() {
    if (this._sep1El) {
      const clearVisible = this._clearEl ? getComputedStyle(this._clearEl).display !== "none" : false;
      const counterVisible = this._counterHostEl ? getComputedStyle(this._counterHostEl).display !== "none" : false;
      const shortcutVisible = this._shortcutEl ? getComputedStyle(this._shortcutEl).display !== "none" : false;
      const badgeVisible = counterVisible || shortcutVisible;
      this._sep1El.classList.toggle("arvo-search__sep--hidden", !(clearVisible && badgeVisible));
    }
    if (this._sep2El) {
      const hidden = this._options.isDisabled || this._options.isLoading || this._options.isReadOnly;
      this._sep2El.classList.toggle("arvo-search__sep--hidden", hidden);
    }
  }
  _updateNavState() {
    var _a, _b;
    if (this._options.variant !== "find") return;
    const navDisabled = this._options.isDisabled || this._options.isLoading || this._options.isReadOnly || (this._options.counter ? this._options.counter.total === 0 : false);
    (_a = this._prevBtn) == null ? void 0 : _a.disabled(navDisabled);
    (_b = this._nextBtn) == null ? void 0 : _b.disabled(navDisabled);
  }
  _dispatchEvent(name, detail) {
    var _a;
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(name, { bubbles: true, cancelable: true, detail })
    );
  }
  value(newValue) {
    var _a, _b, _c;
    if (newValue === void 0) {
      return ((_a = this._inputEl) == null ? void 0 : _a.value) ?? this._options.value;
    }
    this._cancelDebounce();
    const previousValue = this._previousValue;
    this._previousValue = newValue;
    this._options.value = newValue;
    if (this._inputEl) {
      this._inputEl.value = newValue;
    }
    if (this._realValueRef !== null) {
      this._realValueRef = null;
      (_b = this._element) == null ? void 0 : _b.classList.remove("arvo-search--summary");
    }
    (_c = this._element) == null ? void 0 : _c.classList.toggle("has-value", newValue.length > 0);
    const mlConfig = this._resolveMultiLineConfig();
    if (mlConfig.enabled && this._inputEl instanceof HTMLTextAreaElement) {
      this._autoResizeTextarea();
    }
    if (newValue !== previousValue) {
      this._dispatchEvent("search:change", { value: newValue, previousValue });
    }
    this._updateSeparators();
    this._updatePadding();
  }
  clear() {
    var _a, _b, _c, _d;
    this._cancelDebounce();
    this._dispatchEvent("search:clear", {});
    (_b = (_a = this._options).onClear) == null ? void 0 : _b.call(_a);
    this._previousValue = "";
    this._options.value = "";
    if (this._inputEl) {
      this._inputEl.value = "";
    }
    (_c = this._element) == null ? void 0 : _c.classList.remove("has-value");
    const mlConfig = this._resolveMultiLineConfig();
    if (mlConfig.enabled && this._inputEl instanceof HTMLTextAreaElement) {
      this._autoResizeTextarea();
    }
    this._updateSeparators();
    this._updatePadding();
    (_d = this._inputEl) == null ? void 0 : _d.focus();
    if (this._options.searchMode === "input") {
      this._triggerSearch();
    }
  }
  counter(current, total) {
    if (current === void 0) {
      return this._options.counter;
    }
    if (current === null) {
      this._options.counter = null;
      if (this._counterBadge) {
        this._counterBadge.destroy();
        this._counterBadge = null;
      }
      if (this._counterHostEl) {
        this._counterHostEl.remove();
        this._counterHostEl = null;
      }
      this._updateNavState();
      this._updateSeparators();
      this._updatePadding();
      return;
    }
    this._options.counter = { current, total };
    if (!this._counterHostEl && this._actionsEl) {
      this._counterHostEl = document.createElement("span");
      const refNode = this._sep2El ?? this._prevEl ?? this._nextEl ?? this._submitEl ?? this._errIcoEl ?? null;
      this._actionsEl.insertBefore(this._counterHostEl, refNode);
    }
    if (!this._counterBadge && this._counterHostEl) {
      this._counterBadge = Badge.ArvoBadge.initialize(this._counterHostEl, {
        variant: "counter",
        appearance: "outline",
        size: "md",
        semanticType: "neutral",
        counterMode: "ratio",
        // Matches the initial render path -- counter never carries the
        // neutral semantic's default leading speaker icon.
        hasBadgeIcon: false,
        count: current,
        total: total ?? 0
      });
      this._counterHostEl.classList.add("arvo-search__counter");
      this._counterHostEl.setAttribute("aria-live", "polite");
    } else if (this._counterBadge) {
      this._counterBadge.count(current);
      this._counterBadge.setTotal(total ?? null);
    }
    this._updateNavState();
    this._updateSeparators();
    this._updatePadding();
  }
  search() {
    this._cancelDebounce();
    this._triggerSearch();
  }
  next() {
    var _a, _b;
    if (this._options.variant !== "find") return;
    if (this._options.isDisabled || this._options.isLoading || this._options.isReadOnly) return;
    if (this._options.counter && this._options.counter.total === 0) return;
    this._dispatchEvent("search:next", {});
    (_b = (_a = this._options).onNext) == null ? void 0 : _b.call(_a);
  }
  previous() {
    var _a, _b;
    if (this._options.variant !== "find") return;
    if (this._options.isDisabled || this._options.isLoading || this._options.isReadOnly) return;
    if (this._options.counter && this._options.counter.total === 0) return;
    this._dispatchEvent("search:previous", {});
    (_b = (_a = this._options).onPrevious) == null ? void 0 : _b.call(_a);
  }
  expanded(state) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (state === void 0) {
      return this._isExpanded;
    }
    if (this._options.variant !== "expandable-filter") return;
    this._isExpanded = state;
    if (state) {
      (_a = this._element) == null ? void 0 : _a.classList.remove("arvo-search--collapsed");
      (_b = this._expandTriggerBtnEl) == null ? void 0 : _b.setAttribute("aria-expanded", "true");
      this._dispatchEvent("search:expand", {});
      (_d = (_c = this._options).onExpandedChange) == null ? void 0 : _d.call(_c, true);
      requestAnimationFrame(() => {
        var _a2;
        return (_a2 = this._inputEl) == null ? void 0 : _a2.focus();
      });
    } else {
      (_e = this._element) == null ? void 0 : _e.classList.add("arvo-search--collapsed");
      (_f = this._expandTriggerBtnEl) == null ? void 0 : _f.setAttribute("aria-expanded", "false");
      this._dispatchEvent("search:collapse", {});
      (_h = (_g = this._options).onExpandedChange) == null ? void 0 : _h.call(_g, false);
      requestAnimationFrame(() => {
        var _a2;
        return (_a2 = this._expandTriggerBtnEl) == null ? void 0 : _a2.focus();
      });
    }
    this._applyExpandableInert();
    this._syncCollapsedErrorState();
  }
  /**
   * When the variant is expandable-filter, the `has-error` affordance is
   * suppressed while collapsed and reapplied while expanded. This keeps the
   * SCSS layer free of variant-specific `has-error` overrides and matches
   * the React component's `effectiveInvalid` behavior.
   */
  _syncCollapsedErrorState() {
    if (this._options.variant !== "expandable-filter") return;
    if (!this._element || !this._inputEl) return;
    const useTooltipError = this._options.errorDisplay === "tooltip";
    const useInlineAlert = this._options.errorDisplay === "inline";
    const effectiveInvalid = this._options.isInvalid && this._isExpanded;
    if (effectiveInvalid) {
      this._element.classList.add("has-error");
      this._inputEl.setAttribute("aria-invalid", "true");
      if (useTooltipError) this._element.classList.add("error-tooltip");
      if (useInlineAlert) {
        this._inputEl.setAttribute("aria-describedby", this._errorId);
        if (this._inlineAlertEl) this._inlineAlertEl.style.display = "";
      }
    } else {
      this._element.classList.remove("has-error", "error-tooltip");
      this._inputEl.removeAttribute("aria-invalid");
      this._inputEl.removeAttribute("aria-describedby");
      if (this._inlineAlertEl) this._inlineAlertEl.style.display = "none";
    }
  }
  disabled(state) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    if (state === void 0) {
      return this._options.isDisabled;
    }
    this._options.isDisabled = state;
    if (state) {
      (_a = this._element) == null ? void 0 : _a.classList.add("is-disabled");
      (_b = this._element) == null ? void 0 : _b.setAttribute("aria-disabled", "true");
      if (this._inputEl) {
        this._inputEl.disabled = true;
        if (document.activeElement === this._inputEl) {
          this._inputEl.blur();
        }
      }
      (_c = this._clearBtn) == null ? void 0 : _c.disabled(true);
      (_d = this._submitBtn) == null ? void 0 : _d.disabled(true);
      (_e = this._expandTriggerBtn) == null ? void 0 : _e.disabled(true);
    } else {
      (_f = this._element) == null ? void 0 : _f.classList.remove("is-disabled");
      (_g = this._element) == null ? void 0 : _g.removeAttribute("aria-disabled");
      if (this._inputEl) {
        this._inputEl.disabled = false;
      }
      if (!this._options.isLoading && !this._options.isReadOnly) {
        (_h = this._clearBtn) == null ? void 0 : _h.disabled(false);
        (_i = this._submitBtn) == null ? void 0 : _i.disabled(false);
        (_j = this._expandTriggerBtn) == null ? void 0 : _j.disabled(false);
      }
    }
    this._updateNavState();
    this._updateSeparators();
    this._updatePadding();
  }
  readOnly(state) {
    var _a, _b, _c, _d;
    if (state === void 0) {
      return this._options.isReadOnly;
    }
    this._options.isReadOnly = state;
    if (state && !this._options.isDisabled) {
      (_a = this._element) == null ? void 0 : _a.classList.add("is-readonly");
    } else {
      (_b = this._element) == null ? void 0 : _b.classList.remove("is-readonly");
    }
    if (this._inputEl) {
      this._inputEl.readOnly = state;
      if (state) {
        this._inputEl.setAttribute("aria-readonly", "true");
      } else {
        this._inputEl.removeAttribute("aria-readonly");
      }
    }
    const mlConfig = this._resolveMultiLineConfig();
    const effectiveClearable = !mlConfig.enabled && !state && this._options.isClearable;
    if (!effectiveClearable || state) {
      (_c = this._clearBtn) == null ? void 0 : _c.disabled(true);
    } else if (!this._options.isDisabled && !this._options.isLoading) {
      (_d = this._clearBtn) == null ? void 0 : _d.disabled(false);
    }
    if (this._submitBtn) {
      this._submitBtn.disabled(state || this._options.isDisabled || this._options.isLoading);
    }
    this._updateNavState();
    this._updateSeparators();
    this._updatePadding();
  }
  shortcut(newValue) {
    if (newValue === void 0) return this._options.shortcut ?? null;
    if (this._boundShortcutHandler) {
      document.removeEventListener("keydown", this._boundShortcutHandler, true);
      this._boundShortcutHandler = null;
    }
    this._options.shortcut = newValue ?? null;
    if (this._shortcutEl) {
      this._shortcutEl.textContent = newValue ? utils.formatShortcutDisplay(newValue) : "";
    }
    if (newValue) {
      this._shortcutCombo = utils.parseShortcut(newValue);
      this._boundShortcutHandler = this._handleShortcutKeyDown.bind(this);
      document.addEventListener("keydown", this._boundShortcutHandler, true);
    } else {
      this._shortcutCombo = null;
    }
    this._updateSeparators();
    this._updatePadding();
  }
  width(newValue) {
    if (newValue === void 0) return this._options.width;
    this._options.width = newValue ?? null;
    this._applyWidthStyle();
  }
  fullWidth(state) {
    var _a;
    if (state === void 0) return this._options.isFullWidth;
    this._options.isFullWidth = state;
    (_a = this._element) == null ? void 0 : _a.classList.toggle("arvo-search--full-width", state);
    this._applyWidthStyle();
  }
  setError(message) {
    var _a, _b, _c, _d, _e, _f;
    const useTooltipError = this._options.errorDisplay === "tooltip";
    const useInlineAlert = this._options.errorDisplay === "inline";
    const collapsedExpandable = this._options.variant === "expandable-filter" && !this._isExpanded;
    if (message === false) {
      this._options.isInvalid = false;
      this._options.errorMsg = null;
      (_a = this._element) == null ? void 0 : _a.classList.remove("has-error", "error-tooltip");
      if (this._inputEl) {
        this._inputEl.removeAttribute("aria-invalid");
        this._inputEl.removeAttribute("aria-describedby");
      }
      if (this._inlineAlertEl) {
        this._inlineAlertEl.style.display = "none";
      }
      return;
    }
    const msg = message || MessageAlert.ARVO_MSG_ALERT_DEFAULT_ERROR;
    this._options.isInvalid = true;
    this._options.errorMsg = msg;
    if (useTooltipError && this._errIcoEl) {
      (_b = this._errMsgAlert) == null ? void 0 : _b.message(msg);
      if (this._errIcoConnector) {
        this._errIcoConnector.update({ content: msg });
      }
    }
    if (useInlineAlert) {
      (_c = this._inlineAlert) == null ? void 0 : _c.message(msg);
    }
    if (collapsedExpandable) {
      (_d = this._element) == null ? void 0 : _d.classList.remove("has-error", "error-tooltip");
      if (this._inputEl) {
        this._inputEl.removeAttribute("aria-invalid");
        this._inputEl.removeAttribute("aria-describedby");
      }
      if (this._inlineAlertEl) {
        this._inlineAlertEl.style.display = "none";
      }
      return;
    }
    (_e = this._element) == null ? void 0 : _e.classList.add("has-error");
    if (this._inputEl) {
      this._inputEl.setAttribute("aria-invalid", "true");
      if (useInlineAlert) {
        this._inputEl.setAttribute("aria-describedby", this._errorId);
      }
    }
    if (useTooltipError) {
      (_f = this._element) == null ? void 0 : _f.classList.add("error-tooltip");
    }
    if (useInlineAlert && this._inlineAlertEl) {
      this._inlineAlertEl.style.display = "";
    }
    this._updateSeparators();
    this._updatePadding();
  }
  focus() {
    var _a;
    if (!this._options.isDisabled && !this._options.isLoading) {
      (_a = this._inputEl) == null ? void 0 : _a.focus();
    }
  }
  setLoading(isLoading) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    const wasFocused = document.activeElement === this._inputEl;
    this._options.isLoading = isLoading;
    if (isLoading) {
      (_a = this._element) == null ? void 0 : _a.classList.add("loading");
      (_b = this._element) == null ? void 0 : _b.setAttribute("aria-busy", "true");
      (_c = this._clearBtn) == null ? void 0 : _c.disabled(true);
      (_d = this._submitBtn) == null ? void 0 : _d.disabled(true);
      (_e = this._expandTriggerBtn) == null ? void 0 : _e.disabled(true);
      if (wasFocused) {
        (_f = this._inputEl) == null ? void 0 : _f.blur();
      }
    } else {
      (_g = this._element) == null ? void 0 : _g.classList.remove("loading");
      (_h = this._element) == null ? void 0 : _h.removeAttribute("aria-busy");
      if (!this._options.isDisabled && !this._options.isReadOnly) {
        (_i = this._clearBtn) == null ? void 0 : _i.disabled(false);
        (_j = this._submitBtn) == null ? void 0 : _j.disabled(false);
        (_k = this._expandTriggerBtn) == null ? void 0 : _k.disabled(false);
      }
    }
    this._updateNavState();
    this._updateSeparators();
    this._updatePadding();
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
    const el = this._element;
    if (!el) return;
    this._cancelDebounce();
    if (this._inputEl) {
      this._inputEl.removeEventListener("input", this._boundHandleInput);
      this._inputEl.removeEventListener("focus", this._boundHandleFocus);
      this._inputEl.removeEventListener("blur", this._boundHandleBlur);
      this._inputEl.removeEventListener("keydown", this._boundHandleKeydown);
      this._inputEl.removeEventListener("paste", this._boundHandlePaste);
    }
    if (this._clearEl) {
      this._clearEl.removeEventListener("click", this._boundHandleClearClick);
    }
    if (this._prevEl) {
      this._prevEl.removeEventListener("click", this._boundHandlePrevClick);
    }
    if (this._nextEl) {
      this._nextEl.removeEventListener("click", this._boundHandleNextClick);
    }
    if (this._submitEl) {
      this._submitEl.removeEventListener("click", this._boundHandleSubmitClick);
    }
    if (this._expandTriggerBtnEl) {
      this._expandTriggerBtnEl.removeEventListener("click", this._boundHandleExpandTriggerClick);
      this._expandTriggerBtnEl.removeEventListener("focus", this._boundHandleExpandTriggerFocus);
    }
    if (el && this._options.variant === "expandable-filter") {
      el.removeEventListener("focusout", this._boundHandleRootFocusOut);
    }
    if (this._boundShortcutHandler) {
      document.removeEventListener("keydown", this._boundShortcutHandler, true);
      this._boundShortcutHandler = null;
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    (_a = this._inlineAlert) == null ? void 0 : _a.destroy();
    this._inlineAlert = null;
    (_b = this._errMsgAlert) == null ? void 0 : _b.destroy();
    this._errMsgAlert = null;
    (_c = this._clearBtn) == null ? void 0 : _c.destroy();
    this._clearBtn = null;
    (_d = this._prevBtn) == null ? void 0 : _d.destroy();
    this._prevBtn = null;
    (_e = this._nextBtn) == null ? void 0 : _e.destroy();
    this._nextBtn = null;
    (_f = this._submitBtn) == null ? void 0 : _f.destroy();
    this._submitBtn = null;
    (_g = this._counterBadge) == null ? void 0 : _g.destroy();
    this._counterBadge = null;
    (_h = this._expandTriggerBtn) == null ? void 0 : _h.destroy();
    this._expandTriggerBtn = null;
    el.classList.remove(
      "arvo-search",
      "arvo-search--filter",
      "arvo-search--expandable-filter",
      "arvo-search--find",
      "arvo-search--collapsed",
      "arvo-search--expand-start",
      "arvo-search--expand-end",
      "arvo-search--multi-line",
      "arvo-search--summary",
      "arvo-search--full-width",
      "is-disabled",
      "is-readonly",
      "has-error",
      "error-tooltip",
      "loading",
      "has-value"
    );
    el.removeAttribute("role");
    el.removeAttribute("aria-busy");
    el.removeAttribute("aria-disabled");
    el.style.removeProperty("--arvo-form-input-width");
    (_i = this._inlineAlertEl) == null ? void 0 : _i.remove();
    (_j = this._expandTriggerEl) == null ? void 0 : _j.remove();
    (_k = this._fieldEl) == null ? void 0 : _k.remove();
    this._element = null;
    this._inputEl = null;
    this._fieldEl = null;
    this._actionsEl = null;
    this._borderEl = null;
    this._icoEl = null;
    this._clearEl = null;
    this._sep1El = null;
    this._sep2El = null;
    this._shortcutEl = null;
    this._counterHostEl = null;
    this._prevEl = null;
    this._nextEl = null;
    this._submitEl = null;
    this._expandTriggerEl = null;
    this._expandTriggerBtnEl = null;
    (_l = this._errIcoConnector) == null ? void 0 : _l.destroy();
    this._errIcoConnector = null;
    this._errIcoEl = null;
    this._inlineAlertEl = null;
    this._shortcutCombo = null;
    this._realValueRef = null;
  }
};
_ArvoSearch.VARIANTS = ["filter", "expandable-filter", "find"];
_ArvoSearch.SEARCH_MODES = ["input", "submit"];
_ArvoSearch.DEFAULTS = {
  variant: "filter",
  value: "",
  placeholder: "Search",
  isDisabled: false,
  isReadOnly: false,
  isInvalid: false,
  errorMsg: null,
  errorDisplay: "inline",
  isClearable: true,
  shortcut: null,
  counter: null,
  searchMode: "input",
  minChars: 0,
  debounceMs: 0,
  isMultiLine: false,
  isLoading: false,
  width: null,
  isFullWidth: false,
  isExpanded: false,
  defaultExpanded: false,
  expandDirection: "end",
  hasPreviousButton: true,
  hasNextButton: true,
  onSearch: null,
  onInput: null,
  onChange: null,
  onClear: null,
  onFocus: null,
  onBlur: null,
  onNext: null,
  onPrevious: null,
  onExpandedChange: null,
  "aria-label": "Search"
};
let ArvoSearch = _ArvoSearch;
exports.ArvoSearch = ArvoSearch;
//# sourceMappingURL=Search.cjs.map
