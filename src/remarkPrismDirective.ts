import { visit } from 'unist-util-visit';

// --- Shared parser ---

// Parse options string like "js:toolbar:lineNumbers"
function parseOptions(str: string): {
  lang: string;
  showToolbar: boolean;
  showLineNumbers: boolean;
} {
  const parts = str.split(':');
  return {
    lang: parts[0] || '',
    showToolbar: parts.includes('toolbar'),
    showLineNumbers: parts.includes('lineNumbers'),
  };
}

// --- Container directive handler (:::prism) ---

// Extract text content from mdast children (paragraphs, text nodes, etc.)
function extractMdastText(children: any[]): string {
  const parts: string[] = [];
  for (const child of children) {
    if (child.type === 'text') {
      parts.push(child.value);
    } else if (child.type === 'paragraph' && child.children) {
      parts.push(extractMdastText(child.children));
    } else if (child.children) {
      parts.push(extractMdastText(child.children));
    }
  }
  return parts.join('\n');
}

function handleContainerDirective(node: any): void {
  if (node.name !== 'prism') return;

  let lang = '';
  let showToolbar = false;
  let showLineNumbers = false;

  // Extract text from children
  const fullText = extractMdastText(node.children || []).trim();
  const lines = fullText.split('\n');

  // Check if first line is a label (e.g., "js:toolbar:lineNumbers")
  let codeStartIndex = 0;
  const firstLine = lines[0]?.trim() || '';
  if (/^[a-zA-Z0-9_+#.-]+(:[a-zA-Z]+)*$/.test(firstLine)) {
    const parsed = parseOptions(firstLine);
    lang = parsed.lang;
    showToolbar = parsed.showToolbar;
    showLineNumbers = parsed.showLineNumbers;
    codeStartIndex = 1;
  }

  // Structured attributes override (:::prism{lang=js toolbar})
  if (node.attributes) {
    if (node.attributes.lang) lang = node.attributes.lang;
    if ('toolbar' in node.attributes) showToolbar = true;
    if ('lineNumbers' in node.attributes) showLineNumbers = true;
  }

  const code = lines.slice(codeStartIndex).join('\n');

  // Set HAST conversion properties
  const data = node.data || (node.data = {});
  data.hName = 'prism';
  data.hProperties = {
    'data-lang': lang,
    'data-toolbar': showToolbar ? 'true' : 'false',
    'data-line-numbers': showLineNumbers ? 'true' : 'false',
    'data-code': code,
  };
  data.hChildren = [];
  node.children = [];
}

// --- Fenced code block handler (```prism-js:toolbar) ---

// Prefix for fenced code blocks: ```prism or ```prism-js:toolbar
export const PRISM_CODE_PREFIX = 'prism';

function handleCodeNode(node: any): void {
  const nodeLang: string = node.lang || '';
  if (nodeLang !== PRISM_CODE_PREFIX && !nodeLang.startsWith(PRISM_CODE_PREFIX + '-')) {
    return;
  }

  // Parse: "prism" → no options, "prism-js:toolbar" → lang=js, toolbar
  const optionsStr = nodeLang === PRISM_CODE_PREFIX
    ? ''
    : nodeLang.slice(PRISM_CODE_PREFIX.length + 1); // skip "prism-"

  const { lang, showToolbar, showLineNumbers } = parseOptions(optionsStr);
  const code = node.value || '';

  // Mark this code node for our component.
  // We set a special lang prefix so the code component can detect it.
  node.lang = `__prism__${lang}`;
  node.meta = [
    showToolbar ? 'toolbar' : '',
    showLineNumbers ? 'lineNumbers' : '',
  ].filter(Boolean).join(':') || null;

  // Store parsed data for the component
  const data = node.data || (node.data = {});
  data.prismOptions = { lang, showToolbar, showLineNumbers, code };
}

// --- Combined remark plugin ---

// Handles both syntaxes:
//   :::prism{lang=js toolbar}    (container directive — content parsed as markdown)
//   ```prism-js:toolbar           (fenced code — content is literal text)
export function remarkPrismDirective() {
  return (tree: any) => {
    visit(tree, (node: any) => {
      if (node.type === 'containerDirective') {
        handleContainerDirective(node);
      } else if (node.type === 'code') {
        handleCodeNode(node);
      }
    });
  };
}
