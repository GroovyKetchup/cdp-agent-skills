import assert from 'node:assert/strict';
import test from 'node:test';

import { AGENT_IDS, getAgent, listAgents } from '../../src/agents.js';

test('lists all first-class agent targets', () => {
  assert.deepEqual(AGENT_IDS, [
    'windsurf',
    'claude',
    'cursor',
    'copilot-cli',
    'antigravity',
    'trae',
    'openclaw',
    'qwen-code',
    'opencode',
    'custom',
  ]);
});

test('each agent has id, label, install kind, and default location metadata', () => {
  for (const agent of listAgents()) {
    assert.equal(typeof agent.id, 'string');
    assert.equal(typeof agent.label, 'string');
    assert.match(agent.kind, /^(skills-directory|managed-instruction-file)$/);
    assert.equal(typeof agent.defaultTarget, 'string');
  }
});

test('copilot-cli shares Claude Code skill directory by default', () => {
  assert.equal(getAgent('copilot-cli').defaultTarget, '.claude/skills');
  assert.equal(getAgent('claude').defaultTarget, '.claude/skills');
});

test('managed instruction agents define instruction file and resource directory', () => {
  for (const id of ['cursor', 'antigravity', 'trae']) {
    const agent = getAgent(id);
    assert.equal(agent.kind, 'managed-instruction-file');
    assert.equal(typeof agent.instructionFile, 'string');
    assert.equal(typeof agent.resourceTarget, 'string');
  }
});
