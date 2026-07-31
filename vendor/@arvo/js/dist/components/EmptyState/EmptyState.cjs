"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const Button = require("../Button/Button.cjs");
const Link = require("../Link/Link.cjs");
const KNOWN_ILLUSTRATIONS = {
  "no-results": "o9illus-no-results-found",
  "no-data": "o9illus-no-filters-found"
};
const BLOCK = "arvo-empty";
const DEFAULTS = {
  size: "md",
  orientation: "vertical",
  illustration: "no-results",
  title: "",
  message: "Adjust your filter search query.",
  isAnimated: true
};
function resolveIllustrationClass(illustration) {
  if (illustration === "no-results" || illustration === "no-data") {
    return KNOWN_ILLUSTRATIONS[illustration];
  }
  if (illustration.startsWith("o9illus-")) {
    return illustration;
  }
  return `o9illus-${illustration}`;
}
function buildClasses(opts) {
  const size = opts.size ?? DEFAULTS.size;
  const orientation = opts.orientation ?? DEFAULTS.orientation;
  const isAnimated = opts.isAnimated ?? DEFAULTS.isAnimated;
  return [
    BLOCK,
    `${BLOCK}--${size}`,
    `${BLOCK}--${orientation}`,
    !isAnimated && `${BLOCK}--no-anim`,
    opts.className ?? ""
  ].filter(Boolean).join(" ");
}
class ArvoEmptyState {
  constructor(element, options = {}) {
    this._primaryBtn = null;
    this._secondaryBtn = null;
    this._link = null;
    this._destroyed = false;
    const root = element instanceof HTMLDivElement ? element : document.createElement("div");
    this.el = root;
    this._render(options);
  }
  static create(options = {}) {
    return new ArvoEmptyState(null, options);
  }
  static initialize(element, options = {}) {
    return new ArvoEmptyState(element, options);
  }
  _render(options) {
    const root = this.el;
    const illustration = options.illustration ?? DEFAULTS.illustration;
    const title = options.title ?? DEFAULTS.title;
    const message = options.message ?? DEFAULTS.message;
    root.className = buildClasses(options);
    root.setAttribute("role", "status");
    root.setAttribute("aria-live", "polite");
    if (options.id) root.id = options.id;
    const figure = document.createElement("div");
    figure.className = `${BLOCK}__figure`;
    const illus = document.createElement("span");
    illus.className = `${BLOCK}__illus o9illus ${resolveIllustrationClass(illustration)}`;
    illus.setAttribute("aria-hidden", "true");
    figure.appendChild(illus);
    const body = document.createElement("div");
    body.className = `${BLOCK}__body`;
    if (title || message) {
      const msg = document.createElement("div");
      msg.className = `${BLOCK}__msg`;
      if (title) {
        const titleEl = document.createElement("span");
        titleEl.className = `${BLOCK}__title`;
        titleEl.textContent = title;
        msg.appendChild(titleEl);
      }
      if (message) {
        const msgEl = document.createElement("span");
        msgEl.className = `${BLOCK}__message`;
        msgEl.textContent = message;
        msg.appendChild(msgEl);
      }
      body.appendChild(msg);
    }
    const hasButtons = !!(options.primaryAction || options.secondaryAction);
    const hasActions = hasButtons || !!options.link;
    if (hasActions) {
      const actions = document.createElement("div");
      actions.className = `${BLOCK}__actions`;
      if (hasButtons) {
        const row = document.createElement("div");
        row.className = `${BLOCK}__action-row`;
        if (options.secondaryAction) {
          const btnEl = document.createElement("button");
          row.appendChild(btnEl);
          this._secondaryBtn = Button.ArvoButton.initialize(btnEl, {
            label: options.secondaryAction.label,
            icon: options.secondaryAction.icon,
            variant: options.secondaryAction.variant ?? "outline",
            size: "sm",
            isDisabled: options.secondaryAction.isDisabled,
            onClick: options.secondaryAction.onClick
          });
        }
        if (options.primaryAction) {
          const btnEl = document.createElement("button");
          row.appendChild(btnEl);
          this._primaryBtn = Button.ArvoButton.initialize(btnEl, {
            label: options.primaryAction.label,
            icon: options.primaryAction.icon,
            variant: options.primaryAction.variant ?? "primary",
            size: "sm",
            isDisabled: options.primaryAction.isDisabled,
            onClick: options.primaryAction.onClick
          });
        }
        actions.appendChild(row);
      }
      if (options.link) {
        const linkWrap = document.createElement("span");
        linkWrap.className = `${BLOCK}__link`;
        const aEl = document.createElement("a");
        linkWrap.appendChild(aEl);
        this._link = Link.ArvoLink.initialize(aEl, {
          label: options.link.label,
          href: options.link.href,
          icon: options.link.icon ?? "add-attachment",
          isExternal: options.link.isExternal,
          size: "sm",
          onClick: options.link.onClick
        });
        actions.appendChild(linkWrap);
      }
      body.appendChild(actions);
    }
    figure.appendChild(body);
    root.replaceChildren(figure);
  }
  /** Re-render the figure with new options. Inner Arvo* instances are
   * recreated to keep the implementation simple; consumers update infrequently. */
  update(options) {
    if (this._destroyed) return;
    this._teardownInner();
    this._render(options);
  }
  _teardownInner() {
    var _a, _b, _c;
    (_a = this._primaryBtn) == null ? void 0 : _a.destroy();
    this._primaryBtn = null;
    (_b = this._secondaryBtn) == null ? void 0 : _b.destroy();
    this._secondaryBtn = null;
    (_c = this._link) == null ? void 0 : _c.destroy();
    this._link = null;
  }
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._teardownInner();
  }
}
exports.ArvoEmptyState = ArvoEmptyState;
exports.KNOWN_ILLUSTRATIONS = KNOWN_ILLUSTRATIONS;
//# sourceMappingURL=EmptyState.cjs.map
