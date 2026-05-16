// No React hooks — uses DOM manipulation for "Copied!" feedback
// to avoid dual-React-instance issues in Growi plugins

import { debug } from './debug';

export function handleCopyClick(e: MouseEvent): void {
  const button = e.currentTarget as HTMLButtonElement;
  const wrapper = button.closest('.cbs-codeblock-wrapper');
  if (!wrapper) {
    debug('copy: wrapper not found');
    return;
  }

  const codeEl = wrapper.querySelector('code');
  if (!codeEl) {
    debug('copy: code element not found');
    return;
  }

  const text = codeEl.textContent ?? '';

  navigator.clipboard.writeText(text).then(
    () => {
      debug('copy: success', { textLen: text.length });
      showCopiedFeedback(button);
    },
    (err) => {
      debug('copy: clipboard API failed, falling back to execCommand', { err: String(err) });
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      debug('copy: fallback succeeded', { textLen: text.length });
      showCopiedFeedback(button);
    },
  );
}

function showCopiedFeedback(button: HTMLButtonElement): void {
  const original = button.textContent;
  const successText = button.dataset.copySuccess || 'Copied!';
  const timeout = parseInt(button.dataset.copyTimeout || '', 10) || 2000;
  button.textContent = successText;
  setTimeout(() => {
    button.textContent = original;
  }, timeout);
}
