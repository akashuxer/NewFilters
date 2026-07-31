type DelimiterBehavior = 'none' | 'comma-to-new-row' | 'comma-and-linebreak' | 'shift+enter';
export interface ArvoSearchOptions {
    variant?: 'filter' | 'expandable-filter' | 'find';
    value?: string;
    /**
     * Uncontrolled initial input value. Only consulted when `value` is omitted.
     * Mirrors the React `defaultValue` prop seeded via internal state when the
     * controlled `value` is undefined.
     */
    defaultValue?: string;
    placeholder?: string;
    isDisabled?: boolean;
    /** Renders the field read-only: focusable for copy but not editable. */
    isReadOnly?: boolean;
    isInvalid?: boolean;
    errorMsg?: string;
    errorDisplay?: 'inline' | 'tooltip' | 'none';
    isClearable?: boolean;
    shortcut?: string | null;
    counter?: {
        current: number;
        total: number;
    } | null;
    searchMode?: 'input' | 'submit';
    minChars?: number;
    /**
     * Milliseconds to debounce `onSearch` in `input` mode.
     * Does not apply in `submit` mode.
     *
     * Default is `0` (synchronous) for design-system stability: every Arvo
     * component that composes `ArvoSearch` internally for in-memory filtering
     * (Listbox, ActionMenu, OptionList, PanelShell, etc.) needs the filter to
     * apply on the same tick as the keystroke. Direct consumers driving a
     * backend search should opt into a positive value (the figma spec
     * recommends `150`-`300` ms; `200` is a sensible default).
     * @default 0
     */
    debounceMs?: number;
    isMultiLine?: boolean | {
        enabled: boolean;
        minRows?: number;
        maxRows?: number;
        collapseBehavior?: 'none' | 'summary';
        delimiterBehavior?: DelimiterBehavior;
        delimiter?: string;
        /** @deprecated Use delimiterBehavior instead */
        expandRows?: boolean;
    };
    isLoading?: boolean;
    width?: string;
    isFullWidth?: boolean;
    /** Controlled expanded state for `expandable-filter` variant. */
    isExpanded?: boolean;
    /** Uncontrolled initial expanded state for `expandable-filter` variant. */
    defaultExpanded?: boolean;
    /** Direction the field expands when trigger is clicked. @default 'end' */
    expandDirection?: 'start' | 'end';
    /** When false, the "Previous match" button is omitted in `find` variant. @default true */
    hasPreviousButton?: boolean;
    /** When false, the "Next match" button is omitted in `find` variant. @default true */
    hasNextButton?: boolean;
    onSearch?: ((value: string, values?: string[]) => void) | null;
    onInput?: ((event: Event) => void) | null;
    onChange?: ((value: string) => void) | null;
    onClear?: (() => void) | null;
    onFocus?: ((event: Event) => void) | null;
    onBlur?: ((event: Event) => void) | null;
    onNext?: (() => void) | null;
    onPrevious?: (() => void) | null;
    onExpandedChange?: ((expanded: boolean) => void) | null;
    'aria-label'?: string;
}
type RequiredSearchOptions = Required<Omit<ArvoSearchOptions, 'onSearch' | 'onInput' | 'onChange' | 'onClear' | 'onFocus' | 'onBlur' | 'onNext' | 'onPrevious' | 'onExpandedChange' | 'errorMsg' | 'shortcut' | 'counter' | 'width' | 'defaultValue'>> & {
    width: string | null;
    errorMsg: string | null;
    shortcut: string | null;
    counter: {
        current: number;
        total: number;
    } | null;
    onSearch: ((value: string, values?: string[]) => void) | null;
    onInput: ((event: Event) => void) | null;
    onChange: ((value: string) => void) | null;
    onClear: (() => void) | null;
    onFocus: ((event: Event) => void) | null;
    onBlur: ((event: Event) => void) | null;
    onNext: (() => void) | null;
    onPrevious: (() => void) | null;
    onExpandedChange: ((expanded: boolean) => void) | null;
};
export declare class ArvoSearch {
    private _element;
    private _options;
    private _inputEl;
    private _fieldEl;
    private _actionsEl;
    private _borderEl;
    private _icoEl;
    private _clearEl;
    private _clearBtn;
    private _sep1El;
    private _sep2El;
    private _shortcutEl;
    private _counterHostEl;
    private _counterBadge;
    private _prevEl;
    private _prevBtn;
    private _nextEl;
    private _nextBtn;
    private _submitEl;
    private _submitBtn;
    private _expandTriggerEl;
    private _expandTriggerBtnEl;
    private _expandTriggerBtn;
    private _errIcoEl;
    private _errIcoConnector;
    private _errMsgAlert;
    private _inlineAlert;
    private _inlineAlertEl;
    private _previousValue;
    private _errorId;
    private _inputId;
    private _shortcutCombo;
    private _boundShortcutHandler;
    private _resizeObserver;
    /** Active setTimeout id for debounced search; null when idle. */
    private _searchDebounceId;
    /** Current expanded state for expandable-filter variant. */
    private _isExpanded;
    /**
     * Guard window between expand-trigger focus and the rAF-scheduled input
     * focus. While true, the root `focusout` listener will not auto-collapse
     * (the trigger losing focus to `inert` would otherwise immediately undo
     * the expand the user just initiated). Cleared once focus has settled
     * inside the field.
     */
    private _suppressAutoCollapse;
    /** Stashed real value while collapseBehavior='summary' is active (null when not in summary mode). */
    private _realValueRef;
    private _boundHandleInput;
    private _boundHandleFocus;
    private _boundHandleBlur;
    private _boundHandleKeydown;
    private _boundHandleClearClick;
    private _boundHandlePrevClick;
    private _boundHandleNextClick;
    private _boundHandleSubmitClick;
    private _boundHandleExpandTriggerClick;
    private _boundHandleExpandTriggerFocus;
    private _boundHandleRootFocusOut;
    private _boundHandlePaste;
    static readonly VARIANTS: readonly ["filter", "expandable-filter", "find"];
    static readonly SEARCH_MODES: readonly ["input", "submit"];
    static readonly DEFAULTS: RequiredSearchOptions;
    static initialize(element: HTMLDivElement, options?: ArvoSearchOptions): ArvoSearch;
    constructor(element: HTMLDivElement, options?: ArvoSearchOptions);
    private _render;
    /**
     * Toggle the `inert` attribute on the expand-trigger and the field so the
     * currently-invisible half cannot receive Tab focus or be announced by
     * assistive tech. The visible half is left interactive.
     */
    private _applyExpandableInert;
    private _bindEvents;
    private _registerShortcut;
    private _handleInput;
    private _handleFocus;
    private _handleBlur;
    /**
     * Expand on trigger focus. Mirrors the React `onFocus={expandFromTrigger}`
     * wiring: tabbing into the collapsed trigger should expand the field (and
     * `expanded()` forwards focus to the input), keeping click and keyboard
     * entry paths identical for the expandable-filter variant.
     *
     * Sets `_suppressAutoCollapse` so the trigger's own `inert`-driven blur
     * (which happens before the rAF-scheduled input focus lands) does not
     * re-trigger our auto-collapse focusout listener.
     */
    private _handleExpandTriggerFocus;
    /**
     * Root `focusout` listener -- expandable-filter auto-collapse. When focus
     * leaves the entire root and the field is empty, collapse back to the icon
     * trigger. A non-empty value (or an in-progress summary, whose underlying
     * `_realValueRef` is preserved) pins the field open.
     *
     * We deliberately do NOT route through `this.expanded(false)` here because
     * that path schedules a `_expandTriggerBtnEl.focus()` (used by Esc-to-
     * collapse and programmatic API calls); on auto-collapse the user has just
     * moved focus elsewhere and yanking it back to the trigger would be
     * disruptive. The state change + event + ARIA sync is replicated inline.
     */
    private _handleRootFocusOut;
    private _handleKeydown;
    private _handlePaste;
    private _handleClearClick;
    private _handlePrevClick;
    private _handleNextClick;
    private _handleSubmitClick;
    private _handleExpandTriggerClick;
    private _handleShortcutKeyDown;
    private _cancelDebounce;
    private _resolveMultiLineConfig;
    private _autoResizeTextarea;
    private _triggerSearch;
    private _applyWidthStyle;
    private _updatePadding;
    private _updateSeparators;
    private _updateNavState;
    private _dispatchEvent;
    value(): string;
    value(newValue: string): void;
    clear(): void;
    counter(): {
        current: number;
        total: number;
    } | null;
    counter(current: number | null, total?: number): void;
    search(): void;
    next(): void;
    previous(): void;
    expanded(): boolean;
    expanded(state: boolean): void;
    /**
     * When the variant is expandable-filter, the `has-error` affordance is
     * suppressed while collapsed and reapplied while expanded. This keeps the
     * SCSS layer free of variant-specific `has-error` overrides and matches
     * the React component's `effectiveInvalid` behavior.
     */
    private _syncCollapsedErrorState;
    disabled(): boolean;
    disabled(state: boolean): void;
    readOnly(): boolean;
    readOnly(state: boolean): void;
    shortcut(): string | null;
    shortcut(newValue: string | null): void;
    width(): string | null;
    width(newValue: string | null): void;
    fullWidth(): boolean;
    fullWidth(state: boolean): void;
    setError(message: string | false): void;
    focus(): void;
    setLoading(isLoading: boolean): void;
    destroy(): void;
}
export {};
//# sourceMappingURL=Search.d.ts.map