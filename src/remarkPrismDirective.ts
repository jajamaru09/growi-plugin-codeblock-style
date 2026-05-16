import { visit } from 'unist-util-visit';
import { debug } from './debug';

// --- Shared types ---

export interface PrismOptions {
  lang: string;
  showToolbar: boolean;
  showLineNumbers: boolean;
  highlight: string;      // e.g., "1,3-5,7"
  diffHighlight: boolean;
  diffLang: string;       // e.g., "js" (target language for language-specific diff)
  commandLine: boolean;
  prompt: string;         // e.g., "$" or ">"
  user: string;           // e.g., "root"
  host: string;           // e.g., "localhost"
  output: string;         // e.g., "2-4" (lines that are output, no prompt)
  filterOutput: string;   // e.g., "(out)" prefix marks output lines
  continuationStr: string; // e.g., "\\" line-ending continuation marker
  continuationPrompt: string; // e.g., ">" prompt for continuation lines
  filterContinuation: string; // e.g., "(con)" prefix marks continuation lines
  start: number;          // starting line number (default: 1)
  copyText: string;       // custom copy button text
  copySuccess: string;    // custom success message
  copyTimeout: number;    // timeout in ms
  filename: string;       // overlay filename label (top-right)
}

const defaultOptions: PrismOptions = {
  lang: '',
  showToolbar: false,
  showLineNumbers: false,
  highlight: '',
  diffHighlight: false,
  diffLang: '',
  commandLine: false,
  prompt: '',
  user: '',
  host: '',
  output: '',
  filterOutput: '',
  continuationStr: '',
  continuationPrompt: '',
  filterContinuation: '',
  start: 1,
  copyText: '',
  copySuccess: '',
  copyTimeout: 0,
  filename: '',
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
      case 'filterOutput': opts.filterOutput = value || ''; break;
      case 'continuationStr': opts.continuationStr = value || ''; break;
      case 'continuationPrompt': opts.continuationPrompt = value || '>'; break;
      case 'filterContinuation': opts.filterContinuation = value || ''; break;
      case 'start': opts.start = parseInt(value, 10) || 1; break;
      case 'copyText': opts.copyText = value || ''; break;
      case 'copySuccess': opts.copySuccess = value || ''; break;
      case 'copyTimeout': opts.copyTimeout = parseInt(value, 10) || 0; break;
      case 'filename': opts.filename = value || ''; break;
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
  if (attrs.filterOutput) opts.filterOutput = attrs.filterOutput;
  if (attrs.continuationStr) opts.continuationStr = attrs.continuationStr;
  if (attrs.continuationPrompt) opts.continuationPrompt = attrs.continuationPrompt;
  if (attrs.filterContinuation) opts.filterContinuation = attrs.filterContinuation;
  if (attrs.start) opts.start = parseInt(attrs.start, 10) || 1;
  if (attrs.copyText) opts.copyText = attrs.copyText;
  if (attrs.copySuccess) opts.copySuccess = attrs.copySuccess;
  if (attrs.copyTimeout) opts.copyTimeout = parseInt(attrs.copyTimeout, 10) || 0;
  if (attrs.filename) opts.filename = attrs.filename;
}

// Detect "diff-xxx" language pattern and split into diffLang + diffHighlight
function resolveDiffLanguage(opts: PrismOptions): void {
  if (opts.lang.startsWith('diff-') && opts.lang.length > 5) {
    opts.diffLang = opts.lang.slice(5);
    opts.lang = 'diff';
    opts.diffHighlight = true;
  }
}

// Serialize PrismOptions to data-* attributes for HAST
function toDataAttributes(opts: PrismOptions): Record<string, string> {
  return {
    'data-lang': opts.lang,
    'data-toolbar': opts.showToolbar ? 'true' : 'false',
    'data-line-numbers': opts.showLineNumbers ? 'true' : 'false',
    'data-highlight': opts.highlight,
    'data-diff-highlight': opts.diffHighlight ? 'true' : 'false',
    'data-diff-lang': opts.diffLang,
    'data-command-line': opts.commandLine ? 'true' : 'false',
    'data-prompt': opts.prompt,
    'data-user': opts.user,
    'data-host': opts.host,
    'data-output': opts.output,
    'data-filter-output': opts.filterOutput,
    'data-continuation-str': opts.continuationStr,
    'data-continuation-prompt': opts.continuationPrompt,
    'data-filter-continuation': opts.filterContinuation,
    'data-start': String(opts.start),
    'data-copy-text': opts.copyText,
    'data-copy-success': opts.copySuccess,
    'data-copy-timeout': String(opts.copyTimeout),
    'data-filename': opts.filename,
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
  resolveDiffLanguage(opts);

  const code = lines.slice(codeStartIndex).join('\n');

  debug('remark: containerDirective :::prism', {
    lang: opts.lang,
    codeLen: code.length,
    showToolbar: opts.showToolbar,
    showLineNumbers: opts.showLineNumbers,
    commandLine: opts.commandLine,
    diffHighlight: opts.diffHighlight,
    diffLang: opts.diffLang,
    highlight: opts.highlight,
    filename: opts.filename,
  });

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

function handlePrismCodeNode(node: any): void {
  const nodeLang: string = node.lang || '';

  const optionsStr = nodeLang === PRISM_CODE_PREFIX
    ? ''
    : nodeLang.slice(PRISM_CODE_PREFIX.length + 1);

  const opts = parseColonOptions(optionsStr);
  resolveDiffLanguage(opts);

  // Set the real language for className
  node.lang = opts.lang || null;

  debug('remark: prism-* code', {
    nodeLang,
    optionsStr,
    parsedLang: opts.lang,
    diffLang: opts.diffLang,
    showToolbar: opts.showToolbar,
    showLineNumbers: opts.showLineNumbers,
    commandLine: opts.commandLine,
    highlight: opts.highlight,
    filename: opts.filename,
  });

  const data = node.data || (node.data = {});
  data.hProperties = {
    ...(data.hProperties || {}),
    'data-prism': 'true',
    ...toDataAttributes(opts),
  };
}

// Native GROWI syntax: ```javascript:filename — extract filename so we can render
// the overlay ourselves (and prevent GROWI's CodeBlock from also rendering it).
function handleNonPrismCodeNode(node: any): void {
  const nodeLang: string = node.lang || '';
  const colonIdx = nodeLang.indexOf(':');
  if (colonIdx < 0) return;

  const lang = nodeLang.slice(0, colonIdx);
  const filename = nodeLang.slice(colonIdx + 1);
  if (!filename) return;

  node.lang = lang || null;

  debug('remark: code with filename', { lang, filename });

  const data = node.data || (node.data = {});
  data.hProperties = {
    ...(data.hProperties || {}),
    'data-filename': filename,
  };
}

function handleCodeNode(node: any): void {
  const nodeLang: string = node.lang || '';
  if (nodeLang === PRISM_CODE_PREFIX || nodeLang.startsWith(PRISM_CODE_PREFIX + '-')) {
    handlePrismCodeNode(node);
  } else {
    handleNonPrismCodeNode(node);
  }
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
