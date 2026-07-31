"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const tooltipContainer = require("./tooltip-container.cjs");
const DATA_KEY = "arvoTooltipContainer";
function setupTooltipContainerPlugin($) {
  $.fn[DATA_KEY] = function(options) {
    return this.each(function() {
      const existing = $.data(this, DATA_KEY);
      if (existing) {
        if (options) existing.update(options);
        return;
      }
      if (!options || !Array.isArray(options.entries) || options.entries.length === 0) {
        console.warn(
          "[arvo] $.fn.arvoTooltipContainer requires a non-empty `entries` array; skipping.",
          this
        );
        return;
      }
      $.data(
        this,
        DATA_KEY,
        tooltipContainer.ArvoTooltipContainer.initialize(this, options)
      );
    });
  };
}
exports.ArvoTooltipContainer = tooltipContainer.ArvoTooltipContainer;
exports.setupTooltipContainerPlugin = setupTooltipContainerPlugin;
//# sourceMappingURL=tooltip-container-setup.cjs.map
