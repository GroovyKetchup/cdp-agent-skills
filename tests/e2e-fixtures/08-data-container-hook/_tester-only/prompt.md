# Scenario 08 — useDataContainer 误用切换：测试 Prompt

## 用户请求（原样发给 Agent）

> 我们的 MyForm 组件用了 `useDataContainer`，但是发现每输入一个字符整个表单都重渲染，性能很差。怎么优化？

---

## 测试者预设答案（仅 Agent 主动询问时）

| Agent 可能问 | 回答 |
|---|---|
| 现象具体是什么 | 输入任意字段，MyForm 内的 console.log 每次都打 → 整体重渲染 |
| 是否需要响应式 | 不需要，命令式即可（在事件回调读值） |
| 是否能用 `DataScope` / `useFieldRegistry` | 可以，按 SDK 推荐方案 |
| 改完要不要保持现有 props 兼容 | 要 |

---

## 期望路径概览

| 步骤 | 期望 skill | 关键产物 |
|---|---|---|
| 1. 路由 | `cdp-component-traits`（DATA_CONTAINER trait + 三 hook 选择） | — |
| 2. 诊断 | `cdp-component-traits` references | 识别 `useDataContainer` 是订阅式（返回响应式 `containerData`），订阅整体导致所有变化触发重渲染 |
| 3. 切换方案 | — | 用 `useDataContainerApi`（仅命令式 `getContainerData`/`setContainerData`），不订阅整体 |
| 4. 字段订阅 | `cdp-component-traits` references | 用 `DataScope` 包裹 children，让每个字段独立订阅自己的子树（通过 `useFieldRegistry`） |

### 期望修改前后对比

**修改前**（错用，已在 fixture 中）：

```tsx
const result = useDataContainer<FormData>();
console.log('rendered with', result.containerData);   // ← 任意字段变化都打
return <div>{children}</div>;
```

**修改后**（正确）：

```tsx
const api = useDataContainerApi<FormData>();          // ← 命令式，不订阅整体
return (
  <DataScope getRecord={api.getContainerData}>
    {children}
  </DataScope>
);
```

---

## 必须回避的高置信度漏洞

- 🅰 不识别"订阅式 vs 命令式"误用，仅在表面（用 `React.memo` 包字段）打补丁
- 🅰 自己手写字段注册表替代 `useFieldRegistry`
- 🅱 用 `useDataContainer` 但加 `useMemo` / `useCallback` 试图减少重渲染（订阅本身不变，没用）
- 🅱 把 manifest 的 trait 改了（manifest 是对的，问题在 hook 选择）
- 🅲 在 children 外加 React Context 自建作用域（应用 SDK `DataScope`）

---

## 终止标识（达到即算场景完成）

| # | 验收项 |
|---|---|
| 1 | `src/components/MyForm/index.tsx` 改为用 `useDataContainerApi` + `<DataScope>` 包裹 children |
| 2 | `src/components/MyForm/manifest.ts` **字节级未变**（manifest 是对的，问题在 hook 选择）|
| 3 | `npx tsc --noEmit` 通过 |
| 4 | `validateManifest(plugin)` 通过 |
| 5 | self-report 含"为什么 `useDataContainerApi` 不会触发整体重渲染"的解释（说清"订阅式 vs 命令式"区别）|
| 6 | **未**绕过 SDK 数据容器机制（不应改用 zustand / jotai / valtio / redux 等替代 `DataScope` / `useFieldRegistry`）|
| 7 | **未**改 `MyForm` 的 trait（DATA_CONTAINER 是对的） |
| 8 | Agent 走完 `wrap-up-prompt.md`，输出 artifacts |

**最低底线**：1 + 2 + 3 全部满足。

> **行为验证说明**：本场景"重渲染"的客观验证依赖运行时（React DevTools Profiler 或 console.log），SOP 不要求测试者实跑；以**代码 + self-report 解释**为评分依据，由 Judge 判语义正确性。

---

## 不应出现的行为

- 修改 manifest（trait 是对的）
- 用额外状态库（zustand / jotai / valtio 等）绕过 SDK 提供的 `DataScope` / `useFieldRegistry`（应使用 SDK 数据容器机制；状态库本身的选择不在 skills 评判范围，本条只判是否绕过 SDK 契约）
- 把 Form 改成"非数据容器"组件（容器语义是对的）
