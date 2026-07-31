"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const adapter = require("./index32.cjs");
function appendAll(parent, nodes) {
  for (const child of nodes) parent.appendChild(child);
}
const domInlineAdapter = {
  fragment(children) {
    const frag = document.createDocumentFragment();
    appendAll(frag, children);
    return frag;
  },
  text(value) {
    return document.createTextNode(value);
  },
  em(children) {
    const el = document.createElement("em");
    el.className = "arvo-inline__em";
    appendAll(el, children);
    return el;
  },
  strong(children) {
    const el = document.createElement("strong");
    el.className = "arvo-inline__strong";
    appendAll(el, children);
    return el;
  },
  link(props, label) {
    const a = document.createElement("a");
    a.className = "arvo-inline__link";
    a.setAttribute("href", props.href);
    a.setAttribute("target", props.target);
    if (props.rel) a.setAttribute("rel", props.rel);
    if (props.ariaLabel) a.setAttribute("aria-label", props.ariaLabel);
    a.textContent = label;
    return a;
  },
  code(value) {
    const el = document.createElement("code");
    el.className = "arvo-inline__code";
    el.textContent = value;
    return el;
  },
  kbd(value) {
    const el = document.createElement("kbd");
    el.className = "arvo-inline__kbd";
    el.textContent = value;
    return el;
  },
  abbr(value, title) {
    const el = document.createElement("abbr");
    el.className = "arvo-inline__abbr";
    el.setAttribute("title", title);
    el.textContent = value;
    return el;
  },
  time(value, dateTime) {
    const el = document.createElement("time");
    el.className = "arvo-inline__time";
    el.setAttribute("datetime", dateTime);
    el.textContent = value;
    return el;
  },
  sup(value) {
    const el = document.createElement("sup");
    el.className = "arvo-inline__sup";
    el.textContent = value;
    return el;
  },
  sub(value) {
    const el = document.createElement("sub");
    el.className = "arvo-inline__sub";
    el.textContent = value;
    return el;
  },
  br() {
    return document.createElement("br");
  }
};
function renderInlineContentToDOM(content, options) {
  return adapter.renderInlineContent(content, domInlineAdapter, options);
}
function replaceInlineContentInElement(el, content, options) {
  while (el.firstChild) el.removeChild(el.firstChild);
  el.appendChild(renderInlineContentToDOM(content, options));
}
exports.domInlineAdapter = domInlineAdapter;
exports.renderInlineContentToDOM = renderInlineContentToDOM;
exports.replaceInlineContentInElement = replaceInlineContentInElement;
//# sourceMappingURL=index33.cjs.map
