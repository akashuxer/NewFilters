export interface TabRovingOptions {
    container: HTMLElement;
    items: HTMLElement[];
    orientation: 'horizontal' | 'vertical' | 'both';
    wrap: boolean;
    onActivate?: (item: HTMLElement, index: number) => void;
}
export interface TabRoving {
    activate(options: TabRovingOptions): void;
    deactivate(): void;
    setActiveItem(index: number): void;
    getActiveItem(): HTMLElement | null;
    getActiveIndex(): number;
}
export declare function createTabRoving(): TabRoving;
//# sourceMappingURL=tab-roving.d.ts.map