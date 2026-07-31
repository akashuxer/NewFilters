import { ArvoCalendarOptions, ArvoCalendarViewMode } from '../Calendar/Calendar';
/**
 * Scoped escape-hatch bag for popover surface options. `width`, `offset`,
 * and `zIndex` flow through; flat options always win on overlap. `zIndex`
 * overrides the overlay hub for this surface only.
 */
export interface CalendarDropdownPopoverProps {
    width?: string;
    offset?: number;
    zIndex?: number;
}
/**
 * Scoped escape-hatch bag for inner ArvoCalendar config the parent does not
 * curate as a flat prop. Pick<ArvoCalendarProps, 'hasOutsideDays' |
 * 'isKeyboardEnabled' | 'size'>. Bag-only keys flow through; flat props
 * always win on overlap.
 */
export type CalendarDropdownCalendarProps = Pick<ArvoCalendarOptions, 'hasOutsideDays' | 'isKeyboardEnabled' | 'size'>;
export interface MemberItemLike {
    key: string;
    name: string;
    displayName: string;
    index?: number;
}
export interface ArvoCalendarDropdownOptions {
    value?: Date | string | null;
    defaultValue?: Date | string | null;
    format?: string | null;
    locale?: string | null;
    weekStart?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    hasWeeks?: boolean;
    minDate?: Date | string | null;
    maxDate?: Date | string | null;
    frequency?: 'day' | 'week' | 'month' | 'quarter' | 'year' | null;
    memberData?: MemberItemLike[] | null;
    currentMemberIndex?: number | null;
    /** Initial open state for uncontrolled mode. */
    defaultOpen?: boolean;
    isDisabled?: boolean;
    /** Close the dropdown on day-cell select. Default true. */
    isAutoClose?: boolean;
    placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'auto';
    /** Accessible name for the dialog panel. Defaults to 'Choose a date'. */
    ariaLabel?: string;
    calendarProps?: CalendarDropdownCalendarProps | null;
    popoverProps?: CalendarDropdownPopoverProps | null;
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
    minDate: Date | string | null;
    maxDate: Date | string | null;
    frequency: 'day' | 'week' | 'month' | 'quarter' | 'year' | null;
    memberData: MemberItemLike[] | null;
    currentMemberIndex: number | null;
    defaultOpen: boolean;
    isDisabled: boolean;
    isAutoClose: boolean;
    placement: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'auto';
    ariaLabel: string;
    calendarProps: CalendarDropdownCalendarProps | null;
    popoverProps: CalendarDropdownPopoverProps | null;
    onChange: ArvoCalendarDropdownOptions['onChange'] | null;
    onOpen: ArvoCalendarDropdownOptions['onOpen'] | null;
    onClose: ArvoCalendarDropdownOptions['onClose'] | null;
    onOpenChange: ArvoCalendarDropdownOptions['onOpenChange'] | null;
    onMonthChange: ArvoCalendarDropdownOptions['onMonthChange'] | null;
    onViewModeChange: ArvoCalendarDropdownOptions['onViewModeChange'] | null;
}
export declare class ArvoCalendarDropdown {
    private _trigger;
    private _opts;
    private _id;
    private _popoverEl;
    private _headerEl;
    private _bodyEl;
    private _calendar;
    private _calNav;
    private _surface;
    private _committedValue;
    private _visibleYear;
    private _visibleMonth;
    private _viewMode;
    private _isOpen;
    private _destroyed;
    private _closingProgrammatically;
    private _effLocale;
    private _effFormat;
    private _memberIndex;
    static readonly PLACEMENTS: readonly ["top-start", "top-end", "bottom-start", "bottom-end", "auto"];
    static readonly DEFAULTS: RequiredOptions;
    static initialize(trigger: HTMLElement, options?: ArvoCalendarDropdownOptions): ArvoCalendarDropdown;
    constructor(trigger: HTMLElement, options?: ArvoCalendarDropdownOptions);
    private _handleTriggerClick;
    private _handleTriggerKeyDown;
    private _bindTrigger;
    private _unbindTrigger;
    private _buildMemberIndex;
    private _buildPopover;
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
    /**
     * Engine-driven close callback. Fires for outside-click and Escape via the
     * hub. Engine-driven dismissals are unconditional and silent -- no
     * cal-drop:close event, no onClose veto. Mirrors the cross-cutting overlay
     * policy.
     */
    private _handleEngineClose;
    open(): void;
    close(): void;
    toggle(force?: boolean): void;
    isOpen(): boolean;
    value(): Date | null;
    value(v: Date | string | null): void;
    formattedValue(): string;
    disabled(): boolean;
    disabled(state: boolean): void;
    focus(): void;
    destroy(): void;
    /**
     * Tab cycle inside the popover. Mirrors the React `getOrderedElements`
     * contract: calendar cell -> prev / month / year / next / today.
     */
    private _getOrderedPopoverElements;
}
export {};
//# sourceMappingURL=CalendarDropdown.d.ts.map