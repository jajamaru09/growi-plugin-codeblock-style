import { renderCodeBlock } from './CustomHighlighter';

// Parse the directive label from children text.
// :::prism js:toolbar:lineNumbers → first paragraph child contains "js:toolbar:lineNumbers"
function parseDirectiveProps(children: any[]): {
  lang: string;
  showLineNumbers: boolean;
  showToolbar: boolean;
  code: string;
} {
  // containerDirective children are React elements rendered by react-markdown.
  // The content inside :::prism ... ::: becomes child elements.
  // The first line (e.g., "js:toolbar") and the code content are both in children.
  //
  // We need to extract text from the children to find the label and code.
  // react-markdown renders containerDirective children as paragraph elements.
  let allText = '';
  if (Array.isArray(children)) {
    for (const child of children) {
      if (typeof child === 'string') {
        allText += child;
      } else if (child?.props?.children) {
        // React element — extract text recursively
        allText += extractText(child.props.children);
      }
    }
  } else if (typeof children === 'string') {
    allText = children;
  }

  // The label (lang:options) is the first line, code is the rest
  const lines = allText.split('\n');
  const firstLine = lines[0]?.trim() || '';

  // Check if first line looks like a label (e.g., "js", "js:toolbar", "js:lineNumbers:toolbar")
  let label = '';
  let codeStartIndex = 0;

  if (/^[a-zA-Z0-9_+#.-]+(:[a-zA-Z]+)*$/.test(firstLine)) {
    label = firstLine;
    codeStartIndex = 1;
  }

  const code = lines.slice(codeStartIndex).join('\n');
  const parts = label.split(':');
  const lang = parts[0] || '';
  const showLineNumbers = parts.some((p) => p === 'lineNumbers');
  const showToolbar = parts.some((p) => p === 'toolbar');

  return { lang, showLineNumbers, showToolbar, code };
}

function extractText(children: any): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children?.props?.children) return extractText(children.props.children);
  return '';
}

// React component for :::prism directive blocks.
// Registered as components['prism'] — only receives :::prism content.
// Standard ``` blocks are NOT affected.
//
// IMPORTANT: No React hooks — the plugin bundles its own React
// which is a different instance from Growi's React, causing hook errors.
export const CustomCodeBlock = (props: any) => {
  const { lang, showLineNumbers, showToolbar, code } = parseDirectiveProps(props.children ? [props.children] : []);

  const refCallback = (el: HTMLDivElement | null) => {
    if (el && !el.hasChildNodes()) {
      const rendered = renderCodeBlock(code, lang, showLineNumbers, showToolbar);
      el.appendChild(rendered);
    }
  };

  return <div ref={refCallback} />;
};
