import { Frequency, MemberItem, NormalizedMember, RollingRange } from '../../../../core/src';
import { ArvoFormLabelContextHelpConfig } from '../FormLabel/FormLabel';
import { ArvoCalendarOptions } from '../Calendar/Calendar';
export type ArvoDateRangePickerMode = 'absolute' | 'member' | 'rolling';
export interface DateRangeValue {
    start: Date | null;
    end: Date | null;
}
export interface MemberRangeValue {
    start: NormalizedMember | null;
    end: NormalizedMember | null;
}
export interface ArvoDateRangePickerChangePayload {
    start: Date | null;
    end: Date | null;
    formatted: {
        start: string;
        end: string;
    };
    mode: ArvoDateRangePickerMode;
    memberRange?: {
        start: NormalizedMember | null;
        end: NormalizedMember | null;
    };
    rollingValue?: RollingRange;
}
/**
 * Scoped escape-hatch bag for inner `ArvoCalendar` options the parent
 * does not curate as a flat option. Applies to BOTH absolute-mode
 * calendars (member-mode tile panel is parent-owned and unaffected).
 * Mirrors React `DateRangePickerCalendarProps` -- drift checker enforces
 * key-set parity.
 */
export type DateRangePickerCalendarProps = Pick<ArvoCalendarOptions, 'hasOutsideDays' | 'isKeyboardEnabled' | 'size'>;
/**
 * Scoped escape-hatch bag for popover surface options. DateRangePicker
 * portals a custom overlay (not `ArvoPopover`).
 */
export interface DateRangePickerPopoverProps {
    /** CSS width override on the popover surface. */
    width?: string;
    /** Pixel offset between the trigger and the popover. Default: 4. */
    offset?: number;
}
export interface ArvoDateRangePickerOptions {
    startValue?: Date | string | null;
    endValue?: Date | string | null;
    format?: string | null;
    locale?: string | null;
    weekStart?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    hasWeeks?: boolean;
    minDate?: Date | string | null;
    maxDate?: Date | string | null;
    placeholder?: string | null;
    label?: string | null;
    /**
     * Optional contextual-help icon attached to the field label. When provided,
     * embeds an `ArvoContextHelp` at `size: 'sm'` (14px) absolutely positioned
     * to the right of the label. Has no effect when `label` is omitted.
     */
    contextHelp?: ArvoFormLabelContextHelpConfig | null;
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
    width?: string | null;
    isFullWidth?: boolean;
    isDisabled?: boolean;
    isReadOnly?: boolean;
    isRequired?: boolean;
    isInvalid?: boolean;
    errorMsg?: string | null;
    errorDisplay?: 'inline' | 'tooltip' | 'none';
    isLoading?: boolean;
    /** Opt-in clear button (default `false`). */
    isClearable?: boolean;
    isAutoClose?: boolean;
    isStrictParsing?: boolean;
    isSegmented?: boolean;
    frequency?: Frequency | null;
    memberData?: MemberItem[] | null;
    currentMemberIndex?: number | null;
    hasModeToggle?: boolean;
    hasRolling?: boolean;
    rollingPrefix?: string | null;
    rollingValue?: RollingRange | null;
    anchor?: false | true | HTMLElement | string;
    placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'auto';
    /**
     * Inner `ArvoCalendar` config the parent doesn't expose flat. Bag-only
     * keys flow through; flat options always win on overlap. Applies to
     * both absolute-mode calendars (member tile panel unaffected).
     */
    calendarProps?: DateRangePickerCalendarProps;
    /**
     * Popover surface options (custom portal -- not `ArvoPopover`). Bag-only
     * keys (`width`, `offset`) flow through; flat options (`placement`)
     * always win on overlap. Z-index is owned by the overlay hub (configure
     * via `overlayHub.configure({ zIndexBase })`).
     */
    popoverProps?: DateRangePickerPopoverProps;
    onChange?: (payload: ArvoDateRangePickerChangePayload) => void;
    onModeChange?: (payload: {
        mode: ArvoDateRangePickerMode;
    }) => void;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    onCancel?: () => void;
    onSave?: () => void;
}
export declare class ArvoDateRangePicker {
    private _element;
    private _opts;
    private _effLocale;
    private _effFormat;
    private readonly _id;
    private readonly _inputId;
    private readonly _labelId;
    private readonly _errorId;
    private readonly _popoverId;
    private _appliedRange;
    private _draftRange;
    private _draftFirstSet;
    private _hoverDate;
    private _appliedRolling;
    private _draftRolling;
    private _memberToggle;
    private _tab;
    private _isOpen;
    private _visibleYear;
    private _visibleMonth;
    private _viewMode;
    private _errorOverride;
    private _loadingOverride;
    private _memberIndex;
    private _useAnchorRender;
    private _anchorEl;
    private _labelEl;
    private _fieldEl;
    private _inputEl;
    private _endInputEl;
    private _valueEl;
    private _arrowEl;
    private _segDividerEl;
    private _startCtrl;
    private _endCtrl;
    private _focusedSide;
    private _actionsEl;
    private _clearBtnEl;
    private _triggerBtnEl;
    private _errIcoEl;
    private _errMsgEl;
    private _borderEl;
    private _popoverEl;
    private _modeAnnouncerEl;
    private _headerEl;
    private _bodyEl;
    private _footerEl;
    private _calLeftHostEl;
    private _calRightHostEl;
    private _calSepEl;
    private _tilePanelEl;
    private _mtgScrollEl;
    private _mtgGridEl;
    private _rollingSettingEl;
    private _rollingStartHostEl;
    private _rollingEndHostEl;
    private _infoAlertHostEl;
    private _currentIndEl;
    private _switchHostEl;
    private _tabsHostEl;
    private _prevBtnEl;
    private _nextBtnEl;
    private _todayBtnEl;
    private _clearBtn;
    private _triggerBtn;
    private _errIco;
    private _inlineAlert;
    private _infoAlert;
    private _calLeft;
    private _calRight;
    private _switch;
    private _tabs;
    private _rollingStart;
    private _rollingEnd;
    private _prevBtn;
    private _nextBtn;
    private _todayBtn;
    private _saveBtn;
    private _cancelBtn;
    private _calNavLeftZoneEl;
    private _monthBtnL;
    private _yearBtnL;
    private _monthBtnR;
    private _yearBtnR;
    private _calNavLeftEl;
    private _calNavRightEl;
    private _calNavEmDashEl;
    private _periodLblPrimaryEl;
    private _periodLblSecondaryEl;
    private _periodSepEl;
    private _firstVisibleMember;
    private _lastVisibleMember;
    private _mtgScrollResizeObserver;
    private _boundMtgScroll;
    private _mtgScrollRafId;
    private _resizeObserver;
    private _popoverWrapperEl;
    private _surface;
    private _closingProgrammatically;
    private _boundInputKeyDown;
    private _boundSegFocus;
    private _boundSegBlur;
    private _boundSegMouseDown;
    private _boundSegPaste;
    private _boundPopoverKeyDown;
    private _boundAnchorClick;
    private _boundAnchorKeyDown;
    private _destroyed;
    static initialize(element: HTMLElement, options?: ArvoDateRangePickerOptions): ArvoDateRangePicker;
    constructor(element: HTMLElement, options?: ArvoDateRangePickerOptions);
    private _hasMemberCapability;
    private _hasRollingCapability;
    private _activeMode;
    private _buildMemberIndex;
    private _findMemberFor;
    /**
     * Resolve the member that owns the bucket containing `date`. Returns `null`
     * when the date is outside the configured member span (used both as a
     * validation gate and as the source of truth for input/tile display name).
     */
    private _resolveMemberSnap;
    /**
     * Snap an arbitrary in-bucket date to the canonical edge of its member:
     *   - `start` -> member.keyDate
     *   - `end`   -> member.endDate
     * Returns `null` when the date does not match any bucket so callers can
     * revert to the previously valid value (parity with legacy behavior).
     */
    private _snapDateToMember;
    /**
     * Effective min/max dates: when member capability is configured, the picker
     * is hard-bounded by the member span (first.keyDate .. last.endDate). User-
     * supplied min/max can only NARROW that span -- never widen past members.
     */
    private _effMinDate;
    private _effMaxDate;
    private _effError;
    private _effLoading;
    private _asDate;
    private _renderDomInput;
    private _buildSegInput;
    private _renderDomAnchor;
    private _renderActions;
    private _renderInlineError;
    private _applyWidth;
    private _observeActions;
    private _updatePadding;
    private _syncRootClasses;
    /**
     * Keeps the display:contents wrapper's modifier classes in sync so the
     * `--arvo-drp-popover-*` CSS variable cascade matches React's
     * `popoverRootClass` wrapper (`arvo-drp`, size, mode, --full-width,
     * --show-weeks, loading). Called from _syncRootClasses() and _buildPopover().
     */
    private _syncPopoverWrapperClasses;
    private _fieldLabel;
    private _segPlaceholder;
    private _isAbsoluteEditable;
    private _baseSideText;
    private _segSideOf;
    private _segCtrl;
    private _segInputEl;
    private _initSegmentControllers;
    private _destroySegmentControllers;
    private _refreshSeg;
    private _commitSide;
    private _syncSegHasTextSelected;
    private _restoreSegCaret;
    private _focusEndFirst;
    private _focusStartLast;
    private _handleSegFocus;
    private _handleSegBlur;
    /**
     * Click-to-segment. Mirrors the single-input pickers but per-side because
     * the DRP carries two segment controllers. See DatePicker.ts for the rAF
     * rationale.
     */
    private _handleSegMouseDown;
    private _handleSegPaste;
    private _updateInputDisplay;
    private _commitRange;
    private _commitRolling;
    open(): void;
    close(): void;
    /**
     * Engine-driven close callback. Fires for outside-click (via the hub).
     * Per the cross-cutting overlay policy, engine-driven dismissals are
     * unconditional and silent -- no drp:close dispatch, no onClose veto.
     *
     * The `_closingProgrammatically` flag guards the symmetric case where
     * this.close() sets the flag before calling surface.close(). In that path
     * the hook fires while the flag is true and we return early, since the
     * programmatic path already synced state + classes + focus return.
     *
     * Rolling-mode outside-click does not fire drp:cancel / onCancel -- the
     * engine owns dismissal, a deliberate DRP-specific behavior difference
     * from the other overlay-driven pickers.
     */
    private _handleEngineClose;
    toggle(force?: boolean): void;
    private _buildPopover;
    /**
     * Destroys inner components without removing the popover shell. Called from
     * _renderPopover() before rebuilding content, and from _destroyPopover().
     */
    private _destroyPopoverContent;
    private _destroyPopover;
    private _popoverAriaLabel;
    private _renderPopover;
    private _renderHeader;
    /**
     * Render the absolute-mode header left zone. Composition depends on the
     * active calendar view:
     *
     *   days   -> [Month L] [Year L] -- em-dash -- [Month R] [Year R]
     *             (4 zoom buttons; em-dash joins the two month/year pairs)
     *   months -> [Year L]            -- em-dash -- [Year R]
     *             (2 zoom buttons; year-only labels for the left and right
     *              calendars which now span +1 year apart, not the same year)
     *   years  -> [decade-lbl: "{firstYear} - {lastYear}"]
     *             (single continuous decade label spanning the FIRST year of
     *              the left decade to the LAST year of the right decade,
     *              e.g. "2020 - 2039". No em-dash or duplicate labels.)
     *
     * The right calendar's visible period is always one period after the
     * left (_rightVisible()), so the labels rendered here track that
     * relationship.
     */
    private _renderAbsoluteLeftZone;
    /**
     * Refresh the period-label spans for member / rolling header. Pulled into
     * its own helper so the visible-tile tracker can update labels without
     * re-rendering the whole popover.
     */
    private _syncPeriodLabels;
    private _maybeRenderSwitch;
    private _maybeRenderTabs;
    private _renderAbsoluteBody;
    private _renderMemberBody;
    private _renderRollingBody;
    private _renderRangeCountAlert;
    private _renderTilePanel;
    /**
     * Attach a scroll listener + ResizeObserver to the active `_mtgScrollEl`
     * that recomputes the first / last fully visible tile (rAF-throttled) and
     * pushes their `displayName`s into the header period labels.
     */
    private _installMtgVisibleTracker;
    private _removeMtgVisibleTracker;
    private _renderFooter;
    private _removeFooter;
    private _rollingDirty;
    private _rollingResolved;
    private _currentMemberLabel;
    /**
     * Visible period shown by the RIGHT calendar in absolute mode. Always one
     * full period after the left calendar so the dual layout reads as
     * continuous (no duplicates):
     *   days   -> next month
     *   months -> next year
     *   years  -> next decade
     */
    private _rightVisible;
    private _handleTriggerClick;
    private _handleSegKeyDown;
    private _handlePopoverKeyDown;
    private _handleAnchorClick;
    private _handleAnchorKeyDown;
    private _handleMemberToggle;
    private _handleTabChange;
    private _handleCalendarCellSelect;
    /**
     * Auto-correct a member-mode range whose start and end resolve to the same
     * bucket. Tries to push end forward to the next bucket; if there is no
     * next, pulls start back to the previous bucket. Returns the corrected
     * pair, or the original pair when the dataset only has a single member.
     */
    private _enforceDistinctMembers;
    private _handleCalendarCellHover;
    private _handleTileClick;
    private _handleTileHover;
    /**
     * In-place refresh of `.in-range`, `.selected`, and `aria-selected` on the
     * existing tile elements. Called from hover (draft-end preview), rolling
     * stepper changes, and any other path that mutates the live start / end
     * without changing the member list itself. The `.current-member` class is
     * derived from `currentIndex` (which is static while the popover is open)
     * so it's set once at tile-creation time in `_renderTilePanel`.
     */
    private _refreshTileSelectionClasses;
    private _handleRollingStartChange;
    private _handleRollingEndChange;
    private _refreshRollingDerived;
    private _refreshInfoAlert;
    private _handleSaveRolling;
    private _handleCancelRolling;
    /**
     * Toggle the months zoom level. Mirrors the React DRP: clicking the month
     * button while already in months view returns to days. The right
     * calendar's visible period is recomputed by _rightVisible() based on the
     * new view mode so it stays continuous with the left.
     */
    private _handleMonthButton;
    /**
     * Toggle the years zoom level. Same semantics as _handleMonthButton.
     */
    private _handleYearButton;
    private _setViewMode;
    private _handlePrev;
    private _handleNext;
    private _handleToday;
    /**
     * Build the Tab cycle for the active popover mode. Mirrors the React
     * focus-trap order. Disabled buttons (e.g. rolling Save when clean) are
     * filtered out so the cycle never deadlocks.
     */
    private _getOrderedPopoverElements;
    range(): DateRangeValue;
    range(v: DateRangeValue): void;
    memberRange(): MemberRangeValue;
    memberRange(v: MemberRangeValue): void;
    rolling(): RollingRange | null;
    rolling(v: RollingRange): void;
    mode(): ArvoDateRangePickerMode;
    mode(m: ArvoDateRangePickerMode): void;
    memberToggle(): boolean;
    memberToggle(v: boolean): void;
    clear(): void;
    disabled(): boolean;
    disabled(state: boolean): void;
    setError(message: string | false): void;
    setLoading(loading: boolean): void;
    focus(): void;
    destroy(): void;
}
export default ArvoDateRangePicker;
//# sourceMappingURL=DateRangePicker.d.ts.map