import { ContentProfile, InlineContent, NormalizedLink } from './types';
/**
 * Renderer abstraction for inline content. Implemented once per platform:
 * a DOM adapter for vanilla JS, and a React adapter that emits `ReactNode`s.
 *
 * Each method receives already-validated inputs. For node-shaped types
 * (em, strong) the children are pre-rendered.
 */
export interface InlineContentAdapter<TNode> {
    fragment(children: TNode[]): TNode;
    text(value: string): TNode;
    em(children: TNode[]): TNode;
    strong(children: TNode[]): TNode;
    link(props: NormalizedLink, label: string): TNode;
    code(value: string): TNode;
    kbd(value: string): TNode;
    abbr(value: string, title: string): TNode;
    time(value: string, dateTime: string): TNode;
    sup(value: string): TNode;
    sub(value: string): TNode;
    br(): TNode;
}
export interface RenderInlineContentOptions {
    profile?: ContentProfile;
    mode?: 'throw' | 'warn' | 'strip';
}
/**
 * Walks an `InlineContent` and produces a single platform node by delegating
 * to the supplied adapter. The output is wrapped in `adapter.fragment` so
 * callers always receive a single node (or fragment-equivalent).
 */
export declare function renderInlineContent<TNode>(content: InlineContent, adapter: InlineContentAdapter<TNode>, options?: RenderInlineContentOptions): TNode;
//# sourceMappingURL=adapter.d.ts.map