"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const validate = require("./index30.cjs");
function normalizeInlineContent(content, profile = "basic-inline", mode) {
  const validated = validate.validateInlineContent(content, { profile, mode });
  if (typeof validated === "string") {
    if (validated.length === 0) return [];
    const textNode = { type: "text", value: validated };
    return [textNode];
  }
  return validated;
}
exports.sanitizeLink = validate.sanitizeLink;
exports.validateInlineContent = validate.validateInlineContent;
exports.normalizeInlineContent = normalizeInlineContent;
//# sourceMappingURL=index31.cjs.map
