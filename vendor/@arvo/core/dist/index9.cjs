"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function createEscapeHandler(callback) {
  let _element = null;
  function handleKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      callback();
    }
  }
  return {
    attach(element) {
      if (_element) {
        _element.removeEventListener("keydown", handleKeyDown);
      }
      _element = element;
      _element.addEventListener("keydown", handleKeyDown);
    },
    detach() {
      if (_element) {
        _element.removeEventListener("keydown", handleKeyDown);
        _element = null;
      }
    }
  };
}
exports.createEscapeHandler = createEscapeHandler;
//# sourceMappingURL=index9.cjs.map
