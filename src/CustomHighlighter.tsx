import { highlightCode, getLanguageDisplayName } from './languageRegistry';
import { handleCopyClick } from './CopyButton';
import { isDarkMode } from './theme';

// Parse range string like "1,3-5,7" into a Set of line numbers (1-based)
function parseLineRanges(rangeStr: string): Set<number> {
  const lines = new Set<number>();
  if (!rangeStr) return lines;

  for (const part of rangeStr.split(',')) {
    const trimmed = part.trim();
    const match = trimmed.match(/^(\d+)(?:-(\d+))?$/);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = match[2] ? parseInt(match[2], 10) : start;
      for (let i = start; i <= end; i++) {
        lines.add(i);
      }
    }
  }
  return lines;
}

export interface RenderOptions {
  showLineNumbers: boolean;
  showToolbar: boolean;
  highlight: string;
  diffHighlight: boolean;
  diffLang: string;
  commandLine: boolean;
  prompt: string;
  user: string;
  host: string;
  output: string;
  filterOutput: string;
  continuationStr: string;
  continuationPrompt: string;
  filterContinuation: string;
  start: number;
  copyText: string;
  copySuccess: string;
  copyTimeout: number;
}

export function renderCodeBlock(
  code: string,
  lang: string,
  options: RenderOptions,
): HTMLElement {
  const trimmedCode = code.replace(/\n$/, '');
  const dark = isDarkMode();
  const themeClass = dark ? 'cbs-theme-dark' : 'cbs-theme-light';
  const toolbarClass = dark ? 'cbs-toolbar-dark' : 'cbs-toolbar-light';

  // Resolve effective language for highlighting
  let effectiveLang = lang;
  if (options.diffHighlight && !lang && !options.diffLang) {
    effectiveLang = 'diff';
  }
  // Display language for toolbar label and CSS class
  const displayLang = options.diffLang || effectiveLang;

  const lines = trimmedCode.split('\n');

  // --- Preprocess command-line lines (filter prefixes) ---
  let processedLines = [...lines];
  const filterOutputSet = new Set<number>();
  const filterContinuationSet = new Set<number>();

  if (options.commandLine) {
    if (options.filterOutput) {
      processedLines = processedLines.map((line, i) => {
        if (line.startsWith(options.filterOutput)) {
          filterOutputSet.add(i + 1);
          return line.slice(options.filterOutput.length);
        }
        return line;
      });
    }
    if (options.filterContinuation) {
      processedLines = processedLines.map((line, i) => {
        if (line.startsWith(options.filterContinuation)) {
          filterContinuationSet.add(i + 1);
          return line.slice(options.filterContinuation.length);
        }
        return line;
      });
    }
  }

  // --- Syntax highlighting ---
  let highlightedLines: string[];

  if (options.diffHighlight && options.diffLang) {
    // Language-specific diff: strip prefixes, highlight each line with target language
    const strippedLines = processedLines.map(line => {
      const ch = line.charAt(0);
      return (ch === '+' || ch === '-' || ch === ' ') ? line.slice(1) : line;
    });
    highlightedLines = strippedLines.map(line => highlightCode(line, options.diffLang));
  } else {
    // Normal highlighting (including plain diff)
    const codeToHighlight = options.commandLine ? processedLines.join('\n') : trimmedCode;
    const highlightedHtml = highlightCode(codeToHighlight, effectiveLang);
    highlightedLines = highlightedHtml.split('\n');
  }

  // --- Build DOM ---
  const wrapper = document.createElement('div');
  wrapper.className = `cbs-codeblock-wrapper ${themeClass}`;

  // Toolbar
  if (options.showToolbar) {
    const toolbar = document.createElement('div');
    toolbar.className = `cbs-toolbar ${toolbarClass}`;

    const langLabel = document.createElement('span');
    langLabel.className = 'cbs-lang-label';
    langLabel.textContent = displayLang ? getLanguageDisplayName(displayLang) : '';
    toolbar.appendChild(langLabel);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'cbs-copy-btn';
    copyBtn.textContent = options.copyText || 'Copy';
    copyBtn.type = 'button';
    copyBtn.title = 'Copy to clipboard';
    if (options.copySuccess) copyBtn.dataset.copySuccess = options.copySuccess;
    if (options.copyTimeout) copyBtn.dataset.copyTimeout = String(options.copyTimeout);
    copyBtn.addEventListener('click', handleCopyClick as EventListener);
    toolbar.appendChild(copyBtn);

    wrapper.appendChild(toolbar);
  }

  const langClass = displayLang ? `language-${displayLang}` : 'language-plaintext';

  const pre = document.createElement('pre');
  pre.className = langClass;

  const codeEl = document.createElement('code');
  codeEl.className = langClass;

  const highlightSet = parseLineRanges(options.highlight);
  const outputSet = parseLineRanges(options.output);

  // Determine prompt string for command-line
  let promptStr = '';
  if (options.commandLine) {
    if (options.prompt) {
      promptStr = options.prompt;
    } else if (options.user || options.host) {
      const u = options.user || 'user';
      const h = options.host || 'localhost';
      const suffix = u === 'root' ? '#' : '$';
      promptStr = `${u}@${h} ${suffix}`;
    } else {
      promptStr = '$';
    }
  }

  // Use table when features require per-line structure
  const useTable = options.showLineNumbers || highlightSet.size > 0
    || options.commandLine || options.diffHighlight;

  if (useTable) {
    const table = document.createElement('table');
    table.className = 'cbs-line-numbers-table';

    processedLines.forEach((rawLine, i) => {
      const lineNum = options.start + i;
      const lineIdx = i + 1; // 1-based index for range lookups
      const tr = document.createElement('tr');

      // Line highlight
      if (highlightSet.has(lineNum)) {
        tr.className = 'cbs-line-highlight';
      }

      // Diff highlight (check original line before prefix stripping)
      if (options.diffHighlight) {
        if (rawLine.startsWith('+')) {
          tr.classList.add('cbs-diff-inserted');
        } else if (rawLine.startsWith('-')) {
          tr.classList.add('cbs-diff-deleted');
        }
      }

      // Line number column
      if (options.showLineNumbers) {
        const tdNum = document.createElement('td');
        tdNum.className = 'cbs-line-number';
        tdNum.textContent = String(lineNum);
        tr.appendChild(tdNum);
      }

      // Command-line prompt column
      if (options.commandLine) {
        const tdPrompt = document.createElement('td');
        tdPrompt.className = 'cbs-prompt';

        const isOutput = outputSet.has(lineIdx) || filterOutputSet.has(lineIdx);
        const isContinuation = filterContinuationSet.has(lineIdx) ||
          (options.continuationStr && i > 0 &&
            processedLines[i - 1].endsWith(options.continuationStr));

        if (isOutput) {
          tdPrompt.textContent = '';
        } else if (isContinuation) {
          tdPrompt.textContent = options.continuationPrompt || '>';
        } else {
          tdPrompt.textContent = promptStr;
        }
        tr.appendChild(tdPrompt);
      }

      // Code content column
      const tdCode = document.createElement('td');
      tdCode.className = 'cbs-line-content';
      tdCode.innerHTML = highlightedLines[i] ?? '';
      tr.appendChild(tdCode);

      table.appendChild(tr);
    });

    codeEl.appendChild(table);
  } else {
    codeEl.innerHTML = highlightedLines.join('\n');
  }

  pre.appendChild(codeEl);
  wrapper.appendChild(pre);

  return wrapper;
}
