import assert from 'node:assert/strict';
import { mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { installSkills } from '../../src/install.js';

async function tempWorkspace() {
  return mkdtemp(path.join(tmpdir(), 'cdp-agent-skills-'));
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

test('installs all skills to a skills-directory agent target', async () => {
  const cwd = await tempWorkspace();

  const result = await installSkills({
    agent: 'windsurf',
    all: true,
    yes: true,
    cwd,
  });

  assert.equal(result.installed.length, 7);
  assert.equal(await exists(path.join(cwd, '.windsurf/skills/cdp-component-getting-started/SKILL.md')), true);
});

test('installs a subset to qwen-code target', async () => {
  const cwd = await tempWorkspace();

  const result = await installSkills({
    agent: 'qwen-code',
    skills: ['cdp-component-getting-started'],
    yes: true,
    cwd,
  });

  assert.deepEqual(result.installed, ['cdp-component-getting-started']);
  assert.equal(await exists(path.join(cwd, '.qwen/skills/cdp-component-getting-started/SKILL.md')), true);
  assert.equal(await exists(path.join(cwd, '.qwen/skills/cdp-component-wrap-react-library/SKILL.md')), false);
});

test('installs Antigravity resources and AGENTS.md managed block', async () => {
  const cwd = await tempWorkspace();

  await installSkills({
    agent: 'antigravity',
    skills: ['cdp-component-getting-started'],
    yes: true,
    cwd,
  });

  assert.equal(await exists(path.join(cwd, '.antigravity/skills/cdp-component-getting-started/SKILL.md')), true);
  const agents = await readFile(path.join(cwd, 'AGENTS.md'), 'utf8');
  assert.match(agents, /cdp-agent-skills:start/);
  assert.match(agents, /\.antigravity\/skills\/cdp-component-getting-started\/SKILL\.md/);
});

test('installs Trae resources and project rules managed block', async () => {
  const cwd = await tempWorkspace();

  await installSkills({
    agent: 'trae',
    skills: ['cdp-component-getting-started'],
    yes: true,
    cwd,
  });

  assert.equal(await exists(path.join(cwd, '.trae/rules/cdp-agent-skills/cdp-component-getting-started/SKILL.md')), true);
  const rules = await readFile(path.join(cwd, '.trae/rules/project_rules.md'), 'utf8');
  assert.match(rules, /cdp-agent-skills:start/);
  assert.match(rules, /\.trae\/rules\/cdp-agent-skills\/cdp-component-getting-started\/SKILL\.md/);
});

test('repeat install skips existing skill unless force is set', async () => {
  const cwd = await tempWorkspace();
  const skillPath = path.join(cwd, '.opencode/skills/cdp-component-getting-started/SKILL.md');

  await installSkills({
    agent: 'opencode',
    skills: ['cdp-component-getting-started'],
    yes: true,
    cwd,
  });
  await writeFile(skillPath, 'custom user content');

  const skipped = await installSkills({
    agent: 'opencode',
    skills: ['cdp-component-getting-started'],
    yes: true,
    cwd,
  });
  assert.deepEqual(skipped.skipped, ['cdp-component-getting-started']);
  assert.equal(await readFile(skillPath, 'utf8'), 'custom user content');

  const overwritten = await installSkills({
    agent: 'opencode',
    skills: ['cdp-component-getting-started'],
    yes: true,
    force: true,
    cwd,
  });
  assert.deepEqual(overwritten.installed, ['cdp-component-getting-started']);
  assert.notEqual(await readFile(skillPath, 'utf8'), 'custom user content');
});
