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
    if (!el) return;
    // Always clear and re-render so live preview updates when code changes
    el.innerHTML = '';
    const rendered = renderCodeBlock(code, lang, showLineNumbers, showToolbar);
    el.appendChild(rendered);
  };

  // key forces React to remount when content/options change,
  // ensuring refCallback fires with the new values
  const key = `${lang}:${showToolbar}:${showLineNumbers}:${code}`;

  return <div key={key} ref={refCallback} />;
};
