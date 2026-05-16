import './src/prismSetup';
import './src/styles.css';
import { remarkPrismDirective } from './src/remarkPrismDirective';
import { PrismDirectiveBlock, createCodeComponent } from './src/CustomCodeBlock';
import { debug } from './src/debug';

declare global {
  var growiFacade: any;
  var pluginActivators: {
    [key: string]: {
      activate: () => void;
      deactivate: () => void;
    };
  };
}

const PLUGIN_NAME = 'growi-plugin-codeblock-style';
let isDisabled = false;

function registerToHub(plugin: any): void {
  const hub = (window as any).growiPluginHub;
  if (hub?.register) {
    hub.register(plugin);
    debug('activate: registered to hub');
  } else {
    (window as any).growiPluginHub ??= { _queue: [] };
    (window as any).growiPluginHub._queue.push(plugin);
    debug('activate: queued (hub not ready)');
  }
}

const activate = (): void => {
  debug('activate: start');
  if (growiFacade == null || growiFacade.markdownRenderer == null) {
    debug('activate: aborted (growiFacade unavailable)');
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

    if (isDisabled) {
      debug('generateViewOptions: skipped (disabled)');
      return options;
    }

    debug('generateViewOptions called');

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

    if (isDisabled) {
      debug('generatePreviewOptions: skipped (disabled)');
      return options;
    }

    debug('generatePreviewOptions called');

    if (!options.remarkPlugins) options.remarkPlugins = [];
    options.remarkPlugins.push(remarkPrismDirective);

    if (!options.components) options.components = {};

    options.components.prism = PrismDirectiveBlock;

    const OriginalCode = options.components.code;
    options.components.code = createCodeComponent(OriginalCode, growiReact);

    return options;
  };

  debug('activate: hooks installed');

  registerToHub({
    id: PLUGIN_NAME,
    label: 'コードブロックスタイル',
    icon: 'code',
    order: 20,
    menuItem: false,
    onDisable: () => {
      debug('onDisable: fired');
      isDisabled = true;
    },
  });
};

const deactivate = (): void => {
  debug('deactivate: unregistering');
  (window as any).growiPluginHub?.unregister?.(PLUGIN_NAME);
};

if ((window as any).pluginActivators == null) {
  (window as any).pluginActivators = {};
}
(window as any).pluginActivators[PLUGIN_NAME] = {
  activate,
  deactivate,
};
