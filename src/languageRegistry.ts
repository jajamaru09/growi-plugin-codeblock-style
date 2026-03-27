import Prism from 'prismjs';

export interface LanguageDef {
  id: string;
  aliases?: string[];
  displayName?: string;
  aliasDisplayNames?: Record<string, string>;
  module: string;
  dependencies?: string[];
}

// Adding a language: add one entry to this array.
// NOTE: `module` and `dependencies` are documentation only — actual Prism
// registration happens via static imports in prismSetup.ts. When adding a
// language here, also add the corresponding import in prismSetup.ts.
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
  { id: 'markup', aliases: ['html', 'xml'], displayName: 'HTML', aliasDisplayNames: { xml: 'XML' }, module: 'prismjs/components/prism-markup' },

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
  { id: 'bash', aliases: ['sh', 'shell'], displayName: 'Bash', aliasDisplayNames: { sh: 'Shell', shell: 'Shell' }, module: 'prismjs/components/prism-bash' },
  { id: 'powershell', aliases: ['ps1'], displayName: 'PowerShell', module: 'prismjs/components/prism-powershell' },
  { id: 'perl', displayName: 'Perl', module: 'prismjs/components/prism-perl' },
  { id: 'php', displayName: 'PHP', module: 'prismjs/components/prism-php', dependencies: ['markup-templating'] },
  { id: 'batch', aliases: ['bat'], displayName: 'Batch', module: 'prismjs/components/prism-batch' },
  { id: 'autohotkey', aliases: ['ahk'], displayName: 'AutoHotkey', module: 'prismjs/components/prism-autohotkey' },

  // --- .NET / VB ---
  { id: 'visual-basic', aliases: ['vbnet', 'vba'], displayName: 'VB', aliasDisplayNames: { vbnet: 'VB.NET', vba: 'VBA' }, module: 'prismjs/components/prism-visual-basic' },
  { id: 'cshtml', aliases: ['razor'], displayName: 'Razor C#', module: 'prismjs/components/prism-cshtml', dependencies: ['markup-templating'] },

  // --- Other ---
  { id: 'sql', displayName: 'SQL', module: 'prismjs/components/prism-sql' },
  { id: 'mongodb', displayName: 'MongoDB', module: 'prismjs/components/prism-mongodb' },
  { id: 'markdown', aliases: ['md'], displayName: 'Markdown', module: 'prismjs/components/prism-markdown' },
  { id: 'diff', displayName: 'Diff', module: 'prismjs/components/prism-diff' },
  { id: 'docker', aliases: ['dockerfile'], displayName: 'Docker', aliasDisplayNames: { dockerfile: 'Dockerfile' }, module: 'prismjs/components/prism-docker' },
  { id: 'git', displayName: 'Git', module: 'prismjs/components/prism-git' },
  { id: 'ignore', aliases: ['gitignore'], displayName: '.ignore', aliasDisplayNames: { gitignore: '.gitignore' }, module: 'prismjs/components/prism-ignore' },
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
      // Per-alias display name takes priority, then falls back to parent displayName
      const aliasName = def.aliasDisplayNames?.[alias] ?? def.displayName;
      if (aliasName) {
        displayNameMap[alias] = aliasName;
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
