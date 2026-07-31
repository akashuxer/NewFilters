"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const Status = require("../Status/Status.cjs");
const Badge = require("../Badge/Badge.cjs");
const IconButton = require("../IconButton/IconButton.cjs");
const MessageAlert = require("../MessageAlert/MessageAlert.cjs");
const VALID_VARIANTS = ["general", "filter", "input"];
const VALID_SIZES = ["sm", "md", "lg"];
const VALID_APPEARANCES = ["primary", "outline", "utility"];
const VALID_COLOR_MODES = ["default", "semantic", "custom"];
const VALID_SEMANTIC_TYPES = ["none", "negative", "positive", "info", "warning", "block"];
const VALID_CUSTOM_COLORS = ["purple", "pink", "glacier", "amber", "greenish", "bluish"];
const SEMANTIC_COLOR_CLASSES = ["negative", "positive", "info", "warning", "block"];
const DEFAULTS = {
  variant: "general",
  size: "md",
  appearance: "primary",
  colorMode: "default",
  semanticType: "none",
  customColor: "purple",
  label: "",
  title: null,
  icon: null,
  avatar: null,
  status: null,
  counter: null,
  isSelected: false,
  isDisabled: false,
  isReadOnly: false,
  isInvalid: false,
  isWarning: false,
  isExcluded: false,
  isLoading: false,
  maxWidth: null,
  dismissLabel: null,
  hasDrag: false,
  dragHandleProps: null,
  onSelectedChange: null,
  onPress: null,
  onDismiss: null
};
function pick(value, valid, fallback) {
  return value !== void 0 && valid.includes(value) ? value : fallback;
}
class ArvoChip {
  constructor(element, options) {
    this._gripBtnEl = null;
    this._gripInstance = null;
    this._icoEl = null;
    this._avatarEl = null;
    this._titleEl = null;
    this._lblEl = null;
    this._counterSpan = null;
    this._counterInstance = null;
    this._alertEl = null;
    this._alertInstance = null;
    this._excludeEl = null;
    this._statusEl = null;
    this._statusInstance = null;
    this._dismissSpan = null;
    this._dismissBtnEl = null;
    this._dismissInstance = null;
    this._dismissOnClick = null;
    this._boundClick = null;
    this._boundKeydown = null;
    this._destroyed = false;
    this._isRemoving = false;
    this.el = element;
    this._opts = {
      ...DEFAULTS,
      variant: pick(options == null ? void 0 : options.variant, VALID_VARIANTS, DEFAULTS.variant),
      size: pick(options == null ? void 0 : options.size, VALID_SIZES, DEFAULTS.size),
      appearance: pick(options == null ? void 0 : options.appearance, VALID_APPEARANCES, DEFAULTS.appearance),
      colorMode: pick(options == null ? void 0 : options.colorMode, VALID_COLOR_MODES, DEFAULTS.colorMode),
      semanticType: pick(options == null ? void 0 : options.semanticType, VALID_SEMANTIC_TYPES, DEFAULTS.semanticType),
      customColor: pick(options == null ? void 0 : options.customColor, VALID_CUSTOM_COLORS, DEFAULTS.customColor),
      label: (options == null ? void 0 : options.label) ?? DEFAULTS.label,
      title: (options == null ? void 0 : options.title) ?? DEFAULTS.title,
      icon: (options == null ? void 0 : options.icon) ?? DEFAULTS.icon,
      avatar: (options == null ? void 0 : options.avatar) ?? DEFAULTS.avatar,
      status: (options == null ? void 0 : options.status) ?? DEFAULTS.status,
      counter: typeof (options == null ? void 0 : options.counter) === "number" ? options.counter : DEFAULTS.counter,
      isSelected: (options == null ? void 0 : options.isSelected) ?? (options == null ? void 0 : options.defaultSelected) ?? DEFAULTS.isSelected,
      isDisabled: (options == null ? void 0 : options.isDisabled) ?? DEFAULTS.isDisabled,
      isReadOnly: (options == null ? void 0 : options.isReadOnly) ?? DEFAULTS.isReadOnly,
      isInvalid: (options == null ? void 0 : options.isInvalid) ?? DEFAULTS.isInvalid,
      isWarning: (options == null ? void 0 : options.isWarning) ?? DEFAULTS.isWarning,
      isExcluded: (options == null ? void 0 : options.isExcluded) ?? DEFAULTS.isExcluded,
      isLoading: (options == null ? void 0 : options.isLoading) ?? DEFAULTS.isLoading,
      maxWidth: (options == null ? void 0 : options.maxWidth) ?? DEFAULTS.maxWidth,
      dismissLabel: (options == null ? void 0 : options.dismissLabel) ?? DEFAULTS.dismissLabel,
      hasDrag: (options == null ? void 0 : options.hasDrag) ?? DEFAULTS.hasDrag,
      dragHandleProps: (options == null ? void 0 : options.dragHandleProps) ?? DEFAULTS.dragHandleProps,
      onSelectedChange: (options == null ? void 0 : options.onSelectedChange) ?? null,
      onPress: (options == null ? void 0 : options.onPress) ?? null,
      onDismiss: (options == null ? void 0 : options.onDismiss) ?? null
    };
    this._render();
    this._bindEvents();
  }
  static initialize(element, options) {
    return new ArvoChip(element, options);
  }
  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------
  get _isFilter() {
    return this._opts.variant === "filter";
  }
  get _isDismissibleInput() {
    const o = this._opts;
    return o.variant === "input" && !!o.onDismiss && !o.isDisabled && !o.isReadOnly && !o.isLoading;
  }
  /**
   * Input chips with onDismiss are themselves the focusable surface (single-
   * focus chip model -- Delete/Backspace remove). They count as interactive
   * for role/tabindex/click-routing purposes even though the click on the
   * chip body is a no-op (only the inner __dismiss span fires onDismiss).
   */
  get _isInteractive() {
    return this._isFilter || this._opts.variant === "general" && !!this._opts.onPress || this._isDismissibleInput;
  }
  get _isSemantic() {
    return this._opts.colorMode === "semantic";
  }
  get _showInvalid() {
    return this._opts.isInvalid && !this._isSemantic;
  }
  get _showWarning() {
    return this._opts.isWarning && !this._isSemantic && !this._showInvalid;
  }
  get _showExcluded() {
    return this._opts.isExcluded && !this._isSemantic;
  }
  /**
   * Grip is rendered when EITHER ChipList injects dragHandleProps OR the
   * standalone chip sets hasDrag=true, in every color mode -- including
   * semantic, so reorderable semantic chip lists keep their handles.
   * Disabled / read-only / loading chips suppress the grip.
   */
  get _showGrip() {
    const o = this._opts;
    return (!!o.dragHandleProps || o.hasDrag) && !o.isDisabled && !o.isReadOnly && !o.isLoading;
  }
  get _showAvatar() {
    return !!this._opts.avatar && !this._isSemantic;
  }
  get _showStatus() {
    return !!this._opts.status && !this._isSemantic;
  }
  get _effectiveAppearance() {
    return this._opts.colorMode === "custom" ? "utility" : this._opts.appearance;
  }
  get _showDismiss() {
    return this._isDismissibleInput;
  }
  _resolveColorClass() {
    const { colorMode, semanticType, customColor } = this._opts;
    if (colorMode === "semantic" && semanticType !== "none") return `arvo-chip--${semanticType}`;
    if (colorMode === "custom" || this._effectiveAppearance === "utility") return `arvo-chip--${customColor}`;
    return "";
  }
  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  _render() {
    this.el.textContent = "";
    this.el.className = this._buildRootClasses();
    this._applyRootAttributes();
    if (this._opts.maxWidth) {
      this.el.style.setProperty("--arvo-chip-max-width", this._opts.maxWidth);
    }
    this._renderContent();
  }
  _buildRootClasses() {
    const o = this._opts;
    const parts = [
      "arvo-chip",
      `arvo-chip--${o.variant}`,
      `arvo-chip--${o.size}`,
      `arvo-chip--${this._effectiveAppearance}`,
      this._resolveColorClass()
    ];
    if (this._isFilter && o.isSelected) parts.push("active");
    if (o.isDisabled) parts.push("is-disabled");
    if (o.isReadOnly) parts.push("is-readonly");
    if (this._showInvalid) parts.push("is-invalid");
    if (this._showWarning) parts.push("is-warning");
    if (this._showExcluded) parts.push("is-excluded");
    if (o.isLoading) parts.push("loading");
    return parts.filter(Boolean).join(" ");
  }
  _applyRootAttributes() {
    const o = this._opts;
    const isButton = this.el.tagName === "BUTTON";
    if (isButton) {
      this.el.setAttribute("type", "button");
      this.el.disabled = o.isDisabled;
    } else if (this._isInteractive) {
      this.el.setAttribute("role", "button");
      if (!o.isDisabled) this.el.setAttribute("tabindex", "0");
    } else if (o.variant === "input") {
      this.el.setAttribute("role", "group");
    }
    if (this._isFilter) {
      this.el.setAttribute("aria-pressed", String(o.isSelected));
    }
    if (this._isDismissibleInput && !this.el.hasAttribute("aria-label")) {
      this.el.setAttribute(
        "aria-label",
        `${o.label}. Press Delete or Backspace to remove.`
      );
    }
    this._toggleAttr("aria-disabled", o.isDisabled && !isButton);
    this._toggleAttr("aria-readonly", o.isReadOnly);
    this._toggleAttr("aria-invalid", this._showInvalid);
    this._toggleAttr("aria-busy", o.isLoading);
  }
  _toggleAttr(name, on) {
    if (on) this.el.setAttribute(name, "true");
    else this.el.removeAttribute(name);
  }
  _renderContent() {
    const o = this._opts;
    if (this._showGrip) {
      this._gripBtnEl = document.createElement("button");
      const gripLabel = o.dragHandleProps && typeof o.dragHandleProps["aria-label"] === "string" && o.dragHandleProps["aria-label"] || "Drag to reorder";
      this._gripInstance = IconButton.ArvoIconButton.initialize(this._gripBtnEl, {
        icon: "drag-handle",
        variant: "tertiary",
        size: "xs",
        tooltip: gripLabel,
        isDisabled: o.isDisabled
      });
      this._gripBtnEl.classList.add("arvo-chip__grip");
      if (o.dragHandleProps) {
        this._applyDragHandleProps(this._gripBtnEl, o.dragHandleProps);
      }
      this.el.appendChild(this._gripBtnEl);
    }
    if (o.icon) {
      this._icoEl = document.createElement("i");
      this._icoEl.className = `arvo-chip__ico o9con o9con-${o.icon}`;
      this._icoEl.setAttribute("aria-hidden", "true");
      this.el.appendChild(this._icoEl);
    }
    if (this._showAvatar && o.avatar) {
      this._avatarEl = document.createElement("span");
      this._avatarEl.className = "arvo-chip__avatar";
      if (typeof o.avatar === "string") {
        const img = document.createElement("img");
        img.src = o.avatar;
        img.alt = "";
        this._avatarEl.appendChild(img);
      } else {
        this._avatarEl.appendChild(o.avatar);
      }
      this.el.appendChild(this._avatarEl);
    }
    if (o.title) {
      this._titleEl = document.createElement("span");
      this._titleEl.className = "arvo-chip__title";
      this._titleEl.textContent = o.title;
      this.el.appendChild(this._titleEl);
    }
    this._lblEl = document.createElement("span");
    this._lblEl.className = "arvo-chip__lbl";
    this._lblEl.textContent = o.label;
    this.el.appendChild(this._lblEl);
    if (typeof o.counter === "number") {
      this._counterSpan = document.createElement("span");
      this._counterSpan.className = "arvo-chip__counter";
      const counterHost = document.createElement("span");
      const counterColorMode = o.colorMode === "custom" ? "custom" : "semantic";
      const counterSemanticType = o.colorMode === "semantic" && o.semanticType !== "none" ? o.semanticType : "neutral";
      this._counterInstance = Badge.ArvoBadge.initialize(counterHost, {
        variant: "counter",
        appearance: "filled",
        colorMode: counterColorMode,
        semanticType: counterSemanticType,
        customColor: o.customColor,
        size: "sm",
        count: o.counter,
        hideWhenZero: false,
        hasBadgeIcon: false
      });
      this._counterSpan.appendChild(counterHost);
      this.el.appendChild(this._counterSpan);
    }
    if (this._showInvalid || this._showWarning) {
      this._alertEl = document.createElement("div");
      this._alertInstance = MessageAlert.ArvoMessageAlert.initialize(this._alertEl, {
        isInline: true,
        type: this._showInvalid ? "negative" : "warning"
      });
      this._alertEl.classList.add("arvo-chip__alert");
      this.el.appendChild(this._alertEl);
    }
    if (this._showExcluded) {
      this._excludeEl = document.createElement("i");
      this._excludeEl.className = "arvo-chip__exclude o9con o9con-exclude";
      this._excludeEl.setAttribute("aria-hidden", "true");
      this.el.appendChild(this._excludeEl);
    }
    if (this._showDismiss) {
      this._dismissSpan = document.createElement("span");
      this._dismissSpan.className = "arvo-chip__dismiss";
      this._dismissSpan.setAttribute("aria-hidden", "true");
      const dismissIcon = document.createElement("i");
      dismissIcon.className = "arvo-chip__dismiss-icon o9con o9con-close";
      dismissIcon.setAttribute("aria-hidden", "true");
      this._dismissSpan.appendChild(dismissIcon);
      this._dismissOnClick = (event) => {
        event.stopPropagation();
        this._beginRemove(event);
      };
      this._dismissSpan.addEventListener("click", this._dismissOnClick);
      this.el.appendChild(this._dismissSpan);
    }
    if (this._showStatus && o.status) {
      this._statusEl = document.createElement("span");
      this._statusInstance = Status.ArvoStatus.initialize(this._statusEl, {
        ...o.status,
        size: o.size === "lg" ? "md" : "sm",
        placement: o.status.placement ?? "top-right"
      });
      this._statusEl.classList.add("arvo-chip__status");
      this.el.appendChild(this._statusEl);
    }
  }
  _applyDragHandleProps(el, bag) {
    Object.entries(bag).forEach(([key, value]) => {
      if (typeof value === "function") {
        const evt = key.startsWith("on") ? key.slice(2).toLowerCase() : key.toLowerCase();
        el.addEventListener(evt, value);
      } else {
        el.setAttribute(key, String(value));
      }
    });
  }
  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------
  _bindEvents() {
    this._boundClick = (e) => this._handleClick(e);
    this.el.addEventListener("click", this._boundClick);
    if (this._isInteractive && this.el.tagName !== "BUTTON" || this._isDismissibleInput) {
      this._boundKeydown = (e) => this._handleKeydown(e);
      this.el.addEventListener("keydown", this._boundKeydown);
    }
  }
  _handleClick(e) {
    var _a;
    const o = this._opts;
    if (o.isDisabled || o.isReadOnly || o.isLoading) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (this._isFilter) {
      this.selected(!o.isSelected);
      (_a = o.onSelectedChange) == null ? void 0 : _a.call(o, o.isSelected);
      this._emit("chip:select", { isSelected: o.isSelected });
    } else if (o.variant === "general" && o.onPress) {
      o.onPress();
      this._emit("chip:press", { originalEvent: e });
    }
  }
  _handleKeydown(e) {
    if (this._isDismissibleInput && (e.key === "Delete" || e.key === "Backspace")) {
      if (e.target === e.currentTarget) {
        e.preventDefault();
        e.stopPropagation();
        this._beginRemove(e);
      }
      return;
    }
    if (this._isInteractive && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      this._handleClick(e);
    }
  }
  /**
   * Drive the chip remove leave animation. Adds `.is-removing` to the chip
   * root, waits for the max-width transition to finish (or the safety
   * timeout fires), then calls `onDismiss` and emits `chip:dismiss`.
   *
   * In environments without CSS transitions (jsdom, prefers-reduced-motion)
   * the safety timeout (500ms past the longest leg of
   * `$arvo-motion-chip-remove`) ensures the consumer still receives the
   * dismissal callback.
   */
  _beginRemove(originalEvent) {
    if (this._isRemoving) return;
    this._isRemoving = true;
    this.el.classList.add("is-removing");
    let settled = false;
    const finish = () => {
      var _a, _b;
      if (settled) return;
      settled = true;
      this.el.removeEventListener("transitionend", onEnd);
      if (timer !== null) window.clearTimeout(timer);
      (_b = (_a = this._opts).onDismiss) == null ? void 0 : _b.call(_a);
      this._emit("chip:dismiss", { originalEvent });
    };
    const onEnd = (event) => {
      const te = event;
      if (te.target !== this.el) return;
      if (te.propertyName !== "max-width") return;
      finish();
    };
    this.el.addEventListener("transitionend", onEnd);
    const timer = window.setTimeout(finish, 500);
  }
  _emit(name, detail) {
    this.el.dispatchEvent(new CustomEvent(name, { bubbles: true, cancelable: true, detail }));
  }
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  setLabel(text) {
    this._opts.label = text;
    if (this._lblEl) this._lblEl.textContent = text;
    if (this._isDismissibleInput) {
      this.el.setAttribute(
        "aria-label",
        `${text}. Press Delete or Backspace to remove.`
      );
    }
  }
  setTitle(text) {
    this._opts.title = text;
    if (text) {
      if (!this._titleEl) {
        this._titleEl = document.createElement("span");
        this._titleEl.className = "arvo-chip__title";
        if (this._lblEl) this.el.insertBefore(this._titleEl, this._lblEl);
      }
      this._titleEl.textContent = text;
    } else if (this._titleEl) {
      this._titleEl.remove();
      this._titleEl = null;
    }
  }
  setIcon(iconName) {
    this._opts.icon = iconName;
    if (iconName) {
      if (!this._icoEl) {
        this._icoEl = document.createElement("i");
        this._icoEl.setAttribute("aria-hidden", "true");
        const anchor = this._gripBtnEl ? this._gripBtnEl.nextSibling : this.el.firstChild;
        this.el.insertBefore(this._icoEl, anchor);
      }
      this._icoEl.className = `arvo-chip__ico o9con o9con-${iconName}`;
    } else if (this._icoEl) {
      this._icoEl.remove();
      this._icoEl = null;
    }
  }
  setVariant(variant) {
    if (!VALID_VARIANTS.includes(variant)) return;
    this._opts.variant = variant;
    this._rebuild();
  }
  setSize(size) {
    var _a;
    if (!VALID_SIZES.includes(size)) return;
    VALID_SIZES.forEach((s) => this.el.classList.remove(`arvo-chip--${s}`));
    this.el.classList.add(`arvo-chip--${size}`);
    this._opts.size = size;
    if (this._statusInstance) this._statusInstance.setSize(((_a = this._opts.status) == null ? void 0 : _a.size) ?? "sm");
  }
  setAppearance(appearance) {
    if (!VALID_APPEARANCES.includes(appearance)) return;
    this._opts.appearance = appearance;
    this._rebuild();
  }
  setColorMode(mode) {
    if (!VALID_COLOR_MODES.includes(mode)) return;
    this._opts.colorMode = mode;
    this._rebuild();
  }
  setSemanticType(type) {
    if (!VALID_SEMANTIC_TYPES.includes(type)) return;
    this._opts.semanticType = type;
    this._applyColorClass();
  }
  setCustomColor(color) {
    if (!VALID_CUSTOM_COLORS.includes(color)) return;
    this._opts.customColor = color;
    this._applyColorClass();
  }
  _applyColorClass() {
    [...SEMANTIC_COLOR_CLASSES, ...VALID_CUSTOM_COLORS].forEach((c) => this.el.classList.remove(`arvo-chip--${c}`));
    const cls = this._resolveColorClass();
    if (cls) this.el.classList.add(cls);
  }
  setCounter(value) {
    var _a, _b;
    this._opts.counter = value;
    if (typeof value === "number") {
      if (this._counterInstance) {
        this._counterInstance.count(value);
      } else {
        this._counterSpan = document.createElement("span");
        this._counterSpan.className = "arvo-chip__counter";
        const host = document.createElement("span");
        this._counterInstance = Badge.ArvoBadge.initialize(host, {
          variant: "counter",
          appearance: "filled",
          colorMode: "semantic",
          semanticType: "neutral",
          size: "sm",
          count: value,
          hideWhenZero: false
        });
        this._counterSpan.appendChild(host);
        const anchor = this._alertEl ?? this._excludeEl ?? this._dismissSpan ?? this._statusEl;
        this.el.insertBefore(this._counterSpan, anchor);
      }
    } else {
      (_a = this._counterInstance) == null ? void 0 : _a.destroy();
      this._counterInstance = null;
      (_b = this._counterSpan) == null ? void 0 : _b.remove();
      this._counterSpan = null;
    }
  }
  setStatus(config) {
    if (config === false) {
      this._opts.status = null;
    } else {
      this._opts.status = config;
    }
    this._rebuild();
  }
  setMaxWidth(value) {
    this._opts.maxWidth = value;
    if (value) this.el.style.setProperty("--arvo-chip-max-width", value);
    else this.el.style.removeProperty("--arvo-chip-max-width");
  }
  selected(state) {
    if (state === void 0) return this._opts.isSelected;
    if (!this._isFilter) return;
    this._opts.isSelected = state;
    this.el.classList.toggle("active", state);
    this.el.setAttribute("aria-pressed", String(state));
  }
  disabled(state) {
    var _a;
    if (state === void 0) return this._opts.isDisabled;
    this._opts.isDisabled = state;
    this.el.classList.toggle("is-disabled", state);
    if (this.el.tagName === "BUTTON") {
      this.el.disabled = state;
    } else {
      this._toggleAttr("aria-disabled", state);
      if (this._isInteractive) {
        if (state) this.el.removeAttribute("tabindex");
        else this.el.setAttribute("tabindex", "0");
      }
    }
    (_a = this._gripInstance) == null ? void 0 : _a.disabled(state);
    this._refreshDismiss();
  }
  readOnly(state) {
    if (state === void 0) return this._opts.isReadOnly;
    this._opts.isReadOnly = state;
    this.el.classList.toggle("is-readonly", state);
    this._toggleAttr("aria-readonly", state);
    this._refreshDismiss();
  }
  invalid(state) {
    if (state === void 0) return this._opts.isInvalid;
    this._opts.isInvalid = state;
    this._rebuild();
  }
  warning(state) {
    if (state === void 0) return this._opts.isWarning;
    this._opts.isWarning = state;
    this._rebuild();
  }
  excluded(state) {
    if (state === void 0) return this._opts.isExcluded;
    this._opts.isExcluded = state;
    this._rebuild();
  }
  setLoading(loading) {
    this._opts.isLoading = loading;
    this.el.classList.toggle("loading", loading);
    this._toggleAttr("aria-busy", loading);
    this._refreshDismiss();
    this._emit("chip:loading", { isLoading: loading });
  }
  focus() {
    if (!this._opts.isLoading) this.el.focus();
  }
  _refreshDismiss() {
    var _a;
    const shouldShow = this._showDismiss;
    if (shouldShow && !this._dismissSpan) {
      this._dismissSpan = document.createElement("span");
      this._dismissSpan.className = "arvo-chip__dismiss";
      this._dismissSpan.setAttribute("aria-hidden", "true");
      const dismissIcon = document.createElement("i");
      dismissIcon.className = "arvo-chip__dismiss-icon o9con o9con-close";
      dismissIcon.setAttribute("aria-hidden", "true");
      this._dismissSpan.appendChild(dismissIcon);
      this._dismissOnClick = (event) => {
        var _a2, _b;
        event.stopPropagation();
        (_b = (_a2 = this._opts).onDismiss) == null ? void 0 : _b.call(_a2);
        this._emit("chip:dismiss", { originalEvent: event });
      };
      this._dismissSpan.addEventListener("click", this._dismissOnClick);
      const anchor = this._statusEl;
      this.el.insertBefore(this._dismissSpan, anchor);
    } else if (!shouldShow && this._dismissSpan) {
      if (this._dismissOnClick) {
        this._dismissSpan.removeEventListener("click", this._dismissOnClick);
      }
      this._dismissOnClick = null;
      (_a = this._dismissInstance) == null ? void 0 : _a.destroy();
      this._dismissInstance = null;
      this._dismissBtnEl = null;
      this._dismissSpan.remove();
      this._dismissSpan = null;
    }
  }
  _rebuild() {
    this._teardownInner();
    this.el.removeAttribute("role");
    this.el.removeAttribute("tabindex");
    this.el.removeAttribute("aria-pressed");
    this._render();
    this._unbindEvents();
    this._bindEvents();
  }
  _teardownInner() {
    var _a, _b, _c, _d, _e;
    (_a = this._gripInstance) == null ? void 0 : _a.destroy();
    this._gripInstance = null;
    (_b = this._counterInstance) == null ? void 0 : _b.destroy();
    this._counterInstance = null;
    (_c = this._alertInstance) == null ? void 0 : _c.destroy();
    this._alertInstance = null;
    (_d = this._statusInstance) == null ? void 0 : _d.destroy();
    this._statusInstance = null;
    (_e = this._dismissInstance) == null ? void 0 : _e.destroy();
    this._dismissInstance = null;
    if (this._dismissSpan && this._dismissOnClick) {
      this._dismissSpan.removeEventListener("click", this._dismissOnClick);
    }
    this._dismissOnClick = null;
    this._gripBtnEl = null;
    this._icoEl = null;
    this._avatarEl = null;
    this._titleEl = null;
    this._lblEl = null;
    this._counterSpan = null;
    this._alertEl = null;
    this._excludeEl = null;
    this._statusEl = null;
    this._dismissSpan = null;
    this._dismissBtnEl = null;
  }
  _unbindEvents() {
    if (this._boundClick) this.el.removeEventListener("click", this._boundClick);
    if (this._boundKeydown) this.el.removeEventListener("keydown", this._boundKeydown);
    this._boundClick = null;
    this._boundKeydown = null;
  }
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._unbindEvents();
    this._teardownInner();
    this.el.textContent = "";
    this.el.className = "";
    this.el.removeAttribute("role");
    this.el.removeAttribute("tabindex");
    this.el.removeAttribute("aria-pressed");
    this.el.removeAttribute("aria-disabled");
    this.el.removeAttribute("aria-readonly");
    this.el.removeAttribute("aria-invalid");
    this.el.removeAttribute("aria-busy");
    this.el.style.removeProperty("--arvo-chip-max-width");
  }
}
exports.ArvoChip = ArvoChip;
//# sourceMappingURL=Chip.cjs.map
