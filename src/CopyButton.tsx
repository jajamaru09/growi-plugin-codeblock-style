// No React hooks — uses DOM manipulation for "Copied!" feedback
// to avoid dual-React-instance issues in Growi plugins

export function handleCopyClick(e: MouseEvent): void {
  const button = e.currentTarget as HTMLButtonElement;
  const wrapper = button.closest('.cbs-codeblock-wrapper');
  if (!wrapper) return;

  const codeEl = wrapper.querySelector('code');
  if (!codeEl) return;

  const text = codeEl.textContent ?? '';

  navigator.clipboard.writeText(text).then(
    () => showCopiedFeedback(button),
    () => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showCopiedFeedback(button);
    },
  );
}

function showCopiedFeedback(button: HTMLButtonElement): void {
  const original = button.textContent;
  button.textContent = 'Copied!';
  setTimeout(() => {
    button.textContent = original;
  }, 2000);
}
