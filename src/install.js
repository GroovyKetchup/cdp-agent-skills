import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

import { getAgent } from './agents.js';
import { copySkillDirectory } from './copySkill.js';
import { renderManagedBlock, upsertManagedBlock } from './managedBlock.js';
import { resolveFromCwd } from './paths.js';
import { listSkills, readSkill, SKILL_IDS } from './skillCatalog.js';

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function resolveRequestedSkills(options) {
  if (options.all || !options.skills || options.skills.length === 0) {
    return listSkills();
  }

  return Promise.all(options.skills.map((id) => readSkill(id)));
}

export async function installSkills(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const agent = getAgent(options.agent ?? 'windsurf');
  const selectedSkills = await resolveRequestedSkills(options);
  const installed = [];
  const skipped = [];

  if (agent.kind === 'skills-directory') {
    const targetRoot = resolveFromCwd(cwd, options.target ?? agent.defaultTarget);
    await mkdir(targetRoot, { recursive: true });

    for (const skill of selectedSkills) {
      const status = await copySkillDirectory(
        skill.directory,
        path.join(targetRoot, skill.id),
        { force: options.force },
      );
      if (status === 'installed') {
        installed.push(skill.id);
      } else {
        skipped.push(skill.id);
      }
    }

    return {
      agent: agent.id,
      target: targetRoot,
      installed,
      skipped,
    };
  }

  const resourceRoot = resolveFromCwd(cwd, options.target ?? agent.resourceTarget);
  await mkdir(resourceRoot, { recursive: true });

  for (const skill of selectedSkills) {
    const status = await copySkillDirectory(
      skill.directory,
      path.join(resourceRoot, skill.id),
      { force: options.force },
    );
    if (status === 'installed') {
      installed.push(skill.id);
    } else {
      skipped.push(skill.id);
    }
  }

  const instructionFile = resolveFromCwd(cwd, options.instructionFile ?? agent.instructionFile);
  const block = renderManagedBlock({
    agent,
    skills: selectedSkills,
    cwd,
    resourceRoot,
  });
  const managedBlockStatus = await upsertManagedBlock(instructionFile, block);

  return {
    agent: agent.id,
    target: resourceRoot,
    instructionFile,
    managedBlockStatus,
    installed,
    skipped,
  };
}

export async function listInstalledSkills(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const agent = getAgent(options.agent ?? 'windsurf');
  const targetRoot = resolveFromCwd(
    cwd,
    options.target ?? (agent.kind === 'skills-directory' ? agent.defaultTarget : agent.resourceTarget),
  );

  const installed = [];
  for (const id of SKILL_IDS) {
    if (await exists(path.join(targetRoot, id, 'SKILL.md'))) {
      installed.push(id);
    }
  }

  return {
    agent: agent.id,
    target: targetRoot,
    installed,
  };
}

export async function doctor(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const agent = getAgent(options.agent ?? 'windsurf');
  const status = await listInstalledSkills({ ...options, cwd, agent: agent.id });
  const result = {
    agent: agent.id,
    label: agent.label,
    target: status.target,
    targetExists: await exists(status.target),
    installed: status.installed,
    installKind: agent.kind,
  };

  if (agent.kind === 'managed-instruction-file') {
    const instructionFile = resolveFromCwd(cwd, options.instructionFile ?? agent.instructionFile);
    result.instructionFile = instructionFile;
    result.instructionFileExists = await exists(instructionFile);
  }

  return result;
}
