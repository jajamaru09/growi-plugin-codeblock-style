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
