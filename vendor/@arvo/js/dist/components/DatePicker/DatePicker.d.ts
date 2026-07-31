import { ArvoFormLabelContextHelpConfig } from '../FormLabel/FormLabel';
import { ArvoCalendarOptions } from '../Calendar/Calendar';
/**
 * Scoped escape-hatch bag for inner `ArvoCalendar` options the parent
 * does not curate as a flat option. Mirrors React `DatePickerCalendarProps`
 * exactly -- drift checker enforces key-set parity.
 */
export type DatePickerCalendarProps = Pick<ArvoCalendarOptions, 'hasOutsideDays' | 'isKeyboardEnabled' | 'size'>;
/**
 * Scoped escape-hatch bag for popover surface options the parent does
 * not curate as a flat option. DatePicker portals a custom overlay (not
 * `ArvoPopover`); this bag exposes parent-defined visual knobs.
 */
export interface DatePickerPopoverProps {
    /** CSS width override on the popover surface. */
    width?: string;
    /** Pixel offset between the trigger and the popover. Default: 4. */
    offset?: number;
}
export interface ArvoDatePickerOptions {
    /** Current date value. Parsed via parseDate(value, format, locale). */
    value?: Date | string | null;
    /** Initial value for uncontrolled mode. */
    defaultValue?: Date | string | null;
    /** .NET / Kendo date format. Empty resolves to locale default. */
    format?: string | null;
    /** BCP-47 locale. */
    locale?: string | null;
    /** First day of week. 0=Sunday, 1=Monday, ... 6=Saturday. */
    weekStart?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    /** Show weeks column in calendar. Adds arvo-dp--show-weeks modifier. */
    hasWeeks?: boolean;
    /** Min selectable date (inclusive). */
    minDate?: Date | string | null;
    /** Max selectable date (inclusive). */
    maxDate?: Date | string | null;
    /** Placeholder text shown when value is null. */
    placeholder?: string | null;
    /** Form label text. Uses form-label shared pattern. */
    label?: string | null;
    /**
     * Optional contextual-help icon attached to the field label. When provided,
     * embeds an `ArvoContextHelp` at `size: 'sm'` (14px) absolutely positioned
     * to the right of the label. Has no effect when `label` is omitted.
     */
    contextHelp?: ArvoFormLabelContextHelpConfig | null;
    /** Trigger size. Applies arvo-dp--sm or arvo-dp--lg modifier. */
    size?: 'sm' | 'lg';
    /**
     * Visual fill of the trigger field. `'filled'` (default) renders the
     * tinted field background. `'base'` swaps to the host surface color so
     * the trigger reads as a flat extension of its parent (toolbars, side
     * panels, table cells, inline-edit rows). Only the at-rest trigger
     * background changes; hover, focus, disabled, readonly, error, text,
     * border, and icon colors are identical across both surfaces.
     */
    surface?: 'filled' | 'base';
    /** CSS width on the trigger (e.g. "200px", "50%"). Defaults to 300px. */
    width?: string | null;
    /** Shorthand for width="100%". Applies arvo-dp--full-width modifier. */
    isFullWidth?: boolean;
    /** Disabled state. Applies is-disabled class and aria-disabled. */
    isDisabled?: boolean;
    /** Read-only. Applies is-readonly class. */
    isReadOnly?: boolean;
    /** Required for forms. Applies aria-required. */
    isRequired?: boolean;
    /** Validation invalid. Applies has-error class and aria-invalid. */
    isInvalid?: boolean;
    /** Error message text. Used by msg-alert shared pattern. */
    errorMsg?: string | null;
    /** How to render error feedback. */
    errorDisplay?: 'inline' | 'tooltip' | 'none';
    /** Loading state (Pattern C). Applies loading class and aria-busy. */
    isLoading?: boolean;
    /**
     * When true and a value is set, renders a clear icon button in the action
     * overlay. Defaults to `false` (mirrors the React API).
     */
    isClearable?: boolean;
    /** Close popover on day select. */
    isAutoClose?: boolean;
    /** Reject partial format parses. */
    isStrictParsing?: boolean;
    /** Use isSegmented input editing in the trigger. */
    isSegmented?: boolean;
    /**
     * Overlay-only mode. Pass a host element / CSS selector to bind without
     * rendering an input. Applies arvo-dp--anchor-mode modifier.
     */
    anchor?: false | true | HTMLElement | string;
    /** Popover placement relative to the trigger. */
    placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'auto';
    /**
     * Escape hatch for inner `ArvoCalendar` options the parent doesn't
     * expose flat. Bag-only knobs (`hasOutsideDays`, `isKeyboardEnabled`,
     * `size`) flow through. Flat options always win on overlap.
     */
    calendarProps?: DatePickerCalendarProps;
    /**
     * Escape hatch for popover surface options the parent doesn't expose
     * flat. Bag-only knobs (`width`, `offset`) flow through. Flat options
     * (`placement`) always win on overlap. Z-index is owned by the overlay
     * hub (configure via `overlayHub.configure({ zIndexBase })`).
     */
    popoverProps?: DatePickerPopoverProps;
    /** Called when the committed date value changes. */
    onChange?: (payload: {
        value: Date | null;
        formattedValue: string;
    }) => void;
    /** Called when popover is about to open. Return false to cancel. */
    onOpen?: () => boolean | void;
    /** Called when popover is about to close. Return false to cancel. */
    onClose?: () => boolean | void;
    /** Called on trigger blur. */
    onBlur?: () => void;
}
export declare class ArvoDatePicker {
    private _element;
    private _opts;
    private _effLocale;
    private _effFormat;
    private readonly _id;
    private readonly _inputId;
    private readonly _labelId;
    private readonly _errorId;
    private readonly _popoverId;
    private _committedValue;
    private _isOpen;
    private _visibleYear;
    private _visibleMonth;
    private _viewMode;
    private _errorOverride;
    private _loadingOverride;
    private _hasTextSelected;
    private _preFocusValue;
    private _inputFocused;
    private _useAnchorRender;
    private _anchorEl;
    private _labelEl;
    private _fieldEl;
    private _inputEl;
    private _actionsEl;
    private _clearBtnEl;
    private _triggerBtnEl;
    private _errIcoEl;
    private _errMsgEl;
    private _borderEl;
    private _popoverEl;
    private _headerEl;
    private _bodyEl;
    private _clearBtn;
    private _triggerBtn;
    private _errIco;
    private _inlineAlert;
    private _calNav;
    private _calendar;
    private _segmentCtrl;
    private _surface;
    private _closingProgrammatically;
    private _resizeObserver;
    private _boundInputKeyDown;
    private _boundInputFocus;
    private _boundInputBlur;
    private _boundInputMouseDown;
    private _boundInputPaste;
    private _boundInputChange;
    private _boundAnchorClick;
    private _boundAnchorKeyDown;
    private _boundCalCellSelect;
    private _boundCalMonthChange;
    private _boundCalViewModeChange;
    private _boundCalDismiss;
    private _destroyed;
    static initialize(element: HTMLElement, options?: ArvoDatePickerOptions): ArvoDatePicker;
    constructor(element: HTMLElement, options?: ArvoDatePickerOptions);
    private _renderDomInput;
    private _renderDomAnchor;
    private _renderActions;
    private _renderInlineError;
    private _initSegmentController;
    private _observeActions;
    private _updatePadding;
    private _applyWidth;
    private _syncRootClasses;
    private _effError;
    private _effLoading;
    private _asDate;
    private _updateInputDisplay;
    private _refreshInputFromController;
    private _restoreCaretToFocusedSegment;
    private _handleCommit;
    private _handleTriggerClick;
    private _handleInputFocus;
    /**
     * Click-to-segment: maps the mousedown caret offset to a segment index so
     * users can click on (for example) the `dd` segment in `MM/dd/yyyy` and
     * land directly on the day instead of the first segment. The browser sets
     * `selectionStart` from the click position even on readOnly inputs; we
     * defer one frame so the value is stable before reading.
     */
    private _handleInputMouseDown;
    private _handleInputBlur;
    private _handleInputChange;
    private _handleInputKeyDown;
    private _handleInputPaste;
    private _handleAnchorClick;
    private _handleAnchorKeyDown;
    private _buildPopover;
    private _handleCalCellSelect;
    private _handleCalMonthChange;
    private _handleCalViewModeChange;
    private _handleCalDismiss;
    private _setViewMode;
    private _syncCalendarVisible;
    private _handleHeaderPrev;
    private _handleHeaderNext;
    private _handleHeaderToday;
    /**
     * Tab cycle inside the popover (mirrors React's getOrderedPopoverElements).
     * Initial focus is set imperatively to the selected (or today) calendar
     * cell after the engine positions the panel -- see open() rAF block.
     */
    private _getOrderedPopoverElements;
    /**
     * Engine-driven close callback. Fires for outside-click and Escape (via
     * the hub). Per the cross-cutting overlay policy, engine-driven
     * dismissals are unconditional and silent -- no dp:close dispatch, no
     * onClose veto. We still manage focus return here because
     * `_buildPopover` already returns the focus trap with
     * returnFocusOnDeactivate: false (we keep manual focus return for parity
     * with anchor mode).
     */
    private _handleEngineClose;
    open(): void;
    close(): void;
    toggle(force?: boolean): void;
    value(): Date | null;
    value(v: Date | string | null): void;
    formattedValue(): string;
    clear(): void;
    disabled(): boolean;
    disabled(state: boolean): void;
    setError(message: string | false): void;
    setLoading(loading: boolean): void;
    focus(): void;
    destroy(): void;
}
export default ArvoDatePicker;
//# sourceMappingURL=DatePicker.d.ts.map