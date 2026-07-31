export interface ArvoDisclosureButtonOptions {
    /** Visible button text. Examples: `Show more`, `Show less`, `+4 more`. */
    label?: string;
    /** Selects font, chevron container, and gap tokens. Defaults to `md`. */
    size?: 'sm' | 'md' | 'lg';
    /** Initial expanded/collapsed state. After construction the state is mutated
     *  via `expanded(state)` / `toggle(force?)`. Defaults to `false`. */
    isExpanded?: boolean;
    /** Show or hide the built-in trailing chevron. Defaults to `true`. The
     *  glyph is not configurable -- it always renders as `angle-down` and
     *  rotates 180deg via CSS when `isExpanded` is true. */
    hasChevron?: boolean;
    /** Maps to the `aria-controls` HTML attribute. ID of the controlled
     *  content region. */
    ariaControls?: string;
    /** Maps to the `aria-label` HTML attribute. Use when the visible label is a
     *  count shorthand (`+4 more`) and surrounding context does not name the
     *  disclosed content. */
    ariaLabel?: string;
    /** Fired when the user requests a state change via mouse click or
     *  Enter/Space (native button activation). Receives the next `isExpanded`
     *  value. Programmatic mutations via `expanded(state)` do NOT invoke this
     *  callback -- they only emit the `disc-btn:toggle` DOM event. */
    onExpandedChange?: (isExpanded: boolean) => void;
}
type RequiredDisclosureButtonOptions = Required<Omit<ArvoDisclosureButtonOptions, 'onExpandedChange' | 'ariaControls' | 'ariaLabel'>> & {
    ariaControls: string | null;
    ariaLabel: string | null;
    onExpandedChange: ((isExpanded: boolean) => void) | null;
};
export declare class ArvoDisclosureButton {
    private _element;
    private _options;
    private _labelEl;
    private _chevEl;
    private _originalContent;
    private _originalType;
    private _boundHandleClick;
    static readonly SIZES: readonly ["sm", "md", "lg"];
    static readonly DEFAULTS: RequiredDisclosureButtonOptions;
    static initialize(element: HTMLButtonElement, options?: ArvoDisclosureButtonOptions): ArvoDisclosureButton;
    constructor(element: HTMLButtonElement, options?: ArvoDisclosureButtonOptions);
    private _render;
    private _createChevronEl;
    private _bindEvents;
    private _handleClick;
    private _applyExpanded;
    private _dispatchEvent;
    /**
     * Dual-purpose getter/setter for the expanded state. Omit `state` to read,
     * pass a boolean to write. Programmatic writes do NOT invoke the
     * `onExpandedChange` consumer callback (they are not user-driven), but the
     * `disc-btn:toggle` DOM event still fires so external listeners stay in sync.
     */
    expanded(state?: boolean): boolean | void;
    /**
     * Flip the expanded state, or force it to a target value. Mirrors the
     * user-interaction code path: emits the `disc-btn:toggle` DOM event. Does
     * NOT invoke `onExpandedChange` because it is not user-driven.
     */
    toggle(force?: boolean): void;
    /** Update the visible label text. */
    setLabel(text: string): void;
    /** Programmatically focus the button. */
    focus(): void;
    /**
     * Remove the click listener, strip BEM classes and ARIA attributes added
     * during initialize, and restore the element's original text content.
     */
    destroy(): void;
}
export {};
//# sourceMappingURL=DisclosureButton.d.ts.map