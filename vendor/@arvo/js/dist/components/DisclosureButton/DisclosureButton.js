const _ArvoDisclosureButton = class _ArvoDisclosureButton {
  constructor(element, options) {
    this._labelEl = null;
    this._chevEl = null;
    this._element = element;
    this._originalContent = element.textContent ?? "";
    this._originalType = element.getAttribute("type");
    const size = (options == null ? void 0 : options.size) && _ArvoDisclosureButton.SIZES.includes(options.size) ? options.size : _ArvoDisclosureButton.DEFAULTS.size;
    this._options = {
      ..._ArvoDisclosureButton.DEFAULTS,
      ...options,
      size,
      label: (options == null ? void 0 : options.label) ?? this._originalContent.trim(),
      isExpanded: (options == null ? void 0 : options.isExpanded) ?? _ArvoDisclosureButton.DEFAULTS.isExpanded,
      hasChevron: (options == null ? void 0 : options.hasChevron) ?? _ArvoDisclosureButton.DEFAULTS.hasChevron,
      ariaControls: (options == null ? void 0 : options.ariaControls) ?? null,
      ariaLabel: (options == null ? void 0 : options.ariaLabel) ?? null,
      onExpandedChange: (options == null ? void 0 : options.onExpandedChange) ?? null
    };
    this._boundHandleClick = this._handleClick.bind(this);
    this._render();
    this._bindEvents();
  }
  static initialize(element, options) {
    return new _ArvoDisclosureButton(element, options);
  }
  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  _render() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    el.setAttribute("type", "button");
    el.classList.add("arvo-disc-btn");
    el.classList.add(`arvo-disc-btn--${this._options.size}`);
    el.setAttribute("aria-expanded", this._options.isExpanded ? "true" : "false");
    if (this._options.ariaControls) {
      el.setAttribute("aria-controls", this._options.ariaControls);
    }
    if (this._options.ariaLabel) {
      el.setAttribute("aria-label", this._options.ariaLabel);
    }
    this._labelEl = document.createElement("span");
    this._labelEl.className = "arvo-disc-btn__lbl";
    this._labelEl.textContent = this._options.label;
    el.appendChild(this._labelEl);
    if (this._options.hasChevron) {
      this._chevEl = this._createChevronEl();
      el.appendChild(this._chevEl);
    }
  }
  _createChevronEl() {
    const span = document.createElement("span");
    span.className = "arvo-disc-btn__chev o9con o9con-angle-down";
    span.setAttribute("aria-hidden", "true");
    return span;
  }
  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------
  _bindEvents() {
    var _a;
    (_a = this._element) == null ? void 0 : _a.addEventListener("click", this._boundHandleClick);
  }
  _handleClick(_event) {
    var _a, _b;
    const next = !this._options.isExpanded;
    this._applyExpanded(next);
    (_b = (_a = this._options).onExpandedChange) == null ? void 0 : _b.call(_a, next);
    this._dispatchEvent("disc-btn:toggle", { isExpanded: next });
  }
  _applyExpanded(isExpanded) {
    var _a;
    this._options.isExpanded = isExpanded;
    (_a = this._element) == null ? void 0 : _a.setAttribute("aria-expanded", isExpanded ? "true" : "false");
  }
  _dispatchEvent(name, detail) {
    var _a;
    (_a = this._element) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        cancelable: true,
        detail
      })
    );
  }
  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  /**
   * Dual-purpose getter/setter for the expanded state. Omit `state` to read,
   * pass a boolean to write. Programmatic writes do NOT invoke the
   * `onExpandedChange` consumer callback (they are not user-driven), but the
   * `disc-btn:toggle` DOM event still fires so external listeners stay in sync.
   */
  expanded(state) {
    if (state === void 0) {
      return this._options.isExpanded;
    }
    if (state === this._options.isExpanded) return;
    this._applyExpanded(state);
    this._dispatchEvent("disc-btn:toggle", { isExpanded: state });
  }
  /**
   * Flip the expanded state, or force it to a target value. Mirrors the
   * user-interaction code path: emits the `disc-btn:toggle` DOM event. Does
   * NOT invoke `onExpandedChange` because it is not user-driven.
   */
  toggle(force) {
    const next = force === void 0 ? !this._options.isExpanded : force;
    if (next === this._options.isExpanded) return;
    this._applyExpanded(next);
    this._dispatchEvent("disc-btn:toggle", { isExpanded: next });
  }
  /** Update the visible label text. */
  setLabel(text) {
    this._options.label = text;
    if (this._labelEl) {
      this._labelEl.textContent = text;
    }
  }
  /** Programmatically focus the button. */
  focus() {
    var _a;
    (_a = this._element) == null ? void 0 : _a.focus();
  }
  /**
   * Remove the click listener, strip BEM classes and ARIA attributes added
   * during initialize, and restore the element's original text content.
   */
  destroy() {
    var _a, _b;
    const el = this._element;
    if (!el) return;
    el.removeEventListener("click", this._boundHandleClick);
    el.classList.remove("arvo-disc-btn");
    _ArvoDisclosureButton.SIZES.forEach(
      (s) => el.classList.remove(`arvo-disc-btn--${s}`)
    );
    el.removeAttribute("aria-expanded");
    el.removeAttribute("aria-controls");
    el.removeAttribute("aria-label");
    if (this._originalType === null) {
      el.removeAttribute("type");
    } else {
      el.setAttribute("type", this._originalType);
    }
    (_a = this._labelEl) == null ? void 0 : _a.remove();
    (_b = this._chevEl) == null ? void 0 : _b.remove();
    el.textContent = this._originalContent;
    this._element = null;
    this._labelEl = null;
    this._chevEl = null;
  }
};
_ArvoDisclosureButton.SIZES = ["sm", "md", "lg"];
_ArvoDisclosureButton.DEFAULTS = {
  label: "",
  size: "md",
  isExpanded: false,
  hasChevron: true,
  ariaControls: null,
  ariaLabel: null,
  onExpandedChange: null
};
let ArvoDisclosureButton = _ArvoDisclosureButton;
export {
  ArvoDisclosureButton
};
//# sourceMappingURL=DisclosureButton.js.map
