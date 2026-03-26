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
