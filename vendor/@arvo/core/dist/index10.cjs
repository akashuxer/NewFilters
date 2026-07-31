"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function createActivationHandler(callback) {
  return {
    handleKeyDown(event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        callback(event);
      }
    }
  };
}
exports.createActivationHandler = createActivationHandler;
//# sourceMappingURL=index10.cjs.map
