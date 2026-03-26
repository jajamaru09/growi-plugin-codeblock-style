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
