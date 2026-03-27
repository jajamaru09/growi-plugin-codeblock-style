import { renderCodeBlock } from './CustomHighlighter';
import { PRISM_CODE_PREFIX } from './remarkPrismDirective';

// Marker prefix set by remarkPrismDirective on fenced code blocks
const CODE_MARKER = '__prism__';

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
// Detects ```prism-* blocks and renders them custom;
// delegates everything else to Growi's original.
export function createCodeComponent(
  OriginalCode: any,
  growiReact: any,
) {
  return (props: any) => {
    const className: string = props.className || '';
    const match = className.match(/language-__prism__(.*)/);

    if (!match) {
      // Not a prism block — delegate to Growi's original code component
      if (OriginalCode && growiReact) {
        return growiReact.createElement(OriginalCode, props);
      }
      // Fallback if no original available
      return growiReact
        ? growiReact.createElement('code', props)
        : null;
    }

    // Parse options from className: language-__prism__js → lang=js
    const lang = match[1] || '';
    const children = props.children;
    const code = typeof children === 'string'
      ? children
      : Array.isArray(children) ? children.join('') : String(children || '');

    // Read meta options (set by remarkPrismDirective on code node)
    const node = props.node;
    const prismOptions = node?.data?.prismOptions;
    const showToolbar = prismOptions?.showToolbar ?? false;
    const showLineNumbers = prismOptions?.showLineNumbers ?? false;

    return renderToDiv(code, lang, showLineNumbers, showToolbar);
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
