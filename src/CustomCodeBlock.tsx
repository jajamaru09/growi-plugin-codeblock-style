import { renderCodeBlock } from './CustomHighlighter';
import type { CodeBlockProps } from './types';

function extractLanguage(className?: string): string {
  if (!className) return '';
  const match = className.match(/language-(\S+)/);
  return match ? match[1] : '';
}

function parseMetaString(props: Record<string, any>): { showLineNumbers: boolean } {
  const showLineNumbers =
    props.showLineNumbers === true ||
    props.showlinenumbers === true ||
    (typeof props.node?.data?.meta === 'string' &&
      props.node.data.meta.includes('showLineNumbers'));

  return { showLineNumbers };
}

// This is a React component used by Growi's react-markdown.
// IMPORTANT: No React hooks allowed — the plugin bundles its own React
// which is a different instance from Growi's React, causing hook errors.
// Instead, we render pure DOM and mount it via a ref callback.
export const CustomCodeBlock = ({
  children,
  className,
  inline,
  node,
  ...rest
}: CodeBlockProps) => {
  // Inline code — return plain JSX (no hooks needed)
  if (inline) {
    return <code className={className}>{children}</code>;
  }

  const lang = extractLanguage(className);
  const { showLineNumbers } = parseMetaString({ ...rest, node });
  const codeString = String(children);

  // Use ref callback to mount pure DOM content
  const refCallback = (el: HTMLDivElement | null) => {
    if (el && !el.hasChildNodes()) {
      const rendered = renderCodeBlock(codeString, lang, showLineNumbers);
      el.appendChild(rendered);
    }
  };

  return <div ref={refCallback} />;
};
