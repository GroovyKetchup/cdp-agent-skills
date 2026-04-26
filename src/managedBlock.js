import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { toPosixPath } from './paths.js';

export const MANAGED_START = '<!-- cdp-agent-skills:start -->';
export const MANAGED_END = '<!-- cdp-agent-skills:end -->';

export function renderManagedBlock({ agent, skills, cwd, resourceRoot }) {
  const lines = [
    MANAGED_START,
    '# CDP Agent Skills',
    '',
    'Use these local skills when the user asks for CDP component development, wrapping React components, declaring manifests, or validating component packages.',
    '',
    `Agent target: ${agent.label}`,
    '',
    'Installed skills:',
  ];

  for (const skill of skills) {
    const skillFile = path.join(resourceRoot, skill.id, 'SKILL.md');
    const relativeSkillFile = toPosixPath(path.relative(cwd, skillFile));
    lines.push(`- ${skill.id}: ${relativeSkillFile}`);
  }

  lines.push('', 'Load the relevant SKILL.md before making CDP component changes.', MANAGED_END, '');
  return lines.join('\n');
}

export async function upsertManagedBlock(filePath, block) {
  await mkdir(path.dirname(filePath), { recursive: true });

  let existing = '';
  try {
    existing = await readFile(filePath, 'utf8');
  } catch {
    existing = '';
  }

  const start = existing.indexOf(MANAGED_START);
  const end = existing.indexOf(MANAGED_END);

  if (start !== -1 && end !== -1 && end > start) {
    const before = existing.slice(0, start).trimEnd();
    const after = existing.slice(end + MANAGED_END.length).trimStart();
    const next = [before, block.trimEnd(), after].filter(Boolean).join('\n\n');
    await writeFile(filePath, `${next}\n`);
    return 'updated';
  }

  const next = existing.trim().length > 0 ? `${existing.trimEnd()}\n\n${block}` : block;
  await writeFile(filePath, next);
  return 'created';
}
