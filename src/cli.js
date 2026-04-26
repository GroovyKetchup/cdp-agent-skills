#!/usr/bin/env node
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { getAgent, listAgents } from './agents.js';
import { doctor, installSkills } from './install.js';
import { listSkills } from './skillCatalog.js';

function parseArgs(argv) {
  const args = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) {
      args._.push(item);
      continue;
    }

    const [rawKey, inlineValue] = item.slice(2).split('=');
    const key = rawKey.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }
  return args;
}

function parseSkills(value) {
  if (!value || value === true) {
    return undefined;
  }
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function printHelp() {
  console.log(`cdp-agent-skills

Usage:
  cdp-agent-skills install --agent <agent> [--all] [--skills a,b] [--target path] [--yes] [--force]
  cdp-agent-skills list [--agents]
  cdp-agent-skills doctor --agent <agent>

Agents:
  ${listAgents().map((agent) => agent.id).join(', ')}
`);
}

async function promptForInstallOptions(args) {
  if (args.yes) {
    return args;
  }

  const nextArgs = { ...args };
  const rl = readline.createInterface({ input, output });

  try {
    if (!nextArgs.agent) {
      console.log(`Select agent (${listAgents().map((agent) => agent.id).join(', ')})`);
      const answer = await rl.question('Agent: ');
      nextArgs.agent = answer.trim() || 'windsurf';
    }

    if (!nextArgs.all && !nextArgs.skills) {
      const answer = await rl.question('Install all skills? [Y/n] ');
      if (!answer.trim() || /^y(es)?$/i.test(answer.trim())) {
        nextArgs.all = true;
      } else {
        const skills = await rl.question('Skill ids, comma separated: ');
        nextArgs.skills = skills;
      }
    }
  } finally {
    rl.close();
  }

  return nextArgs;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] ?? 'help';

  if (command === 'help' || args.help) {
    printHelp();
    return;
  }

  if (command === 'list') {
    if (args.agents) {
      for (const agent of listAgents()) {
        console.log(`${agent.id}\t${agent.kind}\t${agent.defaultTarget}`);
      }
      return;
    }

    const skills = await listSkills();
    for (const skill of skills) {
      console.log(`${skill.id}\t${skill.description}`);
    }
    return;
  }

  if (command === 'install') {
    const installArgs = await promptForInstallOptions(args);
    const result = await installSkills({
      agent: installArgs.agent ?? 'windsurf',
      all: Boolean(installArgs.all),
      skills: parseSkills(installArgs.skills),
      target: installArgs.target,
      instructionFile: installArgs.instructionFile,
      yes: Boolean(installArgs.yes),
      force: Boolean(installArgs.force),
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === 'doctor') {
    const result = await doctor({
      agent: args.agent ?? 'windsurf',
      target: args.target,
      instructionFile: args.instructionFile,
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  getAgent(command);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
