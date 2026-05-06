import type { EngineComponentPlugin, EnginePluginAPI } from 'cdp-material-sdk/portable';
import { components } from './components';

const plugin: EngineComponentPlugin = {
  id: '@acme/cdp-components',
  version: '0.1.0',
  install: (api: EnginePluginAPI) => {
    api.registerPackage({
      id: '@acme/cdp-components',
      version: '0.1.0',
      components,
    });
  },
};

export default plugin;
