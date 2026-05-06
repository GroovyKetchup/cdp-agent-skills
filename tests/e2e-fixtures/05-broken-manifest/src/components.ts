import type { EngineComponentRegistration } from 'cdp-material-sdk/portable';
import { ColorField } from './components/ColorField';
import colorFieldManifest from './components/ColorField/manifest';

export const components: EngineComponentRegistration[] = [
  { manifest: colorFieldManifest, component: ColorField },
];
