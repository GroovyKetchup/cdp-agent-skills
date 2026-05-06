import type { EngineComponentRegistration } from 'cdp-material-sdk/portable';
import { OldButton } from './components/OldButton';
import oldButtonManifest from './components/OldButton/manifest';

export const components: EngineComponentRegistration[] = [
  { manifest: oldButtonManifest, component: OldButton },
];
