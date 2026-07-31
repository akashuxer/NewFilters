import { validateInlineContent } from "./index30.js";
import { sanitizeLink } from "./index30.js";
function normalizeInlineContent(content, profile = "basic-inline", mode) {
  const validated = validateInlineContent(content, { profile, mode });
  if (typeof validated === "string") {
    if (validated.length === 0) return [];
    const textNode = { type: "text", value: validated };
    return [textNode];
  }
  return validated;
}
export {
  normalizeInlineContent,
  sanitizeLink,
  validateInlineContent
};
//# sourceMappingURL=index31.js.map
