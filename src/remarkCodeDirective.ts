import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

// Type for containerDirective nodes created by remark-directive
interface ContainerDirective {
  type: 'containerDirective';
  name: string;
  attributes?: Record<string, string>;
  children: Array<{ type: string; children?: Array<{ type: string; value?: string }> }>;
  data?: Record<string, unknown>;
}

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

function extractTextContent(node: ContainerDirective): { label: string; code: string } {
  // remark-directive places the directive label (e.g., "js:toolbar")
  // as text inside the first paragraph child, or in node.attributes.
  // The actual code content is in subsequent children.
  //
  // For :::code js:toolbar\nconst x = 42;\n:::
  // The AST typically looks like:
  //   containerDirective { name: 'code',
  //     children: [
  //       paragraph { children: [text { value: 'const x = 42;' }] }
  //     ]
  //   }
  // And the label "js:toolbar" is available via node.attributes or
  // the first "data" part after the directive name.
  //
  // remark-directive puts the text after :::code on the same line
  // into the `attributes` or the directive label. We need to check
  // the actual AST structure.
  //
  // According to remark-directive docs:
  //   :::code{lang=js}   → attributes: { lang: 'js' }
  //   :::code js:toolbar  → The "js:toolbar" becomes a label/text
  //
  // For `:::code js:toolbar`, remark-directive treats "js:toolbar"
  // as the directive's "label" (first text line) which ends up as
  // text content of a paragraph in children.
  //
  // Let's handle both: check if first child is a paragraph containing
  // just the label, and remaining children contain the code.

  let label = '';
  let codeLines: string[] = [];

  for (const child of node.children) {
    if (child.type === 'paragraph' && child.children) {
      const text = child.children
        .filter((c) => c.type === 'text')
        .map((c) => c.value ?? '')
        .join('');

      if (!label && /^[a-zA-Z0-9_-]+(:[a-zA-Z]+)*$/.test(text.trim())) {
        // This looks like a label (e.g., "js:toolbar:lineNumbers")
        label = text.trim();
      } else {
        codeLines.push(text);
      }
    } else if (child.type === 'code' || child.type === 'text') {
      codeLines.push((child as any).value ?? '');
    }
  }

  return { label, code: codeLines.join('\n') };
}

export function remarkCodeDirective() {
  return (tree: Root) => {
    visit(tree, 'containerDirective', (rawNode) => {
      const node = rawNode as unknown as ContainerDirective;
      if (node.name !== 'code') return;

      const { label, code } = extractTextContent(node);
      const { lang, showLineNumbers, showToolbar } = parseDirectiveLabel(label);

      // Transform to HAST-ready node
      const data = node.data || (node.data = {});
      data.hName = 'cbs-code';
      data.hProperties = {
        lang,
        showToolbar: showToolbar ? 'true' : 'false',
        showLineNumbers: showLineNumbers ? 'true' : 'false',
        code,
      };
      // Clear children — the code is now in hProperties
      node.children = [];
    });
  };
}
