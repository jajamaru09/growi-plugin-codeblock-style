export interface CbsCodeProps {
  lang?: string;
  showToolbar?: string;    // "true" or "false" — HAST attributes are strings
  showLineNumbers?: string;
  code?: string;
  children?: any;
  [key: string]: any;
}
