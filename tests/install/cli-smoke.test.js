import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);

test('CLI lists supported agent targets', async () => {
  const { stdout } = await execFileAsync('node', ['./src/cli.js', 'list', '--agents'], {
    cwd: process.cwd(),
  });

  assert.match(stdout, /windsurf\tskills-directory\t\.windsurf\/skills/);
  assert.match(stdout, /antigravity\tmanaged-instruction-file\tAGENTS\.md/);
  assert.match(stdout, /copilot-cli\tskills-directory\t\.claude\/skills/);
});

test('CLI prints skill catalog', async () => {
  const { stdout } = await execFileAsync('node', ['./src/cli.js', 'list'], {
    cwd: process.cwd(),
  });

  assert.match(stdout, /cdp-component-getting-started/);
  assert.match(stdout, /cdp-component-manifest-validation/);
});

test('CLI doctor prints JSON status', async () => {
  const { stdout } = await execFileAsync('node', ['./src/cli.js', 'doctor', '--agent', 'windsurf'], {
    cwd: process.cwd(),
  });
  const result = JSON.parse(stdout);

  assert.equal(result.agent, 'windsurf');
  assert.equal(result.installKind, 'skills-directory');
});
