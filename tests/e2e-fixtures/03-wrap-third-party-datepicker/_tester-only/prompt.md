# Scenario 03 — 包装第三方 DatePicker：测试 Prompt

## 用户请求（原样发给 Agent）

> 我们用了一个第三方日期选择器 `@vendor-x/date-picker`，需要把它接到 CDP 里给设计器用。它的值 prop 是 `selectedDate`（Date 对象），变化事件是 `onDateChange(date: Date | null)`，不是标准的 `value` / `onChange`。怎么做？
>
> 你可以看 `vendor/date-picker.tsx` 了解它的真实接口。

---

## 测试者预设答案（仅 Agent 主动询问时）

| Agent 可能问 | 回答 |
|---|---|
| CDP 侧 valueSchema 用什么类型？ | 你定（毫秒时间戳 `number` / ISO 字符串 / 其他可 JSON 序列化的形式都行），只要 wrapper 在事件层 / 渲染层做正确双向转换 |
| 默认值？ | 与所选 valueSchema 类型对齐的合理初值（如 number→`0`、string→`''`） |
| 组件 type 名？ | `acme.DatePicker` |
| 要不要透传 `dateFormat` 等其他 prop？ | 要，至少透传 `dateFormat` 和 `placeholder` |
| 要不要 clear action？ | 不要（保持最小） |

---

## 期望路径概览（三层决策）

| 层 | 期望选择 | 落地形式 |
|---|---|---|
| **结构层** | wrapper（forwardRef + 外层 DOM + `slotProps.root`） | `<div ref={ref} {...slotProps?.root}><ThirdPartyDatePicker .../></div>` |
| **Props 层** | wrapper 内做值类型转换 | CDP `valueSchema` 类型 ↔ vendor `Date` 的双向转换（如 number 选项：`selectedDate={value ? new Date(value) : null}`；ISO 字符串选项类似） |
| **事件层** | `adapter.events.valueChange` | `propName: 'onDateChange'` + `transform: (date) => ({ newValue: <按所选 valueSchema 类型从 Date 转换>, oldValue: ... })` |

manifest 关键字段：

```ts
{
  type: 'acme.DatePicker',
  engine: { render: { injection: { rootPath: INJECT_PATH_SLOT_PROPS } } },
  traits: [COMPONENT_TRAIT.DATA_FIELD],
  meta: {
    title: '日期选择器',
    category: COMPONENT_CATEGORY.DATA_ENTRY,
    valueSchema: { type: 'number', default: 0 }, // 示例选 number；string/object 同样可
  },
  events: { valueChange: {} },        // 必须先在 manifest 声明
  adapter: {
    events: {
      valueChange: {
        propName: 'onDateChange',
        // transform 把 vendor 的 Date 转成 valueSchema 选定类型；下面是 number 选项示例
        transform: (date: Date | null) => ({ newValue: date?.getTime() ?? 0, oldValue: undefined }),
      },
    },
  },
  props: {
    type: 'object',
    properties: {
      placeholder: { type: 'string', title: '占位提示文本' },
      dateFormat: { type: 'string', title: '日期格式' },
    },
  },
}
```

---

## 必须回避的高置信度漏洞

- 🅰 用 `propMapping` 试图做值类型转换（`propMapping: { value: 'selectedDate' }` ❌ 因为 number ≠ Date）
- 🅰 在 wrapper 里手写所有事件适配（事件层是 adapter 主场）
- 🅰 把 `slotProps.root` 直接传给 `<ThirdPartyDatePicker>` —— vendor 不接受未知 DOM 属性
- 🅰 `adapter.events` 引用未在 `events` 声明的事件
- 🅰 重复声明 DATA_FIELD 自动注入的 `valueChange`（注意：`events: { valueChange: {} }` 是声明事件本身允许触发，**不是**重复声明 DATA_FIELD 注入；这两件事 Agent 容易混）
- 🅱 React peerDependency 配置错误（重复打包 react）
- 🅱 把 `disabled` 当 prop 写到 manifest props 里（DATA_FIELD 自动注入 `readOnly`，`disabled` 不在 SDK 标准）

---

## 终止标识（达到即算场景完成）

| # | 验收项 |
|---|---|
| 1 | `src/components/DatePicker/{index.tsx, manifest.ts}` 新增 |
| 2 | DatePicker manifest 已纳入组件包注册入口，plugin 对外可发现该组件（具体聚合文件名不限） |
| 3 | `vendor/date-picker.tsx` 字节级未变 |
| 4 | `npx tsc --noEmit` 通过 |
| 5 | `validateManifest(plugin)` 通过 |
| 6 | manifest 含 `adapter.events.valueChange.propName: 'onDateChange'` + 在事件层做 vendor `Date` ↔ CDP `valueSchema` 的双向适配（valueSchema 具体类型 number/string/object 由 Agent 选，只要前后一致）|
| 7 | wrapper 在外层 DOM 上 spread `slotProps?.root`，**不**直接传给 vendor |
| 8 | 未用 `propMapping` 做需要值变换的 prop（`propMapping` 只能改名，不能转值）|
| 9 | Agent 走完 `wrap-up-prompt.md`，输出 artifacts |

**最低底线**：1 + 2 + 3 + 4 全部满足。

---

## 不应出现的行为

- 完全不用 `adapter.events`，把事件适配全塞 wrapper
- 把第三方组件改源码（vendor 是只读的）
- 自己 `extends` 第三方组件类
