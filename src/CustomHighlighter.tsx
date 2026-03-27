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
  commandLine: boolean;
  prompt: string;
  user: string;
  host: string;
  output: string;
}

export function renderCodeBlock(
  code: string,
  lang: string,
  options: RenderOptions,
): HTMLElement {
  const trimmedCode = code.replace(/\n$/, '');
  const effectiveLang = options.diffHighlight && !lang ? 'diff' : lang;
  const highlightedHtml = highlightCode(trimmedCode, effectiveLang);
  const dark = isDarkMode();
  const themeClass = dark ? 'cbs-theme-dark' : 'cbs-theme-light';
  const toolbarClass = dark ? 'cbs-toolbar-dark' : 'cbs-toolbar-light';

  const wrapper = document.createElement('div');
  wrapper.className = `cbs-codeblock-wrapper ${themeClass}`;

  // Toolbar
  if (options.showToolbar) {
    const toolbar = document.createElement('div');
    toolbar.className = `cbs-toolbar ${toolbarClass}`;

    const langLabel = document.createElement('span');
    langLabel.className = 'cbs-lang-label';
    langLabel.textContent = effectiveLang ? getLanguageDisplayName(effectiveLang) : '';
    toolbar.appendChild(langLabel);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'cbs-copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.type = 'button';
    copyBtn.title = 'Copy to clipboard';
    copyBtn.addEventListener('click', handleCopyClick as EventListener);
    toolbar.appendChild(copyBtn);

    wrapper.appendChild(toolbar);
  }

  const langClass = effectiveLang ? `language-${effectiveLang}` : 'language-plaintext';

  const pre = document.createElement('pre');
  pre.className = langClass;

  const codeEl = document.createElement('code');
  codeEl.className = langClass;

  const lines = trimmedCode.split('\n');
  const highlightedLines = highlightedHtml.split('\n');
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
      promptStr = `${u}@${h}`;
    } else {
      promptStr = '$';
    }
  }

  // Use table for line numbers, line highlight, command-line, or diff-highlight
  const useTable = options.showLineNumbers || highlightSet.size > 0
    || options.commandLine || options.diffHighlight;

  if (useTable) {
    const table = document.createElement('table');
    table.className = 'cbs-line-numbers-table';

    lines.forEach((rawLine, i) => {
      const lineNum = i + 1;
      const tr = document.createElement('tr');

      // Line highlight
      if (highlightSet.has(lineNum)) {
        tr.className = 'cbs-line-highlight';
      }

      // Diff highlight
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
        tdPrompt.textContent = outputSet.has(lineNum) ? '' : promptStr;
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
    codeEl.innerHTML = highlightedHtml;
  }

  pre.appendChild(codeEl);
  wrapper.appendChild(pre);

  return wrapper;
}
