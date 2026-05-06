---
name: cdp-component-add-to-existing-package
description: Use when a repository already contains a CDP component package and the task is to add, register, minimally wire and validate ONE new component without restructuring the package.
---

# 向已有 CDP 组件包新增组件

## 概述

主线 skill：仓库已有 CDP 组件包结构、用户只想**新增 + 注册 + 验证一个组件**时使用。本 skill 只做工作流程编排与注册清单——具体能力实现走对应原子 skill。

**绝不**重建组件库结构、替换构建工具、改写无关组件，除非用户明确要求。

## 何时使用 / 何时不使用

| 情境 | 是否使用本 skill |
|---|---|
| 已有 CDP 包结构，新增 1 个组件 | ✅ 使用 |
| 从零创建 CDP 组件包 | ❌ 走 `cdp-component-getting-started` |
| 仅修改现有组件 | ❌ 直接走对应原子 skill |
| 排查现有组件故障 | ❌ 走 `cdp-component-manifest-validation` |

## 工作流程

1. **发现现有注册约定**（不要假设）：
   - 找组件目录布局（如 `src/components/<Name>/index.tsx` + `manifest.ts`）
   - 找 manifest 聚合文件 / 组件清单数组
   - 找 plugin.ts / 注册入口（调用 SDK 注册函数处）
   - 复用现有命名空间、命名风格、文件层级

2. **只添加新组件所需文件**：
   - 新组件目录 + `index.tsx`（或等价实现）+ `manifest.ts`
   - 不动其他组件、不改包级元数据

3. **注册新组件**：
   - 将新组件实现 + manifest 加入聚合文件
   - 组件 `type` **稳定、全局唯一、带命名空间前缀**（如 `acme:card`）
   - 保留已有组件元数据不变

4. **按需实现最小契约**——根据组件实际需求**裁剪**能力，并跳到对应原子 skill：

   | 需求 | 原子 skill |
   |---|---|
   | 必填字段（type / meta.title / meta.category / props / designer meta） | `cdp-component-manifest-basics` |
   | 数据语义（DATA_FIELD / DATA_CONTAINER / DataScope） | `cdp-component-traits` |
   | 命名 / 动态 / 作用域 slots | `cdp-component-slots` |
   | 自定义事件 / 命令式 actions / 暴露 state | `cdp-component-events-actions-state` |
   | rootPath / Loading 策略 | `cdp-component-runtime-behavior` |
   | 包装第三方组件 / API 适配 | `cdp-component-adapter-and-wrap` |

   **不要凭直觉全加**——能力按"组件真实需要"裁剪。

5. **校验新增内容**：
   - 优先运行项目已有的校验脚本（如 `pnpm validate-manifests`）
   - 没有脚本时从 `cdp-material-sdk/portable` 导入 `validateManifest` 跑校验（见 `cdp-component-manifest-validation`）
   - 项目已有 typecheck / build 也一并运行

## SDK 导入边界

新组件实现复用现有包的导入约定：默认从 `cdp-material-sdk/portable` 导入 manifest 类型、`COMPONENT_TRAIT` / `COMPONENT_CATEGORY` / `INJECT_PATH_SLOT_PROPS` 常量、`validateManifest` 等；只有在确认与宿主共享 React 运行时与 Context 身份时才用 `cdp-material-sdk/host-react`（数据容器场景）。不导入宿主内部模块或 SDK 源码路径。

## 命名空间与 type 唯一性

- `type` 必须**全局唯一**且**带命名空间前缀**（推荐组织或包名前缀，如 `acme:card`、`order:approvalPanel`）。
- 复用现有包内已有的命名风格——查看其他组件的 `type` 命名后照搬模式。

## 引导路径

事实源（优先读取目标项目本地 SDK 文档）：

- `node_modules/cdp-material-sdk/docs/component-development/getting-started/02-创建组件包并注册.md`
- `node_modules/cdp-material-sdk/docs/component-development/getting-started/03-开发最小可运行组件.md`
- `node_modules/cdp-material-sdk/docs/component-development/reference/示例代码索引.md`

本 skill 的 `references/`（`existing-package-discovery.md` / `add-component-minimum.md` / `registration-and-validation.md`）仅作为 SDK 文档导航与 fallback 提示。

## 常见错误

| 错误 | 修复 |
|---|---|
| 重建包结构 / 替换构建工具 | 用户没要求时不动；只新增 |
| 改写不相关组件 | 同上 |
| 创建文件但忘加入聚合文件 / plugin.ts | 第 3 步注册 |
| 复用其他组件 type 字符串 | 给新组件独立 type |
| `type` 漏命名空间前缀 | 加组织或包名前缀 |
| 复制粘贴老组件后未清理无关 trait / event / action | 按"按需裁剪"原则只保留新组件需要的 |
| 凭直觉全加能力 | 按"需求 → 原子 skill"表逐项判断 |
| 跳过 validateManifest | 第 5 步必跑 |

## 完成检查

- [ ] 仅改动新组件文件 + 必要的注册聚合 / plugin 入口
- [ ] 已有组件 / 包元数据 / 构建配置未动
- [ ] `type` 稳定、全局唯一、带命名空间前缀
- [ ] 未凭直觉添加无关能力（按需要走对应原子 skill）
- [ ] 新 manifest 通过 `validateManifest()`
- [ ] 项目已有 typecheck / build 已通过

## 维护来源

- `cdp-material-sdk/docs/component-development/getting-started/02-创建组件包并注册.md`
- `cdp-material-sdk/docs/component-development/getting-started/03-开发最小可运行组件.md`
- `cdp-material-sdk/docs/component-development/reference/示例代码索引.md`
- `cdp-material-sdk/docs/component-development/reference/SDK导入边界.md`
