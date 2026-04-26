import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

test('interactive install prompts for agent and installs all skills', async () => {
  const cwd = await mkdtemp(path.join(tmpdir(), 'cdp-agent-skills-interactive-'));
  const child = execFile('node', [path.resolve('./src/cli.js'), 'install', '--target', path.join(cwd, '.qwen/skills')], {
    cwd: process.cwd(),
  });

  let stdout = '';
  let answeredAgent = false;
  let answeredAll = false;
  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
    if (!answeredAgent && stdout.includes('Select agent')) {
      answeredAgent = true;
      child.stdin.write('qwen-code\n');
    }
    if (!answeredAll && stdout.includes('Install all skills')) {
      answeredAll = true;
      child.stdin.write('y\n');
      child.stdin.end();
    }
  });

  const result = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout });
      } else {
        reject(new Error(`CLI exited with ${code}: ${stdout}`));
      }
    });
  });

  assert.match(result.stdout, /Select agent/);
  assert.match(result.stdout, /Install all skills/);
  assert.equal(await exists(path.join(cwd, '.qwen/skills/cdp-component-getting-started/SKILL.md')), true);
});
