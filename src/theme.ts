export function isDarkMode(): boolean {
  if (typeof document === 'undefined') {
    return true;
  }
  const attr = document.documentElement.getAttribute('data-bs-theme');
  return attr !== 'light';
}
