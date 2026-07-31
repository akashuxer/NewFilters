"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const BASIC_INLINE_NODES = [
  "text",
  "em",
  "strong",
  "link",
  "code",
  "kbd"
];
const EXTENDED_INLINE_NODES = [
  ...BASIC_INLINE_NODES,
  "abbr",
  "time",
  "sup",
  "sub",
  "br"
];
function getAllowedNodeTypes(profile) {
  switch (profile) {
    case "basic-inline":
      return BASIC_INLINE_NODES;
    case "extended-inline":
      return EXTENDED_INLINE_NODES;
    case "text-only":
    case "slot":
    default:
      return [];
  }
}
exports.BASIC_INLINE_NODES = BASIC_INLINE_NODES;
exports.EXTENDED_INLINE_NODES = EXTENDED_INLINE_NODES;
exports.getAllowedNodeTypes = getAllowedNodeTypes;
//# sourceMappingURL=index29.cjs.map
