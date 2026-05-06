import type { EngineComponentRegistration } from 'cdp-material-sdk/portable';
import { MyForm } from './components/MyForm';
import myFormManifest from './components/MyForm/manifest';

export const components: EngineComponentRegistration[] = [
  { manifest: myFormManifest, component: MyForm },
];
