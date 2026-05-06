# Scenario 05 — 修一个故障的 manifest：测试 Prompt

## 用户请求（原样发给 Agent）

> 我刚加了一个 ColorField 组件，接到 CDP 之后发现 reset 这个 action 调用没反应，设计器里也读不到 selectedColor state。帮我看看哪里出了问题。

---

## 测试者预设答案（仅 Agent 主动询问时）

| Agent 可能问 | 回答 |
|---|---|
| reset 应该把值重置成什么 | valueSchema.default（`#000000`） |
| state key 名要改吗 | 不改名，只改位置 |
| 改 manifest 还是改 ref method 名 | 优先改 manifest 的 action key 为 `resetValue`（与 ref 一致更直观） |

---

## 期望路径概览

| 步骤 | 期望 skill | 关键行为 |
|---|---|---|
| 1. 不改宿主代码 | `cdp-component-manifest-validation` | **不**直接 grep/edit `node_modules` 或 CDP 引擎源码；**先**校验 manifest |
| 2. 静态校验 | — | 跑 `validateManifest()` + `printValidationResult()`；区分 error vs warning |
| 3. 一致性诊断 | — | 跑 `diagnoseMissingActionImpls(manifest, refMethods)` + `diagnoseMissingStateKeys(manifest, stateObj)` |
| 4. 路由到 events-actions-state | `cdp-component-events-actions-state` | 按症状路由表的"action 调用失败 / state 拿不到"行 |
| 5. 修 6 处错 | — | 见下表 |
| 6. 闭环复跑 | `cdp-component-manifest-validation` | 修完后再跑一次工具确认 0 error |

---

## 必须修复的 6 处错（顺序不限）

| # | 错误 | 修复方式 |
|---|---|---|
| 1 | manifest `actions.reset` vs ref `resetValue` 不一致 | 二选一：改 manifest key 为 `resetValue`，或 ref method 改为 `reset` |
| 2 | state `selectedColor` 不在 `COMPONENT_STATE_KEY` 下 | `useImperativeHandle(ref, () => ({ ..., [COMPONENT_STATE_KEY]: { selectedColor } }))` |
| 3 | useImperativeHandle 依赖数组缺 selectedColor | 加进依赖：`[selectedColor, onChange, ...]` |
| 4 | `actions.reset` 漏 `title` | 加 `title: '重置'` |
| 5 | `actions.reset.params` 没有 `type: 'object'` | 改为 `params: { type: 'object', properties: {} }`，或直接删 `params`（reset 无参数） |
| 6 | `state.selectedColor` 漏 `schema` | 加 `schema: { type: 'string' }` |

---

## 必须回避的高置信度漏洞

- 🅰 直接修改宿主代码或 CDP 引擎代码而不先验证 manifest
- 🅰 不会用 `diagnoseMissingActionImpls` / `diagnoseMissingStateKeys` 自检
- 🅰 不知道 action key 必须 = ref method name
- 🅰 不区分 error / warning（应明确 error 必修、warning 建议修）
- 🅱 不查 type 在 `plugin.ts` 中是否已注册（本场景已注册，但 Agent 应主动确认）
- 🅱 改了 state key 名（应只改位置）
- 🅲 引入新依赖来"解决"（无需）

---

## 不应出现的行为

- 怀疑是 CDP 引擎 bug 而要求查 `node_modules/cdp-material-sdk/`
- 重写 ColorField 整体（只需改 ref 实现 + manifest）
- 修改 `plugin.ts` / `components.ts`（这两个是对的）

---

## 期望 manifest 修后形态（参考）

```ts
{
  type: 'acme.ColorField',
  // ... 其他不变
  actions: {
    resetValue: {                           // ← 改 key
      title: '重置',                         // ← 加 title
      description: '重置颜色为默认值',
      // params 删除（reset 无参数）
    },
  },
  state: {
    selectedColor: {
      title: '当前颜色',
      schema: { type: 'string' },           // ← 加 schema
    },
  },
}
```
