const PLUGIN_NAME = 'growi-plugin-codeblock-style';

export function debug(label: string, data?: unknown): void {
  const hub = (window as any).growiPluginHub;
  if (!hub?.log) return;
  if (data !== undefined) {
    hub.log(PLUGIN_NAME, label, data);
  } else {
    hub.log(PLUGIN_NAME, label);
  }
}
