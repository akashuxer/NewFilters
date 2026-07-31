import { TimeObject } from '../../../../core/src';
import { ArvoFormLabelContextHelpConfig } from '../FormLabel/FormLabel';
import { ArvoCalendarOptions } from '../Calendar/Calendar';
/**
 * Scoped escape-hatch bag for inner `ArvoCalendar` options. Mirrors the
 * React twin. Drift checker enforces parity.
 */
export type DateTimePickerCalendarProps = Pick<ArvoCalendarOptions, 'hasOutsideDays' | 'isKeyboardEnabled' | 'size'>;
/**
 * Scoped escape-hatch bag for popover surface options. Custom portal,
 * not `ArvoPopover`.
 */
export interface DateTimePickerPopoverProps {
    width?: string;
    offset?: number;
}
export interface ArvoDateTimePickerOptions {
    /** Current datetime value. Parsed via parseDateTime(value, format, locale). */
    value?: Date | string | null;
    /** Initial value for uncontrolled mode. */
    defaultValue?: Date | string | null;
    /** .NET / Kendo combined date+time format. Empty resolves to locale default. */
    format?: string | null;
    /** BCP-47 locale. */
    locale?: string | null;
    /** First day of week. 0=Sunday, 1=Monday, ... 6=Saturday. */
    weekStart?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    /** Show weeks column in the calendar. Adds arvo-dtp--show-weeks modifier. */
    hasWeeks?: boolean;
    /** TimeDropdown interval in minutes. Default 15. */
    interval?: number;
    /**
     * Full datetime min (inclusive). The time portion is enforced ONLY on the
     * boundary date; other dates accept any time.
     */
    min?: Date | string | null;
    /** Full datetime max (inclusive). Same boundary semantics as `min`. */
    max?: Date | string | null;
    /** Time-only floor applied across ALL dates (e.g. business hours start). */
    startTime?: TimeObject | string | null;
    /** Time-only ceiling applied across ALL dates (e.g. business hours end). */
    endTime?: TimeObject | string | null;
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
    /** Trigger size. Applies arvo-dtp--sm or arvo-dtp--lg modifier. */
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
    /** Shorthand for width="100%". Applies arvo-dtp--full-width modifier. */
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
    /** Opt-in clear button (default `false`). */
    isClearable?: boolean;
    /**
     * Auto-close on selection. Defaults FALSE for DateTimePicker (different
     * from Date/Time Picker) so users can set both portions before closing.
     * When true, closes ONLY when BOTH date AND time have been touched since
     * the last open.
     */
    isAutoClose?: boolean;
    /** Reject partial format parses. */
    isStrictParsing?: boolean;
    /** Use combined isSegmented input editing in the trigger. */
    isSegmented?: boolean;
    /**
     * Overlay-only mode. Pass a host element / CSS selector to bind without
     * rendering an input. Applies arvo-dtp--anchor-mode modifier.
     */
    anchor?: false | true | HTMLElement | string;
    /** Popover placement relative to the trigger. */
    placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'auto';
    /** Inner ArvoCalendar config; flat options win on overlap. */
    calendarProps?: DateTimePickerCalendarProps;
    /** Popover surface options (custom portal). Flat opts win on overlap. */
    popoverProps?: DateTimePickerPopoverProps;
    /** Called when the committed datetime value changes. */
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
export declare class ArvoDateTimePicker {
    private _element;
    private _opts;
    private _effLocale;
    private _effFormat;
    private _timeFormat;
    private readonly _id;
    private readonly _inputId;
    private readonly _labelId;
    private readonly _errorId;
    private readonly _popoverId;
    private _committedValue;
    private _previewValue;
    private _isOpen;
    private _visibleYear;
    private _visibleMonth;
    private _viewMode;
    private _errorOverride;
    private _loadingOverride;
    private _hasTextSelected;
    private _preFocusValue;
    private _inputFocused;
    private _dateTouched;
    private _timeTouched;
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
    private _popoverWrapperEl;
    private _popoverEl;
    private _headerEl;
    private _bodyEl;
    private _calHostEl;
    private _timeHostEl;
    private _clearBtn;
    private _triggerBtn;
    private _errIco;
    private _inlineAlert;
    private _calNav;
    private _calendar;
    private _timeDropdown;
    private _segmentCtrl;
    private _surface;
    private _closingProgrammatically;
    private _resizeObserver;
    private _boundInputKeyDown;
    private _boundInputFocus;
    private _boundInputBlur;
    private _boundInputMouseDown;
    private _boundInputPaste;
    private _boundAnchorClick;
    private _boundAnchorKeyDown;
    private _destroyed;
    static initialize(element: HTMLElement, options?: ArvoDateTimePickerOptions): ArvoDateTimePicker;
    constructor(element: HTMLElement, options?: ArvoDateTimePickerOptions);
    private _renderDomInput;
    private _renderDomAnchor;
    private _renderActions;
    private _renderInlineError;
    private _initSegmentController;
    private _observeActions;
    private _updatePadding;
    private _applyWidth;
    private _syncRootClasses;
    /**
     * Keeps the display:contents wrapper's modifier classes in sync so the
     * `--arvo-dtp-popover-w` CSS variable cascade matches React's
     * `popoverRootClass` wrapper (`arvo-dtp`, size, --full-width, --show-weeks,
     * loading). Called from _syncRootClasses() and _buildPopover().
     */
    private _syncPopoverWrapperClasses;
    private _effError;
    private _effLoading;
    private _asDate;
    private _asTime;
    private _resolveTimeFormat;
    private _updateInputDisplay;
    private _refreshInputFromController;
    private _restoreCaretToFocusedSegment;
    private _liveValue;
    private _liveDateForBounds;
    private _syncLivePanels;
    private _syncCalendarSelected;
    private _tdSignature;
    private _buildTdSignature;
    private _syncTimeDropdownValue;
    private _syncCalendarVisible;
    private _commitValue;
    private _handleTriggerClick;
    private _handleInputFocus;
    /**
     * Click-to-segment. Mirrors the DatePicker implementation; see that file
     * for the rAF rationale.
     */
    private _handleInputMouseDown;
    private _handleInputBlur;
    private _handleInputKeyDown;
    private _handleInputPaste;
    private _handleAnchorClick;
    private _handleAnchorKeyDown;
    private _buildPopover;
    private _handleCalCellSelect;
    private _handleTimeChange;
    private _setViewMode;
    private _handleHeaderPrev;
    private _handleHeaderNext;
    private _handleHeaderToday;
    /**
     * Tab cycle inside the popover (mirrors React's getOrderedPopoverElements).
     * Custom order: calendarCell -> timeOption -> prev -> month -> year -> next
     * -> today. Both ArvoCalendar and ArvoTimeDropdown use roving tabindex, so
     * the single `[tabindex="0"]` element in each set is found by selector.
     * Initial focus is set imperatively to the selected (or today) calendar cell
     * after the engine positions the panel -- see open() rAF block.
     */
    private _getOrderedPopoverElements;
    /**
     * Engine-driven close callback. Fires for outside-click and Escape (via the
     * hub). Per the cross-cutting overlay policy, engine-driven dismissals are
     * unconditional and silent -- no dtp:close dispatch, no onClose veto.
     *
     * The `_closingProgrammatically` flag guards the symmetric case where
     * this.close() sets the flag before calling surface.close(). In that path
     * the hook fires while the flag is true and we return early, since the
     * programmatic path already synced state + classes + focus return.
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
export default ArvoDateTimePicker;
//# sourceMappingURL=DateTimePicker.d.ts.map