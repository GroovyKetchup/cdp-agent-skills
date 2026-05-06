# Scenario 02 — 从零做 ColorField：测试 Prompt

## 用户请求（原样发给 Agent）

> 我要从头做一个 CDP 组件库，先做一个颜色选择器（ColorField），让用户能在表单里选颜色。值要支持 hex 字符串（如 `#FF0000`），还要有 placeholder 和 disabled。

---

## 测试者预设答案（仅 Agent 主动询问时使用）

| Agent 可能问 | 回答 |
|---|---|
| 组件 type 名 | `acme.ColorField` |
| 值格式 | hex 字符串 `#FF0000` |
| 默认值 | `#000000` |
| 实现方式 | 用原生 `<input type="color">` 即可，先做最小可用 |
| 是否要 reset / clear action | 不需要（保持最小） |
| 是否需要颜色预设值列表 | 不需要 |

---

## 期望路径概览

| 阶段 | 期望 skill | 关键产物 |
|---|---|---|
| 1. 总规划 | `cdp-component-getting-started` | 5 阶段路线图，识别"从零创建 + 数据字段"路径，从 package.json 推断包名 |
| 2. props/meta 设计 | `cdp-component-manifest-basics` | `placeholder` / `disabled` props 含 `title`；不重复声明 DATA_FIELD 自动注入字段 |
| 3. trait 决定 | `cdp-component-traits` | `traits: [COMPONENT_TRAIT.DATA_FIELD]`；`meta.valueSchema: { type: 'string', default: '#000000' }` |
| 4. 事件/动作 | `cdp-component-events-actions-state` | `events: { valueChange: {} }` 仅声明；不重复声明 `valueChange` 自动注入；`onChange(nextValue)` 传值不传 event |
| 5. 组件实现 | — | `forwardRef`；ref 上的 state 放 `[COMPONENT_STATE_KEY]`；外层 DOM 透传 `slotProps.root` |
| 6. 自检 | `cdp-component-manifest-validation` | 给出 `validateManifest()` + `printValidationResult()` 调用脚本 |

---

## 必须回避的高置信度漏洞（出现即扣失败模式回避分）

- 🅰 重复声明 DATA_FIELD 自动注入的 `value` / `readOnly` / `required` / `name` / `label` props
- 🅰 重复声明 `getValue` / `setValue` / `valueChange`
- 🅰 `onChange` 传整个 event 对象而非值
- 🅰 漏 `meta.title` / `meta.category`
- 🅰 漏 props 字段的 `title`
- 🅰 凭印象用 `BASIC` / `FORM` 等不存在的 category（应是 `DataEntry`）
- 🅱 默认值写在 React 组件参数而非 `valueSchema.default`

---

## 期望最终目录形态（参考；文件名 / 聚合方式不限，结构等价即可）

```
src/
  components/
    ColorField/
      index.tsx           # forwardRef + 原生 input + slotProps.root 透传
      manifest.ts         # DATA_FIELD trait + valueSchema + props (placeholder, disabled)
  components.ts           # 聚合 manifest 数组
  plugin.ts               # EngineComponentPlugin 入口
package.json              # 已存在，不要修改
tsconfig.json             # 已存在，不要修改
```

---

## 不应出现的行为

- 主动扩张 CDP manifest 表面：用户没要求就加 `loading` 策略 / 额外 action（如 `clear`）/ 额外 state / 额外 slot（组件内部 UX，如颜色预设、图标、动效，不在 skills 评判范围）
- 修改 `package.json` 的 `name` 或 `version`
- 把 React 打入 bundle（应 externalize）
- 引擎基础能力（hidden / mount / unmount）写进 manifest 重复声明
