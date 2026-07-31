import { tooltipManager, connectTooltip } from "@arvo/core";
const _ArvoTooltip = class _ArvoTooltip {
  // Public constructor so the jQuery plugin path (`new Class(el, opts)` inside
  // `registerArvoPlugins`) works alongside the canonical
  // `ArvoTooltip.initialize()` factory. DEFAULTS are merged and the manager
  // is defaulted here so both paths behave identically.
  constructor(element, options, manager = tooltipManager) {
    const opts = { ..._ArvoTooltip.DEFAULTS, ...options };
    this._element = element;
    this._connector = connectTooltip(manager, {
      anchor: element,
      content: opts.content,
      placement: opts.placement,
      shortcut: opts.shortcut
    });
  }
  static initialize(element, options, manager) {
    return new _ArvoTooltip(element, options, manager ?? tooltipManager);
  }
  update(options) {
    const patch = {};
    if ("content" in options && options.content !== void 0) {
      patch.content = options.content;
    }
    if ("placement" in options && options.placement !== void 0) {
      patch.placement = options.placement;
    }
    if ("shortcut" in options && options.shortcut !== void 0) {
      patch.shortcut = options.shortcut;
    }
    this._connector.update(patch);
  }
  destroy() {
    this._connector.destroy();
  }
  get element() {
    return this._element;
  }
};
_ArvoTooltip.DEFAULTS = {};
let ArvoTooltip = _ArvoTooltip;
export {
  ArvoTooltip
};
//# sourceMappingURL=Tooltip.js.map
