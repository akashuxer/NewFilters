"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const normalize = require("./index31.cjs");
function renderInlineContent(content, adapter, options = {}) {
  const profile = options.profile ?? "basic-inline";
  const nodes = normalize.normalizeInlineContent(content, profile, options.mode);
  return adapter.fragment(nodes.map((n) => renderNode(n, adapter)));
}
function renderNode(node, adapter) {
  switch (node.type) {
    case "text":
      return adapter.text(node.value);
    case "em":
      return adapter.em(renderChildren(node.children, adapter));
    case "strong":
      return adapter.strong(renderChildren(node.children, adapter));
    case "link": {
      const link = {
        href: node.href,
        target: node.target ?? "_self",
        rel: node.rel,
        ariaLabel: node.ariaLabel
      };
      return adapter.link(link, node.label);
    }
    case "code":
      return adapter.code(node.value);
    case "kbd":
      return adapter.kbd(node.value);
    case "abbr":
      return adapter.abbr(node.value, node.title);
    case "time":
      return adapter.time(node.value, node.dateTime);
    case "sup":
      return adapter.sup(node.value);
    case "sub":
      return adapter.sub(node.value);
    case "br":
      return adapter.br();
  }
}
function renderChildren(children, adapter) {
  if (typeof children === "string") {
    return children.length > 0 ? [adapter.text(children)] : [];
  }
  return children.map((c) => renderNode(c, adapter));
}
exports.renderInlineContent = renderInlineContent;
//# sourceMappingURL=index32.cjs.map
