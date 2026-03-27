import './src/prismSetup';
import './src/styles.css';
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

    // Add remark plugin for :::code directive
    if (!options.remarkPlugins) options.remarkPlugins = [];
    options.remarkPlugins.push(remarkCodeDirective);

    // Replace code component — CustomCodeBlock handles both:
    // - :::code blocks (CBS_MARKER in className → custom rendering)
    // - standard ``` blocks (no marker → pass through to default)
    if (!options.components) options.components = {};
    options.components.code = CustomCodeBlock;

    return options;
  };

  optionsGenerators.customGeneratePreviewOptions = (...args: any[]) => {
    const options = originalCustomPreviewOptions
      ? originalCustomPreviewOptions(...args)
      : optionsGenerators.generatePreviewOptions(...args);

    if (!options.remarkPlugins) options.remarkPlugins = [];
    options.remarkPlugins.push(remarkCodeDirective);

    if (!options.components) options.components = {};
    options.components.code = CustomCodeBlock;

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
