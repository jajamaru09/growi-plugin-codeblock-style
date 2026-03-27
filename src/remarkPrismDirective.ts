import { visit } from 'unist-util-visit';

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

// Parse label string like "js:toolbar:lineNumbers"
function parseLabel(label: string): {
  lang: string;
  showToolbar: boolean;
  showLineNumbers: boolean;
} {
  const parts = label.split(':');
  return {
    lang: parts[0] || '',
    showToolbar: parts.includes('toolbar'),
    showLineNumbers: parts.includes('lineNumbers'),
  };
}

// Remark plugin: transforms containerDirective[name=prism] nodes
// created by Growi's built-in remark-directive.
//
// Sets data.hName = 'prism' so remark-rehype produces a <prism> element,
// which react-markdown maps to components['prism'].
//
// Supports two syntaxes:
//   :::prism js:toolbar        (label as first line of content)
//   :::prism{lang=js toolbar}  (structured attributes)
export function remarkPrismDirective() {
  return (tree: any) => {
    visit(tree, 'containerDirective', (node: any) => {
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
        const parsed = parseLabel(firstLine);
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
      // Clear children — code is now in data-code attribute
      data.hChildren = [];
      node.children = [];
    });
  };
}
