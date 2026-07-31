export interface MonthMatrixOptions {
    weekStart?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    showWeeks?: boolean;
}
export interface MonthDay {
    date: Date;
    inMonth: boolean;
}
export interface MonthWeek {
    weekNumber: number | null;
    days: MonthDay[];
}
export interface MonthMatrix {
    weeks: MonthWeek[];
    weekStart: number;
}
/**
 * Build the 6x7 day matrix for the given month (month is 0..11). The week
 * number for each row is the ISO week of that row's Thursday, so it is stable
 * regardless of `weekStart`.
 */
export declare function getMonthMatrix(year: number, month: number, options?: MonthMatrixOptions): MonthMatrix;
//# sourceMappingURL=month-matrix.d.ts.map