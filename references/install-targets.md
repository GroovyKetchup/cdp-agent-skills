# 安装目标参考

本文件记录 `cdp-agent-skills` v1 支持的一等 CLI 安装目标。

| Agent | CLI 参数 | 类型 | 默认位置 |
|---|---|---|---|
| Windsurf | `windsurf` | Skills 目录型 | `.windsurf/skills` |
| Claude Code | `claude` | Skills 目录型 | `.claude/skills` |
| Copilot CLI | `copilot-cli` | Claude 兼容型 | `.claude/skills` |
| Cursor | `cursor` | 规则桥接型 | `.cursor/rules/cdp-agent-skills.md` + `.cursor/rules/cdp-agent-skills` |
| Antigravity | `antigravity` | 指令文件桥接型 | `AGENTS.md` + `.antigravity/skills` |
| Trae | `trae` | 规则桥接型 | `.trae/rules/project_rules.md` + `.trae/rules/cdp-agent-skills` |
| OpenClaw | `openclaw` | Skills 目录型 | `skills` |
| Qwen Code | `qwen-code` | Skills 目录型 | `.qwen/skills` |
| OpenCode | `opencode` | Skills 目录型 | `.opencode/skills` |
| Custom | `custom` | Skills 目录型 | 由 `--target` 指定 |

## 安装行为

- Skills 目录型：复制完整 `skills/<skill-name>` 目录。
- 规则/指令文件桥接型：复制 Skill 资源目录，并写入 `cdp-agent-skills` managed block。
- 默认不写用户全局目录。
- 默认不覆盖已存在 Skill 目录；使用 `--force` 才覆盖。
