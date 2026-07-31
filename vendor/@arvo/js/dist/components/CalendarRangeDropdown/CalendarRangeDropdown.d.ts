import { ArvoCalendarOptions } from '../Calendar/Calendar';
export type CalendarRangeDropdownMode = 'absolute' | 'member' | 'rolling';
export interface DateRangeValue {
    start: Date | null;
    end: Date | null;
}
export interface RollingRangeValue {
    startOffset: number;
    endOffset: number;
}
export interface CalendarRangeDropdownPopoverProps {
    width?: string;
    offset?: number;
    zIndex?: number;
}
export type CalendarRangeDropdownCalendarProps = Pick<ArvoCalendarOptions, 'hasOutsideDays' | 'isKeyboardEnabled' | 'size'>;
export interface CalendarRangeMemberItem {
    key: string;
    name: string;
    displayName: string;
    index?: number;
}
export interface ArvoCalendarRangeDropdownOptions {
    startValue?: Date | string | null;
    endValue?: Date | string | null;
    format?: string | null;
    locale?: string | null;
    weekStart?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    hasWeeks?: boolean;
    minDate?: Date | string | null;
    maxDate?: Date | string | null;
    frequency?: 'day' | 'week' | 'month' | 'quarter' | 'year' | null;
    memberData?: CalendarRangeMemberItem[] | null;
    currentMemberIndex?: number | null;
    hasRolling?: boolean;
    rollingPrefix?: string | null;
    rollingValue?: RollingRangeValue | null;
    hasModeToggle?: boolean;
    mode?: CalendarRangeDropdownMode | null;
    defaultMode?: CalendarRangeDropdownMode | null;
    defaultOpen?: boolean;
    isDisabled?: boolean;
    isAutoClose?: boolean;
    placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'auto';
    ariaLabel?: string | null;
    calendarProps?: CalendarRangeDropdownCalendarProps | null;
    popoverProps?: CalendarRangeDropdownPopoverProps | null;
    onChange?: (payload: {
        start: Date | null;
        end: Date | null;
        formatted: {
            start: string;
            end: string;
        };
        mode: CalendarRangeDropdownMode;
        memberRange?: unknown;
        rollingValue?: RollingRangeValue;
    }) => void;
    onModeChange?: (payload: {
        mode: CalendarRangeDropdownMode;
    }) => void;
    onOpen?: () => boolean | void;
    onClose?: () => boolean | void;
    onOpenChange?: (open: boolean) => void;
    onCancel?: () => void;
    onSave?: () => void;
}
export declare class ArvoCalendarRangeDropdown {
    private _trigger;
    private _opts;
    private _id;
    private _popoverEl;
    private _bodyEl;
    private _headerEl;
    private _calLeftEl;
    private _calRightEl;
    private _calLeft;
    private _calRight;
    private _nav;
    private _surface;
    private _effLocale;
    private _effFormat;
    private _appliedRange;
    private _draftRange;
    private _draftFirstSet;
    private _activeSide;
    private _hoverDate;
    private _leftYear;
    private _leftMonth;
    private _viewMode;
    private _isOpen;
    private _destroyed;
    private _closingProgrammatically;
    static initialize(trigger: HTMLElement, options?: ArvoCalendarRangeDropdownOptions): ArvoCalendarRangeDropdown;
    constructor(trigger: HTMLElement, options?: ArvoCalendarRangeDropdownOptions);
    private _handleTriggerClick;
    private _handleTriggerKeyDown;
    private _bindTrigger;
    private _unbindTrigger;
    private _buildPopover;
    private _mountCalendarColumn;
    private _navViewMode;
    private _visibleFor;
    private _handleHeaderPrev;
    private _handleHeaderNext;
    private _handleHeaderToday;
    private _setViewMode;
    private _refreshCalendars;
    private _handleCellSelect;
    private _handleCellHover;
    private _commitRange;
    private _dispatch;
    private _handleEngineClose;
    open(): void;
    close(): void;
    toggle(force?: boolean): void;
    isOpen(): boolean;
    range(): DateRangeValue;
    range(v: DateRangeValue): void;
    /**
     * Imperative active-side hint used by parent pickers' segmented inputs to
     * pre-position the cursor on the calendar before the next click.
     */
    setActiveSide(side: 'start' | 'end'): void;
    disabled(): boolean;
    disabled(state: boolean): void;
    focus(): void;
    destroy(): void;
    private _getOrderedPopoverElements;
}
//# sourceMappingURL=CalendarRangeDropdown.d.ts.map