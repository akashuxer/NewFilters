import { TimeObject } from '../../../../core/src';
import { ArvoCalendarOptions, ArvoCalendarViewMode } from '../Calendar/Calendar';
export type { TimeObject } from '../../../../core/src';
export interface DateTimeDropdownPopoverProps {
    width?: string;
    offset?: number;
    zIndex?: number;
}
export type DateTimeDropdownCalendarProps = Pick<ArvoCalendarOptions, 'hasOutsideDays' | 'isKeyboardEnabled' | 'size'>;
export interface ArvoDateTimeDropdownOptions {
    value?: Date | string | null;
    defaultValue?: Date | string | null;
    format?: string | null;
    locale?: string | null;
    weekStart?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    hasWeeks?: boolean;
    interval?: number;
    /** Full datetime min. Time enforced only on the boundary date. */
    min?: Date | string | null;
    /** Full datetime max. Time enforced only on the boundary date. */
    max?: Date | string | null;
    /** Time-only floor applied across ALL dates. */
    startTime?: TimeObject | string | null;
    /** Time-only ceiling applied across ALL dates. */
    endTime?: TimeObject | string | null;
    defaultOpen?: boolean;
    isDisabled?: boolean;
    /** Default false -- users typically need both date and time before close. */
    isAutoClose?: boolean;
    placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'auto';
    ariaLabel?: string;
    calendarProps?: DateTimeDropdownCalendarProps | null;
    popoverProps?: DateTimeDropdownPopoverProps | null;
    onChange?: (payload: {
        value: Date | null;
        formattedValue: string;
    }) => void;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    onOpenChange?: (open: boolean) => void;
    onMonthChange?: (payload: {
        year: number;
        month: number;
    }) => void;
    onViewModeChange?: (payload: {
        mode: ArvoCalendarViewMode;
    }) => void;
}
interface RequiredOptions {
    value: Date | string | null | undefined;
    defaultValue: Date | string | null;
    format: string | null;
    locale: string | null;
    weekStart: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    hasWeeks: boolean;
    interval: number;
    min: Date | string | null;
    max: Date | string | null;
    startTime: TimeObject | string | null;
    endTime: TimeObject | string | null;
    defaultOpen: boolean;
    isDisabled: boolean;
    isAutoClose: boolean;
    placement: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'auto';
    ariaLabel: string;
    calendarProps: DateTimeDropdownCalendarProps | null;
    popoverProps: DateTimeDropdownPopoverProps | null;
    onChange: ArvoDateTimeDropdownOptions['onChange'] | null;
    onOpen: ArvoDateTimeDropdownOptions['onOpen'] | null;
    onClose: ArvoDateTimeDropdownOptions['onClose'] | null;
    onOpenChange: ArvoDateTimeDropdownOptions['onOpenChange'] | null;
    onMonthChange: ArvoDateTimeDropdownOptions['onMonthChange'] | null;
    onViewModeChange: ArvoDateTimeDropdownOptions['onViewModeChange'] | null;
}
export declare class ArvoDateTimeDropdown {
    private _trigger;
    private _opts;
    private _id;
    private _popoverEl;
    private _calColEl;
    private _headerEl;
    private _calGridEl;
    private _timeColEl;
    private _sepEl;
    private _calendar;
    private _calNav;
    private _timeDropdown;
    private _surface;
    private _committedValue;
    /** Preview value updated via setPreview() while a parent edits an input. */
    private _previewValue;
    private _visibleYear;
    private _visibleMonth;
    private _viewMode;
    private _isOpen;
    private _destroyed;
    private _closingProgrammatically;
    private _effLocale;
    private _effFormat;
    private _effTimeFormat;
    static readonly PLACEMENTS: readonly ["top-start", "top-end", "bottom-start", "bottom-end", "auto"];
    static readonly DEFAULTS: RequiredOptions;
    static initialize(trigger: HTMLElement, options?: ArvoDateTimeDropdownOptions): ArvoDateTimeDropdown;
    constructor(trigger: HTMLElement, options?: ArvoDateTimeDropdownOptions);
    private _handleTriggerClick;
    private _handleTriggerKeyDown;
    private _bindTrigger;
    private _unbindTrigger;
    private _localeDefaultDateTimeFormat;
    private _splitTimeFormat;
    private _liveValue;
    private _buildPopover;
    private _createTimeDropdown;
    private _handleTimeChange;
    private _handleCalSelect;
    private _handleCalMonthChange;
    private _handleCalViewModeChange;
    private _handleCalDismiss;
    private _setViewMode;
    private _syncCalendarVisible;
    private _handleHeaderPrev;
    private _handleHeaderNext;
    private _handleHeaderToday;
    private _handleCommit;
    private _dispatch;
    private _handleEngineClose;
    open(): void;
    close(): void;
    toggle(force?: boolean): void;
    isOpen(): boolean;
    value(): Date | null;
    value(v: Date | string | null): void;
    /**
     * Imperative live-preview setter for the parent picker's segmented input.
     * Updates the highlighted calendar cell + time option without committing
     * or emitting dt-drop:change.
     */
    setPreview(v: Date | null): void;
    formattedValue(): string;
    disabled(): boolean;
    disabled(state: boolean): void;
    focus(): void;
    destroy(): void;
    private _getOrderedPopoverElements;
}
//# sourceMappingURL=DateTimeDropdown.d.ts.map