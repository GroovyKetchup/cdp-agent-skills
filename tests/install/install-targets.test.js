import assert from 'node:assert/strict';
import { mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { installSkills } from '../../src/install.js';

const expectedReferences = {
  'cdp-component-getting-started': [
    'project-structure.md',
    'manifest-minimum.md',
    'component-package-plugin.md',
    'build-config.md',
    'validation.md',
  ],
  'cdp-component-add-to-existing-package': [
    'existing-package-discovery.md',
    'add-component-minimum.md',
    'registration-and-validation.md',
  ],
  'cdp-component-manifest-basics': ['manifest-basics.md'],
  'cdp-component-traits': ['traits.md'],
  'cdp-component-events-actions-state': ['events-actions-state.md'],
  'cdp-component-slots': ['slots.md'],
  'cdp-component-runtime-behavior': ['runtime-behavior.md'],
  'cdp-component-adapter-and-wrap': ['adapter-and-wrap.md'],
  'cdp-component-manifest-validation': [
    'validation-script.md',
    'validation-rules.md',
    'diagnostics.md',
  ],
};

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

  assert.equal(result.installed.length, 9);
  assert.equal(await exists(path.join(cwd, '.windsurf/skills/cdp-component-getting-started/SKILL.md')), true);

  for (const [skillId, references] of Object.entries(expectedReferences)) {
    for (const reference of references) {
      const installedReference = path.join(cwd, '.windsurf/skills', skillId, 'references', reference);
      assert.equal(await exists(installedReference), true);
      const content = await readFile(installedReference, 'utf8');
      assert.match(content, /sdk-docs:[\s\S]*?cdp-material-sdk\/docs\/component-development\//);
      assert.match(content, /本文件只提供 SDK 文档导航/);
      assert.doesNotMatch(content, /source: docs\/组件开发\//);
    }
  }
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
  assert.equal(await exists(path.join(cwd, '.qwen/skills/cdp-component-adapter-and-wrap/SKILL.md')), false);
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
