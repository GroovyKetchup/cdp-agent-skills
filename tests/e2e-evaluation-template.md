# cdp-agent-skills 端到端评分表（Gate 1 模板）

复制本文件到测试结果目录（如 `<test-root>/results/score-<date>.md`），按场景填写。

---

## 跑测元数据

| 字段 | 值 |
|---|---|
| 跑测日期 | YYYY-MM-DD |
| 测试者 | <name> |
| LLM 模型 | <Sonnet 4.5 / Gemini 2.5 Pro / Qwen3 Coder / GLM 4.6 / DeepSeek V3.2 / ...> |
| IDE | <Windsurf / Antigravity / Cursor / Copilot CLI / Claude Code / Trae / OpenClaw / ...> |
| cdp-agent-skills 版本 | <0.x.x> |
| cdp-material-sdk 版本 | <latest 时实际 npm 安装版本号> |
| 跑测次数（每场景） | <1 / 3 / ...> |
| 备注 | <长上下文衰减、网络延迟等异常情况> |

---

## Gate 1 通过判定

| 指标 | 门槛 | 实际 | 通过 |
|---|---|---|---|
| Tier A（场景 01-05）平均分 | ≥ 80 | __/100 | ☐ |
| 任何单场景路由准确性 | ≥ 70 | __/40 | ☐ |
| 🅰 高置信度漏洞总出现次数（9 场景合计） | ≤ 2 | __ | ☐ |
| 🅰 失败模式 0 出现的场景数 | ≥ 6 | __ | ☐ |

**综合判定**：☐ Gate 1 通过 / ☐ Gate 1 不通过（具体原因见下方场景明细）

---

## 9 场景汇总表

| # | 场景 | 路由 (40) | 决策 (30) | 漏洞回避 (30) | 总分 (100) | Tier | 主调 skill |
|---|---|---|---|---|---|---|---|
| 01 | 零知识开发者 | __ | __ | __ | __ | A | getting-started |
| 02 | 从零做 ColorField | __ | __ | __ | __ | A | getting-started + 4 |
| 03 | 包装第三方 DatePicker | __ | __ | __ | __ | A | adapter-and-wrap |
| 04 | 已有项目加 Card | __ | __ | __ | __ | A | add-to-existing-package |
| 05 | 修故障 manifest | __ | __ | __ | __ | A | manifest-validation |
| 06 | DataTable 动态作用域 slot | __ | __ | __ | __ | B | slots |
| 07 | Button + native loading | __ | __ | __ | __ | B | runtime-behavior + adapter |
| 08 | useDataContainer 误用切换 | __ | __ | __ | __ | B | traits |
| 09 | 复制粘贴老组件清理 | __ | __ | __ | __ | B | add-to-existing-package |
| | **Tier A 平均** | | | | __ | | |
| | **9 场景平均** | | | | __ | | |

---

## 场景详评（每场景一节）

> 模板：每节填三张子表（路由 / 决策 / 漏洞）+ 简要观察。

---

### 场景 01 — 零知识开发者（0 组件骨架）

> 测试目标：用户明确"组件下次再做"，Agent 必须搭出**可注册 0 组件**的骨架并通过自检，**不得**自作主张创建任何组件。

#### 1.1 路由准确性（40 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 主调 skill | `cdp-component-getting-started` | __ | __/20 |
| 不过度调用其他 skill | 仅在用户追问时按需调路由表跳转 | __ | __/10 |
| 不直接给"通用 React 组件库"教程 | Agent 应识别这是 CDP 特定语境 | __ | __/10 |

**路由小计**：__ / 40

#### 1.2 决策落地（30 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 自主获取顺序 | 先尝试读 package.json（无）→ 看现有模式（无）→ 再问用户 | __ | __/6 |
| 必填决策点询问 | 仅问包名 + type 命名空间 + 首个组件来源（其他可推断） | __ | __/6 |
| 正确识别"不做组件"意图 | 阶段 3/4 显式跳过，不主动造 demo | __ | __/6 |
| 0 组件骨架产物齐全 | `package.json` + 空 components 注册点（独立数组或 `EngineComponentPackage.components: []` 内联均可）+ 插件入口用 `EngineComponentPackage` `id` 字段注册 0 组件包 | __ | __/6 |
| 自检闭环 | 跑 `validateManifest()` 对 0 组件 plugin，结果贴入 transcript | __ | __/6 |

**决策小计**：__ / 30

#### 1.3 失败模式回避（30 分）

每出现一项 🅰 高置信度漏洞 -10，最低 0 分：

| 漏洞 (🅰) | 出现 | 备注 |
|---|---|---|
| **越权创建组件**（`Button` / `Demo*` / `Hello` 等任何具体组件目录） | ☐ | 本场景头号红线 |
| 凭印象用 `BASIC` / `FORM` / `CONTAINER` 等不存在的 category | ☐ | |
| `EngineComponentPackage` 用 `name` 字段而非 `id` | ☐ | |
| React 版本不指定为 19 | ☐ | |
| 强制每步 ASK pattern 确认 | ☐ | |

**漏洞回避小计**：__ / 30

#### 1.4 总分

**场景 01 总分**：__ / 100

#### 1.5 观察备注

> 文字记录 Agent 行为亮点 / 异常 / 改进建议。

---

### 场景 02 — 从零做 ColorField

#### 2.1 路由准确性（40 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 起点 | `cdp-component-getting-started` | __ | __/8 |
| 串联 manifest-basics | 设计 props/meta 时调 | __ | __/8 |
| 串联 traits | 决定 DATA_FIELD trait 时调 | __ | __/8 |
| 串联 events-actions-state | 设计 events/state 时调 | __ | __/8 |
| 串联 manifest-validation | 自检阶段调 | __ | __/8 |

**路由小计**：__ / 40

#### 2.2 决策落地（30 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| DATA_FIELD trait | `traits: [COMPONENT_TRAIT.DATA_FIELD]` | __ | __/6 |
| valueSchema | `{ type: 'string', default: '#000000' }` | __ | __/6 |
| 不重复声明自动注入字段 | props 不含 value/readOnly/required/name/label | __ | __/6 |
| onChange 传值 | `onChange?.(nextValue)` 不传 event | __ | __/6 |
| 自检脚本 | 给出 `validateManifest()` + `printValidationResult()` 调用 | __ | __/6 |

**决策小计**：__ / 30

#### 2.3 失败模式回避（30 分）

每项 🅰 -10，最低 0：

| 漏洞 (🅰) | 出现 | 备注 |
|---|---|---|
| 重复声明 DATA_FIELD 注入的 props（value/readOnly/required/name/label） | ☐ | |
| 重复声明 getValue/setValue/valueChange | ☐ | |
| onChange 传整个 event 而非值 | ☐ | |
| 漏 meta.title 或 meta.category | ☐ | |
| 漏 props 字段的 title | ☐ | |
| 凭印象用不存在的 category | ☐ | |

**漏洞回避小计**：__ / 30

#### 2.4 总分

**场景 02 总分**：__ / 100

---

### 场景 03 — 包装第三方 DatePicker

#### 3.1 路由准确性（40 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 主调 | `cdp-component-adapter-and-wrap` | __ | __/15 |
| 串联 runtime-behavior | rootPath 决策 | __ | __/10 |
| 串联 manifest-basics | props/meta 设计 | __ | __/8 |
| 不绕开 adapter 直接全塞 wrapper | 事件层走 adapter，不全塞 wrapper | __ | __/7 |

**路由小计**：__ / 40

#### 3.2 决策落地（30 分 — 三层决策表执行）

| 层 | 期望选择 | 实际 | 分 |
|---|---|---|---|
| 结构层 | wrapper（外层 `<div>` + spread `slotProps?.root`） | __ | __/10 |
| Props 层 | wrapper 内做值类型转换（number ↔ Date），**不**用 propMapping | __ | __/10 |
| 事件层 | `adapter.events.valueChange.propName: 'onDateChange'` + transform | __ | __/10 |

**决策小计**：__ / 30

#### 3.3 失败模式回避（30 分）

每项 🅰 -10：

| 漏洞 (🅰) | 出现 | 备注 |
|---|---|---|
| 用 propMapping 试图做值类型转换 | ☐ | |
| 在 wrapper 里手写所有事件适配 | ☐ | |
| 把 slotProps.root 直接传给第三方组件 | ☐ | |
| adapter.events 引用未在 events 声明的事件 | ☐ | |
| 重复声明 DATA_FIELD 自动注入的 valueChange | ☐ | |

**漏洞回避小计**：__ / 30

#### 3.4 总分

**场景 03 总分**：__ / 100

---

### 场景 04 — 已有项目加 Card

#### 4.1 路由准确性（40 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 主调 | `cdp-component-add-to-existing-package`（不是 getting-started） | __ | __/15 |
| 串联 traits | LAYOUT_CONTAINER 决定 | __ | __/8 |
| 串联 slots | header/footer slot 设计 | __ | __/10 |
| 串联 manifest-basics | props/meta（title prop + meta.category=Layout） | __ | __/7 |

**路由小计**：__ / 40

#### 4.2 决策落地（30 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 只新增不重写 | 仅新增 Card 组件并接入既有组件包注册入口，不重写包结构 / plugin 引导 / 构建工具 | __ | __/8 |
| 不修改 ColorField | ColorField 字节级未变 | __ | __/8 |
| trait | `[LAYOUT_CONTAINER]`（不要 DATA_CONTAINER） | __ | __/7 |
| slots 含 title | header/footer 都有 title 字段 | __ | __/7 |

**决策小计**：__ / 30

#### 4.3 失败模式回避（30 分）

每项 🅰 -10：

| 漏洞 (🅰) | 出现 | 备注 |
|---|---|---|
| 重建组件包结构 / 替换构建工具 | ☐ | |
| 改写 ColorField 或其他无关组件 | ☐ | |
| 创建 manifest 但未接入组件包注册入口 | ☐ | |
| 漏 slot 的 title 字段 | ☐ | |
| 组件实现忘渲染 _slots.header / _slots.footer | ☐ | |
| 误以为 LAYOUT_CONTAINER 必须配 slots | ☐ | |

**漏洞回避小计**：__ / 30

#### 4.4 总分

**场景 04 总分**：__ / 100

---

### 场景 05 — 修一个故障的 manifest

#### 5.1 路由准确性（40 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 主调 | `cdp-component-manifest-validation` | __ | __/15 |
| 症状路由表跳转 | "action 调用失败" / "state 拿不到" → events-actions-state | __ | __/12 |
| 不直接修宿主代码 | 不去 grep node_modules / 不动 plugin.ts | __ | __/13 |

**路由小计**：__ / 40

#### 5.2 决策落地（30 分 — 6 处错全修）

每修一处 +5：

| # | 错误 | 修了 |
|---|---|---|
| 1 | manifest action key `reset` vs ref `resetValue` 不一致 | ☐ |
| 2 | state `selectedColor` 不在 `[COMPONENT_STATE_KEY]` 下 | ☐ |
| 3 | useImperativeHandle 依赖数组缺 selectedColor | ☐ |
| 4 | actions.reset 漏 title | ☐ |
| 5 | actions.reset.params 不是 type='object' | ☐ |
| 6 | state.selectedColor 漏 schema | ☐ |

**决策小计**：__ / 30

#### 5.3 失败模式回避（30 分）

每项 🅰 -10：

| 漏洞 (🅰) | 出现 | 备注 |
|---|---|---|
| 直接修宿主或 CDP 引擎代码而不先验证 manifest | ☐ | |
| 不会用 diagnoseMissingActionImpls / diagnoseMissingStateKeys | ☐ | |
| 不知道 action key 必须 = ref method name | ☐ | |
| 不区分 error 必修 / warning 建议修 | ☐ | |

**漏洞回避小计**：__ / 30

#### 5.4 总分

**场景 05 总分**：__ / 100

---

### 场景 06 — DataTable 动态作用域 slot

#### 6.1 路由准确性（40 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 主调 | `cdp-component-slots` | __ | __/20 |
| 串联 manifest-basics | columns 数组 schema | __ | __/12 |
| 不用 React render-prop 自建作用域 | 用 SDK scoped slot 机制 | __ | __/8 |

**路由小计**：__ / 40

#### 6.2 决策落地（30 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| dynamic + dynamicSource + dynamicKey 三件套 | `dynamic: true` + `dynamicSource: 'columns'` + `dynamicKey: '{key}'` | __ | __/10 |
| scoped: true + scopeDescription | 含 record + index 描述 | __ | __/8 |
| 实现侧用 _scopedSlots | `_scopedSlots[name]?.({ record, index })` | __ | __/7 |
| dataIndex 用 format: 'dataField' | columns 数组里 dataIndex 字段 schema | __ | __/5 |

**决策小计**：__ / 30

#### 6.3 失败模式回避（30 分）

每项 🅰 -10：

| 漏洞 (🅰) | 出现 | 备注 |
|---|---|---|
| 为每一列硬编码 slot 名 | ☐ | |
| 漏 dynamicSource / dynamicKey | ☐ | |
| 漏 scoped: true | ☐ | |
| 实现侧用 _slots[name] 而非 _scopedSlots[name] | ☐ | |
| dynamicKey 模板语法错（用 :key / ${key} 等） | ☐ | |
| 用 React render prop 自建 context | ☐ | |

**漏洞回避小计**：__ / 30

#### 6.4 总分

**场景 06 总分**：__ / 100

---

### 场景 07 — Button + native loading + onPress

#### 7.1 路由准确性（40 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 主调 runtime-behavior | Loading 决策 | __ | __/15 |
| 串联 adapter-and-wrap | 事件名 propName + propMapping | __ | __/15 |
| 串联 events-actions-state | events.click 声明 | __ | __/10 |

**路由小计**：__ / 40

#### 7.2 决策落地（30 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| Loading 选 native | `loading: { strategy: NATIVE }` | __ | __/8 |
| rootPath + wrapper DOM | INJECT_PATH_SLOT_PROPS + 外层 div | __ | __/8 |
| 事件 propName | `adapter.events.click.propName: 'onPress'` | __ | __/8 |
| readOnly → disabled propMapping | `propMapping: { readOnly: 'disabled' }` | __ | __/6 |

**决策小计**：__ / 30

#### 7.3 失败模式回避（30 分）

每项 🅰 -10：

| 漏洞 (🅰) | 出现 | 备注 |
|---|---|---|
| 用 wrapper 整体遮罩做 loading | ☐ | |
| 把 INJECT_PATH_SLOT_PROPS 直接给第三方 | ☐ | |
| 重复声明 hidden / mount / unmount 等引擎能力 | ☐ | |
| adapter.events.click 引用未声明事件 | ☐ | |
| 在 wrapper 内手写 onPress={onClick} 转换 | ☐ | |

**漏洞回避小计**：__ / 30

#### 7.4 总分

**场景 07 总分**：__ / 100

---

### 场景 08 — useDataContainer 误用切换

#### 8.1 路由准确性（40 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 主调 traits | DATA_CONTAINER trait + 三 hook 选择 | __ | __/20 |
| 不修 manifest | manifest 是对的，问题在 hook 选择 | __ | __/10 |
| 不引外部状态库 | 用 SDK 内置机制 | __ | __/10 |

**路由小计**：__ / 40

#### 8.2 决策落地（30 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 识别"订阅式 vs 命令式"误用 | 明确指出 useDataContainer 订阅整体导致重渲染 | __ | __/10 |
| 切换到 useDataContainerApi | 用命令式 hook 替代 | __ | __/10 |
| 字段订阅交给 DataScope / useFieldRegistry | 子字段独立订阅 | __ | __/10 |

**决策小计**：__ / 30

#### 8.3 失败模式回避（30 分）

每项 -10：

| 漏洞 | 出现 | 备注 |
|---|---|---|
| 🅰 不识别误用，仅用 React.memo 打补丁 | ☐ | |
| 🅰 自己手写字段注册表替代 useFieldRegistry | ☐ | |
| 🅱 用 useDataContainer 但加 useMemo 试图减重渲染 | ☐ | |
| 🅱 修了 manifest（trait）当成问题源 | ☐ | |

**漏洞回避小计**：__ / 30

#### 8.4 总分

**场景 08 总分**：__ / 100

---

### 场景 09 — 复制粘贴老组件清理

#### 9.1 路由准确性（40 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 主调 add-to-existing-package | 工作流程 + 路由表 | __ | __/15 |
| 按需路由原子 skill | traits（清 DATA_FIELD）+ events-actions-state（清 actions/state）+ runtime-behavior（清 loading） | __ | __/15 |
| 自检 manifest-validation | 验证清理后 manifest 通过 | __ | __/10 |

**路由小计**：__ / 40

#### 9.2 决策落地（30 分 — 必删 vs 必保）

每删/保正确 +3：

| 处理 | 字段 | 正确 |
|---|---|---|
| 删 | engine.render.loading | ☐ |
| 删 | actions.setLoading | ☐ |
| 删 | actions.getLoading | ☐ |
| 删 | state.loading | ☐ |
| 删 | DATA_FIELD trait | ☐ |
| 删 | adapter.propMapping | ☐ |
| 删 | events.focus / events.blur | ☐ |
| 删 | props.placeholder | ☐ |
| 保 | INTERACTION_CLICKABLE trait | ☐ |
| 保 | events.click + actions.click + props.label | ☐ |

**决策小计**：__ / 30

#### 9.3 失败模式回避（30 分）

每项 🅰 -10：

| 漏洞 (🅰) | 出现 | 备注 |
|---|---|---|
| 没移除老组件特有的 trait/event/action/state | ☐ | |
| 复用相同 type 字符串 | ☐ | |
| 直接 import OldButton 实现复用 | ☐ | |

**漏洞回避小计**：__ / 30

#### 9.4 总分

**场景 09 总分**：__ / 100

---

## 跑测后处理

### 反馈到 tdd-progress.md

每个场景里"出现 = 是"的 🅰 漏洞，回到 `cdp-agent-skills/tdd-progress.md` 找到对应 skill 的"后续可能的漏洞"段，标记：

- ✅ 已验证未出现
- ❌ 已验证仍出现 → 需要补 skill
- ➕ 新发现漏洞（不在原清单）→ 补到 skill 里

### Gate 1 决议

按"Gate 1 通过判定"段填结论。若未通过：

- 总结**最影响判定**的 1-2 个场景
- 给出 skill 修订建议
- 修完后重跑这 1-2 个场景

### 进入 Gate 2 准备

通过 Gate 1 后，启动 Gate 2 矩阵跑测：

- 选择 LLM 矩阵（Sonnet 4.5 / Gemini 2.5 Pro / Qwen3 Coder / GLM 4.6 / DeepSeek V3.2 至少 3 款）
- 选择 IDE 矩阵（Windsurf / Antigravity / Cursor / Copilot CLI / Claude Code 至少 3 款）
- N=3 次重复
- 复制本评分模板 × 矩阵单元格数量
- 汇总"单元格稳定性"（pass/total ≥ 80%）
