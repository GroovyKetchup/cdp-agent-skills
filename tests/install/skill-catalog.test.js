import assert from 'node:assert/strict';
import test from 'node:test';

import { listSkills, SKILL_IDS } from '../../src/skillCatalog.js';

test('catalog lists the seven CDP component skills', async () => {
  const skills = await listSkills();

  assert.deepEqual(skills.map((skill) => skill.id), SKILL_IDS);
  assert.equal(skills.length, 7);
});

test('each skill has matching frontmatter and a trigger-focused description', async () => {
  const skills = await listSkills();

  for (const skill of skills) {
    assert.equal(skill.name, skill.id);
    assert.match(skill.description, /Use when/);
    assert.doesNotMatch(skill.content, /src\/engine|src\\engine|src\/protocol|src\\protocol/);
    assert.match(skill.content, /Authoritative sources/);
  }
});
