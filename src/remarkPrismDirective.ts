import { visit } from 'unist-util-visit';

// --- Shared types ---

export interface PrismOptions {
  lang: string;
  showToolbar: boolean;
  showLineNumbers: boolean;
  highlight: string;      // e.g., "1,3-5,7"
  diffHighlight: boolean;
  commandLine: boolean;
  prompt: string;         // e.g., "$" or ">"
  user: string;           // e.g., "root"
  host: string;           // e.g., "localhost"
  output: string;         // e.g., "2-4" (lines that are output, no prompt)
}

const defaultOptions: PrismOptions = {
  lang: '',
  showToolbar: false,
  showLineNumbers: false,
  highlight: '',
  diffHighlight: false,
  commandLine: false,
  prompt: '',
  user: '',
  host: '',
  output: '',
};

// --- Shared parser ---

// Parse colon-separated options: "js:toolbar:lineNumbers:highlight=3-5:commandLine:prompt=$"
function parseColonOptions(str: string): PrismOptions {
  const opts = { ...defaultOptions };
  const parts = str.split(':');

  opts.lang = parts[0] || '';

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const [key, ...rest] = part.split('=');
    const value = rest.join('=');

    switch (key) {
      case 'toolbar': opts.showToolbar = true; break;
      case 'lineNumbers': opts.showLineNumbers = true; break;
      case 'highlight': opts.highlight = value || ''; break;
      case 'diffHighlight': opts.diffHighlight = true; break;
      case 'commandLine': opts.commandLine = true; break;
      case 'prompt': opts.prompt = value || '$'; break;
      case 'user': opts.user = value || ''; break;
      case 'host': opts.host = value || ''; break;
      case 'output': opts.output = value || ''; break;
    }
  }

  return opts;
}

// Parse structured attributes: :::prism{lang=js toolbar highlight="3-5"}
function applyAttributes(opts: PrismOptions, attrs: Record<string, string>): void {
  if (attrs.lang) opts.lang = attrs.lang;
  if ('toolbar' in attrs) opts.showToolbar = true;
  if ('lineNumbers' in attrs) opts.showLineNumbers = true;
  if (attrs.highlight) opts.highlight = attrs.highlight;
  if ('diffHighlight' in attrs) opts.diffHighlight = true;
  if ('commandLine' in attrs) opts.commandLine = true;
  if (attrs.prompt) opts.prompt = attrs.prompt;
  if (attrs.user) opts.user = attrs.user;
  if (attrs.host) opts.host = attrs.host;
  if (attrs.output) opts.output = attrs.output;
}

// Serialize PrismOptions to data-* attributes for HAST
function toDataAttributes(opts: PrismOptions): Record<string, string> {
  return {
    'data-lang': opts.lang,
    'data-toolbar': opts.showToolbar ? 'true' : 'false',
    'data-line-numbers': opts.showLineNumbers ? 'true' : 'false',
    'data-highlight': opts.highlight,
    'data-diff-highlight': opts.diffHighlight ? 'true' : 'false',
    'data-command-line': opts.commandLine ? 'true' : 'false',
    'data-prompt': opts.prompt,
    'data-user': opts.user,
    'data-host': opts.host,
    'data-output': opts.output,
  };
}

// --- Container directive handler (:::prism) ---

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

  const opts = { ...defaultOptions };

  const fullText = extractMdastText(node.children || []).trim();
  const lines = fullText.split('\n');

  let codeStartIndex = 0;
  const firstLine = lines[0]?.trim() || '';
  if (/^[a-zA-Z0-9_+#.-]+(:[a-zA-Z0-9=.$>-]+)*$/.test(firstLine)) {
    const parsed = parseColonOptions(firstLine);
    Object.assign(opts, parsed);
    codeStartIndex = 1;
  }

  if (node.attributes) {
    applyAttributes(opts, node.attributes);
  }

  const code = lines.slice(codeStartIndex).join('\n');

  const data = node.data || (node.data = {});
  data.hName = 'prism';
  data.hProperties = {
    ...toDataAttributes(opts),
    'data-code': code,
  };
  data.hChildren = [];
  node.children = [];
}

// --- Fenced code block handler (```prism-js:toolbar) ---

const PRISM_CODE_PREFIX = 'prism';

function handleCodeNode(node: any): void {
  const nodeLang: string = node.lang || '';
  if (nodeLang !== PRISM_CODE_PREFIX && !nodeLang.startsWith(PRISM_CODE_PREFIX + '-')) {
    return;
  }

  const optionsStr = nodeLang === PRISM_CODE_PREFIX
    ? ''
    : nodeLang.slice(PRISM_CODE_PREFIX.length + 1);

  const opts = parseColonOptions(optionsStr);

  // Set the real language for className
  node.lang = opts.lang || null;

  const data = node.data || (node.data = {});
  data.hProperties = {
    ...(data.hProperties || {}),
    'data-prism': 'true',
    ...toDataAttributes(opts),
  };
}

// --- Combined remark plugin ---

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
