import { registerLanguages } from './src/languages';
import { CustomCodeBlock } from './src/CustomCodeBlock';
import './src/styles.css';

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

  // Register all Prism languages
  registerLanguages();

  const { optionsGenerators } = growiFacade.markdownRenderer;

  // Preserve any previously installed custom options generator (plugin chaining)
  const originalCustomViewOptions = optionsGenerators.customGenerateViewOptions;
  const originalCustomPreviewOptions = optionsGenerators.customGeneratePreviewOptions;

  optionsGenerators.customGenerateViewOptions = (...args: any[]) => {
    const options = originalCustomViewOptions
      ? originalCustomViewOptions(...args)
      : optionsGenerators.generateViewOptions(...args);
    if (!options.components) options.components = {};
    options.components.code = CustomCodeBlock;
    return options;
  };

  optionsGenerators.customGeneratePreviewOptions = (...args: any[]) => {
    const options = originalCustomPreviewOptions
      ? originalCustomPreviewOptions(...args)
      : optionsGenerators.generatePreviewOptions(...args);
    if (!options.components) options.components = {};
    options.components.code = CustomCodeBlock;
    return options;
  };
};

const deactivate = (): void => {
  // No cleanup needed — reload to revert
};

if ((window as any).pluginActivators == null) {
  (window as any).pluginActivators = {};
}
(window as any).pluginActivators['growi-plugin-codeblock-style'] = {
  activate,
  deactivate,
};
