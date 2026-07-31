import { InlineContent } from './types';
import { InlineContentAdapter, RenderInlineContentOptions } from './adapter';
type DomNode = Node;
export declare const domInlineAdapter: InlineContentAdapter<DomNode>;
/**
 * Renders an `InlineContent` value into a real `DocumentFragment`. Use this
 * from any vanilla-JS component that accepts an `InlineContent`-shaped prop.
 */
export declare function renderInlineContentToDOM(content: InlineContent, options?: RenderInlineContentOptions): DocumentFragment;
/**
 * Replaces an element's children with the rendered inline content. Used by
 * components that re-render their message slot via setter methods.
 */
export declare function replaceInlineContentInElement(el: Element, content: InlineContent, options?: RenderInlineContentOptions): void;
export {};
//# sourceMappingURL=dom-adapter.d.ts.map