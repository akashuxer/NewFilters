import { ArrowNavOptions } from './arrow-nav';
export interface TreeNavRowMeta {
    /** True when the row currently has expandable children (parent node). */
    hasChildren: boolean;
    /** True when the row is currently expanded. Ignored when `hasChildren` is false. */
    isExpanded: boolean;
    /** True when the row is disabled. */
    isDisabled: boolean;
    /** Zero-based depth from the root. Root nodes have level 0. */
    level: number;
}
export interface TreeNavOptions {
    /** Currently visible row elements in display order. */
    items: HTMLElement[];
    /**
     * Returns metadata for the row at the given index. Called frequently;
     * implementations should be O(1) lookups against an indexed structure
     * rather than tree walks.
     */
    getRowMeta: (index: number) => TreeNavRowMeta;
    /** Roving focus moved to a row. Index is into the visible list. */
    onNavigate: (item: HTMLElement, index: number) => void;
    /** Selection committed (Enter/Space). */
    onSelect?: (item: HTMLElement, index: number) => void;
    /** Escape pressed. */
    onEscape?: () => void;
    /**
     * Open the parent at the given index. Called on Right Arrow when the focused
     * row `hasChildren && !isExpanded`. Implementations should expand and then
     * call `setItems()` with the new visible list.
     */
    onExpand: (index: number) => void;
    /**
     * Close the parent at the given index. Called on Left Arrow when the focused
     * row `hasChildren && isExpanded`. Implementations should collapse and then
     * call `setItems()`.
     */
    onCollapse: (index: number) => void;
    /**
     * Optional type-ahead support. Same shape as `ArrowNavOptions['typeAhead']`.
     */
    typeAhead?: ArrowNavOptions['typeAhead'];
}
export interface TreeNav {
    /** Drive a keydown event into the tree-nav state machine. */
    handleKeyDown: (event: KeyboardEvent) => void;
    /** Replace the visible-row list (call after expand/collapse). */
    setItems: (items: HTMLElement[]) => void;
    /**
     * Imperatively set the current focused row index. Useful for syncing the
     * state machine when focus moves outside of the keyboard navigation flow
     * (e.g., a row's onFocus handler in React).
     */
    setIndex: (index: number) => void;
    /** Tear down internal resources (timers, listeners). */
    destroy: () => void;
}
/**
 * Build a tree-navigation state machine over the visible rows of a tree.
 *
 * The implementation delegates Up/Down/Home/End/Enter/Space/Escape/type-ahead
 * to `createArrowNav` (vertical, no wrap by tree convention) and intercepts
 * Right/Left arrows to apply the WAI-ARIA Tree pattern.
 */
export declare function createTreeNav(options: TreeNavOptions): TreeNav;
//# sourceMappingURL=tree-nav.d.ts.map