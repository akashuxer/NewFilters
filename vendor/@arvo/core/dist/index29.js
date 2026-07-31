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
export {
  BASIC_INLINE_NODES,
  EXTENDED_INLINE_NODES,
  getAllowedNodeTypes
};
//# sourceMappingURL=index29.js.map
