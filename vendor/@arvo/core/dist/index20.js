import { getFirstFocusable } from "./index3.js";
import { saveFocus, restoreFocus } from "./index4.js";
const DEFAULT_MAX_DEPTH = 5;
const DEFAULT_CONTAINER_CLASS = "arvo-inline-panel-stack";
let _idCounter = 0;
function nextId() {
  _idCounter += 1;
  return `inline-panel-${_idCounter}`;
}
function createInlinePanelStack(options) {
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  const containerClass = options.containerClass ?? DEFAULT_CONTAINER_CLASS;
  const container = options.container ?? document.createElement("div");
  const createdContainer = !options.container;
  if (createdContainer) {
    container.className = containerClass;
    container.hidden = true;
    options.host.appendChild(container);
  }
  const layerClass = `${containerClass.split(/\s+/)[0]}__layer`;
  const stack = [];
  let rootOpenerFocus = null;
  let escapeHandler = null;
  function showContainer() {
    container.hidden = false;
    container.classList.add("open");
  }
  function hideContainer() {
    container.hidden = true;
    container.classList.remove("open");
  }
  function attachEscape() {
    if (escapeHandler) return;
    escapeHandler = (event) => {
      if (event.key !== "Escape" || stack.length === 0) return;
      event.preventDefault();
      event.stopPropagation();
      stackApi.handleEscape();
    };
    options.host.addEventListener("keydown", escapeHandler, true);
  }
  function detachEscape() {
    if (!escapeHandler) return;
    options.host.removeEventListener("keydown", escapeHandler, true);
    escapeHandler = null;
  }
  function focusEntry(entry) {
    const focusable = getFirstFocusable(entry.element);
    if (focusable) {
      focusable.focus({ preventScroll: true });
      return;
    }
    if (!entry.element.hasAttribute("tabindex")) {
      entry.element.setAttribute("tabindex", "-1");
    }
    entry.element.focus({ preventScroll: true });
  }
  function setLayerActive(entry, active) {
    entry.layerEl.classList.toggle("active", active);
    {
      entry.layerEl.removeAttribute("aria-hidden");
    }
  }
  function animateForwardExit(entry) {
    const el = entry.layerEl;
    el.classList.remove("active");
    el.classList.add("is-exiting-forward");
    el.setAttribute("aria-hidden", "true");
    let settled = false;
    const onEnd = (event) => {
      if (event.target !== el || settled) return;
      if (event.propertyName !== "transform" && event.propertyName !== "opacity") {
        return;
      }
      settled = true;
      el.removeEventListener("transitionend", onEnd);
      window.clearTimeout(timer);
      el.classList.remove("is-exiting-forward");
    };
    el.addEventListener("transitionend", onEnd);
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      el.removeEventListener("transitionend", onEnd);
      el.classList.remove("is-exiting-forward");
    }, 500);
  }
  function removeEntry(entry) {
    entry.layerEl.remove();
    if (entry.element.parentElement === entry.layerEl) {
      entry.layerEl.removeChild(entry.element);
    }
  }
  function restoreOpenerFocus(entry) {
    if ((entry == null ? void 0 : entry.openedFrom) && document.contains(entry.openedFrom)) {
      entry.openedFrom.focus({ preventScroll: true });
      return;
    }
    if (rootOpenerFocus) {
      restoreFocus(rootOpenerFocus);
      rootOpenerFocus = null;
    }
  }
  const stackApi = {
    get container() {
      return container;
    },
    push(pushOptions) {
      var _a;
      if (((_a = pushOptions.onOpen) == null ? void 0 : _a.call(pushOptions)) === false) return false;
      if (stack.length >= maxDepth) {
        console.warn(
          `[arvo] Inline panel stack depth cap (${maxDepth}) reached; push rejected.`
        );
        return false;
      }
      if (stack.length === 0) {
        rootOpenerFocus = saveFocus();
        showContainer();
        attachEscape();
      } else {
        animateForwardExit(stack[stack.length - 1]);
      }
      const layerEl = document.createElement("div");
      layerEl.className = layerClass;
      layerEl.appendChild(pushOptions.element);
      container.appendChild(layerEl);
      const entry = {
        id: pushOptions.id ?? nextId(),
        kind: pushOptions.kind,
        element: pushOptions.element,
        layerEl,
        openedFrom: pushOptions.openedFrom ?? null,
        onBack: pushOptions.onBack,
        onClose: pushOptions.onClose
      };
      stack.push(entry);
      void layerEl.offsetHeight;
      setLayerActive(entry, true);
      focusEntry(entry);
      return true;
    },
    pop(popOptions) {
      var _a, _b;
      if (stack.length === 0) return false;
      const via = (popOptions == null ? void 0 : popOptions.via) ?? "default";
      const entry = stack[stack.length - 1];
      if (via === "default" && ((_a = entry.onClose) == null ? void 0 : _a.call(entry)) === false) {
        return false;
      }
      if (via === "back") {
        (_b = entry.onBack) == null ? void 0 : _b.call(entry);
      }
      stack.pop();
      removeEntry(entry);
      if (stack.length === 0) {
        hideContainer();
        detachEscape();
        restoreOpenerFocus(entry);
        return true;
      }
      const previous = stack[stack.length - 1];
      setLayerActive(previous, true);
      restoreOpenerFocus(entry);
      return true;
    },
    popAll() {
      while (stack.length > 0) {
        const entry = stack.pop();
        removeEntry(entry);
      }
      hideContainer();
      detachEscape();
      restoreOpenerFocus(null);
    },
    getDepth() {
      return stack.length;
    },
    getTop() {
      return stack.length > 0 ? stack[stack.length - 1] : null;
    },
    getEntries() {
      return [...stack];
    },
    handleEscape() {
      return stackApi.pop({ via: "default" });
    },
    destroy() {
      stackApi.popAll();
      if (createdContainer) {
        container.remove();
      }
    }
  };
  return stackApi;
}
export {
  createInlinePanelStack
};
//# sourceMappingURL=index20.js.map
