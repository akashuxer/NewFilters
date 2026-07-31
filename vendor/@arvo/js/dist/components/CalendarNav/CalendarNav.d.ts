export interface CalendarNavOptions {
    /** Year currently shown in the calendar header. */
    visibleYear: number;
    /** Month currently shown (0-based: 0=January, 11=December). */
    visibleMonth: number;
    /** Current calendar zoom level. Drives which buttons are active/highlighted. */
    viewMode?: 'days' | 'months' | 'years';
    /**
     * 'single' renders one month/year label group (DatePicker, DateTimePicker,
     * CalendarDropdown, DateTimeDropdown).
     * 'range' renders two label groups joined by an em-dash for the dual-
     * calendar CalendarRangeDropdown header (e.g. "June 2026 - July 2026").
     * In years view the two decades collapse to a single continuous label
     * (e.g. "2020 - 2039") matching the React CalendarNav range variant.
     */
    variant?: 'single' | 'range';
    /** Range variant: year shown by the right (end) calendar. */
    rangeEndYear?: number;
    /** Range variant: month shown by the right (end) calendar (0-based). */
    rangeEndMonth?: number;
    /** BCP-47 locale. Drives month/year label formatting. */
    locale?: string;
    /** Min selectable date; used to compute prev-button disabled state. */
    minDate?: Date | null;
    /** Max selectable date; used to compute next-button disabled state. */
    maxDate?: Date | null;
    /** When true, all interactive elements are non-interactive. */
    isDisabled?: boolean;
    onPrev?: () => void;
    onNext?: () => void;
    onToday?: () => void;
    onMonthButtonClick?: () => void;
    onYearButtonClick?: () => void;
    /** Tooltip for the prev button. Defaults to 'Previous'. */
    prevTooltip?: string;
    /** Tooltip for the next button. Defaults to 'Next'. */
    nextTooltip?: string;
    /** Tooltip for the today button. Defaults to 'Select today'. */
    todayTooltip?: string;
    /** Tooltip for the month label button. Defaults to 'Choose month'. */
    monthTooltip?: string;
    /** Tooltip for the year label button. Defaults to 'Choose year'. */
    yearTooltip?: string;
    className?: string;
    id?: string;
}
export declare class CalendarNav {
    private _element;
    private _options;
    private _leftEl;
    private _rightEl;
    private _monthBtnLEl;
    private _yearBtnLEl;
    private _monthBtnREl;
    private _yearBtnREl;
    private _decadeLblEl;
    private _rangeSepEl;
    private _prevBtnEl;
    private _todayBtnEl;
    private _nextBtnEl;
    private _monthBtnL;
    private _yearBtnL;
    private _monthBtnR;
    private _yearBtnR;
    private _prevBtn;
    private _todayBtn;
    private _nextBtn;
    private _destroyed;
    static initialize(element: HTMLElement, options: CalendarNavOptions): CalendarNav;
    constructor(element: HTMLElement, options: CalendarNavOptions);
    private _buildDom;
    private _renderLeftZone;
    private _mountInnerButtons;
    private _mountLeftZoneButtons;
    private _effLocale;
    private _monthLabel;
    private _yearLabel;
    private _decadeLabel;
    private _continuousDecadeLabel;
    private _syncRootClasses;
    private _syncNavDisabled;
    private _syncPressed;
    private _syncLabels;
    private _emit;
    setVisibleMonth(year: number, month: number): void;
    /**
     * Range variant only: update the end (right) calendar's visible period
     * without changing the left period. Triggers re-render of the right
     * label pair (or the continuous decade label in years view).
     */
    setRangeEnd(year: number, month: number): void;
    setViewMode(mode: 'days' | 'months' | 'years'): void;
    disabled(): boolean;
    disabled(state: boolean): void;
    destroy(): void;
}
export default CalendarNav;
//# sourceMappingURL=CalendarNav.d.ts.map