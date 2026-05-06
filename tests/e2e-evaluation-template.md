# cdp-agent-skills 端到端评分表（Gate 1 模板）

复制本文件到测试结果目录（如 `<test-root>/results/score-<date>.md`），按场景填写。

---

## 评分哲学（必读）

**结果导向，路由作为诊断信号**：

- skills 是手段，**让 Agent 产出符合 CDP 契约的产物才是目标**。Agent 不调 skill 但产出合规 ≠ 失败；Agent 调了 skill 但产出违约 ≠ 成功。
- 评分分两轨：
  - **轨道 A（计分 100，决定通过/失败）**：CDP 契约落地 50 + 失败模式回避 30 + 任务完成度 20
  - **轨道 B（诊断观测，不计入总分）**：skill 触发命中、采纳深度、替代路径——用于反推 skill 设计是否需要改
- 路由命中率低但分数高 → skill 触发词或定位待优化（**改 skill**，不扣 Agent 分）
- 路由命中率高但分数低 → skill 内容质量待优化（**改 skill 内容**）
- Agent 用读 SDK / 经验 / 其他途径达到契约一致 → **照样通过**，记入轨道 B"替代路径"作为 skill 必要性反思素材

---

## 跑测元数据

| 字段 | 值 |
|---|---|
| 跑测日期 | YYYY-MM-DD |
| 测试者 | <name> |
| Worker 模型 | <Sonnet 4.5 / Gemini 2.5 Pro / Qwen3 Coder / GLM 4.6 / DeepSeek V3.2 / ...> |
| Judge 模型 | <必须 ≠ Worker> |
| IDE | <Windsurf / Antigravity / Cursor / Copilot CLI / Claude Code / Trae / OpenClaw / ...> |
| cdp-agent-skills 版本 | <0.x.x> |
| cdp-material-sdk 版本 | <latest 时实际 npm 安装版本号> |
| 跑测次数（每场景） | <1 / 3 / ...> |
| 备注 | <长上下文衰减、网络延迟等异常情况> |

---

## Gate 1 通过判定（轨道 A）

| 指标 | 门槛 | 实际 | 通过 |
|---|---|---|---|
| Tier A（场景 01-05）平均分 | ≥ 80 | __/100 | ☐ |
| 任何单场景"CDP 契约落地" | ≥ 35/50（70%）| min: __/50 | ☐ |
| 🅰 高置信度漏洞总出现次数（9 场景合计） | ≤ 2 | __ | ☐ |
| 🅰 失败模式 0 出现的场景数 | ≥ 6 | __ | ☐ |

**综合判定**：☐ Gate 1 通过 / ☐ Gate 1 不通过（具体原因见下方场景明细）

> **不计入门槛但需观察**（轨道 B 汇总）：
>
> | 指标 | 说明 |
> |---|---|
> | 期望主调 skill 触发率 | 9 场景中有多少触发了"期望主调 skill"——低 = 触发词或定位待优化 |
> | 替代路径分布 | 没用 skill 时 Agent 走了什么（读 SDK / 经验 / 其他）——反推 skill 是否冗余 |

---

## 9 场景汇总表

| # | 场景 | 契约落地 (50) | 漏洞回避 (30) | 完成度 (20) | 总分 (100) | Tier | 期望主调 skill | 主调触发 |
|---|---|---|---|---|---|---|---|---|
| 01 | 零知识开发者 | __ | __ | __ | __ | A | getting-started | ☐ |
| 02 | 从零做 ColorField | __ | __ | __ | __ | A | getting-started + 4 | ☐ |
| 03 | 包装第三方 DatePicker | __ | __ | __ | __ | A | adapter-and-wrap | ☐ |
| 04 | 已有项目加 Card | __ | __ | __ | __ | A | add-to-existing-package | ☐ |
| 05 | 修故障 manifest | __ | __ | __ | __ | A | manifest-validation | ☐ |
| 06 | DataTable 动态作用域 slot | __ | __ | __ | __ | B | slots | ☐ |
| 07 | Button + native loading | __ | __ | __ | __ | B | runtime-behavior + adapter | ☐ |
| 08 | useDataContainer 误用切换 | __ | __ | __ | __ | B | traits | ☐ |
| 09 | 复制粘贴老组件清理 | __ | __ | __ | __ | B | add-to-existing-package | ☐ |
| | **Tier A 平均** | | | | __ | | | |
| | **9 场景平均** | | | | __ | | | |

> "主调触发"列只作诊断信号（轨道 B），不参与综合判定阈值；用于反推 skill 触发设计。

---

## 场景详评（每场景一节）

> 模板：每节填三张计分子表（契约 50 / 漏洞 30 / 完成 20）+ 一张诊断观测表（不计分）+ 简要观察。

---

### 场景 01 — 零知识开发者（0 组件骨架）

> 测试目标：用户明确"组件下次再做"，Agent 必须搭出**可注册 0 组件**的骨架并通过自检，**不得**自作主张创建任何组件。

#### 1.1 CDP 契约落地（50 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 0 组件骨架契约齐全 | `package.json` + 空 components 注册点（独立数组或 `EngineComponentPackage.components: []` 内联）+ 插件入口用 `EngineComponentPackage` `id` 字段 | __ | __/12 |
| `validateManifest()` 自检闭环 | 对 0 组件 plugin 跑通，结果贴入 transcript / artifacts | __ | __/10 |
| `cdp-material-sdk` 依赖与 React 19 peerDep 配置正确 | package.json 含两者 | __ | __/10 |
| 不重复声明引擎自动能力 | 不出现 `hidden` / `mount` / `unmount` 等 | __ | __/8 |
| `npx tsc --noEmit` 通过 | 0 TS 错误 | __ | __/10 |

**契约落地小计**：__ / 50

#### 1.2 失败模式回避（30 分）

每出现一项 🅰 高置信度漏洞 -10，最低 0 分：

| 漏洞 (🅰) | 出现 | 备注 |
|---|---|---|
| **越权创建组件**（`Button` / `Demo*` / `Hello` 等任何具体组件目录） | ☐ | 本场景头号红线 |
| 凭印象用 `BASIC` / `FORM` / `CONTAINER` 等不存在的 category | ☐ | |
| `EngineComponentPackage` 用 `name` 字段而非 `id` | ☐ | |
| React 版本不指定为 19 | ☐ | |
| 强制每步 ASK pattern 确认 | ☐ | |

**漏洞回避小计**：__ / 30

#### 1.3 任务完成度（20 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 终止标识最低底线全满足 | package.json + 空注册点 + 插件入口 + tsc 通过 | __ | __/10 |
| 正确识别"不做组件"意图 | 阶段 3/4 显式跳过，不主动造 demo | __ | __/5 |
| Agent 走完 wrap-up 输出 artifacts | self-report 含包名 / type 前缀 / 跳过组件理由 | __ | __/5 |

**完成度小计**：__ / 20

#### 1.4 总分

**场景 01 总分**：__ / 100

#### 1.5 诊断观测（不计分，轨道 B）

| 观测项 | 期望 | 实际 |
|---|---|---|
| 期望主调 skill | `cdp-component-getting-started` | 触发 ☐ / 未触发 ☐ |
| 采纳深度 | 触发后是否照 skill 内容做 | low / med / high |
| 替代路径 | 没用 skill 时走了什么（读 SDK / 凭经验 / 其他） | __ |

#### 1.6 观察备注

> 文字记录 Agent 行为亮点 / 异常 / 改进建议。

---

### 场景 02 — 从零做 ColorField

#### 2.1 CDP 契约落地（50 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| DATA_FIELD trait | `traits: [COMPONENT_TRAIT.DATA_FIELD]` | __ | __/10 |
| valueSchema | `{ type: 'string', default: '#000000' }` | __ | __/10 |
| 不重复声明 DATA_FIELD 自动注入字段 | props 不含 value/readOnly/required/name/label；不重复 getValue/setValue/valueChange | __ | __/10 |
| onChange 传值 | `onChange?.(nextValue)` 不传 event | __ | __/8 |
| 自检闭环 | `validateManifest()` + `printValidationResult()` 调用 | __ | __/6 |
| meta + props.title | meta.title / meta.category=DataEntry；props 字段含 title | __ | __/6 |

**契约落地小计**：__ / 50

#### 2.2 失败模式回避（30 分）

每项 🅰 -10，最低 0：

| 漏洞 (🅰) | 出现 | 备注 |
|---|---|---|
| 重复声明 DATA_FIELD 注入的 props（value/readOnly/required/name/label） | ☐ | |
| 重复声明 getValue/setValue/valueChange | ☐ | |
| onChange 传整个 event 而非值 | ☐ | |
| 漏 meta.title 或 meta.category | ☐ | |
| 漏 props 字段的 title | ☐ | |
| 凭印象用不存在的 category | ☐ | |
| 主动扩张 manifest 表面（用户没要求加 loading/clear action 等） | ☐ | |

**漏洞回避小计**：__ / 30

#### 2.3 任务完成度（20 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 终止标识最低底线全满足 | 文件 + 注册 + tsc + validateManifest 通过 | __ | __/12 |
| forwardRef + ref 暴露 `[COMPONENT_STATE_KEY]` | 实现侧正确暴露状态 | __ | __/4 |
| Agent 走完 wrap-up 输出 artifacts | self-report 完整 | __ | __/4 |

**完成度小计**：__ / 20

#### 2.4 总分

**场景 02 总分**：__ / 100

#### 2.5 诊断观测（不计分）

| 观测项 | 期望 | 实际 |
|---|---|---|
| 期望主调 skill | `cdp-component-getting-started` | 触发 ☐ / 未触发 ☐ |
| 期望串联 skill | manifest-basics / traits / events-actions-state / manifest-validation | 触发数 __/4 |
| 采纳深度 | low / med / high | __ |
| 替代路径 | __ | __ |

---

### 场景 03 — 包装第三方 DatePicker

#### 3.1 CDP 契约落地（50 分 — 三层决策表）

| 层 | 期望选择 | 实际 | 分 |
|---|---|---|---|
| 结构层 | wrapper（forwardRef + 外层 `<div>` + spread `slotProps?.root`，**不**传给 vendor） | __ | __/16 |
| Props 层 | wrapper 内做值类型转换（number ↔ Date），**不**用 propMapping 改值 | __ | __/16 |
| 事件层 | `adapter.events.valueChange.propName: 'onDateChange'` + `transform`；事件已在 manifest `events` 声明 | __ | __/12 |
| rootPath | `engine.render.injection.rootPath: INJECT_PATH_SLOT_PROPS` | __ | __/6 |

**契约落地小计**：__ / 50

#### 3.2 失败模式回避（30 分）

每项 🅰 -10：

| 漏洞 (🅰) | 出现 | 备注 |
|---|---|---|
| 用 propMapping 试图做值类型转换 | ☐ | |
| 在 wrapper 里手写所有事件适配 | ☐ | |
| 把 slotProps.root 直接传给第三方组件 | ☐ | |
| adapter.events 引用未在 events 声明的事件 | ☐ | |
| 重复声明 DATA_FIELD 自动注入的 valueChange | ☐ | |

**漏洞回避小计**：__ / 30

#### 3.3 任务完成度（20 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 终止标识最低底线全满足 | 组件文件 + 注册入口 + vendor 字节级未变 + tsc 通过 | __ | __/12 |
| `validateManifest(plugin)` 通过 | 自检无报错 | __ | __/4 |
| Agent 走完 wrap-up 输出 artifacts | __ | __ | __/4 |

**完成度小计**：__ / 20

#### 3.4 总分

**场景 03 总分**：__ / 100

#### 3.5 诊断观测（不计分）

| 观测项 | 期望 | 实际 |
|---|---|---|
| 期望主调 skill | `cdp-component-adapter-and-wrap` | 触发 ☐ / 未触发 ☐ |
| 期望串联 skill | runtime-behavior（rootPath） | 触发 ☐ |
| 采纳深度 | low / med / high | __ |
| 替代路径 | __ | __ |

---

### 场景 04 — 已有项目加 Card

#### 4.1 CDP 契约落地（50 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 只新增不重写 | 仅新增 Card 组件并接入既有组件包注册入口，不重写包结构 / plugin 引导 / 构建工具 | __ | __/12 |
| 不修改既有组件 | ColorField **字节级未变** | __ | __/10 |
| trait 选择 | `traits: [LAYOUT_CONTAINER]`（不要 DATA_CONTAINER） | __ | __/10 |
| slots header/footer 含 title | `slots: { header: { title }, footer: { title } }` | __ | __/10 |
| 实现侧渲染 _slots | `_slots.header` / `_slots.footer`，**不**用 React children 凑数 | __ | __/8 |

**契约落地小计**：__ / 50

#### 4.2 失败模式回避（30 分）

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

#### 4.3 任务完成度（20 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 终止标识最低底线全满足 | 文件新增 + 注册 + 不动 ColorField + 不改 plugin + tsc 通过 | __ | __/12 |
| `validateManifest(plugin)` 通过 | 自检 | __ | __/4 |
| Agent 走完 wrap-up 输出 artifacts | __ | __ | __/4 |

**完成度小计**：__ / 20

#### 4.4 总分

**场景 04 总分**：__ / 100

#### 4.5 诊断观测（不计分）

| 观测项 | 期望 | 实际 |
|---|---|---|
| 期望主调 skill | `cdp-component-add-to-existing-package`（**不是** getting-started） | 触发 ☐ / 未触发 ☐ |
| 期望串联 skill | traits / slots / manifest-basics | 触发数 __/3 |
| 采纳深度 | low / med / high | __ |
| 替代路径 | __ | __ |

---

### 场景 05 — 修一个故障的 manifest

#### 5.1 CDP 契约落地（50 分 — 6 处错全修）

每修一处 +8（兼 48），自检 +2：

| # | 错误 | 修了 | 分 |
|---|---|---|---|
| 1 | manifest action key `reset` vs ref `resetValue` 不一致 | ☐ | __/8 |
| 2 | state `selectedColor` 不在 `[COMPONENT_STATE_KEY]` 下 | ☐ | __/8 |
| 3 | useImperativeHandle 依赖数组缺 selectedColor | ☐ | __/8 |
| 4 | actions.reset 漏 title | ☐ | __/8 |
| 5 | actions.reset.params 不是 type='object' | ☐ | __/8 |
| 6 | state.selectedColor 漏 schema | ☐ | __/8 |
| 自检 | `diagnose*` / `validateManifest` 调用且通过 | ☐ | __/2 |

**契约落地小计**：__ / 50

#### 5.2 失败模式回避（30 分）

每项 🅰 -10：

| 漏洞 (🅰) | 出现 | 备注 |
|---|---|---|
| 直接修宿主或 CDP 引擎代码而不先验证 manifest | ☐ | |
| 不会用 diagnoseMissingActionImpls / diagnoseMissingStateKeys | ☐ | |
| 不知道 action key 必须 = ref method name | ☐ | |
| 不区分 error 必修 / warning 建议修 | ☐ | |

**漏洞回避小计**：__ / 30

#### 5.3 任务完成度（20 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 终止标识全满足 | 修复后 tsc + validateManifest 通过 | __ | __/12 |
| 不重写 ColorField 整体 | 只改 ref 实现 + manifest | __ | __/4 |
| Agent 走完 wrap-up 输出 artifacts | __ | __ | __/4 |

**完成度小计**：__ / 20

#### 5.4 总分

**场景 05 总分**：__ / 100

#### 5.5 诊断观测（不计分）

| 观测项 | 期望 | 实际 |
|---|---|---|
| 期望主调 skill | `cdp-component-manifest-validation` | 触发 ☐ / 未触发 ☐ |
| 症状路由跳转 | "action 调用失败" / "state 拿不到" → events-actions-state | 触发 ☐ |
| 采纳深度 | low / med / high | __ |
| 替代路径 | __ | __ |

---

### 场景 06 — DataTable 动态作用域 slot

#### 6.1 CDP 契约落地（50 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| dynamic + dynamicSource + dynamicKey 三件套 | `dynamic: true` + `dynamicSource: 'columns'` + `dynamicKey: '{key}'` | __ | __/15 |
| scoped: true + scopeDescription | 含 record + index 描述 | __ | __/12 |
| 实现侧用 _scopedSlots | `_scopedSlots[col.key]?.({ record, index })`（**不**用 _slots） | __ | __/12 |
| dataIndex 用 format: 'dataField' | columns 数组里 dataIndex 字段 schema | __ | __/6 |
| columns 由 props 配置 | 不写死在 manifest | __ | __/5 |

**契约落地小计**：__ / 50

#### 6.2 失败模式回避（30 分）

每项 🅰 -10：

| 漏洞 (🅰) | 出现 | 备注 |
|---|---|---|
| 为每一列硬编码 slot 名 | ☐ | |
| 漏 dynamicSource / dynamicKey | ☐ | |
| 漏 scoped: true | ☐ | |
| 实现侧用 _slots[name] 而非 _scopedSlots[name] | ☐ | |
| dynamicKey 模板语法错（用 :key / ${key} 等） | ☐ | |
| 用 React render prop 自建 context | ☐ | |
| 主动扩张 manifest 表面（排序/筛选/分页做成 manifest 暴露能力） | ☐ | |

**漏洞回避小计**：__ / 30

#### 6.3 任务完成度（20 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 终止标识最低底线全满足 | 组件文件 + 注册 + tsc + validateManifest 通过 | __ | __/14 |
| Agent 走完 wrap-up 输出 artifacts | __ | __ | __/6 |

**完成度小计**：__ / 20

#### 6.4 总分

**场景 06 总分**：__ / 100

#### 6.5 诊断观测（不计分）

| 观测项 | 期望 | 实际 |
|---|---|---|
| 期望主调 skill | `cdp-component-slots` | 触发 ☐ / 未触发 ☐ |
| 期望串联 skill | manifest-basics（columns schema） | 触发 ☐ |
| 采纳深度 | low / med / high | __ |
| 替代路径 | __ | __ |

---

### 场景 07 — Button + native loading + onPress

#### 7.1 CDP 契约落地（50 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| Loading 选 native | `loading: { strategy: LOADING_STRATEGY.NATIVE }` | __ | __/12 |
| rootPath + wrapper DOM | `INJECT_PATH_SLOT_PROPS` + 外层 div spread `slotProps?.root` | __ | __/12 |
| 事件 propName | `adapter.events.click.propName: 'onPress'` | __ | __/10 |
| readOnly → disabled propMapping | `propMapping: { readOnly: 'disabled' }` | __ | __/8 |
| 不重复声明引擎自动能力 | manifest 不含 hidden/mount/unmount | __ | __/8 |

**契约落地小计**：__ / 50

#### 7.2 失败模式回避（30 分）

每项 🅰 -10：

| 漏洞 (🅰) | 出现 | 备注 |
|---|---|---|
| 用 wrapper 整体遮罩做 loading | ☐ | |
| 把 INJECT_PATH_SLOT_PROPS 直接给第三方 | ☐ | |
| 重复声明 hidden / mount / unmount 等引擎能力 | ☐ | |
| adapter.events.click 引用未声明事件 | ☐ | |
| 在 wrapper 内手写 onPress={onClick} 转换 | ☐ | |
| 声明 NATIVE 但 wrapper 又重复实现 loading state（CDP loading 契约一致性） | ☐ | |

**漏洞回避小计**：__ / 30

#### 7.3 任务完成度（20 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 终止标识最低底线全满足 | 文件 + 注册 + vendor 字节级未变 + tsc 通过 | __ | __/12 |
| `validateManifest(plugin)` 通过 | 自检 | __ | __/4 |
| Agent 走完 wrap-up 输出 artifacts | __ | __ | __/4 |

**完成度小计**：__ / 20

#### 7.4 总分

**场景 07 总分**：__ / 100

#### 7.5 诊断观测（不计分）

| 观测项 | 期望 | 实际 |
|---|---|---|
| 期望主调 skill | `cdp-component-runtime-behavior` + `cdp-component-adapter-and-wrap` | 触发数 __/2 |
| 期望串联 skill | events-actions-state | 触发 ☐ |
| 采纳深度 | low / med / high | __ |
| 替代路径 | __ | __ |

---

### 场景 08 — useDataContainer 误用切换

#### 8.1 CDP 契约落地（50 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 识别"订阅式 vs 命令式"误用 | 明确指出 useDataContainer 订阅整体导致重渲染 | __ | __/12 |
| 切换到 useDataContainerApi | 用命令式 hook 替代 | __ | __/14 |
| 字段订阅交给 DataScope / useFieldRegistry | 子字段独立订阅；用 SDK 提供机制，不绕过 | __ | __/14 |
| manifest 字节级未变 | trait 是对的，不应改 | __ | __/10 |

**契约落地小计**：__ / 50

#### 8.2 失败模式回避（30 分）

每项 🅰 -10、🅱 -5：

| 漏洞 | 出现 | 备注 |
|---|---|---|
| 🅰 不识别误用，仅用 React.memo 打补丁 | ☐ | |
| 🅰 自己手写字段注册表替代 useFieldRegistry | ☐ | |
| 🅱 用 useDataContainer 但加 useMemo 试图减重渲染 | ☐ | |
| 🅱 修了 manifest（trait）当成问题源 | ☐ | |
| 🅰 用额外状态库（zustand/jotai/valtio 等）绕过 SDK DataScope/useFieldRegistry | ☐ | 状态库选择本身不判，只判是否绕过 SDK 契约 |

**漏洞回避小计**：__ / 30

#### 8.3 任务完成度（20 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 终止标识最低底线全满足 | hook 切换 + manifest 未改 + tsc 通过 | __ | __/10 |
| self-report 解释"订阅式 vs 命令式" | 说清原理，让 Judge 判语义正确性 | __ | __/6 |
| Agent 走完 wrap-up 输出 artifacts | __ | __ | __/4 |

**完成度小计**：__ / 20

#### 8.4 总分

**场景 08 总分**：__ / 100

#### 8.5 诊断观测（不计分）

| 观测项 | 期望 | 实际 |
|---|---|---|
| 期望主调 skill | `cdp-component-traits` | 触发 ☐ / 未触发 ☐ |
| 采纳深度 | low / med / high | __ |
| 替代路径 | __ | __ |

---

### 场景 09 — 复制粘贴老组件清理

#### 9.1 CDP 契约落地（50 分 — 必删 vs 必保）

每删/保正确 +4（兼 40），type 唯一 +5、自检 +5：

| 处理 | 字段 | 正确 | 分 |
|---|---|---|---|
| 删 | engine.render.loading | ☐ | __/4 |
| 删 | actions.setLoading | ☐ | __/4 |
| 删 | actions.getLoading | ☐ | __/4 |
| 删 | state.loading | ☐ | __/4 |
| 删 | DATA_FIELD trait | ☐ | __/4 |
| 删 | adapter.propMapping | ☐ | __/4 |
| 删 | events.focus / events.blur | ☐ | __/4 |
| 删 | props.placeholder | ☐ | __/4 |
| 保 | INTERACTION_CLICKABLE trait | ☐ | __/4 |
| 保 | events.click + actions.click + props.label | ☐ | __/4 |
| type 唯一 | `acme.NewActionBar` 不复用 OldButton type | ☐ | __/5 |
| 自检 | `validateManifest()` 通过 | ☐ | __/5 |

**契约落地小计**：__ / 50

#### 9.2 失败模式回避（30 分）

每项 🅰 -10：

| 漏洞 (🅰) | 出现 | 备注 |
|---|---|---|
| 没移除老组件特有的 trait/event/action/state | ☐ | |
| 复用相同 type 字符串 | ☐ | |
| 直接 import OldButton 实现复用 | ☐ | |

**漏洞回避小计**：__ / 30

#### 9.3 任务完成度（20 分）

| 项 | 期望 | 实际 | 分 |
|---|---|---|---|
| 终止标识全满足 | 新组件 + 注册 + tsc + validateManifest 通过 | __ | __/12 |
| 不修改 OldButton | OldButton 字节级未变 | __ | __/4 |
| Agent 走完 wrap-up 输出 artifacts | __ | __ | __/4 |

**完成度小计**：__ / 20

#### 9.4 总分

**场景 09 总分**：__ / 100

#### 9.5 诊断观测（不计分）

| 观测项 | 期望 | 实际 |
|---|---|---|
| 期望主调 skill | `cdp-component-add-to-existing-package` | 触发 ☐ / 未触发 ☐ |
| 期望串联 skill | traits / events-actions-state / runtime-behavior（清无关能力）+ manifest-validation | 触发数 __/4 |
| 采纳深度 | low / med / high | __ |
| 替代路径 | __ | __ |

---

## 跑测后处理

### 反馈到 tdd-progress.md

每个场景里"出现 = 是"的 🅰 漏洞，回到 `cdp-agent-skills/tdd-progress.md` 找到对应 skill 的"后续可能的漏洞"段，标记：

- ✅ 已验证未出现
- ❌ 已验证仍出现 → 需要补 skill
- ➕ 新发现漏洞（不在原清单）→ 补到 skill 里

### 反馈到 skill 设计（轨道 B 输出）

汇总 9 场景的诊断观测：

- **某 skill 触发率持续低**（< 50%）：触发词或定位不显眼 → 改 SKILL.md 的 description / 关键词
- **触发但采纳深度 low**：内容不易消化或 Agent 觉得不必要 → 内容精简或并入其他 skill
- **替代路径常是"读 SDK"**：skill 是 SDK 的浓缩品，效果不如原文 → 改写 skill 内容或考虑废弃
- **替代路径常是"凭经验"**：模型已知该领域 → skill 对该模型冗余，但对弱模型仍有价值，保留

### Gate 1 决议

按"Gate 1 通过判定"段填结论。若未通过：

- 总结**最影响判定**的 1-2 个场景
- 给出 skill 修订建议（来自轨道 A 失败模式 + 轨道 B 诊断）
- 修完后重跑这 1-2 个场景

### 进入 Gate 2 准备

通过 Gate 1 后，启动 Gate 2 矩阵跑测：

- 选择 LLM 矩阵（Sonnet 4.5 / Gemini 2.5 Pro / Qwen3 Coder / GLM 4.6 / DeepSeek V3.2 至少 3 款）
- 选择 IDE 矩阵（Windsurf / Antigravity / Cursor / Copilot CLI / Claude Code 至少 3 款）
- N=3 次重复
- 复制本评分模板 × 矩阵单元格数量
- 汇总"单元格稳定性"（pass/total ≥ 80%）
