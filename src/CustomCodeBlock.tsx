import { renderCodeBlock } from './CustomHighlighter';
import type { CbsCodeProps } from './types';

// React component for <cbs-code> elements.
// IMPORTANT: No React hooks — the plugin bundles its own React
// which is a different instance from Growi's React, causing hook errors.
// We render pure DOM and mount it via a ref callback.
export const CustomCodeBlock = (props: CbsCodeProps) => {
  const lang = props.lang ?? '';
  const showToolbar = props.showToolbar === 'true';
  const showLineNumbers = props.showLineNumbers === 'true';
  const codeString = props.code ?? '';

  const refCallback = (el: HTMLDivElement | null) => {
    if (el && !el.hasChildNodes()) {
      const rendered = renderCodeBlock(codeString, lang, showLineNumbers, showToolbar);
      el.appendChild(rendered);
    }
  };

  return <div ref={refCallback} />;
};
