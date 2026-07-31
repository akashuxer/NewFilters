"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const profiles = require("./index29.cjs");
const ALLOWED_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];
const FORBIDDEN_PROTOCOLS = ["javascript:", "data:", "vbscript:", "file:"];
const RELATIVE_PREFIXES = ["/", "./", "../", "#"];
function looksRelative(href) {
  return RELATIVE_PREFIXES.some((p) => href.startsWith(p));
}
function hasForbiddenProtocol(href) {
  const lower = href.trim().toLowerCase();
  return FORBIDDEN_PROTOCOLS.some((p) => lower.startsWith(p));
}
function hasAllowedProtocol(href) {
  const lower = href.trim().toLowerCase();
  return ALLOWED_PROTOCOLS.some((p) => lower.startsWith(p));
}
function sanitizeLink(node) {
  if (!node || typeof node !== "object") return null;
  if (typeof node.href !== "string" || node.href.length === 0) return null;
  if (typeof node.label !== "string" || node.label.length === 0) return null;
  const href = node.href.trim();
  if (hasForbiddenProtocol(href)) return null;
  if (!hasAllowedProtocol(href) && !looksRelative(href)) return null;
  const target = node.target === "_blank" ? "_blank" : "_self";
  let rel = node.rel;
  if (target === "_blank") {
    const tokens = new Set(
      (rel ?? "").split(/\s+/).map((t) => t.trim()).filter(Boolean)
    );
    tokens.add("noopener");
    tokens.add("noreferrer");
    rel = Array.from(tokens).join(" ");
  }
  return {
    href,
    target,
    rel,
    ariaLabel: node.ariaLabel
  };
}
const _warned = /* @__PURE__ */ new Set();
function warnOnce(message) {
  if (_warned.has(message)) return;
  _warned.add(message);
  if (typeof console !== "undefined" && typeof console.warn === "function") {
    console.warn(`[arvo/inline-content] ${message}`);
  }
}
function defaultMode() {
  try {
    if (typeof process !== "undefined" && process && typeof process.env !== "undefined") {
      const env = process.env.NODE_ENV;
      if (env === "production") return "strip";
    }
  } catch {
  }
  return "throw";
}
class InlineContentError extends Error {
  constructor(message) {
    super(`[arvo/inline-content] ${message}`);
    this.name = "InlineContentError";
  }
}
function emit(message, mode) {
  if (mode === "throw") {
    throw new InlineContentError(message);
  }
  if (mode === "warn") {
    warnOnce(message);
    return "warn";
  }
  warnOnce(message);
  return "strip";
}
function validateInlineContent(content, options) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) {
    emit(
      `Expected string or InlineNode[]; received ${typeof content}.`,
      options.mode ?? defaultMode()
    );
    return [];
  }
  const mode = options.mode ?? defaultMode();
  const allowed = new Set(profiles.getAllowedNodeTypes(options.profile));
  const out = [];
  for (const node of content) {
    if (node == null || typeof node !== "object" || Array.isArray(node)) {
      emit(
        `Inline node must be an object; received ${node === null ? "null" : typeof node}.`,
        mode
      );
      continue;
    }
    const nodeType = node.type;
    if (typeof nodeType !== "string") {
      emit("Inline node is missing a string `type` discriminator.", mode);
      continue;
    }
    if (!allowed.has(nodeType)) {
      emit(
        `Inline node type "${nodeType}" is not allowed in profile "${options.profile}".`,
        mode
      );
      if (mode === "strip") continue;
    }
    const validated = validateSingleNode(node, options);
    if (validated) out.push(validated);
  }
  return out;
}
function validateSingleNode(node, options) {
  const mode = options.mode ?? defaultMode();
  switch (node.type) {
    case "text": {
      if (typeof node.value !== "string") {
        emit("TextNode `value` must be a string.", mode);
        return mode === "strip" ? null : node;
      }
      return { type: "text", value: node.value };
    }
    case "em":
    case "strong": {
      const children = validateInlineContent(node.children, options);
      return { ...node, children };
    }
    case "link": {
      const link = sanitizeLink(node);
      if (!link) {
        emit(
          `Unsafe or invalid link href: "${String(node.href)}".`,
          mode
        );
        if (mode === "strip") return null;
        return node;
      }
      return {
        type: "link",
        label: node.label,
        href: link.href,
        target: link.target,
        rel: link.rel,
        ariaLabel: link.ariaLabel
      };
    }
    case "code":
    case "kbd": {
      if (typeof node.value !== "string") {
        emit(`${node.type} value must be a string.`, mode);
        return mode === "strip" ? null : node;
      }
      return node;
    }
    case "abbr": {
      if (typeof node.value !== "string" || typeof node.title !== "string") {
        emit("AbbrNode requires string `value` and `title`.", mode);
        return mode === "strip" ? null : node;
      }
      return node;
    }
    case "time": {
      if (typeof node.value !== "string" || typeof node.dateTime !== "string") {
        emit("TimeNode requires string `value` and `dateTime`.", mode);
        return mode === "strip" ? null : node;
      }
      return node;
    }
    case "sup":
    case "sub": {
      if (typeof node.value !== "string") {
        emit(`${node.type} value must be a string.`, mode);
        return mode === "strip" ? null : node;
      }
      return node;
    }
    case "br": {
      return { type: "br" };
    }
    default: {
      const exhaustive = node;
      emit(
        `Unknown inline node: ${JSON.stringify(exhaustive)}.`,
        mode
      );
      return null;
    }
  }
}
exports.sanitizeLink = sanitizeLink;
exports.validateInlineContent = validateInlineContent;
//# sourceMappingURL=index30.cjs.map
