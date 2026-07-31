function createBackdropManager() {
  let _el = null;
  let _blockClick = null;
  const manager = {
    show(options) {
      if (_el) manager.hide();
      _el = document.createElement("div");
      _el.className = "arvo-backdrop";
      _el.style.position = "fixed";
      _el.style.top = "0";
      _el.style.left = "0";
      _el.style.width = "100%";
      _el.style.height = "100%";
      _el.style.backgroundColor = `rgba(0, 0, 0, ${options.opacity})`;
      if (options.animated) {
        _el.classList.add("arvo-backdrop--animated");
      }
      if (!options.closeOnClick) {
        _blockClick = (e) => e.stopPropagation();
        _el.addEventListener("mousedown", _blockClick);
      }
      options.container.appendChild(_el);
      return _el;
    },
    hide() {
      if (!_el) return;
      if (_blockClick) {
        _el.removeEventListener("mousedown", _blockClick);
        _blockClick = null;
      }
      _el.remove();
      _el = null;
    },
    isVisible() {
      return _el !== null;
    },
    getElement() {
      return _el;
    }
  };
  return manager;
}
export {
  createBackdropManager
};
//# sourceMappingURL=index21.js.map
