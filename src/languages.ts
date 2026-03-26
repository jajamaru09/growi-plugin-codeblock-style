import { PrismAsyncLight } from 'react-syntax-highlighter';

// Web
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import xmlDoc from 'react-syntax-highlighter/dist/esm/languages/prism/xml-doc';
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

// .NET/VB
import vbnet from 'react-syntax-highlighter/dist/esm/languages/prism/vbnet';
import visualBasic from 'react-syntax-highlighter/dist/esm/languages/prism/visual-basic';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – no type declaration shipped for cshtml
import cshtml from 'react-syntax-highlighter/dist/esm/languages/prism/cshtml';

// Other
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – no type declaration shipped for mongodb
import mongodb from 'react-syntax-highlighter/dist/esm/languages/prism/mongodb';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import diff from 'react-syntax-highlighter/dist/esm/languages/prism/diff';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';
import git from 'react-syntax-highlighter/dist/esm/languages/prism/git';
import ignore from 'react-syntax-highlighter/dist/esm/languages/prism/ignore';
import apacheconf from 'react-syntax-highlighter/dist/esm/languages/prism/apacheconf';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – no type declaration shipped for apex
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
  PrismAsyncLight.registerLanguage('html', markup);
  PrismAsyncLight.registerLanguage('markup', markup);
  PrismAsyncLight.registerLanguage('xml', xmlDoc);
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

  // .NET/VB
  PrismAsyncLight.registerLanguage('vbnet', vbnet);
  PrismAsyncLight.registerLanguage('vba', visualBasic);
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
