function lockPageScroll() {
  if (typeof document === "undefined") {
    return () => {
    };
  }
  _lockCount += 1;
  if (_lockCount === 1) {
    const html = document.documentElement;
    const body = document.body;
    _saved.htmlOverflow = html.style.overflow;
    _saved.bodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
  }
  let released = false;
  return function unlock() {
    if (released) return;
    released = true;
    _lockCount = Math.max(0, _lockCount - 1);
    if (_lockCount === 0) {
      const html = document.documentElement;
      const body = document.body;
      html.style.overflow = _saved.htmlOverflow;
      body.style.overflow = _saved.bodyOverflow;
      _saved.htmlOverflow = "";
      _saved.bodyOverflow = "";
    }
  };
}
function isPageScrollLocked() {
  return _lockCount > 0;
}
let _lockCount = 0;
const _saved = {
  htmlOverflow: "",
  bodyOverflow: ""
};
export {
  isPageScrollLocked,
  lockPageScroll
};
//# sourceMappingURL=index22.js.map
