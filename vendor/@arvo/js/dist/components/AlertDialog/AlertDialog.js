import { createOverlaySurface, renderInlineContentToDOM } from "@arvo/core";
import { attachOverlayFooterFit } from "@arvo/utils";
import { ArvoButton } from "../Button/Button.js";
import { ArvoIconButton } from "../IconButton/IconButton.js";
import { ArvoCheckbox } from "../Checkbox/Checkbox.js";
import { ArvoTextbox } from "../Textbox/Textbox.js";
import { ArvoTextarea } from "../Textarea/Textarea.js";
import { ArvoCombobox } from "../Combobox/Combobox.js";
import { ArvoSelect } from "../Select/Select.js";
import { ArvoBannerAlert } from "../BannerAlert/BannerAlert.js";
const DEFAULT_PRIMARY = { label: "OK" };
const DEFAULT_SECONDARY = { label: "Cancel" };
function normalizeDontShow(v) {
  if (v == null || v === false) return null;
  if (v === true) return {};
  return v;
}
function renderContentInto(container, content) {
  container.textContent = "";
  if (typeof content === "string") {
    container.innerHTML = content;
  } else if (typeof content === "function") {
    content(container);
  } else if (content instanceof Node) {
    container.appendChild(content);
  }
}
let _idCounter = 0;
class ArvoAlertDialog {
  constructor(options) {
    var _a;
    this._rootEl = null;
    this._panelEl = null;
    this._headerEl = null;
    this._icoEl = null;
    this._titleEl = null;
    this._bodyEl = null;
    this._msgEl = null;
    this._confirmInputWrapEl = null;
    this._footerEl = null;
    this._dontShowEl = null;
    this._actionsEl = null;
    this._footerFit = null;
    this._closeBtnInstance = null;
    this._primaryBtnInstance = null;
    this._secondaryBtnInstance = null;
    this._dontShowInstance = null;
    this._confirmInputInstance = null;
    this._surface = null;
    this._isOpen = false;
    this._confirmValue = "";
    this._confirmValues = [];
    this._confirmErrorEl = null;
    this._confirmInputAltInstance = null;
    this._bannerEl = null;
    this._bannerInstance = null;
    this._dontShowChecked = false;
    this._closingProgrammatically = false;
    const uid = ++_idCounter;
    this._dialogId = `arvo-alert-dlg-${uid}`;
    this._titleId = `arvo-alert-dlg-title-${uid}`;
    this._bodyId = `arvo-alert-dlg-body-${uid}`;
    this._options = this._resolveOptions(options);
    this._dontShowChecked = ((_a = this._options.dontShowAgain) == null ? void 0 : _a.defaultChecked) ?? false;
    this._boundHandleKeyDown = this._handleKeyDown.bind(this);
    this._render();
  }
  static initialize(options) {
    return new ArvoAlertDialog(options);
  }
  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  open() {
    var _a, _b;
    if (this._isOpen) return;
    if (((_b = (_a = this._options).onOpen) == null ? void 0 : _b.call(_a)) === false) return;
    if (!this._rootEl || !this._panelEl) return;
    this._isOpen = true;
    const container = this._resolveContainer();
    container.appendChild(this._rootEl);
    this._rootEl.classList.add("open");
    if (!this._surface) {
      this._surface = createOverlaySurface({
        id: this._dialogId,
        surface: this._panelEl,
        // Pin the outer host's stacking context to the panel's hub-assigned
        // z-index so consumer-level zIndexBase tuning (overlayHub.configure)
        // lifts the WHOLE dialog above sibling overlays -- not just the
        // inner panel inside a wrapper trapped at the SCSS fallback layer.
        surfaceRoot: this._rootEl,
        type: "modal",
        priority: 10,
        trigger: null,
        position: false,
        focus: {
          mode: "trap",
          initialFocus: this._options.confirmInput ? "none" : "first",
          returnFocus: true
        },
        mask: this._options.hasBackdrop !== false ? {
          className: "arvo-alert-dlg__overlay-mask",
          closeOnClick: this._options.closeOnBackdrop,
          onOutside: () => {
            var _a2;
            void ((_a2 = this._surface) == null ? void 0 : _a2.close());
          }
        } : void 0,
        managesOwnBackdrop: true,
        transition: "scale",
        transitionDuration: 150,
        closeOnOutside: this._options.closeOnBackdrop,
        triggerAria: false,
        onClose: () => this._handleEngineClose()
      });
    }
    void this._surface.open();
    if (this._options.closeOnEscape) {
      document.addEventListener("keydown", this._boundHandleKeyDown, true);
    }
    if (this._options.confirmInput) {
      window.setTimeout(() => {
        var _a2;
        const focusable = (_a2 = this._panelEl) == null ? void 0 : _a2.querySelector(
          '.arvo-alert-dlg__confirm-input input, .arvo-alert-dlg__confirm-input textarea, .arvo-alert-dlg__confirm-input [role="combobox"]'
        );
        focusable == null ? void 0 : focusable.focus({ preventScroll: true });
      }, 0);
    }
    this._dispatchEvent("alert-dlg:open", {});
  }
  close(reason = "programmatic") {
    var _a, _b, _c;
    if (!this._isOpen) return;
    if (((_b = (_a = this._options).onClose) == null ? void 0 : _b.call(_a, { reason })) === false) return;
    this._isOpen = false;
    document.removeEventListener("keydown", this._boundHandleKeyDown, true);
    this._dispatchEvent("alert-dlg:close", { reason });
    this._confirmValue = "";
    this._confirmValues = [];
    if (this._confirmInputInstance) {
      this._confirmInputInstance.value("");
    }
    this._closingProgrammatically = true;
    void ((_c = this._surface) == null ? void 0 : _c.close());
    this._closingProgrammatically = false;
    const root = this._rootEl;
    window.setTimeout(() => {
      root == null ? void 0 : root.classList.remove("open");
      if (root && root.parentNode) {
        root.parentNode.removeChild(root);
      }
    }, 160);
  }
  isOpen() {
    return this._isOpen;
  }
  toggle() {
    if (this._isOpen) this.close();
    else this.open();
  }
  title(value) {
    if (value === void 0) {
      return this._options.title;
    }
    this._options.title = value;
    if (this._titleEl) this._titleEl.textContent = value;
  }
  message(value) {
    if (value === void 0) {
      return this._options.message ?? "";
    }
    this._options.message = value;
    if (!this._bodyEl) return;
    if (!this._msgEl) {
      this._msgEl = document.createElement("p");
      this._msgEl.className = "arvo-alert-dlg__msg";
      if (this._confirmInputWrapEl) {
        this._bodyEl.insertBefore(this._msgEl, this._confirmInputWrapEl);
      } else {
        this._bodyEl.insertBefore(this._msgEl, this._bodyEl.firstChild);
      }
    }
    while (this._msgEl.firstChild) this._msgEl.removeChild(this._msgEl.firstChild);
    if (typeof value === "string") {
      this._msgEl.textContent = value;
    } else {
      this._msgEl.appendChild(
        renderInlineContentToDOM(value, { profile: "basic-inline" })
      );
    }
  }
  renderContent(content) {
    var _a;
    this._options.content = content;
    if (!this._bodyEl) return;
    (_a = this._msgEl) == null ? void 0 : _a.remove();
    this._msgEl = null;
    const fragment = document.createDocumentFragment();
    const scratch = document.createElement("div");
    renderContentInto(scratch, content);
    while (scratch.firstChild) {
      fragment.appendChild(scratch.firstChild);
    }
    if (this._confirmInputWrapEl) {
      this._bodyEl.insertBefore(fragment, this._confirmInputWrapEl);
    } else {
      this._bodyEl.textContent = "";
      this._bodyEl.appendChild(fragment);
    }
  }
  setVariant(variant) {
    var _a, _b;
    if (variant === this._options.variant) return;
    (_a = this._rootEl) == null ? void 0 : _a.classList.remove(`arvo-alert-dlg--${this._options.variant}`);
    (_b = this._rootEl) == null ? void 0 : _b.classList.add(`arvo-alert-dlg--${variant}`);
    this._options.variant = variant;
  }
  setActions(actions) {
    var _a, _b, _c;
    if (actions.primary) {
      this._options.primaryAction = {
        ...this._options.primaryAction,
        ...actions.primary
      };
      this._applyActionToButton(
        this._primaryBtnInstance,
        actions.primary,
        true
      );
    }
    if (actions.secondary !== void 0) {
      if (actions.secondary === null) {
        this._options.secondaryAction = null;
        if (this._secondaryBtnInstance) {
          this._secondaryBtnInstance.disabled(true);
        }
      } else {
        this._options.secondaryAction = {
          ...this._options.secondaryAction ?? DEFAULT_SECONDARY,
          ...actions.secondary
        };
        this._applyActionToButton(
          this._secondaryBtnInstance,
          actions.secondary,
          false
        );
      }
    }
    if (((_a = actions.primary) == null ? void 0 : _a.label) !== void 0 || ((_b = actions.primary) == null ? void 0 : _b.icon) !== void 0 || actions.secondary && typeof actions.secondary === "object" && ("label" in actions.secondary || "icon" in actions.secondary)) {
      (_c = this._footerFit) == null ? void 0 : _c.measure();
    }
  }
  setLoading(loading) {
    var _a, _b, _c;
    if (this._options.isLoading === loading) return;
    this._options.isLoading = loading;
    (_a = this._rootEl) == null ? void 0 : _a.classList.toggle("loading", loading);
    if (this._panelEl) {
      if (loading) this._panelEl.setAttribute("aria-busy", "true");
      else this._panelEl.removeAttribute("aria-busy");
    }
    this._refreshButtonDisabledStates();
    (_b = this._closeBtnInstance) == null ? void 0 : _b.disabled(loading || this._options.isDisabled);
    (_c = this._dontShowInstance) == null ? void 0 : _c.disabled(loading || this._options.isDisabled);
  }
  confirmValue() {
    return this._confirmValue;
  }
  dontShowAgainChecked(value) {
    if (value === void 0) {
      return this._dontShowChecked;
    }
    this._dontShowChecked = value;
    if (this._dontShowInstance) {
      this._dontShowInstance.toggle(value);
    }
  }
  destroy() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    (_a = this._surface) == null ? void 0 : _a.destroy();
    this._surface = null;
    if (this._isOpen) {
      this._isOpen = false;
      document.removeEventListener("keydown", this._boundHandleKeyDown, true);
    }
    (_b = this._closeBtnInstance) == null ? void 0 : _b.destroy();
    (_c = this._primaryBtnInstance) == null ? void 0 : _c.destroy();
    (_d = this._secondaryBtnInstance) == null ? void 0 : _d.destroy();
    (_e = this._dontShowInstance) == null ? void 0 : _e.destroy();
    (_f = this._confirmInputInstance) == null ? void 0 : _f.destroy();
    (_h = (_g = this._confirmInputAltInstance) == null ? void 0 : _g.destroy) == null ? void 0 : _h.call(_g);
    (_i = this._bannerInstance) == null ? void 0 : _i.destroy();
    (_j = this._footerFit) == null ? void 0 : _j.destroy();
    this._footerFit = null;
    this._closeBtnInstance = null;
    this._primaryBtnInstance = null;
    this._secondaryBtnInstance = null;
    this._dontShowInstance = null;
    this._confirmInputInstance = null;
    this._confirmInputAltInstance = null;
    this._bannerInstance = null;
    if (this._rootEl && this._rootEl.parentNode) {
      this._rootEl.parentNode.removeChild(this._rootEl);
    }
    this._rootEl = null;
    this._panelEl = null;
    this._headerEl = null;
    this._icoEl = null;
    this._titleEl = null;
    this._bodyEl = null;
    this._msgEl = null;
    this._confirmInputWrapEl = null;
    this._footerEl = null;
    this._dontShowEl = null;
    this._actionsEl = null;
  }
  // ---------------------------------------------------------------------------
  // Two-path close: engine callback (picker-silent pattern)
  // ---------------------------------------------------------------------------
  _handleEngineClose() {
    if (this._closingProgrammatically) {
      return;
    }
    this._isOpen = false;
    document.removeEventListener("keydown", this._boundHandleKeyDown, true);
    this._confirmValue = "";
    this._confirmValues = [];
    if (this._confirmInputInstance) {
      this._confirmInputInstance.value("");
    }
    const root = this._rootEl;
    window.setTimeout(() => {
      root == null ? void 0 : root.classList.remove("open");
      if (root && root.parentNode) {
        root.parentNode.removeChild(root);
      }
    }, 160);
  }
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  _render() {
    const o = this._options;
    this._rootEl = document.createElement("div");
    this._rootEl.className = this._buildRootClasses();
    this._panelEl = document.createElement("div");
    this._panelEl.id = this._dialogId;
    this._panelEl.className = "arvo-alert-dlg__panel";
    this._panelEl.setAttribute("role", "alertdialog");
    this._panelEl.setAttribute("aria-modal", "true");
    this._panelEl.setAttribute("aria-labelledby", this._titleId);
    this._panelEl.setAttribute("aria-describedby", this._bodyId);
    if (o.isLoading) this._panelEl.setAttribute("aria-busy", "true");
    this._panelEl.tabIndex = -1;
    this._renderHeader();
    this._renderBanner();
    this._renderBody();
    this._renderFooter();
    if (this._headerEl) this._panelEl.appendChild(this._headerEl);
    if (this._bannerEl) this._panelEl.appendChild(this._bannerEl);
    if (this._bodyEl) this._panelEl.appendChild(this._bodyEl);
    if (this._footerEl) this._panelEl.appendChild(this._footerEl);
    this._rootEl.appendChild(this._panelEl);
  }
  _renderBanner() {
    const o = this._options;
    if (!o.bannerAlert) return;
    this._bannerEl = document.createElement("div");
    this._bannerEl.className = "arvo-alert-dlg__banner";
    const host = document.createElement("div");
    this._bannerEl.appendChild(host);
    this._bannerInstance = ArvoBannerAlert.initialize(host, o.bannerAlert);
  }
  _renderHeader() {
    const o = this._options;
    this._headerEl = document.createElement("div");
    this._headerEl.className = "arvo-alert-dlg__header";
    this._icoEl = document.createElement("span");
    this._icoEl.className = "arvo-alert-dlg__ico o9con";
    this._icoEl.setAttribute("aria-hidden", "true");
    this._headerEl.appendChild(this._icoEl);
    this._titleEl = document.createElement("p");
    this._titleEl.id = this._titleId;
    this._titleEl.className = "arvo-alert-dlg__title";
    this._titleEl.textContent = o.title;
    this._headerEl.appendChild(this._titleEl);
    if (o.isClosable) {
      const wrap = document.createElement("span");
      wrap.className = "arvo-alert-dlg__close-btn";
      const btnEl = document.createElement("button");
      this._closeBtnInstance = ArvoIconButton.initialize(btnEl, {
        variant: "tertiary",
        size: "sm",
        icon: "close",
        tooltip: "Close",
        isDisabled: o.isLoading || o.isDisabled,
        onClick: () => this.close("close-button")
      });
      btnEl.setAttribute("aria-label", "Close dialog");
      wrap.appendChild(btnEl);
      this._headerEl.appendChild(wrap);
    }
  }
  _renderBody() {
    const o = this._options;
    this._bodyEl = document.createElement("div");
    this._bodyEl.id = this._bodyId;
    this._bodyEl.className = "arvo-alert-dlg__body";
    if (o.content !== null && o.content !== void 0) {
      const scratch = document.createElement("div");
      renderContentInto(scratch, o.content);
      while (scratch.firstChild) {
        this._bodyEl.appendChild(scratch.firstChild);
      }
    } else if (o.message != null) {
      this._msgEl = document.createElement("p");
      this._msgEl.className = "arvo-alert-dlg__msg";
      if (typeof o.message === "string") {
        this._msgEl.textContent = o.message;
      } else {
        this._msgEl.appendChild(
          renderInlineContentToDOM(o.message, { profile: "basic-inline" })
        );
      }
      this._bodyEl.appendChild(this._msgEl);
    }
    if (o.confirmInput) {
      this._confirmInputWrapEl = document.createElement("div");
      this._confirmInputWrapEl.className = "arvo-alert-dlg__confirm-input";
      this._renderConfirmInput(this._confirmInputWrapEl, o.confirmInput);
      this._bodyEl.appendChild(this._confirmInputWrapEl);
    }
  }
  _renderConfirmInput(wrap, ci) {
    var _a;
    const o = this._options;
    const isDisabled = o.isLoading || o.isDisabled;
    const inputType = ci.type ?? "textbox";
    const inputSize = ci.size ?? "lg";
    if (inputType === "textbox") {
      const tbEl = document.createElement("div");
      this._confirmInputInstance = ArvoTextbox.initialize(tbEl, {
        size: inputSize,
        isFullWidth: true,
        label: ci.label,
        placeholder: ci.placeholder,
        maxLength: ci.maxLength ?? null,
        value: "",
        isDisabled,
        onInput: (e) => {
          var _a2;
          return this._handleConfirmInput(
            ((_a2 = e.target) == null ? void 0 : _a2.value) ?? ""
          );
        },
        onKeyDown: (e) => this._handleConfirmKeyDown(e)
      });
      wrap.appendChild(tbEl);
    } else if (inputType === "textarea") {
      const taEl = document.createElement("div");
      const taOpts = ci;
      this._confirmInputAltInstance = ArvoTextarea.initialize(taEl, {
        size: inputSize,
        isFullWidth: true,
        label: ci.label,
        placeholder: ci.placeholder,
        maxLength: taOpts.maxLength ?? null,
        rows: taOpts.rows,
        value: "",
        isDisabled,
        onInput: (e) => {
          var _a2;
          return this._handleConfirmInput(
            ((_a2 = e.target) == null ? void 0 : _a2.value) ?? ""
          );
        }
      });
      wrap.appendChild(taEl);
      const textareaEl = taEl.querySelector("textarea");
      textareaEl == null ? void 0 : textareaEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          this._handleConfirmKeyDown(e);
        }
      });
    } else if (inputType === "combobox" || inputType === "multi-select") {
      if (inputType === "multi-select" && typeof process !== "undefined" && ((_a = process.env) == null ? void 0 : _a.NODE_ENV) !== "production" && typeof console !== "undefined" && typeof console.warn === "function") {
        console.warn(
          '[ArvoAlertDialog] confirmInput type "multi-select" is pending until ArvoMultiSelect ships; falling back to combobox single-select.'
        );
      }
      const cbEl = document.createElement("div");
      const items = ci.options.map((o2) => ({ id: o2.id, label: o2.label, value: o2.value ?? o2.id }));
      this._confirmInputAltInstance = ArvoCombobox.initialize(cbEl, {
        size: inputSize,
        isFullWidth: true,
        label: ci.label,
        placeholder: ci.placeholder,
        items,
        isDisabled,
        onChange: (item) => {
          const next = item ? String(item.value ?? item.id) : "";
          if (inputType === "multi-select") {
            this._handleMultiConfirmInput(next ? [next] : []);
          } else {
            this._handleConfirmInput(next);
          }
        }
      });
      wrap.appendChild(cbEl);
    } else if (inputType === "select") {
      const selEl = document.createElement("div");
      const items = ci.options.map(
        (o2) => ({ id: o2.id, label: o2.label, value: o2.value ?? o2.id })
      );
      this._confirmInputAltInstance = ArvoSelect.initialize(selEl, {
        size: inputSize,
        isFullWidth: true,
        label: ci.label,
        placeholder: ci.placeholder,
        items,
        isDisabled,
        onChange: (item) => {
          this._handleConfirmInput(item ? String(item.value ?? item.id) : "");
        }
      });
      wrap.appendChild(selEl);
    }
    this._confirmErrorEl = document.createElement("p");
    this._confirmErrorEl.className = "arvo-alert-dlg__confirm-error";
    this._confirmErrorEl.setAttribute("role", "alert");
    this._confirmErrorEl.style.display = "none";
    wrap.appendChild(this._confirmErrorEl);
  }
  _handleMultiConfirmInput(next) {
    var _a, _b, _c;
    this._confirmValues = next;
    const ci = this._options.confirmInput;
    if ((ci == null ? void 0 : ci.type) === "multi-select") {
      (_a = ci.onChange) == null ? void 0 : _a.call(ci, next);
    }
    (_c = (_b = this._options).onConfirmInputChange) == null ? void 0 : _c.call(_b, next);
    this._refreshConfirmError();
    this._refreshButtonDisabledStates();
  }
  _refreshConfirmError() {
    if (!this._confirmErrorEl) return;
    const err = this._confirmValidationError();
    if (err) {
      this._confirmErrorEl.textContent = err;
      this._confirmErrorEl.style.display = "";
    } else {
      this._confirmErrorEl.textContent = "";
      this._confirmErrorEl.style.display = "none";
    }
  }
  _renderFooter() {
    var _a;
    const o = this._options;
    this._footerEl = document.createElement("div");
    this._footerEl.className = "arvo-alert-dlg__footer";
    if (o.dontShowAgain) {
      this._dontShowEl = document.createElement("div");
      this._dontShowEl.className = "arvo-alert-dlg__dont-show";
      const cbEl = document.createElement("span");
      const label = o.dontShowAgain.label ?? "Don't show this again";
      this._dontShowInstance = ArvoCheckbox.initialize(cbEl, {
        size: "sm",
        label,
        isChecked: this._dontShowChecked,
        isDisabled: o.isLoading || o.isDisabled,
        onChange: (detail) => this._handleDontShowChange(detail.isChecked)
      });
      this._dontShowEl.appendChild(cbEl);
      this._footerEl.appendChild(this._dontShowEl);
    }
    this._actionsEl = document.createElement("div");
    this._actionsEl.className = "arvo-alert-dlg__actions";
    const showSecondary = o.hasSecondaryBtn && o.secondaryAction !== null;
    if (showSecondary && o.secondaryAction) {
      const secEl = document.createElement("button");
      this._secondaryBtnInstance = ArvoButton.initialize(secEl, {
        variant: "secondary",
        size: "md",
        label: o.secondaryAction.label,
        icon: o.secondaryAction.icon ?? null,
        isDisabled: o.isLoading || o.isDisabled || o.secondaryAction.isDisabled === true,
        isLoading: o.secondaryAction.isLoading === true,
        onClick: (e) => this._handleSecondaryClick(e)
      });
      this._actionsEl.appendChild(secEl);
    }
    const primary = o.primaryAction;
    const primaryEl = document.createElement("button");
    this._primaryBtnInstance = ArvoButton.initialize(primaryEl, {
      variant: o.hasDangerAction ? "danger" : "primary",
      size: "md",
      label: primary.label,
      icon: primary.icon ?? null,
      isDisabled: this._isPrimaryDisabled(),
      isLoading: primary.isLoading === true,
      onClick: (e) => this._handlePrimaryClick(e)
    });
    this._actionsEl.appendChild(primaryEl);
    this._footerEl.appendChild(this._actionsEl);
    (_a = this._footerFit) == null ? void 0 : _a.destroy();
    this._footerFit = attachOverlayFooterFit(this._actionsEl, { gap: 6 });
  }
  // ---------------------------------------------------------------------------
  // Class string builder
  // ---------------------------------------------------------------------------
  _buildRootClasses() {
    const {
      variant,
      hasDangerAction,
      isClosable,
      isLoading
    } = this._options;
    return [
      "arvo-alert-dlg",
      `arvo-alert-dlg--${variant}`,
      hasDangerAction && "arvo-alert-dlg--danger",
      isClosable && "arvo-alert-dlg--closable",
      isLoading && "loading"
    ].filter(Boolean).join(" ");
  }
  // ---------------------------------------------------------------------------
  // Action handlers
  // ---------------------------------------------------------------------------
  _handlePrimaryClick(e) {
    if (this._isPrimaryBlocked()) return;
    this._runAction(this._options.primaryAction, "primary", e);
  }
  _handleSecondaryClick(e) {
    const sec = this._options.secondaryAction;
    if (!sec) return;
    this._runAction(sec, "secondary", e);
  }
  _runAction(action, reason, e) {
    var _a;
    const result = (_a = action.onClick) == null ? void 0 : _a.call(action, e);
    this._dispatchEvent("alert-dlg:action", {
      action: reason,
      confirmValue: this._options.confirmInput ? this._confirmValue : null,
      dontShowAgain: this._options.dontShowAgain ? this._dontShowChecked : null
    });
    if (result === false) return;
    if (action.closeOnClick !== false) {
      this.close(reason);
    }
  }
  _handleConfirmInput(value) {
    var _a, _b, _c;
    this._confirmValue = value;
    const ci = this._options.confirmInput;
    if (ci && ci.type !== "multi-select") {
      (_a = ci.onChange) == null ? void 0 : _a.call(ci, value);
    }
    (_c = (_b = this._options).onConfirmInputChange) == null ? void 0 : _c.call(_b, value);
    this._refreshConfirmError();
    this._refreshButtonDisabledStates();
  }
  _handleConfirmKeyDown(e) {
    if (e.key !== "Enter") return;
    if (this._isPrimaryBlocked()) return;
    e.preventDefault();
    this._runAction(this._options.primaryAction, "primary", e);
  }
  _handleDontShowChange(checked) {
    var _a, _b, _c, _d;
    this._dontShowChecked = checked;
    (_b = (_a = this._options.dontShowAgain) == null ? void 0 : _a.onChange) == null ? void 0 : _b.call(_a, checked);
    (_d = (_c = this._options).onDontShowAgainChange) == null ? void 0 : _d.call(_c, checked);
  }
  _handleKeyDown(e) {
    var _a;
    if (e.key !== "Escape") return;
    if (!this._isOpen) return;
    e.stopPropagation();
    void ((_a = this._surface) == null ? void 0 : _a.close());
  }
  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------
  _resolveOptions(o) {
    var _a;
    if (o.hasPrimaryBtn === false && o.variant !== "warning" && typeof process !== "undefined" && ((_a = process.env) == null ? void 0 : _a.NODE_ENV) !== "production" && typeof console !== "undefined" && typeof console.warn === "function") {
      console.warn(
        '[ArvoAlertDialog] `hasPrimaryBtn: false` is only honored when `variant: "warning"`. The primary button will be rendered.'
      );
    }
    return {
      variant: o.variant ?? "warning",
      title: o.title,
      message: o.message ?? null,
      content: o.content ?? null,
      bannerAlert: o.bannerAlert ?? null,
      hasDangerAction: o.hasDangerAction ?? false,
      primaryAction: o.primaryAction ?? DEFAULT_PRIMARY,
      secondaryAction: o.secondaryAction === null ? null : o.secondaryAction ?? DEFAULT_SECONDARY,
      hasSecondaryBtn: o.hasSecondaryBtn ?? true,
      hasPrimaryBtn: o.hasPrimaryBtn ?? true,
      isClosable: o.isClosable ?? false,
      hasBackdrop: o.hasBackdrop ?? true,
      closeOnBackdrop: o.closeOnBackdrop ?? false,
      closeOnEscape: o.closeOnEscape ?? true,
      confirmInput: o.confirmInput ?? null,
      dontShowAgain: normalizeDontShow(o.dontShowAgain),
      isLoading: o.isLoading ?? false,
      isDisabled: o.isDisabled ?? false,
      container: o.container ?? null,
      onOpen: o.onOpen ?? null,
      onClose: o.onClose ?? null,
      onConfirmInputChange: o.onConfirmInputChange ?? null,
      onDontShowAgainChange: o.onDontShowAgainChange ?? null
    };
  }
  _resolveContainer() {
    const c = this._options.container;
    if (!c) return document.body;
    if (typeof c === "string") {
      return document.querySelector(c) ?? document.body;
    }
    return c;
  }
  _isPrimaryDisabledByConfirm() {
    var _a, _b;
    const ci = this._options.confirmInput;
    if (!ci) return false;
    if (ci.type === "multi-select") {
      const expected2 = ci.expectedValues;
      if (expected2) {
        const actual = this._confirmValues;
        const sameLen = actual.length === expected2.length;
        const sameSet = sameLen && expected2.every((v) => actual.includes(v));
        if (!sameSet) return true;
      }
      const r2 = (_a = ci.validate) == null ? void 0 : _a.call(ci, this._confirmValues);
      if (r2 === false || typeof r2 === "string") return true;
      return false;
    }
    const expected = ci.expectedValue;
    if (expected != null && this._confirmValue !== expected) return true;
    const r = (_b = ci.validate) == null ? void 0 : _b.call(ci, this._confirmValue);
    if (r === false || typeof r === "string") return true;
    return false;
  }
  _confirmValidationError() {
    var _a, _b;
    const ci = this._options.confirmInput;
    if (!ci) return null;
    if (ci.type === "multi-select") {
      const r2 = (_a = ci.validate) == null ? void 0 : _a.call(ci, this._confirmValues);
      return typeof r2 === "string" ? r2 : null;
    }
    const r = (_b = ci.validate) == null ? void 0 : _b.call(ci, this._confirmValue);
    return typeof r === "string" ? r : null;
  }
  _isPrimaryDisabled() {
    const o = this._options;
    return o.isLoading || o.isDisabled || o.primaryAction.isDisabled === true || this._isPrimaryDisabledByConfirm();
  }
  _isPrimaryBlocked() {
    return this._isPrimaryDisabled();
  }
  _refreshButtonDisabledStates() {
    var _a;
    const o = this._options;
    (_a = this._primaryBtnInstance) == null ? void 0 : _a.disabled(this._isPrimaryDisabled());
    if (this._secondaryBtnInstance) {
      const sec = o.secondaryAction;
      this._secondaryBtnInstance.disabled(
        o.isLoading || o.isDisabled || (sec == null ? void 0 : sec.isDisabled) === true
      );
    }
  }
  _applyActionToButton(btn, next, isPrimary) {
    if (!btn) return;
    if (next.label !== void 0) btn.setLabel(next.label);
    if (next.icon !== void 0) btn.setIcon(next.icon ?? null);
    if (next.isLoading !== void 0) btn.setLoading(next.isLoading);
    if (next.isDisabled !== void 0 || next.isLoading !== void 0) {
      if (isPrimary) {
        btn.disabled(this._isPrimaryDisabled());
      } else {
        const o = this._options;
        const sec = o.secondaryAction;
        btn.disabled(
          o.isLoading || o.isDisabled || (sec == null ? void 0 : sec.isDisabled) === true
        );
      }
    }
  }
  _dispatchEvent(eventName, detail = {}) {
    var _a;
    (_a = this._panelEl) == null ? void 0 : _a.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        cancelable: false,
        detail
      })
    );
  }
}
export {
  ArvoAlertDialog
};
//# sourceMappingURL=AlertDialog.js.map
