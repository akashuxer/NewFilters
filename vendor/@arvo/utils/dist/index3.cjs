"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const core = require("@arvo/core");
function attachTitleTruncationTooltip(options) {
  const { element, triggerElement, placement = "bottom-center" } = options;
  const anchor = triggerElement ?? element;
  let _content = options.content;
  const connector = core.connectTooltip(core.tooltipManager, {
    anchor,
    content: () => typeof _content === "function" ? _content() : _content,
    placement,
    labelElement: element,
    autoOnTruncation: true,
    kind: "truncation"
  });
  let observer = null;
  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(() => {
    });
    observer.observe(element);
  }
  let destroyed = false;
  return {
    update(newContent) {
      _content = newContent;
      connector.update({});
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      observer == null ? void 0 : observer.disconnect();
      observer = null;
      connector.destroy();
    }
  };
}
exports.attachTitleTruncationTooltip = attachTitleTruncationTooltip;
//# sourceMappingURL=index3.cjs.map
