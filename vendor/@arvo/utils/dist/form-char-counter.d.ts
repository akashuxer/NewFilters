export interface CharCounterOptions {
    maxLength?: number | null;
}
/**
 * Formats a character count string with zero-padded current value.
 * Padding width is determined by the number of digits in maxLength.
 *
 * Examples:
 *   formatCharCount(5, 100)  -> "005/100"
 *   formatCharCount(12, 50)  -> "12/50"
 *   formatCharCount(0, 1000) -> "0000/1000"
 *   formatCharCount(7, null) -> "7"
 */
export declare function formatCharCount(current: number, maxLength: number | null): string;
/**
 * Creates a character counter DOM element.
 * The consuming component appends this after the input/border area.
 */
export declare function createCharCounter(options?: CharCounterOptions): HTMLSpanElement;
/**
 * Updates the counter text. Call this on every input event.
 */
export declare function updateCharCounter(el: HTMLSpanElement, current: number, maxLength: number | null): void;
//# sourceMappingURL=form-char-counter.d.ts.map