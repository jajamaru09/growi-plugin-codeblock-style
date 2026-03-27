# Design: `:::code` Directive-Based Custom Code Block

## Background

The plugin currently replaces Growi's `code` component entirely, meaning all ``` code blocks are rendered through the plugin's Prism.js-based highlighter. This makes it impossible to use Growi's standard code block rendering.

## Goal

- Standard ``` code blocks remain untouched (Growi default rendering)
- `:::code` directive blocks are rendered by the plugin with custom Prism.js highlighting, toolbar, line numbers, and theming

## Syntax

```markdown
:::code js
const x = 42;
:::

:::code js:toolbar
const x = 42;
:::

:::code js:lineNumbers:toolbar
const x = 42;
:::

:::code
Plain text (no language)
:::
```

Format: `:::code <lang>:<option1>:<option2>`

Options: `toolbar`, `lineNumbers` (same as current)

## Architecture

```
Markdown text
  |
  v
remark-directive (parses :::code into containerDirective AST node)
  |
  v
remarkCodeDirective (transforms containerDirective[name=code] -> custom HAST element)
  |
  v
react-markdown (maps custom element -> React component)
  |
  v
CustomCodeBlock (Prism.js highlighting + toolbar + line numbers)
```

## Key Design Decisions

### 1. remark-directive for parsing

- `remark-directive` is the standard remark plugin for `:::` container directive syntax
- Growi's plugin API supports adding remark plugins via `options.remarkPlugins.push()`
- The plugin handles all parsing edge cases (nested content, escaping, etc.)

### 2. Custom HAST element for component mapping

The custom remark plugin transforms `containerDirective[name=code]` nodes by setting:
- `data.hName = 'cbs-code'` (custom HTML element name)
- `data.hProperties = { lang, showToolbar, showLineNumbers }` (attributes)

react-markdown then maps `cbs-code` to the `CustomCodeBlock` React component via `options.components['cbs-code']`.

### 3. No more `code` component replacement

The existing `code` component override is removed. Standard ``` code blocks pass through Growi's default renderer unchanged.

## File Changes

### New Files

**`src/remarkCodeDirective.ts`**
- Custom remark plugin
- Visits `containerDirective` nodes where `name === 'code'`
- Parses the directive label (e.g., `js:toolbar:lineNumbers`) into lang and options
- Extracts text content from children
- Sets `data.hName`, `data.hProperties`, `data.hChildren` for HAST conversion

### Modified Files

**`client-entry.tsx`**
- Remove `code` component replacement
- Add `remarkDirective` and `remarkCodeDirective` to `options.remarkPlugins`
- Add `options.components['cbs-code'] = CustomCodeBlock` for the custom element

**`src/CustomCodeBlock.tsx`**
- Change props interface: read from HAST properties (`lang`, `showToolbar`, `showLineNumbers`) instead of parsing `className`
- Remove inline code detection (no longer relevant since `:::code` is always block-level)
- Rendering logic (ref callback + DOM mounting) remains the same

### Unchanged Files

- `src/CustomHighlighter.tsx` — DOM rendering logic unchanged
- `src/CopyButton.tsx` — copy functionality unchanged
- `src/LanguageLabel.tsx` — language display names unchanged
- `src/languages.ts` — Prism.js language registration unchanged
- `src/styles.css` — all styling unchanged
- `src/theme.ts` — theme detection unchanged
- `src/types.ts` — may need minor updates for new props

### Dependencies

```
+ remark-directive
+ unist-util-visit
```

## Component Data Flow

```
:::code js:toolbar
const x = 42;
:::
```

1. remark-directive parses into:
   ```
   containerDirective { name: 'code', children: [paragraph[text('js:toolbar')], ...code content...] }
   ```

2. remarkCodeDirective transforms to HAST-ready node:
   ```
   { data: { hName: 'cbs-code', hProperties: { lang: 'js', showToolbar: true, showLineNumbers: false, code: 'const x = 42;' } } }
   ```

3. react-markdown renders `<cbs-code lang="js" showToolbar="true" code="const x = 42;" />`

4. CustomCodeBlock receives props and renders via DOM (same as current approach)

## Extensible Language & Plugin Registry

Current `languages.ts` has hardcoded imports and alias mappings scattered across the file. Refactor to a **declarative registry** so that adding a language or Prism plugin requires only one line change.

### Language Registry (`src/languages.ts`)

```ts
interface LanguageDef {
  id: string;             // Prism canonical name
  aliases?: string[];     // shorthand aliases (e.g., ['js'] for 'javascript')
  module: string;         // import path (e.g., 'prismjs/components/prism-javascript')
  dependencies?: string[];// languages that must be loaded first (e.g., 'markup' for JSX)
}

// Adding a language = adding one entry here
const languageRegistry: LanguageDef[] = [
  { id: 'javascript', aliases: ['js'], module: 'prismjs/components/prism-javascript' },
  { id: 'typescript', aliases: ['ts'], module: 'prismjs/components/prism-typescript', dependencies: ['javascript'] },
  // ...
];
```

- `registerAllLanguages()` iterates the registry, resolves dependencies, and imports modules
- Alias map is auto-generated from the registry (no separate maintenance)
- `highlightCode()` interface remains the same

### Prism Plugin Registry (`src/prismPlugins.ts` — new)

```ts
interface PrismPluginDef {
  id: string;             // plugin identifier
  module: string;         // import path (e.g., 'prismjs/plugins/line-highlight/prism-line-highlight')
  css?: string;           // optional CSS import path
}

const pluginRegistry: PrismPluginDef[] = [
  // Add Prism plugins here as needed
];
```

- Plugins are loaded after languages during `activate()`
- CSS for plugins is injected alongside `styles.css`

### Display Name Registry (`src/LanguageLabel.tsx`)

The existing display name map is kept as-is but co-located with the language registry:
- `LanguageDef` gains an optional `displayName` field
- `getLanguageDisplayName()` reads from registry first, falls back to raw id

### File Changes

- `src/languages.ts` — refactor to registry pattern
- `src/prismPlugins.ts` — new file for plugin registry (initially empty)
- `src/LanguageLabel.tsx` — simplify by reading displayName from language registry

## Testing Considerations

- Verify standard ``` code blocks render with Growi's default styling
- Verify `:::code` blocks render with plugin styling
- Test all option combinations: no options, toolbar only, lineNumbers only, both
- Test with and without language specification
- Test dark/light theme switching
- Verify no dual-React hook conflicts (existing DOM-based approach should prevent this)
