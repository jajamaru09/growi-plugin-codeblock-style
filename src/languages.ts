import Prism from 'prismjs';

// Prism core includes: markup, css, clike, javascript by default
// Import additional languages (order matters for dependencies)

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

// Language alias map for resolving common aliases
const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rb: 'ruby',
  sh: 'bash',
  shell: 'bash',
  ps1: 'powershell',
  bat: 'batch',
  ahk: 'autohotkey',
  cs: 'csharp',
  yml: 'yaml',
  md: 'markdown',
  dockerfile: 'docker',
  gitignore: 'ignore',
  razor: 'cshtml',
  vba: 'visual-basic',
  vbnet: 'visual-basic',
  html: 'markup',
  xml: 'markup',
};

export function resolveLanguage(lang: string): string {
  const resolved = LANGUAGE_ALIASES[lang] || lang;
  return resolved;
}

export function highlightCode(code: string, lang: string): string {
  const resolved = resolveLanguage(lang);
  const grammar = Prism.languages[resolved];
  if (grammar) {
    return Prism.highlight(code, grammar, resolved);
  }
  // Fallback: return escaped HTML
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
