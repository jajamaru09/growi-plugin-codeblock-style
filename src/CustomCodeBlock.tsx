import { renderCodeBlock } from './CustomHighlighter';
import { CBS_MARKER } from './remarkCodeDirective';

// Parse className for :::code blocks marked with CBS_MARKER
function parseCbsClassName(className?: string): {
  isCbs: boolean;
  lang: string;
  showLineNumbers: boolean;
  showToolbar: boolean;
} {
  if (!className) return { isCbs: false, lang: '', showLineNumbers: false, showToolbar: false };

  const match = className.match(/language-(\S+)/);
  if (!match) return { isCbs: false, lang: '', showLineNumbers: false, showToolbar: false };

  const raw = match[1];
  if (!raw.startsWith(CBS_MARKER)) {
    return { isCbs: false, lang: '', showLineNumbers: false, showToolbar: false };
  }

  // Strip marker and parse: "js:toolbar:lineNumbers"
  const labelStr = raw.slice(CBS_MARKER.length);
  const parts = labelStr.split(':');
  const lang = parts[0] || '';
  const showLineNumbers = parts.some((p) => p === 'lineNumbers');
  const showToolbar = parts.some((p) => p === 'toolbar');

  return { isCbs: true, lang, showLineNumbers, showToolbar };
}

// React component replacing the `code` element.
// IMPORTANT: No React hooks — the plugin bundles its own React
// which is a different instance from Growi's React, causing hook errors.
//
// For :::code blocks (detected by CBS_MARKER in className):
//   renders custom Prism.js highlighted block with toolbar/line numbers.
// For standard ``` blocks:
//   returns default <code> element (Growi's native rendering).
export const CustomCodeBlock = ({
  children,
  className,
  inline,
  ...rest
}: any) => {
  // Inline code — always pass through
  if (inline) {
    return <code className={className}>{children}</code>;
  }

  const { isCbs, lang, showLineNumbers, showToolbar } = parseCbsClassName(className);

  // Standard ``` code block — pass through to Growi default
  if (!isCbs) {
    return <code className={className} {...rest}>{children}</code>;
  }

  // :::code block — render custom
  const codeString = String(children);

  const refCallback = (el: HTMLDivElement | null) => {
    if (el && !el.hasChildNodes()) {
      const rendered = renderCodeBlock(codeString, lang, showLineNumbers, showToolbar);
      el.appendChild(rendered);
    }
  };

  return <div ref={refCallback} />;
};
