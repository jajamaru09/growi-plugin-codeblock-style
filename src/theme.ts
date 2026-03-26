import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light';
import type { PrismTheme } from './types';

function detectColorScheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') {
    return 'dark';
  }
  const attr = document.documentElement.getAttribute('data-bs-theme');
  return attr === 'light' ? 'light' : 'dark';
}

const colorScheme = detectColorScheme();

export const currentTheme: PrismTheme = colorScheme === 'light' ? oneLight : oneDark;
export const isDarkMode: boolean = colorScheme === 'dark';
