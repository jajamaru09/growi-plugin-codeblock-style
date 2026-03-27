import { highlightCode } from './languageRegistry';
import { getLanguageDisplayName } from './languageRegistry';
import { handleCopyClick } from './CopyButton';
import { isDarkMode } from './theme';

export function renderCodeBlock(
  code: string,
  lang: string,
  showLineNumbers: boolean,
  showToolbar: boolean,
): HTMLElement {
  const trimmedCode = code.replace(/\n$/, '');
  const highlightedHtml = highlightCode(trimmedCode, lang);
  const themeClass = isDarkMode ? 'cbs-theme-dark' : 'cbs-theme-light';
  const toolbarClass = isDarkMode ? 'cbs-toolbar-dark' : 'cbs-toolbar-light';

  const wrapper = document.createElement('div');
  wrapper.className = `cbs-codeblock-wrapper ${themeClass}`;

  // Toolbar — only shown with :toolbar option
  if (showToolbar) {
    const toolbar = document.createElement('div');
    toolbar.className = `cbs-toolbar ${toolbarClass}`;

    const langLabel = document.createElement('span');
    langLabel.className = 'cbs-lang-label';
    langLabel.textContent = lang ? getLanguageDisplayName(lang) : '';
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

  // Code block — always use language-* class to prevent Growi's
  // code:not([class^=language-]) border styles from applying
  const langClass = lang ? `language-${lang}` : 'language-plaintext';

  const pre = document.createElement('pre');
  pre.className = langClass;

  const codeEl = document.createElement('code');
  codeEl.className = langClass;

  if (showLineNumbers) {
    const lines = trimmedCode.split('\n');
    const highlightedLines = highlightedHtml.split('\n');
    const table = document.createElement('table');
    table.className = 'cbs-line-numbers-table';

    lines.forEach((_, i) => {
      const tr = document.createElement('tr');

      const tdNum = document.createElement('td');
      tdNum.className = 'cbs-line-number';
      tdNum.textContent = String(i + 1);
      tr.appendChild(tdNum);

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
