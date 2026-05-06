# Scenario 04 — 已有项目加 Card 容器：测试 Prompt

## 用户请求（原样发给 Agent）

> 我们的 CDP 组件包里已经有 ColorField 组件了。现在想加一个 Card 组件，要能放任意子组件，还要有标题区（header）和操作区（footer）。

---

## 测试者预设答案（仅 Agent 主动询问时）

| Agent 可能问 | 回答 |
|---|---|
| Card 的 type 名 | `acme.Card` |
| Card 要哪些 props | 至少 `title: string`；其他你建议 |
| header / footer 默认启用？ | 默认禁用，设计师按需打开 |
| 默认 children 区域怎么处理 | LAYOUT_CONTAINER 提供默认 children；header / footer 是命名 slot |
| 是否要 loading 配置 | 不要（保持最小） |

---

## 期望路径概览

| 步骤 | 期望 skill | 关键产物 |
|---|---|---|
| 1. 路由 | `cdp-component-add-to-existing-package` | 不重建结构；只加新文件 + 改聚合 |
| 2. trait 决定 | `cdp-component-traits` | `traits: [COMPONENT_TRAIT.LAYOUT_CONTAINER]`（提供默认 children 区域） |
| 3. slot 设计 | `cdp-component-slots` | `slots: { header: { title: '头部', defaultEnabled: false }, footer: { title: '底部', defaultEnabled: false } }` |
| 4. props/meta | `cdp-component-manifest-basics` | `props.title` 字段含 `title: '卡片标题'`；`meta.category: COMPONENT_CATEGORY.LAYOUT` |
| 5. 注册 | — | Card manifest 纳入既有组件包注册入口；不重写 plugin 引导结构 |
| 6. 自检 | （可选）`cdp-component-manifest-validation` | `validateManifest()` 通过 |

---

## 期望文件变化（只增不改）

```diff
src/
  plugin.ts                       (既有 plugin 引导结构不重写)
+ components 注册点              (改：纳入 cardManifest，文件名不限)
  components/
    ColorField/                   (不变)
+   Card/
+     index.tsx                   (新增)
+     manifest.ts                 (新增)
```

---

## 必须回避的高置信度漏洞

- 🅰 重建组件包结构 / 替换构建工具
- 🅰 改写 ColorField（无关组件）
- 🅰 创建 Card 但忘加入组件包注册入口（设计器找不到组件）
- 🅰 漏 slot 的 `title` 字段（validateManifest 报错）
- 🅰 组件实现忘渲染 `_slots.header` / `_slots.footer`，用 `<header>{children}</header>` 凑数
- 🅰 误以为 LAYOUT_CONTAINER 必须配 slots（旧 SDK 文档暗示，已修）
- 🅰 同时把"子组件"理解为 React `children` 又走 slots 实现 — 应该是 LAYOUT_CONTAINER 提供默认 children，header/footer 走 slots
- 🅱 Card 的 type 与 ColorField 用相同前缀但不带命名空间（如 `Card` 而非 `acme.Card`）

---

## 终止标识（达到即算场景完成）

| # | 验收项 |
|---|---|
| 1 | `src/components/Card/{index.tsx, manifest.ts}` 新增 |
| 2 | Card manifest 已纳入组件包注册入口（具体聚合文件名不限） |
| 3 | `src/components/ColorField/` **字节级未变** |
| 4 | 既有 plugin 引导结构未被重写，只复用原有注册链路接入 Card |
| 5 | `package.json` 不新增依赖 |
| 6 | `npx tsc --noEmit` 通过 |
| 7 | `validateManifest(plugin)` 通过 |
| 8 | manifest 含 `traits: [LAYOUT_CONTAINER]` + `slots: { header, footer }` 各含 `title` |
| 9 | 实现侧渲染 `_slots.header` / `_slots.footer`（**不**用 React children 凑数） |
| 10 | Agent 走完 `wrap-up-prompt.md`，输出 artifacts |

**最低底线**：1 + 2 + 3 + 4 + 6 全部满足。

---

## 不应出现的行为

- 主动加 loading 策略（用户没要求）
- 主动加 dataBindings / DATA_CONTAINER（Card 不是数据容器）
- 添加任何新依赖到 `package.json`
