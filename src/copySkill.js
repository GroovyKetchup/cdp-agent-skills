import { cp, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function copySkillDirectory(sourceDirectory, targetDirectory, options = {}) {
  if ((await exists(targetDirectory)) && !options.force) {
    return 'skipped';
  }

  if (options.force) {
    await rm(targetDirectory, { recursive: true, force: true });
  }

  await mkdir(path.dirname(targetDirectory), { recursive: true });
  await cp(sourceDirectory, targetDirectory, { recursive: true, force: true });
  return 'installed';
}
