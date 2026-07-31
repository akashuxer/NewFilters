/**
 * Aggregate selection state across a known id universe.
 *
 * Returns:
 *   - 'none' when no selectable id is selected
 *   - 'all'  when every selectable id is selected
 *   - 'some' when at least one but not all selectable ids are selected
 *
 * `selectableIds` should already exclude disabled rows. Empty `selectableIds`
 * collapses to 'none' so a global select-all row over an empty list reads as
 * unchecked rather than indeterminate.
 */
export type AggregateSelectionState = 'none' | 'some' | 'all';
export declare function aggregateSelectionState(selectedIds: readonly string[], selectableIds: readonly string[]): AggregateSelectionState;
/**
 * Compute the next selection set for a Shift+Space range selection.
 *
 * Given an ordered id list, an anchor id (last single-click target), and the
 * focused target id, returns the id set after toggling every id in the closed
 * `[anchor, target]` range to the same selected state as the anchor.
 *
 * If `anchorId` is null the function falls back to a plain single-id toggle on
 * `targetId`. Disabled ids (passed via `disabledIds`) are never included.
 */
export declare function nextSelectionForRangeShift(options: {
    selectedIds: readonly string[];
    orderedIds: readonly string[];
    anchorId: string | null;
    targetId: string;
    disabledIds?: readonly string[];
}): string[];
//# sourceMappingURL=selection-helpers.d.ts.map