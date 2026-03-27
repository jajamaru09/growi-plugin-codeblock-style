import { renderCodeBlock } from './CustomHighlighter';

// --- Directive component (:::prism) ---

interface PrismBlockProps {
  'data-lang'?: string;
  'data-toolbar'?: string;
  'data-line-numbers'?: string;
  'data-code'?: string;
  [key: string]: unknown;
}

// Component for :::prism directive — registered as components['prism']
export const PrismDirectiveBlock = (props: PrismBlockProps) => {
  const lang = props['data-lang'] || '';
  const showToolbar = props['data-toolbar'] === 'true';
  const showLineNumbers = props['data-line-numbers'] === 'true';
  const code = props['data-code'] || '';

  return renderToDiv(code, lang, showLineNumbers, showToolbar);
};

// --- Code component (```prism-js:toolbar) ---

// Wraps Growi's original code component.
// Detects ```prism-* blocks via data-prism attribute;
// delegates everything else to Growi's original.
export function createCodeComponent(
  OriginalCode: any,
  growiReact: any,
) {
  return (props: any) => {
    // Check for data-prism attribute set by remarkPrismDirective
    if (props['data-prism'] === 'true') {
      const lang = props['data-prism-lang'] || '';
      const showToolbar = props['data-prism-toolbar'] === 'true';
      const showLineNumbers = props['data-prism-line-numbers'] === 'true';
      const code = typeof props.children === 'string'
        ? props.children
        : String(props.children || '');

      return renderToDiv(code, lang, showLineNumbers, showToolbar);
    }

    // Not a prism block — delegate to Growi's original code component
    if (OriginalCode && growiReact) {
      return growiReact.createElement(OriginalCode, props);
    }
    return growiReact
      ? growiReact.createElement('code', props)
      : null;
  };
}

// --- Shared DOM rendering ---

// IMPORTANT: No React hooks — the plugin bundles its own React
// which is a different instance from Growi's React, causing hook errors.
// We render pure DOM and mount it via a ref callback.
function renderToDiv(
  code: string,
  lang: string,
  showLineNumbers: boolean,
  showToolbar: boolean,
) {
  const refCallback = (el: HTMLDivElement | null) => {
    if (!el) return;
    el.innerHTML = '';
    const rendered = renderCodeBlock(code, lang, showLineNumbers, showToolbar);
    el.appendChild(rendered);
  };

  const key = `${lang}:${showToolbar}:${showLineNumbers}:${code}`;
  return <div key={key} ref={refCallback} />;
}
