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
export {
  createEscapeHandler
};
//# sourceMappingURL=index9.js.map
