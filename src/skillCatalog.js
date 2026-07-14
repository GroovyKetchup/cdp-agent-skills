import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import { skillsRoot } from './paths.js';

export const SKILL_IDS = [
  'cdp-component-getting-started',
  'cdp-component-add-to-existing-package',
  'cdp-component-manifest-basics',
  'cdp-component-traits',
  'cdp-component-events-actions-state',
  'cdp-component-slots',
  'cdp-component-runtime-behavior',
  'cdp-component-adapter-and-wrap',
  'cdp-component-manifest-validation',
];

export function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    throw new Error('Missing YAML frontmatter');
  }

  const metadata = {};
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');
    if (separator === -1) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['\"]|['\"]$/g, '');
    metadata[key] = value;
  }
  return metadata;
}

export async function readSkill(id, options = {}) {
  const root = options.skillsDir ?? skillsRoot();
  const skillFile = path.join(root, id, 'SKILL.md');
  const content = await readFile(skillFile, 'utf8');
  const metadata = parseFrontmatter(content);
  return {
    id,
    name: metadata.name,
    description: metadata.description,
    directory: path.join(root, id),
    skillFile,
    content,
  };
}

export async function listSkills(options = {}) {
  const root = options.skillsDir ?? skillsRoot();
  const entries = new Set(await readdir(root));
  const skills = [];
  for (const id of SKILL_IDS) {
    if (!entries.has(id)) {
      throw new Error(`Missing skill directory: ${id}`);
    }
    const skill = await readSkill(id, { skillsDir: root });
    if (skill.name !== id) {
      throw new Error(`Skill name mismatch: ${id}`);
    }
    skills.push(skill);
  }
  return skills;
}
