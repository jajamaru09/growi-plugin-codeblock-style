import type { CSSProperties, ReactNode } from 'react';

export interface CodeBlockProps {
  children: ReactNode;
  className?: string;
  inline?: boolean;
  node?: any;
  [key: string]: any;
}

export type PrismTheme = { [key: string]: CSSProperties };
