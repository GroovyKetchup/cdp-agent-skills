export const AGENT_IDS = [
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
];

const agents = [
  {
    id: 'windsurf',
    label: 'Windsurf',
    kind: 'skills-directory',
    defaultTarget: '.windsurf/skills',
    description: 'Workspace-level Windsurf Cascade Skills directory.',
  },
  {
    id: 'claude',
    label: 'Claude Code',
    kind: 'skills-directory',
    defaultTarget: '.claude/skills',
    description: 'Project-level Claude Code Skills directory.',
  },
  {
    id: 'cursor',
    label: 'Cursor',
    kind: 'managed-instruction-file',
    defaultTarget: '.cursor/rules/cdp-agent-skills.md',
    instructionFile: '.cursor/rules/cdp-agent-skills.md',
    resourceTarget: '.cursor/rules/cdp-agent-skills',
    description: 'Cursor project rules bridge for CDP Skills.',
  },
  {
    id: 'copilot-cli',
    label: 'Copilot CLI',
    kind: 'skills-directory',
    defaultTarget: '.claude/skills',
    description: 'Copilot CLI uses the Claude-compatible Skills layout.',
  },
  {
    id: 'antigravity',
    label: 'Antigravity',
    kind: 'managed-instruction-file',
    defaultTarget: 'AGENTS.md',
    instructionFile: 'AGENTS.md',
    alternateInstructionFile: 'GEMINI.md',
    resourceTarget: '.antigravity/skills',
    description: 'Antigravity project instructions bridge using AGENTS.md or GEMINI.md.',
  },
  {
    id: 'trae',
    label: 'Trae',
    kind: 'managed-instruction-file',
    defaultTarget: '.trae/rules/project_rules.md',
    instructionFile: '.trae/rules/project_rules.md',
    resourceTarget: '.trae/rules/cdp-agent-skills',
    description: 'Trae project rules bridge for CDP Skills.',
  },
  {
    id: 'openclaw',
    label: 'OpenClaw',
    kind: 'skills-directory',
    defaultTarget: 'skills',
    description: 'Workspace-level OpenClaw Skills directory.',
  },
  {
    id: 'qwen-code',
    label: 'Qwen Code',
    kind: 'skills-directory',
    defaultTarget: '.qwen/skills',
    description: 'Project-level Qwen Code Skills directory.',
  },
  {
    id: 'opencode',
    label: 'OpenCode',
    kind: 'skills-directory',
    defaultTarget: '.opencode/skills',
    description: 'Project-level OpenCode Skills directory.',
  },
  {
    id: 'custom',
    label: 'Custom',
    kind: 'skills-directory',
    defaultTarget: 'skills',
    description: 'Custom SKILL.md-compatible target directory selected with --target.',
  },
];

export function listAgents() {
  return agents.map((agent) => ({ ...agent }));
}

export function getAgent(id) {
  const agent = agents.find((item) => item.id === id);
  if (!agent) {
    throw new Error(`Unknown agent: ${id}`);
  }
  return { ...agent };
}
