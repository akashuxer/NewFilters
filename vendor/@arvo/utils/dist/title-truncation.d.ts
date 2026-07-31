import { TooltipPlacement } from '../../core/src';
export interface TitleTruncationOptions {
    /**
     * Element whose truncation state controls the tooltip. When
     * `triggerElement` is omitted this element is ALSO the hover/focus
     * anchor (the typical title-clamp pattern used by Toast / BannerAlert /
     * AccordionItem).
     */
    element: HTMLElement;
    /**
     * Optional hover/focus anchor that owns the tooltip events. Defaults
     * to `element`. Use this when the visible truncation target lives
     * inside a larger interactive surface that should be the actual hover
     * trigger -- e.g. `ArvoButton` passes the `<button>` as the trigger
     * and the `<span class="arvo-btn__lbl">` as the measurement element.
     */
    triggerElement?: HTMLElement;
    /** Full title text to display in the tooltip. */
    content: string | (() => string);
    /** Tooltip placement; defaults to `bottom-center`. */
    placement?: TooltipPlacement;
}
export interface TitleTruncationHandle {
    /** Update the title content (e.g. when the consumer's `title` prop changes). */
    update(content: string | (() => string)): void;
    /** Detach the tooltip and observer. Safe to call multiple times. */
    destroy(): void;
}
/**
 * Attaches a truncation-aware tooltip to a title element. The tooltip
 * renders only when the text is clipped by overflow/line-clamp.
 *
 * Always wires the underlying connector as `kind: 'truncation'`, which
 * means it automatically yields to any explicit `<ArvoTooltip>` /
 * `ArvoTooltip.initialize` that is bound to the same anchor (or one of
 * its ancestors) and skips `aria-describedby` so assistive tech does not
 * double-announce text that is already in the anchor's accessible name.
 */
export declare function attachTitleTruncationTooltip(options: TitleTruncationOptions): TitleTruncationHandle;
//# sourceMappingURL=title-truncation.d.ts.map