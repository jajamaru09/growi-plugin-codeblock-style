import { renderCodeBlock, RenderOptions } from './CustomHighlighter';

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
  return renderToDiv(code, lang, options);
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
    if (props['data-prism'] === 'true') {
      const { lang, options } = propsToRenderOptions(props);
      const code = typeof props.children === 'string'
        ? props.children
        : String(props.children || '');

      return renderToDiv(code, lang, options);
    }

    // Delegate to Growi's original code component
    if (OriginalCode && growiReact) {
      return growiReact.createElement(OriginalCode, props);
    }
    return growiReact
      ? growiReact.createElement('code', props)
      : null;
  };
}
