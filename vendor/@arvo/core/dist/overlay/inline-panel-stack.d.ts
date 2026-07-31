export type InlinePanelKind = 'popover' | 'hybrid' | 'custom';
export interface InlinePanelPushOptions {
    id?: string;
    kind: InlinePanelKind;
    element: HTMLElement;
    openedFrom?: HTMLElement | null;
    onBack?: () => void;
    onClose?: () => void | false;
    onOpen?: () => void | false;
}
export interface InlinePanelStackEntry {
    id: string;
    kind: InlinePanelKind;
    element: HTMLElement;
    layerEl: HTMLElement;
    openedFrom: HTMLElement | null;
    onBack?: () => void;
    onClose?: () => void | false;
}
export type InlinePanelPopVia = 'default' | 'back' | 'force';
export interface InlinePanelPopOptions {
    /** How the pop was initiated. `back` notifies onBack; `force` skips veto. */
    via?: InlinePanelPopVia;
}
export interface InlinePanelStackOptions {
    /** Host overlay panel element that owns the stack. */
    host: HTMLElement;
    /** Optional pre-existing container; one is created and appended if omitted. */
    container?: HTMLElement;
    /** CSS class on the auto-created stack container. */
    containerClass?: string;
    maxDepth?: number;
}
export interface InlinePanelStack {
    readonly container: HTMLElement;
    push(options: InlinePanelPushOptions): boolean;
    pop(options?: InlinePanelPopOptions): boolean;
    popAll(): void;
    getDepth(): number;
    getTop(): InlinePanelStackEntry | null;
    getEntries(): readonly InlinePanelStackEntry[];
    handleEscape(): boolean;
    destroy(): void;
}
export declare function createInlinePanelStack(options: InlinePanelStackOptions): InlinePanelStack;
//# sourceMappingURL=inline-panel-stack.d.ts.map