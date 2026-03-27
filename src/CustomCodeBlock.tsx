import { renderCodeBlock } from './CustomHighlighter';

// React component for :::prism directive blocks.
// Registered as components['prism'] — only receives :::prism content.
// Standard ``` blocks are NOT affected.
//
// Props come from data-* attributes set by remarkPrismDirective.
//
// IMPORTANT: No React hooks — the plugin bundles its own React
// which is a different instance from Growi's React, causing hook errors.
export const CustomCodeBlock = (props: any) => {
  const lang = props['data-lang'] || '';
  const showToolbar = props['data-toolbar'] === 'true';
  const showLineNumbers = props['data-line-numbers'] === 'true';
  const code = props['data-code'] || '';

  const refCallback = (el: HTMLDivElement | null) => {
    if (el && !el.hasChildNodes()) {
      const rendered = renderCodeBlock(code, lang, showLineNumbers, showToolbar);
      el.appendChild(rendered);
    }
  };

  return <div ref={refCallback} />;
};
