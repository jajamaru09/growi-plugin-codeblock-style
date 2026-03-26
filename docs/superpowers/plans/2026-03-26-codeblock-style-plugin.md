# Growi CodeBlock Style Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Growi script plugin that replaces the default CodeBlock component with a customizable one supporting light/dark Prism themes, copy button, line numbers, and language labels.

**Architecture:** A Growi v4 script plugin that hooks into `growiFacade.markdownRenderer.optionsGenerators` to replace the `code` component. The custom component uses `react-syntax-highlighter` with `PrismAsyncLight`, reads `data-bs-theme` at plugin load time to select oneDark/oneLight, and parses code fence meta strings for `showLineNumbers`.

**Tech Stack:** TypeScript, React 18, Vite, react-syntax-highlighter (Prism), CSS

---

## File Structure

```
growi-plugin-codeblock-style/
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── client-entry.tsx              # Plugin activate/deactivate registration
└── src/
    ├── vite-env.d.ts
    ├── types.ts                  # Shared types (CodeBlockProps, etc.)
    ├── theme.ts                  # Read data-bs-theme, export selected Prism theme
    ├── languages.ts              # PrismAsyncLight language registrations
    ├── CustomCodeBlock.tsx        # Main component (inline/block dispatch)
    ├── CustomHighlighter.tsx      # Prism highlighter with line numbers
    ├── CopyButton.tsx             # Copy-to-clipboard button
    ├── LanguageLabel.tsx          # Language name display
    └── styles.css                 # All component styles
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/vite-env.d.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "growi-plugin-codeblock-style",
  "version": "1.0.0",
  "description": "GROWI plugin to customize code block style with Prism themes, copy button, line numbers, and language labels",
  "license": "MIT",
  "keywords": ["growi", "growi-plugin"],
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-syntax-highlighter": "^15.6.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.14",
    "@types/react-dom": "^18.2.6",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  },
  "growiPlugin": {
    "schemaVersion": "4",
    "types": ["script"]
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "client-entry.tsx"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create vite.config.ts**

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    rollupOptions: {
      input: ['/client-entry.tsx'],
    },
  },
});
```

- [ ] **Step 5: Create src/vite-env.d.ts**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, `package-lock.json` generated

- [ ] **Step 7: Verify build setup**

Run: `npx tsc --noEmit`
Expected: No errors (may warn about missing source files, that's fine at this stage)

- [ ] **Step 8: Commit**

```bash
git init
git add package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts src/vite-env.d.ts
git commit -m "chore: scaffold growi-plugin-codeblock-style project"
```

---

### Task 2: Types and Theme Selection

**Files:**
- Create: `src/types.ts`
- Create: `src/theme.ts`

- [ ] **Step 1: Create src/types.ts**

```ts
import type { CSSProperties, ReactNode } from 'react';

export interface CodeBlockProps {
  children: ReactNode;
  className?: string;
  inline?: boolean;
  node?: any;
  [key: string]: any;
}

export type PrismTheme = { [key: string]: CSSProperties };
```

- [ ] **Step 2: Create src/theme.ts**

```ts
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
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/theme.ts
git commit -m "feat: add types and theme selection based on data-bs-theme"
```

---

### Task 3: Language Registration

**Files:**
- Create: `src/languages.ts`

- [ ] **Step 1: Create src/languages.ts**

Register all requested languages with PrismAsyncLight. Each language is imported from `react-syntax-highlighter/dist/esm/languages/prism/<name>` and registered.

```ts
import { PrismAsyncLight } from 'react-syntax-highlighter';

// Web
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import xml from 'react-syntax-highlighter/dist/esm/languages/prism/xml-doc';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import scss from 'react-syntax-highlighter/dist/esm/languages/prism/scss';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import toml from 'react-syntax-highlighter/dist/esm/languages/prism/toml';
import graphql from 'react-syntax-highlighter/dist/esm/languages/prism/graphql';
import regex from 'react-syntax-highlighter/dist/esm/languages/prism/regex';

// Systems
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin';

// Scripting
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import powershell from 'react-syntax-highlighter/dist/esm/languages/prism/powershell';
import perl from 'react-syntax-highlighter/dist/esm/languages/prism/perl';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import batch from 'react-syntax-highlighter/dist/esm/languages/prism/batch';
import autohotkey from 'react-syntax-highlighter/dist/esm/languages/prism/autohotkey';

// .NET / VB
import vbnet from 'react-syntax-highlighter/dist/esm/languages/prism/vbnet';
import vba from 'react-syntax-highlighter/dist/esm/languages/prism/visual-basic';
import cshtml from 'react-syntax-highlighter/dist/esm/languages/prism/cshtml';

// Other
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import mongodb from 'react-syntax-highlighter/dist/esm/languages/prism/mongodb';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import diff from 'react-syntax-highlighter/dist/esm/languages/prism/diff';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';
import git from 'react-syntax-highlighter/dist/esm/languages/prism/git';
import ignore from 'react-syntax-highlighter/dist/esm/languages/prism/ignore';
import apacheconf from 'react-syntax-highlighter/dist/esm/languages/prism/apacheconf';
import apex from 'react-syntax-highlighter/dist/esm/languages/prism/apex';
import arduino from 'react-syntax-highlighter/dist/esm/languages/prism/arduino';
import smalltalk from 'react-syntax-highlighter/dist/esm/languages/prism/smalltalk';

export function registerLanguages(): void {
  // Web
  PrismAsyncLight.registerLanguage('javascript', javascript);
  PrismAsyncLight.registerLanguage('js', javascript);
  PrismAsyncLight.registerLanguage('jsx', jsx);
  PrismAsyncLight.registerLanguage('tsx', tsx);
  PrismAsyncLight.registerLanguage('typescript', typescript);
  PrismAsyncLight.registerLanguage('ts', typescript);
  PrismAsyncLight.registerLanguage('html', html);
  PrismAsyncLight.registerLanguage('xml', xml);
  PrismAsyncLight.registerLanguage('css', css);
  PrismAsyncLight.registerLanguage('scss', scss);
  PrismAsyncLight.registerLanguage('json', json);
  PrismAsyncLight.registerLanguage('yaml', yaml);
  PrismAsyncLight.registerLanguage('yml', yaml);
  PrismAsyncLight.registerLanguage('toml', toml);
  PrismAsyncLight.registerLanguage('graphql', graphql);
  PrismAsyncLight.registerLanguage('regex', regex);

  // Systems
  PrismAsyncLight.registerLanguage('c', c);
  PrismAsyncLight.registerLanguage('cpp', cpp);
  PrismAsyncLight.registerLanguage('csharp', csharp);
  PrismAsyncLight.registerLanguage('cs', csharp);
  PrismAsyncLight.registerLanguage('rust', rust);
  PrismAsyncLight.registerLanguage('go', go);
  PrismAsyncLight.registerLanguage('java', java);
  PrismAsyncLight.registerLanguage('swift', swift);
  PrismAsyncLight.registerLanguage('kotlin', kotlin);

  // Scripting
  PrismAsyncLight.registerLanguage('python', python);
  PrismAsyncLight.registerLanguage('py', python);
  PrismAsyncLight.registerLanguage('ruby', ruby);
  PrismAsyncLight.registerLanguage('rb', ruby);
  PrismAsyncLight.registerLanguage('bash', bash);
  PrismAsyncLight.registerLanguage('shell', bash);
  PrismAsyncLight.registerLanguage('sh', bash);
  PrismAsyncLight.registerLanguage('powershell', powershell);
  PrismAsyncLight.registerLanguage('ps1', powershell);
  PrismAsyncLight.registerLanguage('perl', perl);
  PrismAsyncLight.registerLanguage('php', php);
  PrismAsyncLight.registerLanguage('batch', batch);
  PrismAsyncLight.registerLanguage('bat', batch);
  PrismAsyncLight.registerLanguage('autohotkey', autohotkey);
  PrismAsyncLight.registerLanguage('ahk', autohotkey);

  // .NET / VB
  PrismAsyncLight.registerLanguage('vbnet', vbnet);
  PrismAsyncLight.registerLanguage('vba', vba);
  PrismAsyncLight.registerLanguage('cshtml', cshtml);
  PrismAsyncLight.registerLanguage('razor', cshtml);

  // Other
  PrismAsyncLight.registerLanguage('sql', sql);
  PrismAsyncLight.registerLanguage('mongodb', mongodb);
  PrismAsyncLight.registerLanguage('markdown', markdown);
  PrismAsyncLight.registerLanguage('md', markdown);
  PrismAsyncLight.registerLanguage('diff', diff);
  PrismAsyncLight.registerLanguage('docker', docker);
  PrismAsyncLight.registerLanguage('dockerfile', docker);
  PrismAsyncLight.registerLanguage('git', git);
  PrismAsyncLight.registerLanguage('ignore', ignore);
  PrismAsyncLight.registerLanguage('gitignore', ignore);
  PrismAsyncLight.registerLanguage('apacheconf', apacheconf);
  PrismAsyncLight.registerLanguage('apex', apex);
  PrismAsyncLight.registerLanguage('arduino', arduino);
  PrismAsyncLight.registerLanguage('smalltalk', smalltalk);
}
```

Note: Some language import paths may need adjustment based on `react-syntax-highlighter`'s actual exports. If a language module is not found at the ESM path, try the CJS path: `react-syntax-highlighter/dist/cjs/languages/prism/<name>`.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors. If any import paths are wrong, fix them by checking `node_modules/react-syntax-highlighter/dist/esm/languages/prism/` for available language files.

- [ ] **Step 3: Commit**

```bash
git add src/languages.ts
git commit -m "feat: register all supported Prism languages"
```

---

### Task 4: CopyButton and LanguageLabel Components

**Files:**
- Create: `src/CopyButton.tsx`
- Create: `src/LanguageLabel.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: Create src/CopyButton.tsx**

```tsx
import { useState, useCallback } from 'react';

interface CopyButtonProps {
  text: string;
}

export const CopyButton = ({ text }: CopyButtonProps): JSX.Element => {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      className="cbs-copy-btn"
      onClick={handleClick}
      title="Copy to clipboard"
      type="button"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};
```

- [ ] **Step 2: Create src/LanguageLabel.tsx**

```tsx
const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  jsx: 'JSX',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  html: 'HTML',
  xml: 'XML',
  css: 'CSS',
  scss: 'SCSS',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  toml: 'TOML',
  graphql: 'GraphQL',
  regex: 'Regex',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  cs: 'C#',
  rust: 'Rust',
  go: 'Go',
  java: 'Java',
  swift: 'Swift',
  kotlin: 'Kotlin',
  python: 'Python',
  py: 'Python',
  ruby: 'Ruby',
  rb: 'Ruby',
  bash: 'Bash',
  shell: 'Shell',
  sh: 'Shell',
  powershell: 'PowerShell',
  ps1: 'PowerShell',
  perl: 'Perl',
  php: 'PHP',
  batch: 'Batch',
  bat: 'Batch',
  autohotkey: 'AutoHotkey',
  ahk: 'AutoHotkey',
  vbnet: 'VB.NET',
  vba: 'VBA',
  cshtml: 'Razor C#',
  razor: 'Razor C#',
  sql: 'SQL',
  mongodb: 'MongoDB',
  markdown: 'Markdown',
  md: 'Markdown',
  diff: 'Diff',
  docker: 'Docker',
  dockerfile: 'Dockerfile',
  git: 'Git',
  ignore: '.ignore',
  gitignore: '.gitignore',
  apacheconf: 'Apache Conf',
  apex: 'Apex',
  arduino: 'Arduino',
  smalltalk: 'Smalltalk',
};

interface LanguageLabelProps {
  lang: string;
}

export const LanguageLabel = ({ lang }: LanguageLabelProps): JSX.Element => {
  const displayName = LANGUAGE_DISPLAY_NAMES[lang] ?? lang;
  return <span className="cbs-lang-label">{displayName}</span>;
};
```

- [ ] **Step 3: Create src/styles.css**

```css
.cbs-codeblock-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.cbs-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 12px;
  font-size: 0.75rem;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}

.cbs-toolbar-dark {
  background: hsl(220, 13%, 16%);
  color: hsl(220, 14%, 60%);
}

.cbs-toolbar-light {
  background: hsl(230, 1%, 93%);
  color: hsl(230, 8%, 40%);
}

.cbs-lang-label {
  font-family: sans-serif;
  font-weight: 500;
  user-select: none;
}

.cbs-copy-btn {
  background: transparent;
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.7rem;
  cursor: pointer;
  font-family: sans-serif;
  transition: background 0.15s, color 0.15s;
}

.cbs-toolbar-dark .cbs-copy-btn {
  color: hsl(220, 14%, 60%);
}

.cbs-toolbar-dark .cbs-copy-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: hsl(220, 14%, 80%);
}

.cbs-toolbar-light .cbs-copy-btn {
  color: hsl(230, 8%, 40%);
}

.cbs-toolbar-light .cbs-copy-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: hsl(230, 8%, 25%);
}

/* Remove default margin/padding from react-syntax-highlighter's pre */
.cbs-codeblock-wrapper pre {
  margin: 0 !important;
  border-radius: 0 !important;
}

/* Round only the outer wrapper */
.cbs-codeblock-wrapper {
  border-radius: 6px;
  overflow: hidden;
}

/* Line numbers styling */
.cbs-codeblock-wrapper .linenumber {
  min-width: 2.5em !important;
  padding-right: 1em !important;
  text-align: right;
  user-select: none;
  opacity: 0.5;
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/CopyButton.tsx src/LanguageLabel.tsx src/styles.css
git commit -m "feat: add CopyButton, LanguageLabel components and styles"
```

---

### Task 5: CustomHighlighter Component

**Files:**
- Create: `src/CustomHighlighter.tsx`

- [ ] **Step 1: Create src/CustomHighlighter.tsx**

```tsx
import { PrismAsyncLight } from 'react-syntax-highlighter';
import { currentTheme, isDarkMode } from './theme';
import { CopyButton } from './CopyButton';
import { LanguageLabel } from './LanguageLabel';

interface CustomHighlighterProps {
  lang: string;
  showLineNumbers: boolean;
  children: string;
}

export const CustomHighlighter = ({
  lang,
  showLineNumbers,
  children,
}: CustomHighlighterProps): JSX.Element => {
  const code = children.replace(/\n$/, '');
  const toolbarClass = isDarkMode ? 'cbs-toolbar-dark' : 'cbs-toolbar-light';

  return (
    <div className="cbs-codeblock-wrapper">
      <div className={`cbs-toolbar ${toolbarClass}`}>
        <LanguageLabel lang={lang} />
        <CopyButton text={code} />
      </div>
      <PrismAsyncLight
        language={lang}
        style={currentTheme}
        showLineNumbers={showLineNumbers}
        PreTag="div"
      >
        {code}
      </PrismAsyncLight>
    </div>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/CustomHighlighter.tsx
git commit -m "feat: add CustomHighlighter with Prism, copy button, line numbers, and language label"
```

---

### Task 6: CustomCodeBlock Component

**Files:**
- Create: `src/CustomCodeBlock.tsx`

- [ ] **Step 1: Create src/CustomCodeBlock.tsx**

This component replaces Growi's default `code` component. It receives props from `react-markdown`:
- `className` like `"language-javascript"` for the language
- `inline` prop or heuristic detection for inline vs block code
- `children` containing the code text
- Additional meta string from the code fence is passed through by remark

```tsx
import { CustomHighlighter } from './CustomHighlighter';
import type { CodeBlockProps } from './types';

function extractLanguage(className?: string): string {
  if (!className) return '';
  const match = className.match(/language-(\S+)/);
  return match ? match[1] : '';
}

function parseMetaString(props: Record<string, any>): { showLineNumbers: boolean } {
  // react-markdown passes unknown code fence meta tokens as props with value true
  // e.g., ```js showLineNumbers → props.showLineNumbers === true
  // Also check the node's meta/data for the raw meta string
  const showLineNumbers =
    props.showLineNumbers === true ||
    props.showlinenumbers === true ||
    (typeof props.node?.data?.meta === 'string' &&
      props.node.data.meta.includes('showLineNumbers'));

  return { showLineNumbers };
}

export const CustomCodeBlock = ({
  children,
  className,
  inline,
  node,
  ...rest
}: CodeBlockProps): JSX.Element => {
  // Inline code
  if (inline) {
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  }

  const lang = extractLanguage(className);
  const { showLineNumbers } = parseMetaString({ ...rest, node });
  const codeString = String(children);

  return (
    <CustomHighlighter lang={lang} showLineNumbers={showLineNumbers}>
      {codeString}
    </CustomHighlighter>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/CustomCodeBlock.tsx
git commit -m "feat: add CustomCodeBlock with language extraction and meta string parsing"
```

---

### Task 7: Plugin Entry Point

**Files:**
- Create: `client-entry.tsx`

- [ ] **Step 1: Create client-entry.tsx**

```tsx
import { registerLanguages } from './src/languages';
import { CustomCodeBlock } from './src/CustomCodeBlock';
import './src/styles.css';

declare global {
  var growiFacade: any;
  var pluginActivators: {
    [key: string]: {
      activate: () => void;
      deactivate: () => void;
    };
  };
}

const activate = (): void => {
  if (growiFacade == null || growiFacade.markdownRenderer == null) {
    return;
  }

  // Register all Prism languages
  registerLanguages();

  const { optionsGenerators } = growiFacade.markdownRenderer;

  // Preserve any previously installed custom options generator (plugin chaining)
  const originalCustomViewOptions = optionsGenerators.customGenerateViewOptions;
  const originalCustomPreviewOptions = optionsGenerators.customGeneratePreviewOptions;

  optionsGenerators.customGenerateViewOptions = (...args: any[]) => {
    const options = originalCustomViewOptions
      ? originalCustomViewOptions(...args)
      : optionsGenerators.generateViewOptions(...args);
    options.components.code = CustomCodeBlock;
    return options;
  };

  optionsGenerators.customGeneratePreviewOptions = (...args: any[]) => {
    const options = originalCustomPreviewOptions
      ? originalCustomPreviewOptions(...args)
      : optionsGenerators.generatePreviewOptions(...args);
    options.components.code = CustomCodeBlock;
    return options;
  };
};

const deactivate = (): void => {
  // No cleanup needed — reload to revert
};

if ((window as any).pluginActivators == null) {
  (window as any).pluginActivators = {};
}
(window as any).pluginActivators['growi-plugin-codeblock-style'] = {
  activate,
  deactivate,
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Build the plugin**

Run: `npm run build`
Expected: `dist/` directory created with:
- `dist/.vite/manifest.json` containing `client-entry.tsx` key
- `dist/assets/client-entry-*.js`
- `dist/assets/client-entry-*.css`

- [ ] **Step 4: Verify manifest structure**

Run: `cat dist/.vite/manifest.json`
Expected: JSON with structure like:
```json
{
  "client-entry.tsx": {
    "file": "assets/client-entry-HASH.js",
    "src": "client-entry.tsx",
    "isEntry": true,
    "css": ["assets/client-entry-HASH.css"]
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add client-entry.tsx
git commit -m "feat: add plugin entry point with facade hook registration"
```

---

### Task 8: Build Verification and Final Checks

**Files:**
- Modify: various (if fixes needed)

- [ ] **Step 1: Clean build**

Run: `rm -rf dist && npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Check bundle for CDN references**

Run: `grep -r "cdn" dist/ || echo "No CDN references found"`
Expected: "No CDN references found"

- [ ] **Step 3: Verify all language imports resolved**

Run: `npm run build 2>&1 | grep -i "warning\|error" || echo "No warnings or errors"`
Expected: No unresolved import warnings

- [ ] **Step 4: Create .gitignore**

```
node_modules/
```

Note: Do NOT gitignore `dist/` — Growi loads the plugin from the built dist directory.

- [ ] **Step 5: Final commit**

```bash
git add .gitignore dist/
git commit -m "chore: add built dist and gitignore"
```

---

## Language Import Path Reference

If any language import fails, check the actual file name in `node_modules/react-syntax-highlighter/dist/esm/languages/prism/`. Common mismatches:
- `html` → might be `markup`
- `xml` → might be `xml-doc` or part of `markup`
- `shell` → use `bash`
- `vba` → might be `visual-basic`
- `cshtml` → might be `razor` or `cshtml`
- `bat` → use `batch`
- `ignore` → might be `gitignore` or `.ignore`

Verify paths during Task 3 Step 2 and adjust as needed.
