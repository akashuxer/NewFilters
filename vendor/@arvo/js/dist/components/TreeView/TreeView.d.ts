import { ArvoBadgeOptions } from '../Badge/Badge';
import { ArvoActionMenuOptions } from '../ActionMenu/ActionMenu';
/**
 * Per-row trailing meta indicator. Either a bare string (text-only shortcut,
 * e.g. `'EXT'`) or an object that supports an icon, text, or both. Rendered
 * between the label and any inline actions inside `__content`.
 */
export type TreeItemMeta = string | {
    icon?: string;
    text?: string;
};
export interface ArvoTreeItem {
    id: string;
    label: string;
    icon?: string;
    secondaryLabel?: string;
    badge?: ArvoBadgeOptions | string | number;
    /** Optional trailing supporting indicator (1-3 char text and/or 12x12 icon). */
    meta?: TreeItemMeta;
    children?: ArvoTreeItem[] | null;
    isDisabled?: boolean;
    /**
     * Whether this row participates in selection. Defaults to `true`.
     * Set `false` on group / category parent rows whose only role is
     * to group their children:
     *   - in `multiSelect` / `navigationMultiSelect` the checkbox is
     *     suppressed and the row carries no `aria-checked`;
     *   - in `singleSelect` the row body + Enter + Space only expand /
     *     collapse (no selection occurs, no `aria-selected` is set);
     *   - in `expandOnly` the row already only expands (no change);
     *   - in `navigation` / `navigationMultiSelect` the row body + Enter
     *     still fire `onNavigate` (navigation is independent of
     *     selection).
     * The row is excluded from the multi-select cascade -- it is
     * neither toggled when an ancestor is checked nor counted toward an
     * ancestor's indeterminate state -- but its selectable descendants
     * are still cascaded. Unrelated to `isDisabled`, which blocks ALL
     * interaction including expansion / focus / navigation.
     */
    isSelectable?: boolean;
    isLoading?: boolean;
    isAsyncLoading?: boolean;
    isEmphasized?: boolean;
    /**
     * Per-item visual emphasis override. Falls back to the tree-level
     * `appearance` option when omitted. `'strong'` bumps the label
     * typography one step (sm: 14px medium; lg: 16px medium) and is
     * intended for major hierarchy sections, important parent items,
     * group-style parents, or primary categories. It changes ONLY visual
     * emphasis -- selection, navigation, expansion, keyboard, and
     * accessibility semantics are unaffected.
     */
    appearance?: TreeAppearance;
    /**
     * Render the row in the 'currently open / active destination' treatment
     * (same chrome as `selected`). Independent from `isSelected` -- use to
     * compose the Figma `navigation` / `navigationMultiSelect` patterns.
     */
    isActive?: boolean;
    /**
     * Per-row override for the search-highlight modifier. When set, the row
     * uses this value instead of the auto-derived "label contains
     * searchQuery" check. Consumers running their own match logic (fuzzy
     * match, scoring, etc.) can use this to drive which rows visually
     * highlight while still relying on the tree's substring highlight
     * overlay inside `__label-match`.
     */
    isSearchMatch?: boolean;
    ariaCurrent?: boolean | 'page' | 'location' | 'true';
    ariaLabel?: string;
    /** Per-row override of the tree-level `actions` default. */
    actions?: TreeRowAction[];
    /**
     * Per-row override for the drag handle (spec section 24). Defaults
     * to `true` when the tree-level `isReorderable` is true. Set `false`
     * to keep the row in place: it cannot be picked up via keyboard or
     * click, but it can still be the TARGET of a move from another row
     * unless `canMoveItem` rejects the move.
     */
    hasDragHandle?: boolean;
    /**
     * When true (and the tree-level `contextMenu` option is configured),
     * render a trailing `more-vertical` overflow button in the
     * inline-actions zone that opens the same context menu (spec
     * section 23). Mirrors the React API.
     */
    hasOverflowMenu?: boolean;
    /**
     * Decoupled "this row requires additional visual attention" flag
     * (spec section 33). Renders the row's label in bold italic.
     * Independent from `isSelected`, `isActive`, and `isEmphasized` --
     * compose freely. Use for tenant / source / imported / recommended
     * / recently-used / business-specific highlights.
     */
    isHighlighted?: boolean;
}
export interface TreeViewEmptyConfig {
    illustration?: string;
    title?: string;
    message?: string;
}
export type TreeSelectionMode = 'single' | 'multiple';
export type TreeSize = 'sm' | 'lg';
export type TreeAppearance = 'default' | 'strong';
/**
 * The five canonical TreeView interaction models (spec sections 6.1-6.5).
 * Choosing a `variant` defines what the chevron, label/row body,
 * checkbox (if any), Enter, and Space do for every row in the tree --
 * developers do not configure label vs checkbox vs chevron behavior
 * individually. Mapping:
 *
 * | variant                 | ARIA selection model      | row-body action  | Enter             | Space            |
 * | ----------------------- | ------------------------- | ---------------- | ----------------- | ---------------- |
 * | `expandOnly`            | none (parent rows only)   | expand / no-op   | expand            | no-op            |
 * | `singleSelect`          | aria-selected             | select           | select            | select           |
 * | `multiSelect`           | aria-checked + multisel.  | expand / no-op   | expand            | toggle checkbox  |
 * | `navigation`            | none                      | onNavigate       | onNavigate        | no-op            |
 * | `navigationMultiSelect` | aria-checked + multisel.  | onNavigate       | onNavigate        | toggle checkbox  |
 *
 * Rows whose `isSelectable === false` route the row body to `expand`
 * (or `onNavigate` in navigation variants) regardless of the tree
 * variant.
 */
export type TreeVariant = 'expandOnly' | 'singleSelect' | 'multiSelect' | 'navigation' | 'navigationMultiSelect';
/**
 * Internal routing for the row body / Enter. Derived from `variant`
 * and never exposed as a public option.
 */
export type TreeRowInteraction = 'expand' | 'select' | 'navigate';
export interface TreeSelectionContext {
    item: ArvoTreeItem;
    isSelected: boolean;
}
export interface TreeExpandContext {
    item: ArvoTreeItem;
    isExpanded: boolean;
}
export interface TreeRowAction {
    id: string;
    icon: string;
    ariaLabel: string;
    isDisabled?: boolean;
    onClick?: (item: ArvoTreeItem, event: Event) => boolean | void;
}
/**
 * Drop position relative to the target row (spec section 24):
 *   - `'before'` -- place the moved row before the target (same parent).
 *   - `'after'`  -- place the moved row after the target (same parent).
 *   - `'inside'` -- place the moved row inside the target as its child.
 */
export type TreeDropPosition = 'before' | 'after' | 'inside';
export interface TreeReorderContext {
    item: ArvoTreeItem;
    fromParentId: string | null;
    fromIndex: number;
    toParentId: string | null;
    toIndex: number;
    /** Drop position relative to the target (spec section 24). */
    position: TreeDropPosition;
}
export type TreeMaxVisualLevel = 1 | 2 | 3 | 4;
export interface ArvoTreeViewOptions {
    items?: ArvoTreeItem[];
    /**
     * Selects one of the five UX interaction models (spec sections
     * 6.1-6.5). Defaults to `'expandOnly'`. See {@link TreeVariant} for
     * the per-variant mapping of row body, Enter, Space, checkbox, and
     * ARIA semantics. Rows whose `isSelectable === false` always route
     * the row body to expand (or `onNavigate` in navigation variants),
     * regardless of the tree variant.
     */
    variant?: TreeVariant;
    /**
     * Called when the row body is clicked or `Enter` is pressed AND the
     * tree's `variant` is `'navigation'` or `'navigationMultiSelect'`.
     * Selection state is NOT mutated; pair with per-row `isActive` (and
     * optionally `ariaCurrent`) to drive the "currently open destination"
     * chrome.
     */
    onNavigate?: (item: ArvoTreeItem, event: Event) => void;
    size?: TreeSize;
    /**
     * Tree-level default for per-row appearance. Per-row
     * `item.appearance` overrides this for individual rows.
     */
    appearance?: TreeAppearance;
    /**
     * When `true`, render vertical + elbow connector lines that
     * communicate parent-child relationships. Default `false` -- depth is
     * communicated through indentation alone (spec section 13).
     */
    hasHierarchyLines?: boolean;
    selectedIds?: string[];
    defaultSelectedIds?: string[];
    expandedIds?: string[];
    defaultExpandedIds?: string[];
    searchQuery?: string;
    onLoadChildren?: (item: ArvoTreeItem) => Promise<ArvoTreeItem[]>;
    isDisabled?: boolean;
    isLoading?: boolean;
    emptyConfig?: TreeViewEmptyConfig;
    ariaLabel?: string;
    ariaLabelledBy?: string;
    onSelectionChange?: (ids: string[], context: TreeSelectionContext) => void;
    onExpandedChange?: (ids: string[], context: TreeExpandContext) => void;
    /** Default action set rendered on every row. Per-row `item.actions` overrides this. */
    actions?: TreeRowAction[];
    /** Visibility of the `__actions` row. Defaults to 'hover'. */
    actionsVisibility?: 'always' | 'hover';
    /**
     * Max number of indent slots rendered per row (1-4). Defaults to 4.
     * Deeper rows still receive accurate `aria-level`; only the visual
     * indent cluster caps.
     */
    maxVisualLevel?: TreeMaxVisualLevel;
    /** Enables the keyboard + click reorder mode. */
    isReorderable?: boolean;
    /** Called before a reorder commits. Return false to cancel. */
    onReorder?: (context: TreeReorderContext) => boolean | void;
    /**
     * Optional pre-commit validator. Called BEFORE `tree:reorder` is
     * dispatched and BEFORE `onReorder` runs. Return `false` to reject
     * the move; the live region announces "Move not allowed." and the
     * row stays in place.
     */
    canMoveItem?: (context: TreeReorderContext) => boolean;
    /**
     * Per-row context menu configuration (spec section 23). Either a
     * static `ArvoActionMenuOptions['items']` array OR a function that
     * returns the items for a given row. When set, the tree wires four
     * triggers: right-click on the row, `Shift+F10`, `Ctrl+Shift+X`,
     * and the Context Menu key. Pairs with per-item `hasOverflowMenu`
     * which adds a keyboard-accessible inline overflow button.
     */
    contextMenu?: ArvoActionMenuOptions['items'] | ((item: ArvoTreeItem) => ArvoActionMenuOptions['items']);
    /**
     * Optional callback fired when a context menu opens on a row.
     * Receives the originating tree item and the trigger source:
     * `'mouse'` for right-click, `'keyboard'` for Shift+F10 /
     * Ctrl+Shift+X / ContextMenu, `'overflow'` for the inline overflow
     * button.
     */
    onContextMenu?: (item: ArvoTreeItem, trigger: 'mouse' | 'keyboard' | 'overflow') => void;
    /**
     * Read-only mode (spec section A14). Selection and expansion are
     * still possible; mutating affordances (inline actions, drag
     * handles, overflow menu, context menu) are suppressed. The tree
     * root carries `aria-readonly='true'`.
     */
    isReadOnly?: boolean;
}
export declare class ArvoTreeView {
    private _element;
    private _options;
    private _id;
    private _items;
    private _selectedSet;
    private _expandedSet;
    private _asyncLoadingSet;
    private _activeIndex;
    private _reorderingId;
    private _liveRegionEl;
    private _contextMenu;
    private _contextTriggerEl;
    private _contextItemId;
    private _treeNav;
    /**
     * Tree-level inner instances created during a full rebuild that are
     * NOT scoped to a single row (e.g. the global EmptyState body and
     * the whole-tree Pattern B loader). Per-row inner instances live in
     * `_innerInstancesByRow` so a surgical update can tear down or
     * preserve them independently of unaffected rows.
     */
    private _innerInstancesTreeLevel;
    /**
     * Per-row inner instances keyed by the row's id. Each entry is the
     * list of ArvoBadge / ArvoCheckbox / ArvoIconButton instances
     * mounted inside that row. Surgical expansion updates destroy
     * ONLY the entries for rows that are leaving the visible set;
     * surgical selection updates touch zero instances (they mutate
     * DOM attrs in place).
     */
    private _innerInstancesByRow;
    /**
     * Per-row BODY inner instance keyed by the row's id. Tracks the
     * single ArvoLoader / ArvoEmptyState mounted in the body sibling
     * (`__loader` / `__empty`) of an async-loading or empty parent.
     * Kept separate from `_innerInstancesByRow` so the body's instance
     * can be torn down independently when the body is removed (collapse
     * of an empty parent, resolution of an async load) without touching
     * the row's own badge / checkbox / icon button instances.
     */
    private _bodyInstanceByRow;
    /**
     * Map from row id to its rendered `[role="treeitem"]` element. Used
     * by surgical helpers (`_renderSelectionChange`,
     * `_renderExpansionChange`, `_renderSearchHighlight`) so they can
     * locate a row in O(1) without re-querying the DOM.
     */
    private _rowMap;
    /**
     * Map from row id to the latest `ArvoTreeItem` it was built from.
     * Mirrors `_rowMap` so surgical helpers can read item data
     * (icon, badge, isDisabled, isSelectable, etc.) without walking
     * the source `_items` tree.
     */
    private _dataMap;
    /**
     * The full visible-row layout from the last full rebuild. Surgical
     * expansion uses this snapshot to know which children to insert
     * (and where) when a parent opens, or which descendant rows to
     * remove when it closes.
     */
    private _lastVisibleRows;
    private _isControlledSelection;
    private _isControlledExpansion;
    static initialize(element: HTMLElement, options?: ArvoTreeViewOptions): ArvoTreeView;
    constructor(element: HTMLElement, options?: ArvoTreeViewOptions);
    destroy(): void;
    selected(ids?: string[]): string[] | void;
    expanded(ids?: string[]): string[] | void;
    expand(id: string): void;
    collapse(id: string): void;
    toggleExpansion(id: string): void;
    disabled(state?: boolean): boolean | void;
    setLoading(state: boolean): void;
    /**
     * Update the search query used for substring highlighting in row labels.
     * Mirrors the reactive React `searchQuery` prop so composing parents
     * (DropdownTree, ActionMenu, HybridPopover, etc.) can drive highlighting
     * without tearing down + rebuilding the tree on every keystroke.
     */
    setSearchQuery(query: string): void;
    setItems(items: ArvoTreeItem[]): void;
    updateItem(id: string, partial: Partial<ArvoTreeItem>): void;
    /**
     * Capture a shallow snapshot of `_items` BEFORE a mutation so the A8
     * reconciliation can compare old vs new descendant sets. Used by
     * `updateItem` which mutates in place; `setItems` already has the
     * old array available.
     */
    private _snapshotItems;
    /**
     * A8 lazy-load selection inheritance (multi-select only). When the
     * items array changes, walk the new tree and find selected parents
     * whose eligible descendant set has GROWN since the previous render.
     * Add the new eligible descendant ids to the selection. Parents
     * that were `mixed` (a user-selected subset) are left alone.
     */
    private _reconcileLazyLoadSelection;
    /**
     * Capture the focus context before a structural mutation. Returns
     * `null` when the tree does not own focus, so the restoration step
     * can be skipped without stealing focus from outside the tree.
     */
    private _captureFocusContext;
    /**
     * A12 focus restoration. After a structural mutation, if the
     * previously focused row id is no longer in the visible row set,
     * fall back via the spec's order (spec section 31):
     *   next sibling -> previous sibling -> parent -> first non-disabled
     *
     * Receives a token captured BEFORE the mutation -- `_render()` wipes
     * the DOM, so `document.activeElement` is no longer reliable by the
     * time this method runs.
     */
    private _restoreFocusAfterMutation;
    focusItem(id: string): void;
    /**
     * Full rebuild. Called once on mount and from mutators whose change
     * is large enough that targeted updates would be more error-prone
     * than helpful (e.g. `setItems`, async-load arrivals, reorder
     * commits, tree-level loading skeleton transitions). Surgical
     * helpers (`_renderSelectionChange`, `_renderExpansionChange`,
     * `_renderSearchHighlight`, `_renderTreeState`) avoid this path for
     * the common selection / expansion / search-highlight / disabled
     * mutations so unchanged rows keep their DOM identity and their
     * mounted inner instances (ArvoBadge, ArvoCheckbox, ArvoIconButton,
     * ArvoActionMenu) are not torn down and re-created. The row-enter
     * SCSS animation uses `@starting-style` so it only runs for genuinely
     * new rows.
     */
    private _fullRebuild;
    private _renderSkeleton;
    private _renderEmptyTree;
    /**
     * Whether the user has opted into reduced motion. The animation
     * helpers below short-circuit to instant insert / remove when true
     * (and in non-browser test environments where `matchMedia` is
     * unavailable, e.g. jsdom -- we conservatively skip animations there
     * so the unit tests see synchronous DOM mutations).
     */
    private _prefersReducedMotion;
    /**
     * Animation budget. When a single expand or collapse touches more
     * than this many elements we skip the fade and snap the change in
     * synchronously -- protects very large trees from running 1000+
     * transitions per interaction. The compositor handles a few hundred
     * concurrent opacity/transform animations comfortably; this ceiling
     * is well above any reasonable per-screen row count.
     */
    private static readonly _ANIMATION_BUDGET;
    /** Exit transition duration in ms. Mirrors the SCSS `$arvo-duration-base`. */
    private static readonly _EXIT_DURATION_MS;
    /**
     * Enter is fully CSS-driven via `@starting-style` in `_arvo-tree.scss`
     * -- the browser interpolates `opacity` + `transform` (compositor-only
     * properties) on first paint after a node attaches to the document.
     *
     * This method is intentionally a no-op. It is kept on the class so
     * the surgical insertion paths can stay readable ("insert + animate
     * enter") and so a future motion redesign has one symbol to swap.
     * Inserting 1000 rows therefore costs zero per-row main-thread
     * animation work -- the GPU handles every fade in parallel.
     */
    private _animateEnter;
    /**
     * Fade `el` out (compositor-only) then run `onComplete` for the
     * physical DOM removal + inner-instance teardown. For batch exits
     * prefer `_animateExitBatch` -- it sets all classes in one pass and
     * shares a single timer for the whole group.
     *
     * Marks the element with `data-arvo-leaving="true"` so the surgical
     * expand path can detect and instantly purge a dying row if the user
     * re-expands a branch before the previous exit completes (preventing
     * a duplicate-id collision in the DOM).
     *
     * No height measurement, no inline-style transitions, no
     * `transitionend` listener -- the SCSS class fully defines the
     * animation and a single timeout schedules the cleanup. This keeps
     * the cost O(1) per element regardless of tree size.
     */
    private _animateExit;
    /**
     * Batched fade-out for a group of elements that all leave together
     * (e.g. all descendant rows of a collapsing parent + their body
     * siblings). All elements get the `is-leaving` class in a single
     * synchronous pass, the GPU runs every transition in parallel on
     * the compositor thread, and a SINGLE timer schedules all of the
     * cleanups in one frame.
     *
     * For very large groups (more than `_ANIMATION_BUDGET` elements) the
     * fade is skipped entirely and the cleanup runs synchronously --
     * 1000-row collapses become an instant snap that completes in a
     * single frame, with zero animation cost.
     */
    private _animateExitBatch;
    /**
     * Apply tree-level state changes (`isDisabled`, `isLoading`,
     * `isReadOnly`) to the root element without rebuilding any rows.
     * Falls back to `_fullRebuild` when `isLoading` transitions to /
     * from skeleton mode (the body content type changes).
     */
    private _renderTreeState;
    /**
     * Update `.selected`, `aria-selected`, `aria-checked`, and the inner
     * checkbox state (where applicable) for every rendered row to match
     * the current `_selectedSet`. Does NOT touch row DOM identity or
     * tear down any inner instances -- only attributes / classes /
     * input.checked / input.indeterminate are written. This is what
     * makes a multi-select cascade O(visible rows) of attribute writes
     * instead of O(visible rows) of full DOM recreation.
     */
    private _renderSelectionChange;
    /**
     * Update the `--search-highlight` modifier and the `__label-match`
     * span structure on every rendered row to match the current
     * `searchQuery`. Inner instances are untouched.
     */
    private _renderSearchHighlight;
    /**
     * Apply an expansion change to the visible row set without
     * rebuilding the entire tree. Handles every variant surgically:
     *
     *  - Expand a parent with children: build the newly-visible
     *    descendant rows and insert them as siblings right after the
     *    parent in `__group`; animate each one in.
     *  - Expand a parent whose `children === []` (empty parent):
     *    insert an `__empty` body element as a sibling right after the
     *    parent; tag the row with `--empty` and animate the body in.
     *  - Expand a parent whose `children === null` (async-load):
     *    insert an `__loader` body element as a sibling; tag the row
     *    with `--async-loading` + `aria-busy`. The body is replaced /
     *    removed by `_resolveAsyncLoad` once the children promise
     *    resolves.
     *  - Collapse any of the above: remove the body sibling (if any),
     *    remove the row classes, then animate out + remove every
     *    descendant row (and its own attached body) below the parent.
     *
     * Inner instances mounted under unaffected rows are NEVER torn
     * down -- the parent row keeps the same DOM identity in every case
     * so the previously-allocated ArvoBadge / ArvoCheckbox /
     * ArvoIconButton / ArvoActionMenu instances stay alive.
     */
    private _renderExpansionChange;
    /**
     * Resolve an async-load: clear the row's loading chrome and remove
     * the loader body sibling (if any). Called by `_setExpansion` from
     * the `Promise.finally` once the consumer's `onLoadChildren`
     * settles. The consumer is responsible for committing the resolved
     * children via `updateItem(id, { children: loaded })` -- once they
     * do, `_fullRebuild` (or the surgical update we may add later)
     * renders the children. This method only handles the loader
     * lifecycle so the row's other inner instances stay intact.
     */
    private _resolveAsyncLoad;
    private _buildRowEl;
    /**
     * Build the empty / loader body element that sits as a SIBLING of an
     * async-loading or empty parent row inside `__group`. Identified by a
     * `data-arvo-empty-for` / `data-arvo-loader-for` attribute pointing at
     * the row's item id so surgical helpers can locate + remove the body
     * in O(1) without touching the parent row's DOM. The body's inner
     * ArvoLoader / ArvoEmptyState instance is registered under the parent
     * row's id so it is destroyed alongside the row when the row leaves
     * the visible set.
     */
    private _buildBodyEl;
    /** Destroy the body inner instance (if any) registered under `id`. */
    private _destroyBodyInstance;
    /**
     * Find the empty / loader body element currently rendered as the next
     * sibling of `rowEl` (if any). Returns `null` when the row has no
     * attached body. Used by the surgical helpers to locate the body
     * without re-walking `__group`.
     */
    private _findRowBody;
    /**
     * Instantly remove any leftover dying DOM element belonging to the
     * given row id. Used by the surgical expand path so a rapid
     * collapse -> expand sequence does not leave the dying copy in the
     * document (which would collide with the freshly-inserted row's id
     * and confuse `_focusActiveRow` / accessibility tools). Cancels any
     * pending exit animation by removing the node outright. The matching
     * body sibling (if any) is also cleared.
     *
     * Avoids `CSS.escape` (unavailable in some non-browser environments
     * such as the jsdom test runner) by scanning the small set of
     * currently-leaving elements with an attribute selector.
     */
    private _purgeDyingRow;
    /**
     * Instantly remove a leaving body sibling for the given row id (the
     * row itself is still alive). Used by the surgical expand path so
     * a rapid collapse -> re-expand of an empty / async parent doesn't
     * end up with a half-faded ghost body next to the row.
     */
    private _purgeDyingBody;
    private _toggleSelection;
    private _setExpansion;
    private _setupTreeNav;
    private _focusActiveRow;
    private _announce;
    /**
     * A9 -- open the configured context menu at the given row. Resolves
     * per-row items if `contextMenu` is a function. Reuses a single
     * ArvoActionMenu instance for the lifetime of the tree; destroys
     * and re-creates only when items differ from the previous open.
     */
    private _openContextMenu;
    private _findItemLocation;
    private _enterReorderMode;
    private _cancelReorderMode;
    private _commitReorder;
    private _handleDragHandleClick;
    /**
     * Programmatically move a row. Dispatches `tree:reorder`. Optional
     * `position` defaults to `'before'`.
     */
    move(id: string, target: {
        parentId: string | null;
        index: number;
        position?: TreeDropPosition;
    }): void;
    private _onKeyDown;
    private _bindEvents;
    private _unbindEvents;
    /**
     * Tear down every mounted inner instance (per-row + body + tree-level).
     * Called from `_fullRebuild` and `destroy()`. Surgical updates use
     * the more targeted `_destroyRowInstances(id)` / `_destroyBodyInstance(id)`
     * so they only touch the rows / bodies that are actually leaving
     * the visible set.
     */
    private _destroyInnerInstances;
    /**
     * Destroy the inner instances mounted inside a single row (chevron,
     * drag handle, checkbox, badge, inline actions). Does NOT touch the
     * body instance for the same row -- use `_destroyBodyInstance(id)`
     * for that. This split lets `_resolveAsyncLoad` tear down the
     * loader body without disturbing the parent row's still-needed
     * inner instances.
     */
    private _destroyRowInstances;
    /** Register an inner instance under the row id that owns it. */
    private _pushRowInstance;
    private _dispatchEvent;
}
export default ArvoTreeView;
//# sourceMappingURL=TreeView.d.ts.map