# Scenario 07 — Button + native loading + onPress：测试 Prompt

## 用户请求（原样发给 Agent）

> 我们用了一个第三方 `@vendor-x/button`，它的事件是 `onPress` 不是 `onClick`，但自带 `loading` 属性 —— loading 时按钮自己变灰、显示 spinner、不能点。把它包装成 CDP 组件。
>
> 你可以看 `vendor/button.tsx` 了解它的真实接口。

---

## 测试者预设答案（仅 Agent 主动询问时）

| Agent 可能问 | 回答 |
|---|---|
| 组件 type 名 | `acme.Button` |
| Loading 策略选哪个 | 让你按决策表选；vendor 自带 loading prop，按理应该 `native` |
| readOnly / disabled 怎么处理 | DATA_FIELD 注入 `readOnly`；二选一映射到 vendor `disabled`：（1）manifest 用 `adapter.propMapping: { readOnly: 'disabled' }`；（2）wrapper JSX 里手写 `disabled={readOnly}` 透传 |
| 要不要 click action | 要（用户能在低代码里命令式触发） |

---

## 期望路径概览

| 步骤 | 期望 skill | 关键产物 |
|---|---|---|
| 1. 路由 | `runtime-behavior`（Loading）+ `adapter-and-wrap`（事件 propName） | — |
| 2. Loading 决策 | `runtime-behavior` Loading 三策略表 | 选 `native`（vendor 自带 loading） |
| 3. rootPath | `runtime-behavior` rootPath 决策表 | `INJECT_PATH_SLOT_PROPS` + 外层 wrapper DOM（vendor 不接受未知 DOM 属性） |
| 4. 事件适配 | `adapter-and-wrap` | `adapter.events.click.propName: 'onPress'` |
| 5. props 适配 | `adapter-and-wrap` | `readOnly→disabled` 映射：`adapter.propMapping: { readOnly: 'disabled' }` 或 wrapper 内手映射，二选一 |
| 6. 事件声明 | `events-actions-state` | `events: { click: {} }` 必须先声明 |

### 期望 manifest 关键片段

```ts
{
  type: 'acme.Button',
  engine: {
    render: {
      injection: { rootPath: INJECT_PATH_SLOT_PROPS },
      loading: { strategy: LOADING_STRATEGY.NATIVE },
    },
  },
  traits: [COMPONENT_TRAIT.INTERACTION_CLICKABLE, COMPONENT_TRAIT.DATA_FIELD],
  meta: {
    title: '按钮',
    category: COMPONENT_CATEGORY.GENERAL,
  },
  events: {
    click: {},
  },
  adapter: {
    propMapping: { readOnly: 'disabled' },
    events: {
      click: { propName: 'onPress' },
    },
  },
  actions: {
    click: { title: '点击', description: '命令式触发按钮' },
  },
}
```

### 期望 wrapper 实现侧

```tsx
const Button = forwardRef<HTMLDivElement, ButtonProps>(function Button(
  { label, slotProps, loading, disabled, onPress },
  ref,
) {
  return (
    <div ref={ref} {...slotProps?.root}>
      <VendorButton onPress={onPress} loading={loading} disabled={disabled}>
        {label}
      </VendorButton>
    </div>
  );
});
```

---

## 必须回避的高置信度漏洞

- 🅰 用 `wrapper` 整体遮罩做 loading（破坏 native button loading 体验）
- 🅰 用 `native` 但忘了声明 vendor 自带 loading（应让宿主直接传 `loading` prop 给 vendor）
- 🅰 把 `INJECT_PATH_SLOT_PROPS` 直接传给 `<VendorButton>`（vendor 不接受未知 DOM 属性）
- 🅰 重复声明 `hidden` / `setHidden` / `mount` / `unmount` 等引擎自动补充能力
- 🅰 `adapter.events.click` 引用未在 `events` 声明的事件
- 🅰 在 wrapper 里手写 `onPress={onClick}` 转换（应走 `adapter.events.click.propName`）
- 🅱 DATA_FIELD trait 缺失 → readOnly 自动注入失效

---

## 终止标识（达到即算场景完成）

| # | 验收项 |
|---|---|
| 1 | `src/components/Button/{index.tsx, manifest.ts}` 新增 |
| 2 | `src/components.ts` + `src/plugin.ts` 注册 |
| 3 | `vendor/button.tsx` **字节级未变** |
| 4 | `npx tsc --noEmit` 通过 |
| 5 | `validateManifest(plugin)` 通过 |
| 6 | manifest 含 `engine.render.loading.strategy: LOADING_STRATEGY.NATIVE` |
| 7 | manifest 含 `engine.render.injection.rootPath: INJECT_PATH_SLOT_PROPS` |
| 8 | manifest 含 `adapter.events.click.propName: 'onPress'` |
| 9 | wrapper 外层 DOM spread `slotProps?.root`，**不**传给 `<VendorButton>` |
| 10 | manifest **未**重复声明 `hidden` / `setHidden` / `mount` / `unmount`（引擎自动补充）|
| 11 | Agent 走完 `wrap-up-prompt.md`，输出 artifacts |

**最低底线**：1 + 2 + 3 + 4 全部满足。

---

## 不应出现的行为

- 声明 `LOADING_STRATEGY.NATIVE` 但又在 wrapper 里重复实现 loading state（vendor 已自带，应让 vendor 接管）—— 注：组件内部如何实现 loading 本身不在 skills 评判范围，本条只判 CDP loading 契约一致性
- 选 Loading 策略 `none` 然后又自己写 `setLoading` action（manifest 与实现冲突）
- 修改 `vendor/button.tsx`（vendor 是只读的）
