import { formatTime, shouldUse12Hour, getUserLocale, getAmPmStrings, createArrowNav } from "@arvo/core";
import { ArvoButtonGroup } from "../ButtonGroup/ButtonGroup.js";
function totalMilliseconds(t) {
  return ((t.hours * 60 + t.minutes) * 60 + (t.seconds ?? 0)) * 1e3 + (t.milliseconds ?? 0);
}
function buildOptions(args) {
  const step = Math.max(1, Math.floor(args.interval));
  const min = args.minTime ? totalMilliseconds(args.minTime) : 0;
  const max = args.maxTime ? totalMilliseconds(args.maxTime) : ((23 * 60 + 59) * 60 + 59) * 1e3 + 999;
  const out = [];
  for (let m = 0; m < 24 * 60; m += step) {
    const hours = Math.floor(m / 60);
    const minutes = m % 60;
    const time = { hours, minutes, seconds: 0, milliseconds: 0 };
    const candidate = totalMilliseconds(time);
    if (candidate < min || candidate > max) continue;
    out.push({
      hours,
      minutes,
      key: `${hours}:${minutes}`,
      label: formatTime(time, args.format)
    });
  }
  return out;
}
function pickInitialAmPm(value) {
  if (value) return value.hours < 12 ? "am" : "pm";
  return (/* @__PURE__ */ new Date()).getHours() < 12 ? "am" : "pm";
}
function pickFocusKey(opts, value) {
  if (opts.length === 0) return null;
  if (value) {
    const target = totalMilliseconds(value);
    const exact = opts.find((o) => totalMilliseconds({
      hours: o.hours,
      minutes: o.minutes,
      seconds: 0,
      milliseconds: 0
    }) === target);
    if (exact) return exact.key;
  }
  const now = /* @__PURE__ */ new Date();
  const ref = value ? totalMilliseconds(value) : totalMilliseconds({
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
    milliseconds: now.getMilliseconds()
  });
  let best = opts[0];
  let bestDelta = Math.abs(totalMilliseconds({
    hours: best.hours,
    minutes: best.minutes,
    seconds: 0,
    milliseconds: 0
  }) - ref);
  for (const o of opts) {
    const d = Math.abs(totalMilliseconds({
      hours: o.hours,
      minutes: o.minutes,
      seconds: 0,
      milliseconds: 0
    }) - ref);
    if (d < bestDelta) {
      best = o;
      bestDelta = d;
    }
  }
  return best.key;
}
class ArvoTimeDropdown {
  constructor(element, options) {
    this._use12Hour = false;
    this._ampmLabels = { am: "AM", pm: "PM" };
    this._allOptions = [];
    this._amOptions = [];
    this._pmOptions = [];
    this._visibleOptions = [];
    this._ampm = "am";
    this._focusedKey = "";
    this._tabsEl = null;
    this._ampmGroupHostEl = null;
    this._ampmGroup = null;
    this._listEl = null;
    this._optionEls = [];
    this._arrowNav = null;
    this._destroyed = false;
    this._handleListClick = (e) => {
      var _a;
      if (this._options.isDisabled) return;
      const target = (_a = e.target) == null ? void 0 : _a.closest(
        ".arvo-tdrop__item"
      );
      if (!target) return;
      const key = target.getAttribute("data-key");
      if (!key) return;
      const opt = this._visibleOptions.find((o) => o.key === key);
      if (!opt) return;
      this._setFocusedKey(opt.key);
      this._emitChange(opt);
    };
    this._handleListKeyDown = (e) => {
      var _a;
      if (this._options.isDisabled) return;
      if (e.key === "Escape") {
        e.preventDefault();
        this._emitDismiss();
        return;
      }
      if (e.key === "Spacebar") {
        e.preventDefault();
        const idx = this._visibleOptions.findIndex((o) => o.key === this._focusedKey);
        if (idx >= 0) this._emitChange(this._visibleOptions[idx]);
        return;
      }
      (_a = this._arrowNav) == null ? void 0 : _a.handleKeyDown(e);
    };
    this._element = element;
    this._options = {
      value: null,
      interval: 15,
      minTime: null,
      maxTime: null,
      isDisabled: false,
      ...options
    };
    this._ampm = pickInitialAmPm(this._options.value ?? null);
    this._rebuild();
  }
  static initialize(element, options) {
    return new ArvoTimeDropdown(element, options);
  }
  value(v) {
    if (v === void 0) {
      return this._options.value ?? null;
    }
    this._options.value = v;
    if (this._use12Hour) {
      const nextAmPm = pickInitialAmPm(v);
      const optionsForHalf = nextAmPm === "am" ? this._amOptions : this._pmOptions;
      if (nextAmPm !== this._ampm && optionsForHalf.length > 0) {
        this._ampm = nextAmPm;
        this._refreshVisible();
        this._focusedKey = pickFocusKey(this._visibleOptions, v) ?? "";
        this._renderList();
        this._scrollFocusedIntoView();
        return;
      }
    }
    const next = pickFocusKey(this._visibleOptions, v);
    if (next != null && next !== this._focusedKey) {
      this._focusedKey = next;
      this._updateFocusedTabindex();
    }
    this._updateSelectionDOM();
  }
  formattedValue() {
    const v = this._options.value;
    if (!v) return "";
    return formatTime(v, this._options.format);
  }
  disabled(state) {
    if (state === void 0) return !!this._options.isDisabled;
    if (state === !!this._options.isDisabled) return;
    this._options.isDisabled = state;
    const el = this._element;
    if (!el) return;
    el.classList.toggle("is-disabled", state);
    if (state) el.setAttribute("aria-disabled", "true");
    else el.removeAttribute("aria-disabled");
    if (this._listEl) {
      if (state) this._listEl.setAttribute("aria-disabled", "true");
      else this._listEl.removeAttribute("aria-disabled");
    }
    this._renderTabs();
  }
  destroy() {
    var _a, _b;
    if (this._destroyed) return;
    this._destroyed = true;
    (_a = this._arrowNav) == null ? void 0 : _a.destroy();
    this._arrowNav = null;
    if (this._listEl) {
      this._listEl.removeEventListener("click", this._handleListClick);
      this._listEl.removeEventListener("keydown", this._handleListKeyDown);
    }
    (_b = this._ampmGroup) == null ? void 0 : _b.destroy();
    this._ampmGroup = null;
    if (this._element) {
      this._element.textContent = "";
      this._element.removeAttribute("role");
      this._element.removeAttribute("aria-label");
      this._element.removeAttribute("aria-disabled");
      this._element.classList.remove(
        "arvo-tdrop",
        "arvo-tdrop--12hour",
        "arvo-tdrop--24hour",
        "is-disabled"
      );
    }
    this._element = null;
    this._listEl = null;
    this._tabsEl = null;
    this._ampmGroupHostEl = null;
    this._optionEls = [];
    this._allOptions = [];
    this._amOptions = [];
    this._pmOptions = [];
    this._visibleOptions = [];
  }
  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  /**
   * Full rebuild: recompute derived state from options, rebuild tabs + list DOM.
   * Used on mount and when format/locale/interval/bounds/isDisabled change.
   */
  _rebuild() {
    const el = this._element;
    if (!el) return;
    const { format, locale, interval = 15, minTime, maxTime, value } = this._options;
    this._use12Hour = shouldUse12Hour({ format, locale });
    const effLocale = getUserLocale(locale);
    this._ampmLabels = getAmPmStrings(effLocale);
    this._allOptions = buildOptions({
      interval,
      format,
      minTime: minTime ?? null,
      maxTime: maxTime ?? null
    });
    this._amOptions = this._allOptions.filter((o) => o.hours < 12);
    this._pmOptions = this._allOptions.filter((o) => o.hours >= 12);
    this._refreshVisible();
    this._focusedKey = pickFocusKey(this._visibleOptions, value ?? null) ?? "";
    this._renderRoot();
    this._renderTabs();
    this._renderList();
    this._setupKeyboard();
    this._scrollFocusedIntoView();
  }
  _refreshVisible() {
    if (this._use12Hour) {
      this._visibleOptions = this._ampm === "am" ? this._amOptions : this._pmOptions;
    } else {
      this._visibleOptions = this._allOptions;
    }
  }
  _renderRoot() {
    const el = this._element;
    if (!el) return;
    el.textContent = "";
    el.classList.remove(
      "arvo-tdrop",
      "arvo-tdrop--12hour",
      "arvo-tdrop--24hour",
      "is-disabled"
    );
    el.classList.add("arvo-tdrop");
    el.classList.add(this._use12Hour ? "arvo-tdrop--12hour" : "arvo-tdrop--24hour");
    if (this._options.isDisabled) el.classList.add("is-disabled");
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Time options");
    if (this._options.isDisabled) el.setAttribute("aria-disabled", "true");
    else el.removeAttribute("aria-disabled");
  }
  _renderTabs() {
    var _a, _b;
    (_a = this._ampmGroup) == null ? void 0 : _a.destroy();
    this._ampmGroup = null;
    (_b = this._tabsEl) == null ? void 0 : _b.remove();
    this._tabsEl = null;
    this._ampmGroupHostEl = null;
    if (!this._use12Hour || !this._element) return;
    const tabs = document.createElement("div");
    tabs.className = "arvo-tdrop__tabs";
    if (this._listEl && this._listEl.parentNode === this._element) {
      this._element.insertBefore(tabs, this._listEl);
    } else {
      this._element.appendChild(tabs);
    }
    this._tabsEl = tabs;
    const host = document.createElement("div");
    tabs.appendChild(host);
    this._ampmGroupHostEl = host;
    this._ampmGroup = ArvoButtonGroup.initialize(host, {
      items: [
        {
          value: "am",
          label: this._ampmLabels.am,
          isDisabled: this._amOptions.length === 0
        },
        {
          value: "pm",
          label: this._ampmLabels.pm,
          isDisabled: this._pmOptions.length === 0
        }
      ],
      value: this._ampm,
      variant: "primary",
      size: "sm",
      isDisabled: !!this._options.isDisabled,
      ariaLabel: "Select AM or PM",
      onChange: (detail) => {
        const next = detail.value;
        if (next === "am" || next === "pm") this._switchTab(next);
      }
    });
  }
  _updateTabsDisabledState() {
    if (!this._ampmGroup) return;
    this._ampmGroup.setItems([
      {
        value: "am",
        label: this._ampmLabels.am,
        isDisabled: this._amOptions.length === 0
      },
      {
        value: "pm",
        label: this._ampmLabels.pm,
        isDisabled: this._pmOptions.length === 0
      }
    ]);
    this._ampmGroup.value(this._ampm);
  }
  _renderList() {
    var _a;
    const el = this._element;
    if (!el) return;
    if (this._listEl) {
      this._listEl.removeEventListener("click", this._handleListClick);
      this._listEl.removeEventListener("keydown", this._handleListKeyDown);
      this._listEl.remove();
    }
    const list = document.createElement("ul");
    list.className = "arvo-tdrop__list";
    list.setAttribute("role", "listbox");
    list.tabIndex = -1;
    if (this._options.isDisabled) list.setAttribute("aria-disabled", "true");
    this._optionEls = [];
    const value = this._options.value ?? null;
    for (const opt of this._visibleOptions) {
      const li = document.createElement("li");
      const active = value != null && value.hours === opt.hours && value.minutes === opt.minutes;
      const focused = opt.key === this._focusedKey;
      li.className = ["arvo-tdrop__item", active ? "active" : ""].filter(Boolean).join(" ");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(active));
      li.title = opt.label;
      li.tabIndex = focused ? 0 : -1;
      li.setAttribute("data-key", opt.key);
      const label = document.createElement("span");
      label.className = "arvo-tdrop__label";
      label.textContent = opt.label;
      li.appendChild(label);
      list.appendChild(li);
      this._optionEls.push(li);
    }
    list.addEventListener("click", this._handleListClick);
    list.addEventListener("keydown", this._handleListKeyDown);
    this._listEl = list;
    el.appendChild(list);
    (_a = this._arrowNav) == null ? void 0 : _a.setItems(this._optionEls);
    this._updateTabsDisabledState();
  }
  /** Surgical class/aria swap for the active item -- preserves DOM focus. */
  _updateSelectionDOM() {
    const value = this._options.value ?? null;
    for (let i = 0; i < this._visibleOptions.length; i++) {
      const opt = this._visibleOptions[i];
      const el = this._optionEls[i];
      if (!el) continue;
      const active = value != null && value.hours === opt.hours && value.minutes === opt.minutes;
      el.classList.toggle("active", active);
      el.setAttribute("aria-selected", String(active));
    }
  }
  /** Update tabindex on all visible option elements to match _focusedKey. */
  _updateFocusedTabindex() {
    for (let i = 0; i < this._visibleOptions.length; i++) {
      const el = this._optionEls[i];
      if (!el) continue;
      el.tabIndex = this._visibleOptions[i].key === this._focusedKey ? 0 : -1;
    }
  }
  _scrollFocusedIntoView() {
    var _a;
    const idx = this._visibleOptions.findIndex((o) => o.key === this._focusedKey);
    if (idx < 0) return;
    (_a = this._optionEls[idx]) == null ? void 0 : _a.scrollIntoView({ block: "nearest" });
  }
  // ---------------------------------------------------------------------------
  // Keyboard
  // ---------------------------------------------------------------------------
  _setupKeyboard() {
    var _a;
    (_a = this._arrowNav) == null ? void 0 : _a.destroy();
    this._arrowNav = createArrowNav({
      items: this._optionEls,
      orientation: "vertical",
      wrap: false,
      onNavigate: (_item, index) => {
        const opt = this._visibleOptions[index];
        if (!opt) return;
        this._setFocusedKey(opt.key);
      },
      onSelect: (_item, index) => {
        const opt = this._visibleOptions[index];
        if (!opt) return;
        this._setFocusedKey(opt.key);
        this._emitChange(opt);
      }
    });
  }
  _setFocusedKey(key) {
    if (key === this._focusedKey) return;
    const prevIdx = this._visibleOptions.findIndex((o) => o.key === this._focusedKey);
    const nextIdx = this._visibleOptions.findIndex((o) => o.key === key);
    this._focusedKey = key;
    if (prevIdx >= 0 && this._optionEls[prevIdx]) {
      this._optionEls[prevIdx].tabIndex = -1;
    }
    if (nextIdx >= 0 && this._optionEls[nextIdx]) {
      const nextEl = this._optionEls[nextIdx];
      nextEl.tabIndex = 0;
      if (this._listEl && this._listEl.contains(document.activeElement)) {
        nextEl.focus();
      }
      nextEl.scrollIntoView({ block: "nearest" });
    }
  }
  // ---------------------------------------------------------------------------
  // Tab / selection mechanics (handled via ArvoButtonGroup's onChange callback)
  // ---------------------------------------------------------------------------
  _switchTab(which) {
    if (!this._use12Hour || this._options.isDisabled) return;
    const halfDayEmpty = which === "am" ? this._amOptions.length === 0 : this._pmOptions.length === 0;
    if (halfDayEmpty) return;
    if (this._ampm === which) return;
    this._ampm = which;
    this._refreshVisible();
    const stillPresent = this._visibleOptions.some((o) => o.key === this._focusedKey);
    if (!stillPresent) {
      const next = pickFocusKey(this._visibleOptions, this._options.value ?? null);
      this._focusedKey = next ?? "";
    }
    this._renderList();
    this._scrollFocusedIntoView();
  }
  // ---------------------------------------------------------------------------
  // Event dispatch
  // ---------------------------------------------------------------------------
  _emitChange(opt) {
    var _a, _b, _c;
    if (this._options.isDisabled) return;
    const value = {
      hours: opt.hours,
      minutes: opt.minutes,
      seconds: 0,
      milliseconds: 0
    };
    this._options.value = value;
    this._updateSelectionDOM();
    (_b = (_a = this._options).onChange) == null ? void 0 : _b.call(_a, value);
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(
      new CustomEvent("tdrop:change", { bubbles: true, detail: { value } })
    );
  }
  _emitDismiss() {
    var _a, _b, _c;
    (_b = (_a = this._options).onDismiss) == null ? void 0 : _b.call(_a);
    (_c = this._element) == null ? void 0 : _c.dispatchEvent(
      new CustomEvent("tdrop:dismiss", { bubbles: true, detail: {} })
    );
  }
}
export {
  ArvoTimeDropdown
};
//# sourceMappingURL=TimeDropdown.js.map
