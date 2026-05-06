# Scenario 09 — 复制粘贴老组件清理：测试 Prompt

## 用户请求（原样发给 Agent）

> 帮我把 `OldButton` 复制一份改成 `NewActionBar`。NewActionBar 不需要 loading 和 disabled，但要能显示一个图标。

---

## 测试者预设答案（仅 Agent 主动询问时）

| Agent 可能问 | 回答 |
|---|---|
| NewActionBar 的 type 名 | `acme.NewActionBar` |
| 保留 click 事件吗 | 要 |
| 保留 focus/blur 吗 | 不要 |
| 保留 loading 吗 | 不要 |
| 保留 disabled / readOnly 吗 | 不要 |
| icon 怎么显示 | prop 是字符串图标名，简单显示即可 |

---

## 期望路径概览

| 步骤 | 期望 skill | 关键产物 |
|---|---|---|
| 1. 路由 | `cdp-component-add-to-existing-package` | 不重建结构，只新增 |
| 2. 复制 | — | 复制 `OldButton/` → `NewActionBar/` |
| 3. **清理无关能力** | `cdp-component-traits` + `cdp-component-events-actions-state` + `cdp-component-runtime-behavior` | 见下表"必删项" |
| 4. type 唯一 | — | 改 type 为 `acme.NewActionBar`，不复用 OldButton 的 type |
| 5. 注册 | — | NewActionBar manifest 纳入组件包注册入口（具体聚合文件名不限） |
| 6. 自检 | `cdp-component-manifest-validation` | `validateManifest()` 通过 |

### 必删项清单（对照 OldButton manifest）

| 字段 | 处理 | 原因 |
|---|---|---|
| `engine.render.loading` | **删** | NewActionBar 不要 loading |
| `actions.setLoading` | **删** | 同上 |
| `actions.getLoading` | **删** | 同上 |
| `state.loading` | **删** | 同上 |
| `traits: [..., COMPONENT_TRAIT.DATA_FIELD]` | **去掉 DATA_FIELD** | NewActionBar 不需要 readOnly / value 注入；保留 `INTERACTION_CLICKABLE` |
| `adapter.propMapping: { readOnly: 'disabled' }` | **删整个 adapter.propMapping** | DATA_FIELD 没了，readOnly 不存在 |
| `events: { focus, blur }` | **删** | 不要焦点态 |
| `props.placeholder` | **删** | 老组件特有（DATA_FIELD 注入语义），NewActionBar 不需要 |

### 必保留项

| 字段 | 处理 |
|---|---|
| `engine.render.injection.rootPath` | 保留 |
| `traits: [INTERACTION_CLICKABLE]` | 保留 |
| `meta.title` / `meta.category` | 改为 NewActionBar 的描述 |
| `events: { click }` | 保留 |
| `actions: { click }` | 保留 |
| `props: { label, icon }` | 保留 + 添加 icon |
| `adapter.events: { click: { propName, transform } }` | 保留（如老组件用了） |

### 实现侧 (index.tsx) 同步清理

| 老代码 | 处理 |
|---|---|
| `loading` state + `setLoading` ref method | 删 |
| `useImperativeHandle` 中的 loading / setLoading / getLoading | 删 |
| `[COMPONENT_STATE_KEY]: { loading }` | 删 |
| `disabled` prop 处理 | 删 |
| 焦点 onFocus / onBlur 处理 | 删 |

---

## 终止标识（达到即算场景完成）

| # | 验收项 |
|---|---|
| 1 | `src/components/NewActionBar/{index.tsx, manifest.ts}` 新增（OldButton 复制改名而来）|
| 2 | NewActionBar manifest 已纳入组件包注册入口（具体聚合文件名不限）|
| 3 | `src/components/OldButton/` **字节级未变** |
| 4 | `npx tsc --noEmit` 通过 |
| 5 | `validateManifest(plugin)` 通过 |
| 6 | NewActionBar manifest **未**含 `engine.render.loading` / `actions.setLoading` / `actions.getLoading` / `state.loading` / `events.focus` / `events.blur` / `props.placeholder` / `adapter.propMapping`（老组件特有 loading & 焦点 & DATA_FIELD 相关项已清理）|
| 7 | NewActionBar `traits` 含 `INTERACTION_CLICKABLE` 且**不**含 `DATA_FIELD` |
| 8 | `type` 唯一，不复用 OldButton 的 type；含命名空间前缀（如 `acme.NewActionBar`）|
| 9 | NewActionBar 不通过 `import` OldButton 实现复用（应是独立复制后的代码）|
| 10 | Agent 走完 `wrap-up-prompt.md`，输出 artifacts |

**最低底线**：1 + 2 + 3 + 4 + 5 全部满足。

---

## 必须回避的高置信度漏洞

- 🅰 没移除老组件特有的 trait / event / action / state（配置漂移；validateManifest 可能 warning）
- 🅰 复用相同 `type` 字符串（type 必须全局唯一）
- 🅰 直接 import OldButton 实现复用（应是独立复制）
- 🅱 type 缺命名空间前缀
- 🅱 留下 import 但实际没用（如 `LOADING_STRATEGY` 不再用却仍 import）
- 🅲 NewActionBar 仍叫 `OldButton` 改了一个字段就算（应彻底重命名）

---

## 不应出现的行为

- 修改 `OldButton` 的代码（用户没说）
- 重建 plugin / 替换构建工具
- 主动加用户没要求的能力（如自定义事件、scoped slot）
- 不复制直接 import 复用 OldButton 实现
