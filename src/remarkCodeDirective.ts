import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Text } from 'mdast';

// Parse "js:toolbar:lineNumbers" into structured options
function parseDirectiveLabel(label: string): {
  lang: string;
  showLineNumbers: boolean;
  showToolbar: boolean;
} {
  const parts = label.split(':');
  const lang = parts[0] || '';
  const showLineNumbers = parts.some((p) => p === 'lineNumbers');
  const showToolbar = parts.some((p) => p === 'toolbar');
  return { lang, showLineNumbers, showToolbar };
}

// Extract full text content from a paragraph node (joining all text/break children)
function getParagraphText(node: Paragraph): string {
  return node.children
    .map((child) => {
      if (child.type === 'text') return (child as Text).value;
      if (child.type === 'break') return '\n';
      return '';
    })
    .join('');
}

// Remark plugin: transforms paragraphs containing :::code ... ::: into custom HAST nodes.
// Works without remark-directive by directly scanning paragraph text content.
//
// Supports:
//   :::code js
//   const x = 42;
//   :::
//
//   :::code js:toolbar:lineNumbers
//   const x = 42;
//   :::
export function remarkCodeDirective() {
  return (tree: Root) => {
    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      if (index == null || parent == null) return;

      const text = getParagraphText(node);

      // Match: starts with :::code, ends with :::
      const match = text.match(/^:::code(?:\s+(\S+))?\n([\s\S]*?)\n:::$/);
      if (!match) return;

      const labelStr = match[1] || '';
      const code = match[2] || '';
      const { lang, showLineNumbers, showToolbar } = parseDirectiveLabel(labelStr);

      // Replace the paragraph node with a custom HAST-ready node
      const replacement: any = {
        type: 'code', // use 'code' node type so it passes through mdast-to-hast
        value: code,
        data: {
          hName: 'cbs-code',
          hProperties: {
            lang,
            showToolbar: showToolbar ? 'true' : 'false',
            showLineNumbers: showLineNumbers ? 'true' : 'false',
            code,
          },
          hChildren: [],
        },
      };

      parent.children.splice(index, 1, replacement);
      return index; // revisit this index since we replaced the node
    });
  };
}
