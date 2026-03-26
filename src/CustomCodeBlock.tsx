import { renderCodeBlock } from './CustomHighlighter';
import type { CodeBlockProps } from './types';

// Parse className like "language-js:filename.js:lineNumbers"
// Growi uses colon-separated format: language:filename
// We extend it: language:lineNumbers or language:filename:lineNumbers
function parseClassName(className?: string): {
  lang: string;
  showLineNumbers: boolean;
  showToolbar: boolean;
} {
  if (!className) return { lang: '', showLineNumbers: false, showToolbar: false };

  const match = className.match(/language-(\S+)/);
  if (!match) return { lang: '', showLineNumbers: false, showToolbar: false };

  const parts = match[1].split(':');
  const lang = parts[0];
  const showLineNumbers = parts.some((p) => p === 'lineNumbers');
  const showToolbar = parts.some((p) => p === 'toolbar');

  return { lang, showLineNumbers, showToolbar };
}

// This is a React component used by Growi's react-markdown.
// IMPORTANT: No React hooks allowed — the plugin bundles its own React
// which is a different instance from Growi's React, causing hook errors.
// Instead, we render pure DOM and mount it via a ref callback.
export const CustomCodeBlock = ({
  children,
  className,
  inline,
}: CodeBlockProps) => {
  // Inline code — return plain JSX (no hooks needed)
  if (inline) {
    return <code className={className}>{children}</code>;
  }

  const { lang, showLineNumbers, showToolbar } = parseClassName(className);
  const codeString = String(children);

  // Use ref callback to mount pure DOM content
  const refCallback = (el: HTMLDivElement | null) => {
    if (el && !el.hasChildNodes()) {
      const rendered = renderCodeBlock(codeString, lang, showLineNumbers, showToolbar);
      el.appendChild(rendered);
    }
  };

  return <div ref={refCallback} />;
};
