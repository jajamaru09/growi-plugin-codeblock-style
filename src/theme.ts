function detectColorScheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') {
    return 'dark';
  }
  const attr = document.documentElement.getAttribute('data-bs-theme');
  return attr === 'light' ? 'light' : 'dark';
}

const colorScheme = detectColorScheme();

export const isDarkMode: boolean = colorScheme === 'dark';
