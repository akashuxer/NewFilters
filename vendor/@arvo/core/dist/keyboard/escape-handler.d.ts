export interface EscapeHandler {
    attach: (element: HTMLElement) => void;
    detach: () => void;
}
export declare function createEscapeHandler(callback: () => void): EscapeHandler;
//# sourceMappingURL=escape-handler.d.ts.map