import { renderCodeBlock, RenderOptions } from './CustomHighlighter';
import { debug } from './debug';

// --- Helpers ---

function propsToRenderOptions(p: Record<string, string>): { lang: string; code: string; options: RenderOptions } {
  return {
    lang: p['data-lang'] || '',
    code: p['data-code'] || '',
    options: {
      showToolbar: p['data-toolbar'] === 'true',
      showLineNumbers: p['data-line-numbers'] === 'true',
      highlight: p['data-highlight'] || '',
      diffHighlight: p['data-diff-highlight'] === 'true',
      diffLang: p['data-diff-lang'] || '',
      commandLine: p['data-command-line'] === 'true',
      prompt: p['data-prompt'] || '',
      user: p['data-user'] || '',
      host: p['data-host'] || '',
      output: p['data-output'] || '',
      filterOutput: p['data-filter-output'] || '',
      continuationStr: p['data-continuation-str'] || '',
      continuationPrompt: p['data-continuation-prompt'] || '',
      filterContinuation: p['data-filter-continuation'] || '',
      start: parseInt(p['data-start'], 10) || 1,
      copyText: p['data-copy-text'] || '',
      copySuccess: p['data-copy-success'] || '',
      copyTimeout: parseInt(p['data-copy-timeout'], 10) || 0,
      filename: p['data-filename'] || '',
    },
  };
}

// IMPORTANT: No React hooks — the plugin bundles its own React
// which is a different instance from Growi's React, causing hook errors.
function renderToDiv(code: string, lang: string, options: RenderOptions) {
  const refCallback = (el: HTMLDivElement | null) => {
    if (!el) return;
    el.innerHTML = '';
    const rendered = renderCodeBlock(code, lang, options);
    el.appendChild(rendered);
  };

  const key = `${lang}:${JSON.stringify(options)}:${code}`;
  return <div key={key} ref={refCallback} />;
}

// --- Directive component (:::prism) ---

// Component for :::prism directive — registered as components['prism']
export const PrismDirectiveBlock = (props: any) => {
  const { lang, code, options } = propsToRenderOptions(props);
  debug('render: PrismDirectiveBlock', { lang, codeLen: code.length, options });
  return renderToDiv(code, lang, options);
};

// --- Code component (```prism-js:toolbar) ---

// Wraps Growi's original code component.
// Detects ```prism-* blocks via data-prism attribute;
// delegates everything else to Growi's original, optionally prefixing a
// filename overlay (data-filename) for the native ```lang:filename syntax.
export function createCodeComponent(
  OriginalCode: any,
  growiReact: any,
) {
  return (props: any) => {
    if (props['data-prism'] === 'true') {
      const { lang, options } = propsToRenderOptions(props);
      const code = typeof props.children === 'string'
        ? props.children
        : String(props.children || '');

      debug('render: prism-* code', { lang, codeLen: code.length, options });
      return renderToDiv(code, lang, options);
    }

    // Strip data-filename from props passed to OriginalCode (we render the
    // cite ourselves; OriginalCode no longer sees the colon-suffix in className).
    const { 'data-filename': filename, ...restProps } = props;

    const baseElement = OriginalCode && growiReact
      ? growiReact.createElement(OriginalCode, restProps)
      : (growiReact ? growiReact.createElement('code', restProps) : null);

    if (filename && growiReact) {
      debug('render: code with filename overlay', { filename });
      const cite = growiReact.createElement(
        'cite',
        { className: 'cbs-filename-label' },
        filename,
      );
      return growiReact.createElement(
        growiReact.Fragment,
        null,
        cite,
        baseElement,
      );
    }

    return baseElement;
  };
}
