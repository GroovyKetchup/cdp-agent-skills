import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import { listSkills, SKILL_IDS } from '../../src/skillCatalog.js';
import { repoRoot } from '../../src/paths.js';

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

test('catalog lists the nine CDP component skills', async () => {
  const skills = await listSkills();

  assert.deepEqual(skills.map((skill) => skill.id), SKILL_IDS);
  assert.equal(skills.length, 9);
});

test('each skill has matching frontmatter and a trigger-focused description', async () => {
  const skills = await listSkills();

  for (const skill of skills) {
    assert.equal(skill.name, skill.id);
    assert.match(skill.description, /Use when/);
    assert.doesNotMatch(skill.content, /src\/engine|src\\engine|src\/protocol|src\\protocol/);
    assert.match(skill.content, /维护来源/);
    assert.doesNotMatch(skill.content, /## 权威来源/);
  }
});

test('skill bodies use the 9-skill Chinese section contract', async () => {
  const skills = await listSkills();

  for (const skill of skills) {
    assert.match(skill.content, /## 概述/, `${skill.id} missing 概述`);
    assert.match(skill.content, /## 何时使用/, `${skill.id} missing 何时使用`);
    assert.match(skill.content, /## 工作流程|## 阶段路线图/, `${skill.id} missing 工作流程 or 阶段路线图`);
    assert.match(skill.content, /## 引导路径/, `${skill.id} missing 引导路径`);
    assert.match(skill.content, /## 完成检查/, `${skill.id} missing 完成检查`);
    assert.match(skill.content, /## 维护来源/, `${skill.id} missing 维护来源`);
    assert.doesNotMatch(skill.content, /## When to use|## Workflow|## Completion checklist|## Authoritative sources/, `${skill.id} contains English headings`);
  }
});

test('each skill points at SDK-shipped documentation and the public portable entry', async () => {
  const skills = await listSkills();

  for (const skill of skills) {
    assert.match(skill.content, /cdp-material-sdk/, `${skill.id} should mention cdp-material-sdk`);
    assert.match(skill.content, /cdp-material-sdk\/portable/, `${skill.id} should reference cdp-material-sdk/portable`);
    assert.match(skill.content, /node_modules\/cdp-material-sdk\/docs\/component-development/, `${skill.id} should reference node_modules SDK docs path`);
    assert.match(skill.content, /cdp-material-sdk\/docs\/component-development/, `${skill.id} should reference SDK component-development docs root`);
    assert.doesNotMatch(skill.content, /CDP 主仓 `docs\/组件开发` 是组件开发文档事实源/, `${skill.id} should not reference legacy CDP host docs path`);
  }
});

test('each skill keeps references/ as SDK navigation and fallback', async () => {
  const skills = await listSkills();

  for (const skill of skills) {
    assert.match(skill.content, /references\//, `${skill.id} should reference its references/ directory`);

    const referenceRoot = path.join(skill.directory, 'references');
    const files = await readdir(referenceRoot);
    assert.deepEqual(files.sort(), expectedReferences[skill.id].sort(), `${skill.id} references mismatch`);

    for (const file of expectedReferences[skill.id]) {
      const reference = await readFile(path.join(referenceRoot, file), 'utf8');
      assert.match(reference, /sdk-docs:[\s\S]*?cdp-material-sdk\/docs\/component-development\//, `${skill.id}/${file} missing sdk-docs SDK pointer`);
      assert.match(reference, /cdp-material-sdk\/portable/, `${skill.id}/${file} should mention cdp-material-sdk/portable`);
      assert.match(reference, /本文件只提供 SDK 文档导航/, `${skill.id}/${file} missing fallback notice`);
      assert.doesNotMatch(reference, /source: docs\/组件开发\//, `${skill.id}/${file} should not reference legacy host docs path`);
    }
  }
});

test('repository documentation identifies SDK-shipped component docs as source of truth', async () => {
  const root = repoRoot();
  const readme = await readFile(path.join(root, 'README.md'), 'utf8');
  const docsMap = await readFile(path.join(root, 'references', 'component-docs-map.md'), 'utf8');

  for (const content of [readme, docsMap]) {
    assert.match(content, /cdp-material-sdk\/docs\/component-development/);
    assert.match(content, /node_modules\/cdp-material-sdk\/docs\/component-development/);
    assert.doesNotMatch(content, /CDP 主仓 `docs\/组件开发` 是组件开发文档事实源/);
    assert.doesNotMatch(content, /面向 IDE Agent 的派生运行时参考包/);
  }
});
