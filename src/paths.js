import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function repoRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
}

export function skillsRoot() {
  return path.join(repoRoot(), 'skills');
}

export function resolveFromCwd(cwd, targetPath) {
  return path.isAbsolute(targetPath) ? targetPath : path.resolve(cwd, targetPath);
}

export function toPosixPath(value) {
  return value.replace(/\\/g, '/');
}
