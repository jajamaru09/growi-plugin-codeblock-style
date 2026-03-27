import './src/prismSetup';
import './src/styles.css';
import { remarkPrismDirective } from './src/remarkPrismDirective';
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

    // Add handler for :::prism containerDirective nodes
    // (Growi's built-in remark-directive does the parsing)
    if (!options.remarkPlugins) options.remarkPlugins = [];
    options.remarkPlugins.push(remarkPrismDirective);

    // Map <prism> element to our component
    if (!options.components) options.components = {};
    options.components.prism = CustomCodeBlock;

    return options;
  };

  optionsGenerators.customGeneratePreviewOptions = (...args: any[]) => {
    const options = originalCustomPreviewOptions
      ? originalCustomPreviewOptions(...args)
      : optionsGenerators.generatePreviewOptions(...args);

    if (!options.remarkPlugins) options.remarkPlugins = [];
    options.remarkPlugins.push(remarkPrismDirective);

    if (!options.components) options.components = {};
    options.components.prism = CustomCodeBlock;

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
