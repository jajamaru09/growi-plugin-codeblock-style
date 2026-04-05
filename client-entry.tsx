import './src/prismSetup';
import './src/styles.css';
import { remarkPrismDirective } from './src/remarkPrismDirective';
import { PrismDirectiveBlock, createCodeComponent } from './src/CustomCodeBlock';

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

  const growiReact = growiFacade.react;
  const { optionsGenerators } = growiFacade.markdownRenderer;

  const originalCustomViewOptions = optionsGenerators.customGenerateViewOptions;
  const originalCustomPreviewOptions = optionsGenerators.customGeneratePreviewOptions;

  optionsGenerators.customGenerateViewOptions = (...args: any[]) => {
    const options = originalCustomViewOptions
      ? originalCustomViewOptions(...args)
      : optionsGenerators.generateViewOptions(...args);

    // Add remark plugin for both :::prism and ```prism-* handling
    if (!options.remarkPlugins) options.remarkPlugins = [];
    options.remarkPlugins.push(remarkPrismDirective);

    if (!options.components) options.components = {};

    // :::prism directive → PrismDirectiveBlock
    options.components.prism = PrismDirectiveBlock;

    // ```prism-* fenced code → custom, else → Growi's original
    const OriginalCode = options.components.code;
    options.components.code = createCodeComponent(OriginalCode, growiReact);

    return options;
  };

  optionsGenerators.customGeneratePreviewOptions = (...args: any[]) => {
    const options = originalCustomPreviewOptions
      ? originalCustomPreviewOptions(...args)
      : optionsGenerators.generatePreviewOptions(...args);

    if (!options.remarkPlugins) options.remarkPlugins = [];
    options.remarkPlugins.push(remarkPrismDirective);

    if (!options.components) options.components = {};

    options.components.prism = PrismDirectiveBlock;

    const OriginalCode = options.components.code;
    options.components.code = createCodeComponent(OriginalCode, growiReact);

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
