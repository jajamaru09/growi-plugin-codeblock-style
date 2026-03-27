import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Text, Code } from 'mdast';

// Marker prefix to distinguish :::code blocks from standard ``` blocks
export const CBS_MARKER = '__cbs__';

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

// Remark plugin: transforms paragraphs containing :::code ... ::: into
// standard mdast `code` nodes with a marker in the `lang` field.
//
// The marker allows the code component to distinguish :::code blocks
// from standard ``` blocks at render time.
//
// :::code js:toolbar       → code node with lang = "__cbs__js:toolbar"
// :::code js:lineNumbers   → code node with lang = "__cbs__js:lineNumbers"
// :::code                  → code node with lang = "__cbs__"
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

      // Create a standard code node with a marker prefix in lang.
      // remark-rehype handles code nodes natively → <pre><code class="language-__cbs__js:toolbar">
      const replacement: Code = {
        type: 'code',
        lang: CBS_MARKER + labelStr,
        value: code,
      };

      parent.children.splice(index, 1, replacement);
      return index;
    });
  };
}
