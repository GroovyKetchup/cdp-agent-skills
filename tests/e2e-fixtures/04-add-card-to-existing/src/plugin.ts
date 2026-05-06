import type { EngineComponentPlugin } from 'cdp-material-sdk/portable';
import { components } from './components';

const plugin: EngineComponentPlugin = {
  id: '@acme/cdp-components',
  version: '0.1.0',
  install: (api) => {
    api.registerPackage({
      id: '@acme/cdp-components',
      version: '0.1.0',
      components,
    });
  },
};

export default plugin;
