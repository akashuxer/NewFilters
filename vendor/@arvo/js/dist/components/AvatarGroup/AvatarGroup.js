import { createTabRoving, connectTooltip, tooltipManager } from "@arvo/core";
import { ArvoAvatar } from "../Avatar/Avatar.js";
import { ArvoPopover } from "../Popover/Popover.js";
const VALID_SIZES = ["xs", "sm", "md", "lg", "xl"];
const DEFAULTS = {
  avatars: [],
  size: "md",
  maxCount: 5,
  hasTooltip: true,
  tooltipPosition: "bottom",
  label: "avatar group",
  defaultOpen: false,
  overflowPlacement: "bottom",
  isDisabled: false,
  isLoading: false
};
function clampMaxCount(input) {
  if (!Number.isFinite(input)) return DEFAULTS.maxCount;
  const n = Math.floor(input);
  return n < 1 ? 1 : n;
}
function pickEnum(value, valid, fallback) {
  return value !== void 0 && valid.includes(value) ? value : fallback;
}
function defaultMoreLabel(hiddenCount) {
  return `${hiddenCount} additional collaborators`;
}
function hiddenNamesPhrase(hidden, cap = 8) {
  const names = hidden.map((h) => h.name ?? h.alt ?? h.id).filter(Boolean);
  if (names.length === 0) return "";
  if (names.length <= cap) return names.join(", ");
  return `${names.slice(0, cap).join(", ")}, and ${names.length - cap} more`;
}
function rowLabel(item) {
  return item.name ?? item.alt ?? item.id;
}
const _ArvoAvatarGroup = class _ArvoAvatarGroup {
  constructor(element, options) {
    this._destroyed = false;
    this._isOpen = false;
    this._childAvatars = [];
    this._overflowWrapEl = null;
    this._overflowBtn = null;
    this._popover = null;
    this._popoverChildAvatars = [];
    this._tooltipConnector = null;
    this._tabRoving = null;
    this._onMoreClickBound = null;
    this._onPopoverOpenBound = null;
    this._onPopoverCloseBound = null;
    this.el = element;
    this._opts = this._normalize(options);
    this._isOpen = this._opts.isOpen ?? this._opts.defaultOpen;
    this._render();
  }
  static initialize(element, options) {
    const host = element ?? document.createElement("div");
    return new _ArvoAvatarGroup(host, options);
  }
  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------
  _normalize(options) {
    const o = options ?? {};
    return {
      avatars: Array.isArray(o.avatars) ? o.avatars : DEFAULTS.avatars,
      size: pickEnum(o.size, VALID_SIZES, DEFAULTS.size),
      maxCount: clampMaxCount(o.maxCount),
      hasTooltip: o.hasTooltip ?? DEFAULTS.hasTooltip,
      tooltipPosition: pickEnum(
        o.tooltipPosition,
        ["top", "bottom"],
        DEFAULTS.tooltipPosition
      ),
      label: o.label ?? DEFAULTS.label,
      moreIndicatorLabel: o.moreIndicatorLabel ?? null,
      isOpen: o.isOpen ?? null,
      defaultOpen: o.defaultOpen ?? DEFAULTS.defaultOpen,
      onOpenChange: o.onOpenChange ?? null,
      onMoreClick: o.onMoreClick ?? null,
      overflowPlacement: pickEnum(
        o.overflowPlacement,
        ["top", "bottom"],
        DEFAULTS.overflowPlacement
      ),
      popoverProps: o.popoverProps ?? null,
      isDisabled: o.isDisabled ?? DEFAULTS.isDisabled,
      isLoading: o.isLoading ?? DEFAULTS.isLoading,
      id: o.id ?? null
    };
  }
  _visibleHiddenSplit() {
    const { avatars, maxCount } = this._opts;
    if (avatars.length <= maxCount) {
      return { visible: avatars, hidden: [] };
    }
    const visibleCount = Math.max(0, maxCount - 1);
    return {
      visible: avatars.slice(0, visibleCount),
      hidden: avatars.slice(visibleCount)
    };
  }
  _render() {
    this._teardownChildren();
    this.el.textContent = "";
    if (this._opts.id) this.el.id = this._opts.id;
    this._applyRootClasses();
    this._applyRootAttributes();
    const isLoading = this._opts.isLoading === true;
    const { visible, hidden } = this._visibleHiddenSplit();
    for (const item of visible) {
      const wrap = document.createElement("span");
      wrap.className = "arvo-avt-grp__item";
      const host = document.createElement("span");
      wrap.appendChild(host);
      this.el.appendChild(wrap);
      this._childAvatars.push(
        ArvoAvatar.initialize(host, {
          ...item,
          size: this._opts.size,
          isDisabled: this._opts.isDisabled || item.isDisabled,
          isLoading,
          tooltip: this._opts.hasTooltip ? item.tooltip ?? item.name ?? item.alt ?? null : null
        })
      );
    }
    if (hidden.length > 0) {
      this._renderOverflow(hidden);
    }
    this._setupTabRoving();
  }
  // -------------------------------------------------------------------------
  // Roving tabindex
  // -------------------------------------------------------------------------
  /**
   * Collect the focusable elements that participate in the roving rotation:
   * the inner element of every visible avatar (`.arvo-avt` -- a `<button>`,
   * `<a>`, or `<span>` depending on interactivity) and the overflow tile.
   * Returned in left-to-right DOM order.
   */
  _getRovingItems() {
    const items = [];
    const wrappers = this.el.querySelectorAll(
      ".arvo-avt-grp__item"
    );
    wrappers.forEach((wrap) => {
      if (wrap.classList.contains("arvo-avt-grp__item--overflow")) {
        if (this._overflowBtn) items.push(this._overflowBtn);
        return;
      }
      const inner = wrap.querySelector(".arvo-avt");
      if (inner) items.push(inner);
    });
    return items;
  }
  _setupTabRoving() {
    this._teardownTabRoving();
    const items = this._getRovingItems();
    if (items.length === 0) return;
    const roving = createTabRoving();
    roving.activate({
      container: this.el,
      items,
      orientation: "horizontal",
      wrap: true
    });
    this._tabRoving = roving;
  }
  _teardownTabRoving() {
    if (!this._tabRoving) return;
    this._tabRoving.deactivate();
    this._tabRoving = null;
  }
  _renderOverflow(hidden) {
    var _a;
    const wrap = document.createElement("span");
    wrap.className = "arvo-avt-grp__item arvo-avt-grp__item--overflow";
    this._overflowWrapEl = wrap;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "arvo-avt-grp__overflow";
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("data-arvo-loading-ignore", "true");
    btn.textContent = `+${hidden.length}`;
    this._overflowBtn = btn;
    wrap.appendChild(btn);
    this.el.appendChild(wrap);
    this._applyOverflowState();
    const listEl = document.createElement("ul");
    listEl.className = "arvo-avt-grp__list";
    listEl.setAttribute("role", "list");
    for (const item of hidden) {
      const li = document.createElement("li");
      li.className = "arvo-avt-grp__list-item";
      const avtHost = document.createElement("span");
      li.appendChild(avtHost);
      const lbl = document.createElement("span");
      lbl.className = "arvo-avt-grp__list-lbl";
      lbl.textContent = rowLabel(item);
      li.appendChild(lbl);
      listEl.appendChild(li);
      this._popoverChildAvatars.push(
        ArvoAvatar.initialize(avtHost, {
          ...item,
          size: "sm",
          isInteractive: false,
          isLoading: false
        })
      );
    }
    const placement = this._opts.overflowPlacement === "top" ? "top-end" : "bottom-end";
    this._popover = ArvoPopover.initialize(btn, {
      ...this._opts.popoverProps ?? {},
      content: listEl,
      placement,
      offset: ((_a = this._opts.popoverProps) == null ? void 0 : _a.offset) ?? 4,
      // Strip all chrome (no header, footer, back, close, arrow).
      hasHeader: false,
      hasFooter: false,
      hasArrow: false,
      isClosable: false,
      hasBackButton: false,
      title: "",
      headerActions: [],
      actions: []
    });
    this._onMoreClickBound = (event) => this._handleMoreClick(event);
    btn.addEventListener("click", this._onMoreClickBound, { capture: true });
    this._onPopoverOpenBound = () => this._handlePopoverTransition(true);
    this._onPopoverCloseBound = () => this._handlePopoverTransition(false);
    btn.addEventListener("popover:open", this._onPopoverOpenBound);
    btn.addEventListener("popover:close", this._onPopoverCloseBound);
    this._attachOverflowTooltip(hidden);
    const blocked = this._opts.isDisabled || this._opts.isLoading === true;
    if (this._isOpen && !blocked) {
      this._popover.open();
    }
  }
  _attachOverflowTooltip(hidden) {
    if (!this._overflowBtn) return;
    if (this._tooltipConnector) {
      this._tooltipConnector.destroy();
      this._tooltipConnector = null;
    }
    const content = this._opts.hasTooltip && hidden.length > 0 ? hiddenNamesPhrase(hidden) : this._opts.moreIndicatorLabel ?? defaultMoreLabel(hidden.length);
    this._tooltipConnector = connectTooltip(tooltipManager, {
      anchor: this._overflowBtn,
      content,
      placement: this._opts.tooltipPosition === "top" ? "top-center" : "bottom-center"
    });
  }
  _detachOverflowTooltip() {
    if (this._tooltipConnector) {
      this._tooltipConnector.destroy();
      this._tooltipConnector = null;
    }
  }
  _teardownChildren() {
    this._teardownTabRoving();
    for (const child of this._childAvatars) child.destroy();
    this._childAvatars = [];
    for (const child of this._popoverChildAvatars) child.destroy();
    this._popoverChildAvatars = [];
    if (this._overflowBtn) {
      if (this._onMoreClickBound) {
        this._overflowBtn.removeEventListener(
          "click",
          this._onMoreClickBound,
          { capture: true }
        );
      }
      if (this._onPopoverOpenBound) {
        this._overflowBtn.removeEventListener("popover:open", this._onPopoverOpenBound);
      }
      if (this._onPopoverCloseBound) {
        this._overflowBtn.removeEventListener("popover:close", this._onPopoverCloseBound);
      }
    }
    this._onMoreClickBound = null;
    this._onPopoverOpenBound = null;
    this._onPopoverCloseBound = null;
    this._detachOverflowTooltip();
    if (this._popover) {
      this._popover.destroy();
      this._popover = null;
    }
    this._overflowWrapEl = null;
    this._overflowBtn = null;
  }
  // -------------------------------------------------------------------------
  // Class / attribute application
  // -------------------------------------------------------------------------
  _applyRootClasses() {
    const isLoading = this._opts.isLoading === true;
    const classes = ["arvo-avt-grp", `arvo-avt-grp--${this._opts.size}`];
    if (isLoading) classes.push("loading");
    this.el.className = classes.join(" ");
  }
  _applyRootAttributes() {
    this.el.setAttribute("role", "group");
    this.el.setAttribute("aria-label", this._opts.label);
    const isLoading = this._opts.isLoading === true;
    if (isLoading) {
      this.el.setAttribute("aria-busy", "true");
      this.el.setAttribute("data-arvo-loading", "true");
    } else {
      this.el.removeAttribute("aria-busy");
      this.el.removeAttribute("data-arvo-loading");
    }
    if (this._opts.isDisabled) {
      this.el.setAttribute("aria-disabled", "true");
    } else {
      this.el.removeAttribute("aria-disabled");
    }
  }
  _applyOverflowState() {
    if (!this._overflowBtn) return;
    const blocked = this._opts.isDisabled || this._opts.isLoading === true;
    const { hidden } = this._visibleHiddenSplit();
    const resolvedMoreLabel = this._opts.moreIndicatorLabel ?? defaultMoreLabel(hidden.length);
    this._overflowBtn.setAttribute("aria-label", resolvedMoreLabel);
    this._overflowBtn.setAttribute(
      "aria-expanded",
      String(this._isOpen && !blocked)
    );
    this._overflowBtn.classList.toggle(
      "is-open",
      this._isOpen && !blocked
    );
    if (blocked) {
      this._overflowBtn.setAttribute("aria-disabled", "true");
      this._overflowBtn.setAttribute("disabled", "");
    } else {
      this._overflowBtn.removeAttribute("aria-disabled");
      this._overflowBtn.removeAttribute("disabled");
    }
  }
  // -------------------------------------------------------------------------
  // Event handlers
  // -------------------------------------------------------------------------
  _handleMoreClick(event) {
    var _a, _b;
    const blocked = this._opts.isDisabled || this._opts.isLoading === true;
    if (blocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const customEvt = new CustomEvent("avt-grp:more-click", {
      bubbles: true,
      cancelable: true,
      detail: { originalEvent: event }
    });
    this.el.dispatchEvent(customEvt);
    (_b = (_a = this._opts).onMoreClick) == null ? void 0 : _b.call(_a, event);
    if (customEvt.defaultPrevented || event.defaultPrevented) {
      event.stopImmediatePropagation();
    }
  }
  _handlePopoverTransition(opened) {
    var _a, _b;
    if (this._isOpen === opened) return;
    this._isOpen = opened;
    this._applyOverflowState();
    this.el.dispatchEvent(
      new CustomEvent(opened ? "avt-grp:open" : "avt-grp:close", {
        bubbles: true
      })
    );
    (_b = (_a = this._opts).onOpenChange) == null ? void 0 : _b.call(_a, opened);
  }
  // -------------------------------------------------------------------------
  // Public API (mirrors the React props as setters + dual-purpose accessors)
  // -------------------------------------------------------------------------
  setAvatars(avatars) {
    this._opts.avatars = Array.isArray(avatars) ? avatars : [];
    this._isOpen = false;
    this._render();
  }
  setSize(size) {
    if (!VALID_SIZES.includes(size)) return;
    this._opts.size = size;
    this._render();
  }
  setMaxCount(count) {
    this._opts.maxCount = clampMaxCount(count);
    this._render();
  }
  setHasTooltip(enabled) {
    this._opts.hasTooltip = !!enabled;
    this._render();
  }
  setLabel(label) {
    this._opts.label = label;
    this.el.setAttribute("aria-label", label);
  }
  disabled(state) {
    var _a;
    if (state === void 0) return this._opts.isDisabled;
    this._opts.isDisabled = !!state;
    for (const child of this._childAvatars) child.disabled(this._opts.isDisabled);
    this._applyRootAttributes();
    this._applyOverflowState();
    if (this._opts.isDisabled && this._isOpen) {
      (_a = this._popover) == null ? void 0 : _a.close();
    }
  }
  loading(state) {
    var _a;
    if (state === void 0) return this._opts.isLoading;
    this._opts.isLoading = !!state;
    for (const child of this._childAvatars) child.loading(this._opts.isLoading);
    this._applyRootClasses();
    this._applyRootAttributes();
    this._applyOverflowState();
    if (this._opts.isLoading && this._isOpen) {
      (_a = this._popover) == null ? void 0 : _a.close();
    }
  }
  open(state) {
    if (state === void 0) return this._isOpen;
    if (!this._popover) return;
    if (this._opts.isDisabled || this._opts.isLoading === true) return;
    if (state) this._popover.open();
    else this._popover.close();
  }
  /** Tear down children + popover + listeners. Host element is preserved. */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._teardownChildren();
    this.el.textContent = "";
    this.el.removeAttribute("class");
    this.el.removeAttribute("role");
    this.el.removeAttribute("aria-label");
    this.el.removeAttribute("aria-busy");
    this.el.removeAttribute("aria-disabled");
    this.el.removeAttribute("data-arvo-loading");
  }
};
_ArvoAvatarGroup.SIZES = VALID_SIZES;
let ArvoAvatarGroup = _ArvoAvatarGroup;
export {
  ArvoAvatarGroup
};
//# sourceMappingURL=AvatarGroup.js.map
