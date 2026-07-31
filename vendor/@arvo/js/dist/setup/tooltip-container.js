import { tooltipManager, isTruncated } from "@arvo/core";
const _focusVisibleSupported = /* @__PURE__ */ (() => {
  try {
    return typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("selector(:focus-visible)");
  } catch {
    return false;
  }
})();
function resolveContent(anchor, source) {
  const value = typeof source === "function" ? source(anchor) : source;
  if (value == null || value === "") return null;
  return value;
}
function resolveShortcut(anchor, source) {
  if (source == null) return void 0;
  const value = typeof source === "function" ? source(anchor) : source;
  return value == null || value === "" ? void 0 : value;
}
class ArvoTooltipContainer {
  constructor(container, options, manager = tooltipManager) {
    this._currentAnchor = null;
    this._container = container;
    this._opts = { ...options, entries: [...options.entries] };
    this._manager = manager;
    this._onMouseOver = (e) => this._handleMouseOver(e);
    this._onMouseOut = (e) => this._handleMouseOut(e);
    this._onFocusIn = (e) => this._handleFocusIn(e);
    this._onFocusOut = (e) => this._handleFocusOut(e);
    this._bind();
  }
  static initialize(container, options, manager) {
    return new ArvoTooltipContainer(container, options, manager ?? tooltipManager);
  }
  /**
   * Merge new options into the container. `entries` may be swapped;
   * no listener rebind is required since delegation is scoped to the
   * container element itself.
   */
  update(patch) {
    this._opts = {
      ...this._opts,
      ...patch,
      entries: patch.entries ? [...patch.entries] : this._opts.entries
    };
  }
  /**
   * Remove all listeners and hide the tooltip if it is currently
   * associated with this container's anchor. The shared tooltip DOM
   * element and singleton manager stay alive for other consumers.
   */
  destroy() {
    this._unbind();
    if (this._currentAnchor) {
      this._manager.hide(true);
      this._currentAnchor = null;
    }
  }
  // -----------------------------------------------------------------------
  // Internals
  // -----------------------------------------------------------------------
  _bind() {
    this._container.addEventListener("mouseover", this._onMouseOver);
    this._container.addEventListener("mouseout", this._onMouseOut);
    this._container.addEventListener("focusin", this._onFocusIn);
    this._container.addEventListener("focusout", this._onFocusOut);
  }
  _unbind() {
    this._container.removeEventListener("mouseover", this._onMouseOver);
    this._container.removeEventListener("mouseout", this._onMouseOut);
    this._container.removeEventListener("focusin", this._onFocusIn);
    this._container.removeEventListener("focusout", this._onFocusOut);
  }
  /**
   * Resolve the first entry whose `filter` selector matches an ancestor
   * of `target` inside this container. First-wins mirrors Kendo's
   * `getConfigForTooltip` iteration order and is documented as the
   * public semantic contract.
   */
  _resolveEntry(target) {
    if (!(target instanceof Element)) return null;
    for (const entry of this._opts.entries) {
      const anchor = target.closest(entry.filter);
      if (anchor && this._container.contains(anchor)) {
        return { entry, anchor };
      }
    }
    return null;
  }
  /**
   * Truncation gate. Returns true when the entry opts into truncation
   * but the resolved text element isn't actually clipped -- caller
   * should skip the show.
   */
  _isTruncationSuppressed(entry, anchor) {
    if (!entry.truncated) return false;
    const textEl = entry.textSelector ? anchor.querySelector(entry.textSelector) : anchor;
    if (!textEl) return true;
    return !isTruncated(textEl);
  }
  _showFor(anchor, entry, trigger) {
    if (this._isTruncationSuppressed(entry, anchor)) return;
    const content = resolveContent(anchor, entry.content);
    if (content == null) return;
    const shortcut = resolveShortcut(anchor, entry.shortcut);
    const placement = entry.placement ?? this._opts.placement;
    this._currentAnchor = anchor;
    this._manager.show({
      anchor,
      content,
      placement,
      shortcut,
      trigger
    });
  }
  _handleMouseOver(e) {
    const match = this._resolveEntry(e.target);
    if (!match) return;
    const related = e.relatedTarget;
    if (this._currentAnchor === match.anchor && related && match.anchor.contains(related)) {
      return;
    }
    this._showFor(match.anchor, match.entry, "hover");
  }
  _handleMouseOut(e) {
    if (!this._currentAnchor) return;
    const anchor = this._currentAnchor;
    const target = e.target;
    if (!target || !anchor.contains(target)) return;
    const related = e.relatedTarget;
    if (related && anchor.contains(related)) return;
    if (related instanceof Element) {
      const nextMatch = this._resolveEntry(related);
      if (nextMatch && nextMatch.anchor !== anchor && this._container.contains(nextMatch.anchor)) {
        return;
      }
    }
    this._currentAnchor = null;
    this._manager.hide();
  }
  _handleFocusIn(e) {
    const match = this._resolveEntry(e.target);
    if (!match) return;
    if (_focusVisibleSupported) {
      const target = e.target;
      try {
        const hasVisibleFocus = match.anchor.matches(":focus-visible") || !!(target == null ? void 0 : target.matches(":focus-visible"));
        if (!hasVisibleFocus) return;
      } catch {
      }
    }
    this._showFor(match.anchor, match.entry, "focus");
  }
  _handleFocusOut(e) {
    if (!this._currentAnchor) return;
    const target = e.target;
    if (!target || !this._currentAnchor.contains(target)) return;
    this._currentAnchor = null;
    this._manager.hide(true);
  }
  // -----------------------------------------------------------------------
  // Debug / introspection helpers -- intentionally minimal.
  // -----------------------------------------------------------------------
  /** The container element this adapter is attached to. */
  get element() {
    return this._container;
  }
}
export {
  ArvoTooltipContainer
};
//# sourceMappingURL=tooltip-container.js.map
