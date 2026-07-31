import { SegmentKind } from './types';
export interface SegmentBoundsContext {
    year?: number;
    month?: number;
}
/**
 * Numeric increment/decrement bounds for an editable segment. Returns `null`
 * for non-numeric (text) segments such as `monthName`, `ampm`, `dayName`.
 * Day bounds are MONTH/YEAR-AWARE when the context supplies them.
 */
export declare function getSegmentBounds(kind: SegmentKind, context?: SegmentBoundsContext): {
    min: number;
    max: number;
} | null;
//# sourceMappingURL=bounds.d.ts.map