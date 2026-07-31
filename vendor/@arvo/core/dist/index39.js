import { isTruncated } from "./index26.js";
const _focusVisibleSupported = /* @__PURE__ */ (() => {
  try {
    return typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("selector(:focus-visible)");
  } catch {
    return false;
  }
})();
const _explicitAnchors = /* @__PURE__ */ new WeakMap();
function markExplicit(anchor) {
  const prev = _explicitAnchors.get(anchor) ?? 0;
  _explicitAnchors.set(anchor, prev + 1);
}
function unmarkExplicit(anchor) {
  const prev = _explicitAnchors.get(anchor);
  if (prev === void 0) return;
  if (prev <= 1) {
    _explicitAnchors.delete(anchor);
  } else {
    _explicitAnchors.set(anchor, prev - 1);
  }
}
function hasExplicitInAncestors(anchor) {
  let node = anchor;
  while (node) {
    if (_explicitAnchors.has(node)) return true;
    node = node.parentElement;
  }
  return false;
}
function connectTooltip(manager, options) {
  let _opts = { ...options };
  function resolveKind() {
    return _opts.kind ?? "explicit";
  }
  function resolveContent() {
    return typeof _opts.content === "function" ? _opts.content() : _opts.content;
  }
  function shouldSuppress() {
    var _a;
    if (resolveKind() === "truncation" && hasExplicitInAncestors(_opts.anchor)) {
      return true;
    }
    if (!_opts.autoOnTruncation) return false;
    const labelEl = _opts.labelElement ?? _opts.anchor;
    const content = resolveContent();
    const labelText = ((_a = labelEl.textContent) == null ? void 0 : _a.trim()) ?? "";
    return content === labelText && !isTruncated(labelEl);
  }
  function buildShowOptions(trigger) {
    return {
      anchor: _opts.anchor,
      content: resolveContent(),
      placement: _opts.placement,
      shortcut: _opts.shortcut,
      trigger,
      suppressAria: resolveKind() === "truncation"
    };
  }
  function onMouseEnter() {
    if (shouldSuppress()) return;
    manager.show(buildShowOptions("hover"));
  }
  function onMouseLeave() {
    manager.hide();
  }
  function onFocusIn(e) {
    if (shouldSuppress()) return;
    if (_focusVisibleSupported) {
      const target = e.target;
      try {
        const hasVisibleFocus = _opts.anchor.matches(":focus-visible") || !!(target == null ? void 0 : target.matches(":focus-visible"));
        if (!hasVisibleFocus) return;
      } catch {
      }
    }
    manager.show(buildShowOptions("focus"));
  }
  function onFocusOut() {
    manager.hide(true);
  }
  function bind() {
    const el = _opts.anchor;
    el.addEventListener("mouseenter", onMouseEnter);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    if (resolveKind() === "explicit") {
      markExplicit(el);
    }
  }
  function unbind() {
    const el = _opts.anchor;
    el.removeEventListener("mouseenter", onMouseEnter);
    el.removeEventListener("mouseleave", onMouseLeave);
    el.removeEventListener("focusin", onFocusIn);
    el.removeEventListener("focusout", onFocusOut);
    if (resolveKind() === "explicit") {
      unmarkExplicit(el);
    }
  }
  bind();
  return {
    update(newOpts) {
      const anchorChanged = !!newOpts.anchor && newOpts.anchor !== _opts.anchor;
      const kindChanged = newOpts.kind !== void 0 && newOpts.kind !== _opts.kind;
      if (anchorChanged || kindChanged) {
        unbind();
        _opts = { ..._opts, ...newOpts };
        bind();
      } else {
        _opts = { ..._opts, ...newOpts };
      }
    },
    destroy() {
      unbind();
      manager.hide(true);
    }
  };
}
export {
  connectTooltip
};
//# sourceMappingURL=index39.js.map
