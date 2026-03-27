# `:::code` Directive-Based Custom Code Block — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current "replace all code blocks" approach with a `:::code` directive that only renders custom code blocks when explicitly requested, leaving standard ``` blocks untouched.

**Architecture:** Add `remark-directive` to parse `:::code` container directives into AST nodes. A custom remark plugin transforms those nodes into `<cbs-code>` HAST elements. react-markdown maps `cbs-code` to the existing `CustomCodeBlock` component. Refactor the language/plugin system to a declarative registry pattern.

**Tech Stack:** remark-directive, unist-util-visit, Prism.js, React 18, Vite (IIFE bundle)

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/languageRegistry.ts` | Create | Declarative language registry — defines all languages, aliases, display names, dependencies |
| `src/prismPluginRegistry.ts` | Create | Declarative Prism plugin registry (initially empty, extensibility scaffold) |
| `src/prismSetup.ts` | Create | Reads registries and registers languages/plugins with Prism.js |
| `src/remarkCodeDirective.ts` | Create | Custom remark plugin — transforms `containerDirective[name=code]` to `<cbs-code>` HAST element |
| `src/CustomCodeBlock.tsx` | Modify | Update props to read from HAST properties instead of className parsing |
| `src/types.ts` | Modify | Update `CodeBlockProps` → `CbsCodeProps` for the new HAST-based props |
| `client-entry.tsx` | Modify | Replace `code` component override with remarkPlugins + `cbs-code` component mapping |
| `src/languages.ts` | Delete | Replaced by `languageRegistry.ts` + `prismSetup.ts` |
| `src/LanguageLabel.tsx` | Delete | Display names moved into `languageRegistry.ts` |
| `src/CustomHighlighter.tsx` | Unchanged | DOM rendering logic stays the same |
| `src/CopyButton.tsx` | Unchanged | Copy handler stays the same |
| `src/theme.ts` | Unchanged | Theme detection stays the same |
| `src/styles.css` | Unchanged | All CSS stays the same |
| `package.json` | Modify | Add `remark-directive` and `unist-util-visit` dependencies |

---

## Task 1: Add dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install remark-directive and unist-util-visit**

```bash
cd F:/Work/growi-plugin-codeblock-style
npm install remark-directive unist-util-visit
```

- [ ] **Step 2: Verify dependencies in package.json**

```bash
cat package.json | grep -E "remark-directive|unist-util-visit"
```

Expected: Both packages appear under `dependencies`.

- [ ] **Step 3: Verify build still works**

```bash
npm run build
```

Expected: Build succeeds (no code changes yet, just new deps).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add remark-directive and unist-util-visit"
```

---

## Task 2: Create declarative language registry

**Files:**
- Create: `src/languageRegistry.ts`

- [ ] **Step 1: Create `src/languageRegistry.ts` with full language registry**

This file replaces `src/languages.ts` (imports + alias map) and `src/LanguageLabel.tsx` (display names). All three concerns consolidated into one registry.

```ts
import Prism from 'prismjs';

export interface LanguageDef {
  id: string;
  aliases?: string[];
  displayName?: string;
  module: string;
  dependencies?: string[];
}

// Adding a language: add one entry to this array.
// - id: Prism canonical name (must match prismjs/components/prism-{id})
// - aliases: shorthand names users can type (e.g., 'js' for 'javascript')
// - displayName: shown in toolbar (falls back to id if omitted)
// - module: import path for side-effect import
// - dependencies: language ids that must be loaded first
export const languageRegistry: LanguageDef[] = [
  // --- Web / Frontend ---
  { id: 'markup-templating', module: 'prismjs/components/prism-markup-templating' },
  { id: 'javascript', aliases: ['js'], displayName: 'JavaScript', module: 'prismjs/components/prism-javascript' },
  { id: 'jsx', displayName: 'JSX', module: 'prismjs/components/prism-jsx', dependencies: ['markup-templating'] },
  { id: 'typescript', aliases: ['ts'], displayName: 'TypeScript', module: 'prismjs/components/prism-typescript', dependencies: ['javascript'] },
  { id: 'tsx', displayName: 'TSX', module: 'prismjs/components/prism-tsx', dependencies: ['typescript', 'jsx'] },
  { id: 'css', displayName: 'CSS', module: 'prismjs/components/prism-css' },
  { id: 'scss', displayName: 'SCSS', module: 'prismjs/components/prism-scss', dependencies: ['css'] },
  { id: 'json', displayName: 'JSON', module: 'prismjs/components/prism-json' },
  { id: 'yaml', aliases: ['yml'], displayName: 'YAML', module: 'prismjs/components/prism-yaml' },
  { id: 'toml', displayName: 'TOML', module: 'prismjs/components/prism-toml' },
  { id: 'graphql', displayName: 'GraphQL', module: 'prismjs/components/prism-graphql' },
  { id: 'regex', displayName: 'Regex', module: 'prismjs/components/prism-regex' },
  { id: 'markup', aliases: ['html', 'xml'], displayName: 'HTML', module: 'prismjs/components/prism-markup' },

  // --- Systems ---
  { id: 'c', displayName: 'C', module: 'prismjs/components/prism-c' },
  { id: 'cpp', displayName: 'C++', module: 'prismjs/components/prism-cpp', dependencies: ['c'] },
  { id: 'csharp', aliases: ['cs'], displayName: 'C#', module: 'prismjs/components/prism-csharp' },
  { id: 'rust', displayName: 'Rust', module: 'prismjs/components/prism-rust' },
  { id: 'go', displayName: 'Go', module: 'prismjs/components/prism-go' },
  { id: 'java', displayName: 'Java', module: 'prismjs/components/prism-java' },
  { id: 'swift', displayName: 'Swift', module: 'prismjs/components/prism-swift' },
  { id: 'kotlin', displayName: 'Kotlin', module: 'prismjs/components/prism-kotlin' },

  // --- Scripting ---
  { id: 'python', aliases: ['py'], displayName: 'Python', module: 'prismjs/components/prism-python' },
  { id: 'ruby', aliases: ['rb'], displayName: 'Ruby', module: 'prismjs/components/prism-ruby' },
  { id: 'bash', aliases: ['sh', 'shell'], displayName: 'Bash', module: 'prismjs/components/prism-bash' },
  { id: 'powershell', aliases: ['ps1'], displayName: 'PowerShell', module: 'prismjs/components/prism-powershell' },
  { id: 'perl', displayName: 'Perl', module: 'prismjs/components/prism-perl' },
  { id: 'php', displayName: 'PHP', module: 'prismjs/components/prism-php', dependencies: ['markup-templating'] },
  { id: 'batch', aliases: ['bat'], displayName: 'Batch', module: 'prismjs/components/prism-batch' },
  { id: 'autohotkey', aliases: ['ahk'], displayName: 'AutoHotkey', module: 'prismjs/components/prism-autohotkey' },

  // --- .NET / VB ---
  { id: 'visual-basic', aliases: ['vbnet', 'vba'], displayName: 'VB', module: 'prismjs/components/prism-visual-basic' },
  { id: 'cshtml', aliases: ['razor'], displayName: 'Razor C#', module: 'prismjs/components/prism-cshtml', dependencies: ['markup-templating'] },

  // --- Other ---
  { id: 'sql', displayName: 'SQL', module: 'prismjs/components/prism-sql' },
  { id: 'mongodb', displayName: 'MongoDB', module: 'prismjs/components/prism-mongodb' },
  { id: 'markdown', aliases: ['md'], displayName: 'Markdown', module: 'prismjs/components/prism-markdown' },
  { id: 'diff', displayName: 'Diff', module: 'prismjs/components/prism-diff' },
  { id: 'docker', aliases: ['dockerfile'], displayName: 'Docker', module: 'prismjs/components/prism-docker' },
  { id: 'git', displayName: 'Git', module: 'prismjs/components/prism-git' },
  { id: 'ignore', aliases: ['gitignore'], displayName: '.ignore', module: 'prismjs/components/prism-ignore' },
  { id: 'apacheconf', displayName: 'Apache Conf', module: 'prismjs/components/prism-apacheconf' },
  { id: 'apex', displayName: 'Apex', module: 'prismjs/components/prism-apex' },
  { id: 'arduino', displayName: 'Arduino', module: 'prismjs/components/prism-arduino', dependencies: ['cpp'] },
  { id: 'smalltalk', displayName: 'Smalltalk', module: 'prismjs/components/prism-smalltalk' },
];

// --- Derived lookup maps (auto-generated from registry) ---

const aliasMap: Record<string, string> = {};
const displayNameMap: Record<string, string> = {};

for (const def of languageRegistry) {
  if (def.displayName) {
    displayNameMap[def.id] = def.displayName;
  }
  if (def.aliases) {
    for (const alias of def.aliases) {
      aliasMap[alias] = def.id;
      if (def.displayName) {
        displayNameMap[alias] = def.displayName;
      }
    }
  }
}

export function resolveLanguage(lang: string): string {
  return aliasMap[lang] ?? lang;
}

export function getLanguageDisplayName(lang: string): string {
  return displayNameMap[lang] ?? lang;
}

export function highlightCode(code: string, lang: string): string {
  const resolved = resolveLanguage(lang);
  const grammar = Prism.languages[resolved];
  if (grammar) {
    return Prism.highlight(code, grammar, resolved);
  }
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors (the file is self-contained, no consumers yet).

- [ ] **Step 3: Commit**

```bash
git add src/languageRegistry.ts
git commit -m "feat: add declarative language registry"
```

---

## Task 3: Create Prism plugin registry scaffold

**Files:**
- Create: `src/prismPluginRegistry.ts`

- [ ] **Step 1: Create `src/prismPluginRegistry.ts`**

```ts
export interface PrismPluginDef {
  id: string;
  module: string;
  css?: string;
}

// Adding a Prism plugin: add one entry to this array.
// - id: plugin identifier
// - module: import path (e.g., 'prismjs/plugins/line-highlight/prism-line-highlight')
// - css: optional CSS import path for the plugin
export const prismPluginRegistry: PrismPluginDef[] = [
  // Example:
  // { id: 'line-highlight', module: 'prismjs/plugins/line-highlight/prism-line-highlight', css: 'prismjs/plugins/line-highlight/prism-line-highlight.css' },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/prismPluginRegistry.ts
git commit -m "feat: add Prism plugin registry scaffold"
```

---

## Task 4: Create prismSetup module

**Files:**
- Create: `src/prismSetup.ts`

- [ ] **Step 1: Create `src/prismSetup.ts`**

This replaces the side-effect imports in `languages.ts`. It uses **static side-effect imports** (Vite's IIFE build requires static import paths to bundle them). The `languageRegistry.ts` provides metadata (aliases, display names), while this file handles the actual Prism component registration.

```ts
// Side-effect imports to register Prism languages (order matters for dependencies)
// The languageRegistry in languageRegistry.ts provides metadata (aliases, display names).
// This file handles the actual Prism component registration.

// Web / Frontend
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-graphql';
import 'prismjs/components/prism-regex';

// Systems
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';

// Scripting
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-perl';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-batch';
import 'prismjs/components/prism-autohotkey';

// .NET / VB
import 'prismjs/components/prism-visual-basic';
import 'prismjs/components/prism-cshtml';

// Other
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-mongodb';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-git';
import 'prismjs/components/prism-ignore';
import 'prismjs/components/prism-apacheconf';
import 'prismjs/components/prism-apex';
import 'prismjs/components/prism-arduino';
import 'prismjs/components/prism-smalltalk';

// Prism plugins — add imports here when adding entries to prismPluginRegistry
// (none yet)
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/prismSetup.ts
git commit -m "feat: add prismSetup module for language/plugin registration"
```

---

## Task 5: Create remarkCodeDirective plugin

**Files:**
- Create: `src/remarkCodeDirective.ts`

- [ ] **Step 1: Create `src/remarkCodeDirective.ts`**

This is the custom remark plugin that transforms `containerDirective[name=code]` nodes into HAST-ready nodes.

```ts
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

// Type for containerDirective nodes created by remark-directive
interface ContainerDirective {
  type: 'containerDirective';
  name: string;
  attributes?: Record<string, string>;
  children: Array<{ type: string; children?: Array<{ type: string; value?: string }> }>;
  data?: Record<string, unknown>;
}

function parseDirectiveLabel(label: string): {
  lang: string;
  showLineNumbers: boolean;
  showToolbar: boolean;
} {
  const parts = label.split(':');
  const lang = parts[0] || '';
  const showLineNumbers = parts.some((p) => p === 'lineNumbers');
  const showToolbar = parts.some((p) => p === 'toolbar');
  return { lang, showLineNumbers, showToolbar };
}

function extractTextContent(node: ContainerDirective): { label: string; code: string } {
  // remark-directive places the directive label (e.g., "js:toolbar")
  // as text inside the first paragraph child, or in node.attributes.
  // The actual code content is in subsequent children.
  //
  // For :::code js:toolbar\nconst x = 42;\n:::
  // The AST typically looks like:
  //   containerDirective { name: 'code',
  //     children: [
  //       paragraph { children: [text { value: 'const x = 42;' }] }
  //     ]
  //   }
  // And the label "js:toolbar" is available via node.attributes or
  // the first "data" part after the directive name.
  //
  // remark-directive puts the text after :::code on the same line
  // into the `attributes` or the directive label. We need to check
  // the actual AST structure.
  //
  // According to remark-directive docs:
  //   :::code{lang=js}   → attributes: { lang: 'js' }
  //   :::code js:toolbar  → The "js:toolbar" becomes a label/text
  //
  // For `:::code js:toolbar`, remark-directive treats "js:toolbar"
  // as the directive's "label" (first text line) which ends up as
  // text content of a paragraph in children.
  //
  // Let's handle both: check if first child is a paragraph containing
  // just the label, and remaining children contain the code.

  let label = '';
  let codeLines: string[] = [];

  for (const child of node.children) {
    if (child.type === 'paragraph' && child.children) {
      const text = child.children
        .filter((c) => c.type === 'text')
        .map((c) => c.value ?? '')
        .join('');

      if (!label && /^[a-zA-Z0-9_-]+(:[a-zA-Z]+)*$/.test(text.trim())) {
        // This looks like a label (e.g., "js:toolbar:lineNumbers")
        label = text.trim();
      } else {
        codeLines.push(text);
      }
    } else if (child.type === 'code' || child.type === 'text') {
      codeLines.push((child as any).value ?? '');
    }
  }

  return { label, code: codeLines.join('\n') };
}

export function remarkCodeDirective() {
  return (tree: Root) => {
    visit(tree, 'containerDirective', (node: ContainerDirective) => {
      if (node.name !== 'code') return;

      const { label, code } = extractTextContent(node);
      const { lang, showLineNumbers, showToolbar } = parseDirectiveLabel(label);

      // Transform to HAST-ready node
      const data = node.data || (node.data = {});
      data.hName = 'cbs-code';
      data.hProperties = {
        lang,
        showToolbar: showToolbar ? 'true' : 'false',
        showLineNumbers: showLineNumbers ? 'true' : 'false',
        code,
      };
      // Clear children — the code is now in hProperties
      node.children = [];
    });
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors. May need to add `@types/mdast` if not already available through `remark-directive`.

If type errors occur for `mdast`, install:
```bash
npm install -D @types/mdast
```

- [ ] **Step 3: Commit**

```bash
git add src/remarkCodeDirective.ts
git commit -m "feat: add remarkCodeDirective remark plugin"
```

---

## Task 6: Update types.ts for new props

**Files:**
- Modify: `src/types.ts`

- [ ] **Step 1: Replace `CodeBlockProps` with `CbsCodeProps`**

Replace the entire content of `src/types.ts`:

```ts
export interface CbsCodeProps {
  lang?: string;
  showToolbar?: string;    // "true" or "false" — HAST attributes are strings
  showLineNumbers?: string;
  code?: string;
  children?: any;
  [key: string]: any;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: Errors in `CustomCodeBlock.tsx` (still imports old type) — expected, will fix in next task.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "refactor: update types for HAST-based cbs-code props"
```

---

## Task 7: Update CustomCodeBlock.tsx

**Files:**
- Modify: `src/CustomCodeBlock.tsx`

- [ ] **Step 1: Rewrite CustomCodeBlock to use new props**

Replace the entire content of `src/CustomCodeBlock.tsx`:

```tsx
import { renderCodeBlock } from './CustomHighlighter';
import type { CbsCodeProps } from './types';

// React component for <cbs-code> elements.
// IMPORTANT: No React hooks — the plugin bundles its own React
// which is a different instance from Growi's React, causing hook errors.
// We render pure DOM and mount it via a ref callback.
export const CustomCodeBlock = (props: CbsCodeProps) => {
  const lang = props.lang ?? '';
  const showToolbar = props.showToolbar === 'true';
  const showLineNumbers = props.showLineNumbers === 'true';
  const codeString = props.code ?? '';

  const refCallback = (el: HTMLDivElement | null) => {
    if (el && !el.hasChildNodes()) {
      const rendered = renderCodeBlock(codeString, lang, showLineNumbers, showToolbar);
      el.appendChild(rendered);
    }
  };

  return <div ref={refCallback} />;
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors (or errors only in `client-entry.tsx` which still uses old imports).

- [ ] **Step 3: Commit**

```bash
git add src/CustomCodeBlock.tsx
git commit -m "refactor: update CustomCodeBlock for HAST-based directive props"
```

---

## Task 8: Update CustomHighlighter.tsx imports

**Files:**
- Modify: `src/CustomHighlighter.tsx`

- [ ] **Step 1: Update imports to use languageRegistry**

In `src/CustomHighlighter.tsx`, change line 1:

Old:
```ts
import { highlightCode } from './languages';
```

New:
```ts
import { highlightCode } from './languageRegistry';
```

And change line 2:

Old:
```ts
import { getLanguageDisplayName } from './LanguageLabel';
```

New:
```ts
import { getLanguageDisplayName } from './languageRegistry';
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors in this file.

- [ ] **Step 3: Commit**

```bash
git add src/CustomHighlighter.tsx
git commit -m "refactor: update CustomHighlighter imports to use languageRegistry"
```

---

## Task 9: Update client-entry.tsx

**Files:**
- Modify: `client-entry.tsx`

- [ ] **Step 1: Rewrite client-entry.tsx for directive-based approach**

Replace the entire content of `client-entry.tsx`:

```tsx
import './src/prismSetup';
import './src/styles.css';
import remarkDirective from 'remark-directive';
import { remarkCodeDirective } from './src/remarkCodeDirective';
import { CustomCodeBlock } from './src/CustomCodeBlock';

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

  const { optionsGenerators } = growiFacade.markdownRenderer;

  const originalCustomViewOptions = optionsGenerators.customGenerateViewOptions;
  const originalCustomPreviewOptions = optionsGenerators.customGeneratePreviewOptions;

  optionsGenerators.customGenerateViewOptions = (...args: any[]) => {
    const options = originalCustomViewOptions
      ? originalCustomViewOptions(...args)
      : optionsGenerators.generateViewOptions(...args);

    // Add remark plugins for :::code directive
    if (!options.remarkPlugins) options.remarkPlugins = [];
    options.remarkPlugins.push(remarkDirective);
    options.remarkPlugins.push(remarkCodeDirective);

    // Map <cbs-code> to CustomCodeBlock component
    if (!options.components) options.components = {};
    options.components['cbs-code'] = CustomCodeBlock;

    return options;
  };

  optionsGenerators.customGeneratePreviewOptions = (...args: any[]) => {
    const options = originalCustomPreviewOptions
      ? originalCustomPreviewOptions(...args)
      : optionsGenerators.generatePreviewOptions(...args);

    if (!options.remarkPlugins) options.remarkPlugins = [];
    options.remarkPlugins.push(remarkDirective);
    options.remarkPlugins.push(remarkCodeDirective);

    if (!options.components) options.components = {};
    options.components['cbs-code'] = CustomCodeBlock;

    return options;
  };
};

const deactivate = (): void => {};

if ((window as any).pluginActivators == null) {
  (window as any).pluginActivators = {};
}
(window as any).pluginActivators['growi-plugin-codeblock-style'] = {
  activate,
  deactivate,
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: May see warnings about `remark-directive` types. If so:

```bash
npm install -D @types/remark-directive
```

Or add a type declaration in `src/vite-env.d.ts`:

```ts
declare module 'remark-directive';
```

- [ ] **Step 3: Commit**

```bash
git add client-entry.tsx
git commit -m "feat: switch to remark-directive for :::code custom blocks"
```

---

## Task 10: Delete old files

**Files:**
- Delete: `src/languages.ts`
- Delete: `src/LanguageLabel.tsx`

- [ ] **Step 1: Remove old language and label files**

```bash
cd F:/Work/growi-plugin-codeblock-style
git rm src/languages.ts src/LanguageLabel.tsx
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds. No file references the old modules.

- [ ] **Step 3: Commit**

```bash
git commit -m "refactor: remove old languages.ts and LanguageLabel.tsx (replaced by languageRegistry)"
```

---

## Task 11: Build and verify

**Files:**
- None (verification only)

- [ ] **Step 1: Clean build**

```bash
cd F:/Work/growi-plugin-codeblock-style
rm -rf dist
npm run build
```

Expected: Build succeeds, `dist/` is populated with the IIFE bundle and manifest.

- [ ] **Step 2: Check bundle includes remark-directive**

```bash
ls -la dist/assets/
```

Expected: Single JS bundle file. Check file size increased (remark-directive is ~15KB).

- [ ] **Step 3: Verify manifest**

```bash
cat dist/.vite/manifest.json
```

Expected: Entry point listed correctly.

- [ ] **Step 4: Commit (if any build config changes were needed)**

Only if changes were required:
```bash
git add -A
git commit -m "fix: resolve build issues for directive-based approach"
```

---

## Task 12: Integration testing in Growi

**Files:**
- None (manual testing)

- [ ] **Step 1: Install plugin in Growi test instance**

Copy the built `dist/` to the Growi plugins directory or configure via Growi admin.

- [ ] **Step 2: Test standard code blocks are untouched**

Create a page with:
````markdown
```js
const x = 42;
```
````

Expected: Renders with Growi's **default** code block styling (not the plugin's One Dark/One Light theme).

- [ ] **Step 3: Test :::code directive blocks**

Create a page with:
```markdown
:::code js
const x = 42;
:::

:::code js:toolbar
const y = 100;
:::

:::code js:lineNumbers:toolbar
function hello() {
  console.log('world');
}
:::

:::code
plain text block
:::
```

Expected:
- First block: Prism.js highlighted, no toolbar, no line numbers
- Second block: Prism.js highlighted, toolbar with "JavaScript" label and Copy button
- Third block: Prism.js highlighted, toolbar + line numbers
- Fourth block: Plain text, no highlighting

- [ ] **Step 4: Test dark/light theme**

Toggle Growi's theme. Reload page.

Expected: Plugin blocks switch between One Dark and One Light themes.

- [ ] **Step 5: Test Copy button**

Click Copy on a toolbar-enabled block.

Expected: Code copied to clipboard, button shows "Copied!" for 2 seconds.
