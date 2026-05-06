---
name: cdp-component-getting-started
description: Use when starting a CDP component package from scratch, onboarding an existing UI library, building the package skeleton (EngineComponentPackage + EngineComponentPlugin), or wiring up the first component end-to-end.
---

# CDP 组件开发入门（总调度）

## 概述

主线 skill：**从零启动**一个 CDP 组件库的总调度入口。本 skill 只给阶段路线图 + 决策点 + "需求 → 原子/主线 skill"路由，不重复任何具体能力实现。

## 何时使用 / 何时不使用

| 情境 | 是否使用本 skill |
|---|---|
| 全新仓库 / 全新组件库工程，从零搭建 | ✅ 使用 |
| 包装已有 UI 库（AntD / Arco / MUI / ECharts）从零搭骨架 | ✅ 使用（首个组件路由到 adapter-and-wrap） |
| 仓库已有 CDP 组件包，只需新增 1 个组件 | ❌ 走 `cdp-component-add-to-existing-package` |
| 排查现有组件故障 | ❌ 走 `cdp-component-manifest-validation` |

## 必填决策点

启动前必须明确以下信息（缺失时按"自主获取顺序"获取——读现有代码 / 上下文推断；仍不明朗时再询问用户，**不要默认填值**）：

| 决策点 | 说明 | 自主获取顺序 |
|---|---|---|
| **包 id**（`EngineComponentPackage.id`） | 稳定唯一，建议与 npm 包名或团队命名空间一致 | npm 包名 → 仓库名 → 询问 |
| **组件 `type` 命名空间前缀** | 所有组件 type 的统一前缀（如 `acme:button`），落库后修改成本高 | 现有同团队组件包 type 模式 → 询问 |
| **React 版本** | SDK peerDep 要求 React 19；目标仓库 < 19 需先升级 | 读 `package.json` |
| **首个组件来源** | 见下方"首个组件来源"路由表 | 用户上下文 / 询问 |

不要默认追加 events / actions / state / slots / 数据 trait / rootPath / loading——这些走第 4 阶段按需添加。

## 阶段路线图

### 阶段 1：环境与依赖

- 安装 `cdp-material-sdk@latest`；确保 React peerDep ≥ 19
- 配置构建为 ESM、external React（不打包 react / react-dom 运行时）
- 默认从 `cdp-material-sdk/portable` 导入；只有确认与宿主共享 React 运行时与 Context 身份时才用 `cdp-material-sdk/host-react`

### 阶段 2：搭骨架（不创建业务组件）

- 组件目录约定：`src/components/<Name>/index.tsx` + `manifest.ts`
- manifest 聚合：`src/manifests.ts`（或等价文件，此时 `components: []`）
- plugin 入口：`src/plugin.ts`，导出 `EngineComponentPlugin`
- 创建空的 `EngineComponentPackage`（`id` / `version` / `components: []`）与 `EngineComponentPlugin`（`id` / `version` / `install`）
- 此时仓库可构建但没有任何组件

### 阶段 3：首个组件（按来源路由）

| 来源 | 走哪个 skill |
|---|---|
| 用户已有业务组件需求（自研 UI） | 阶段 4（按需走原子 skill） |
| 包装第三方 React 组件库（AntD / Arco / MUI / ECharts / 自研 UI Kit） | `cdp-component-adapter-and-wrap` |
| 接入仓库已有 React 组件 | `cdp-component-adapter-and-wrap` |
| 最小占位 demo（仅打通流程） | 阶段 4（最小 manifest，无可选能力） |

### 阶段 4：能力按需添加

按组件实际需求挑选，**不要全加**：

| 需求 | 原子 skill |
|---|---|
| 必填字段（type / meta.title / meta.category）+ props + designer meta | `cdp-component-manifest-basics` |
| 数据语义（DATA_FIELD / DATA_CONTAINER / DataScope） | `cdp-component-traits` |
| 命名 / 动态 / 作用域 slots | `cdp-component-slots` |
| 自定义事件 / 命令式 actions / 暴露 state | `cdp-component-events-actions-state` |
| rootPath / Loading 策略 | `cdp-component-runtime-behavior` |

### 阶段 5：交付前自检

走 `cdp-component-manifest-validation` 跑 `validateManifest()` / `validateManifests()` 与一致性诊断；确认产物为 ESM，未打包 React 运行时。

## SDK 实际接口要点（防印象错）

以 `cdp-material-sdk/portable` 真实导出为准：

- `EngineComponentPackage` 字段是 **`id`**（不是 `name`），同时必须有 `version`
- `EngineComponentPlugin` 必须有 `id` / `version` / `install`
- `COMPONENT_CATEGORY` 完整可用值以**真实导出**为准；常见误用 `BASIC` / `FORM` / `CONTAINER` **都不存在**——读 SDK 类型确认
- `cdp-material-sdk` peerDependencies：React 19（`react@^19.1.1` / `react-dom@^19.1.1`）
- 字段或常量找不到时**读真实 SDK 类型**，不要凭印象填写

## 引导路径

事实源（优先读取目标项目本地 SDK 文档）：

- `node_modules/cdp-material-sdk/docs/component-development/README.md`
- `node_modules/cdp-material-sdk/docs/component-development/getting-started/01-创建或接入组件库工程.md`
- `node_modules/cdp-material-sdk/docs/component-development/getting-started/02-创建组件包并注册.md`
- `node_modules/cdp-material-sdk/docs/component-development/getting-started/03-开发最小可运行组件.md`
- `node_modules/cdp-material-sdk/docs/component-development/getting-started/04-构建发布与宿主接入.md`
- `node_modules/cdp-material-sdk/docs/component-development/reference/SDK导入边界.md`

本 skill 的 `references/`（`project-structure.md` / `manifest-minimum.md` / `component-package-plugin.md` / `build-config.md` / `validation.md`）仅作为 SDK 文档导航与 fallback 提示。

## 常见错误

| 错误 | 修复 |
|---|---|
| 用 `BASIC` / `FORM` / `CONTAINER` 等不存在的 category | 读 `COMPONENT_CATEGORY` 真实导出 |
| `EngineComponentPackage` 用 `name` 字段 | 改 `id` |
| React 版本 < 19 | 升级；或确认 SDK peerDep 后再开工 |
| 漏 `EngineComponentPlugin` 入口 | 阶段 2 必建 |
| 主动创建 demo 组件 | 按用户需求决定首个组件来源 |
| 凭直觉默认命名空间前缀（如全用 `acme:`） | 由用户或项目上下文决定 |
| 一上来就把 events / actions / state / loading 全加 | 走阶段 4 按需挑 skill |
| 跳过 `validateManifest()` 直接交付 | 阶段 5 必跑 |

## 完成检查

- [ ] 已确认包 `id` / `type` 命名空间前缀 / 首个组件 category / React 版本（任一项使用默认值需有明确依据）
- [ ] `EngineComponentPackage` 用 `id`（不是 `name`）+ `version`；`EngineComponentPlugin` 含 `id` / `version` / `install`
- [ ] `meta.category` 取自 `COMPONENT_CATEGORY` 真实导出
- [ ] SDK 默认从 `cdp-material-sdk/portable` 导入
- [ ] React 已外部化（peerDep React 19；产物未打包 react 运行时）
- [ ] 每个 manifest 含 `type` / `meta.title` / `meta.category`
- [ ] 已按"阶段 4 路由表"逐项决定能力，未主动追加未需要的能力
- [ ] `validateManifest()` 无 error
- [ ] 组件包可被 CDP 宿主动态导入

## 维护来源

- `cdp-material-sdk/docs/component-development/getting-started/01-创建或接入组件库工程.md`
- `cdp-material-sdk/docs/component-development/getting-started/02-创建组件包并注册.md`
- `cdp-material-sdk/docs/component-development/getting-started/03-开发最小可运行组件.md`
- `cdp-material-sdk/docs/component-development/getting-started/04-构建发布与宿主接入.md`
- `cdp-material-sdk/docs/component-development/getting-started/05-自检与排错.md`
- `cdp-material-sdk/docs/component-development/reference/SDK导入边界.md`
