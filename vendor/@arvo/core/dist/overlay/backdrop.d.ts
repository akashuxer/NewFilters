export interface BackdropOptions {
    opacity: number;
    closeOnClick: boolean;
    animated: boolean;
    container: HTMLElement;
}
export interface BackdropManager {
    show(options: BackdropOptions): HTMLElement;
    hide(): void;
    isVisible(): boolean;
    getElement(): HTMLElement | null;
}
export declare function createBackdropManager(): BackdropManager;
//# sourceMappingURL=backdrop.d.ts.map