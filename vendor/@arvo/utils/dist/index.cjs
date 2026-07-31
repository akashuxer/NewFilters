"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const formCharCounter = require("./index2.cjs");
const titleTruncation = require("./index3.cjs");
const overlayFooter = require("./index4.cjs");
const core = require("@arvo/core");
const panelShell = require("./index5.cjs");
exports.createCharCounter = formCharCounter.createCharCounter;
exports.formatCharCount = formCharCounter.formatCharCount;
exports.updateCharCounter = formCharCounter.updateCharCounter;
exports.attachTitleTruncationTooltip = titleTruncation.attachTitleTruncationTooltip;
exports.attachOverlayFooterFit = overlayFooter.attachOverlayFooterFit;
exports.clampFooterActions = overlayFooter.clampFooterActions;
Object.defineProperty(exports, "formatShortcutDisplay", {
  enumerable: true,
  get: () => core.formatShortcutDisplay
});
Object.defineProperty(exports, "getOperatingSystem", {
  enumerable: true,
  get: () => core.getOperatingSystem
});
Object.defineProperty(exports, "isMacOS", {
  enumerable: true,
  get: () => core.isMacOS
});
Object.defineProperty(exports, "isModKey", {
  enumerable: true,
  get: () => core.isModKey
});
Object.defineProperty(exports, "matchesShortcut", {
  enumerable: true,
  get: () => core.matchesShortcut
});
Object.defineProperty(exports, "parseShortcut", {
  enumerable: true,
  get: () => core.parseShortcut
});
exports.formatMatchCountMessage = panelShell.formatMatchCountMessage;
exports.runItemFilter = panelShell.runItemFilter;
exports.validateHeaderAction = panelShell.validateHeaderAction;
//# sourceMappingURL=index.cjs.map
