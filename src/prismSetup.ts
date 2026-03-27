// Side-effect imports to register Prism languages (order matters for dependencies)
// The languageRegistry in languageRegistry.ts provides metadata (aliases, display names).
// This file handles the actual Prism component registration.

// Prism core must be loaded before any component imports
import 'prismjs';

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
