# cdp-agent-skills TDD 重构进度

本文件记录 9-skill 重构的 TDD 工作流：每个 skill 经历红（基线场景与失败模式）→ 绿（最小 SKILL.md）→ 重构（堵漏洞）三阶段。

## 方法论说明

按 `writing-skills` 的方法论：
1. **红**：跑场景，记录智能体在没有技能时的失败行为与合理化借口
2. **绿**：写技能解决具体失败
3. **重构**：发现新合理化借口 → 堵漏洞 → 重新验证

**本会话内的限制**：无法真正派遣"无技能子智能体"跑基线，所以红色阶段的失败模式来自：
- 对 LLM 行为的合理预测（基于过往观察）
- SDK 字段约束（事实源）
- `validateManifest()` 与 `diagnose*()` 工具实际会报的错误

**置信度标注**：
- 🅰 高置信度：基于 SDK 强校验或多次观察的 LLM 模式
- 🅱 中置信度：LLM 在类似任务中常见但需具体验证
- 🅲 推测：基于一般性 LLM 倾向，需场景验证

如需真正的子智能体基线，需在独立会话跑场景报告。

## Skill 重构清单与状态

| # | Skill | 类型 | 红 | 绿 | 重构 | 备注 |
|---|---|---|:---:|:---:|:---:|---|
| 1 | cdp-component-slots | 原子（POC） | ✅ | ✅ | ✅ | 85 行 / 447 词 / 3596 字符 |
| 2 | cdp-component-traits | 原子 | ✅ | ✅ | ✅ | 114 行 / 539 词 / 4946 字符；含 DATA_FIELD 自动注入清单 + DataScope 详表移到 references |
| 3 | cdp-component-manifest-basics | 原子 | ✅ | ✅ | ✅ | 110 行 / 571 词 / 4231 字符；新增 skill 覆盖 props + designer meta |
| 4 | cdp-component-events-actions-state | 原子 | ✅ | ✅ | ✅ | 116 行 / 564 词 / 4774 字符；去 slots，三合一仍内聚 |
| 5 | cdp-component-runtime-behavior | 原子 | ✅ | ✅ | ✅ | 118 行 / 624 词 / 5233 字符；改名+引入 useConcurrentLoading/useDualLoading + 引擎基础能力清单 |
| 6 | cdp-component-adapter-and-wrap | 原子 | ✅ | ✅ | ✅ | 127 行 / 691 词 / 5254 字符；升格 Adapter 决策框架，wrapper 模板 + 三层决策表 |
| 7 | cdp-component-manifest-validation | 主线 | ✅ | ✅ | ✅ | 91 行 / 298 词 / 3339 字符；主线只做"症状→原子 skill"路由+校验工具速查+SDK 导入边界 |
| 8 | cdp-component-add-to-existing-package | 主线 | ✅ | ✅ | ✅ | 88 行 / 234 词 / 2727 字符；只做"新增组件"工作流程编排 + 需求→原子 skill 路由 |
| 9 | cdp-component-getting-started | 主线 | ✅ | ✅ | ✅ | 129 行 / 617 词 / 4993 字符；总调度入口；去掉强制 ASK pattern；更新废弃 skill 引用名 |

---

## 1. cdp-component-slots（进行中）

### 红色阶段：应用场景与基线失败模式

#### 场景 1：命名插槽（Card 类）

**用户输入**："给当前 CDP 组件包加一个 Card 组件，需要 header 区域和 footer 区域"

**无技能基线行为预测**：

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 给 Card 加上 `LAYOUT_CONTAINER` trait（多余） | 🅰 | LLM 看到"承载子内容"会本能加 trait；SDK 文档之前也有此暗示 |
| 把 slots 写在错误的层级（如 `meta.slots`） | 🅱 | manifest 结构层级是项目特有约定 |
| 漏写 `title` 字段 | 🅰 | LLM 可能简化为 `{ header: {} }`；validateManifest 会报错但 LLM 不一定知道 |
| 组件实现忘记渲染 `_slots.header` / `_slots.footer` | 🅰 | LLM 可能用 `<header>{children}</header>` 凑数；运行时设计器显示但实际不渲染 |
| import 路径混乱（直接从 `cdp-material-sdk` 而非 `/portable`） | 🅱 | 子路径约定是项目特有 |

#### 场景 2：动态插槽（Table 列模板）

**用户输入**："给 DataTable 加上 columns 数组，每列要支持自定义渲染模板"

**无技能基线行为预测**：

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 为每一列硬编码 slot 名（不动态） | 🅰 | LLM 默认逐个写；不知道 dynamic 机制 |
| 漏写 `dynamicSource` 或 `dynamicKey` | 🅰 | validateManifest 强校验，但 LLM 不知道字段 |
| `dynamicKey` 格式错误（用 `:` 替代而非 `{}` 模板） | 🅱 | 项目特有命名约定 |
| 漏写 `scoped: true` + `scopeDescription` | 🅱 | 列模板需要 record 上下文，但 LLM 不一定意识到 |
| 实现侧用 `_slots[name]` 而非 `_scopedSlots[name]` | 🅰 | 两套机制 LLM 容易混淆 |

#### 场景 3：作用域插槽（List 行项）

**用户输入**："List 的每个 item 要能访问当前的 record 和 index"

**无技能基线行为预测**：

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 用 React render prop 模式自建 context | 🅰 | LLM 默认走 React 通用方案，不知道 SDK 已封装 scoped slots |
| 漏写 `scoped: true` | 🅰 | 默认 LLM 写普通命名 slot |
| 实现侧不用 `_scopedSlots` 接收 scope props | 🅰 | 与上一条联动 |

#### 场景 4：LAYOUT_CONTAINER 与 slots 区分

**用户输入**："我要做一个布局容器，能放子组件"

**无技能基线行为预测**：

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 同时加 LAYOUT_CONTAINER 和 slots（误把 slots 当具体区域） | 🅰 | 之前 SDK 文档有此暗示（已修） |
| 只加 slots 不加 LAYOUT_CONTAINER（用户其实想要默认 children） | 🅱 | 看用户原话决定 |
| 把"子组件"理解成 React `children` 但走 slots 实现 | 🅱 | 概念混淆 |

### 绿色阶段：最小技能 ✅

写出 `skills/cdp-component-slots/SKILL.md`（85 行 / 447 词），含：

- description：纯触发条件，无 workflow 总结
- 何时使用表格：覆盖 6 种子内容形态（命名 / 作用域 / 动态 / 单一匿名 / 强组合 / 混合）
- 关键约束：必填字段、命名规则、调用形式
- 工作流程 5 步
- 常见错误 6 项 + 引导路径

### 重构阶段：堵 4 个漏洞 ✅

绿色阶段验证 4 场景后发现的漏洞与对应修复：

| 漏洞 | 修复 |
|---|---|
| 表格里"单一匿名子区域"举 Card 例子误导（Card 实为混合形态） | 改用纯 Modal/Card-装饰 例子；新增"既有匿名主区又有具名扩展区（带 header/footer 的 Card）"行 |
| 动态插槽行没明示通常配 `scoped: true` | 表格 / 工作流程 / 常见错误三处都加该提示 |
| 工作流程"通过函数调用接收 scope"措辞含糊 | 给出 `_scopedSlots[name]?.(scope)` 调用骨架，并强调"参数名必须从 SDK recipe 复制" |
| 缺少对"用 React render-prop 自建作用域"基线失败的反驳 | 常见错误新增一行直接反驳 |
| 用户说"做一个布局容器"时缺前置路径分流 | "何时使用"开头加分流说明：单一匿名 / 强组合 → 切到 traits skill |

### 后续可能的漏洞（待真实子智能体验证）

- LLM 看到 `?.(scope)` 不熟悉可选链 + 函数调用语法，可能误用为普通 ReactNode → 已在常见错误反驳，但需真实测试
- LLM 不读 SDK recipe 凭印象猜 scope 字段名 → 已在工作流程强约束"必须从 SDK 复制"，需真实测试

---

## 2. cdp-component-traits（进行中）

### 红色阶段：应用场景与基线失败模式

#### 场景 1：单值字段（ColorPicker 接入表单）

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 重复声明 value / readOnly / required / name / label props | 🅰 | LLM 不知道 DATA_FIELD trait 自动注入这些；会按"完整 manifest"思维写满 |
| 重复声明 getValue / setValue / valueChange 等 | 🅰 | 同上；覆盖引擎版本会丢失 valueSchema 自动特化 |
| 漏写 valueSchema 或缺 default | 🅱 | validateManifest 给 warning |
| 组件 onChange 传整个 event 对象而非值 | 🅰 | LLM 默认 React 习惯；CDP 期望 `onChange(nextValue)` |

#### 场景 2：数据容器（Form）

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 只声明 DATA_CONTAINER，漏 LAYOUT_CONTAINER | 🅰 | Form 拖入字段需要 LAYOUT_CONTAINER；LLM 容易看到"管理数据"就只标 DATA |
| 缺 valueSchema | 🅱 | LLM 可能省略 |
| 不包 DataScope，直接渲染 children | 🅰 | LLM 不知道 SDK 封装了 DataScope；子字段路径解析失败 |
| DataScope 传 inline lambda（getRecord / registerField） | 🅰 | LLM 默认习惯；导致每次 render 子字段重新订阅 |
| 用 useDataContainer 替代 useDataContainerApi | 🅱 | LLM 可能误选订阅式；性能差 |
| 自己手写字段注册表而不用 useFieldRegistry | 🅲 | LLM 不知道 SDK hook 存在 |

#### 场景 3：通用布局容器（Card）

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 误以为 LAYOUT_CONTAINER 必须配 slots | 🅰 | 旧 SDK 文档暗示（已修），LLM 训练数据可能还停留在旧版 |
| 组件实现忘渲染 `{children}` | 🅱 | LLM 可能漏 |
| Card 误标为 DATA_CONTAINER | 🅲 | 概念混淆 |

#### 场景 4：强组合容器（Tabs/TabPane）

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 用 slots 命名 panel1/panel2 硬编码 | 🅰 | LLM 默认想到 slot；不知道 nesting 机制 |
| 用 slots.allowedChildren 而非 nesting.allowedChildren | 🅰 | 两个 allowedChildren 字段同名易混 |
| 仅在 Tabs 写 nesting.allowedChildren，TabPane 漏 nesting.allowedParents | 🅱 | 单向限制；建议双向声明 |
| nesting.allowedChildren 写不存在的 type | 🅲 | 拼写错误 |

#### 场景 5：Form 同时是 DATA_CONTAINER + LAYOUT_CONTAINER

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 只声明一个 trait | 🅰 | 见场景 2 |
| 困惑两个 trait 是否互斥 | 🅲 | 概念问题 |

### 绿色阶段：最小技能 ✅

写出 `skills/cdp-component-traits/SKILL.md`（114 行 / 539 词），含：

- description：纯触发条件（DATA_FIELD / DATA_CONTAINER / LAYOUT_CONTAINER / nesting 关键词）
- 何时使用 trait 组合表（覆盖 7 种组件形态）
- DATA_FIELD 自动注入清单（最关键，防止重复声明）
- DATA_CONTAINER：DataScope + 三个 hook 选择 + useFieldRegistry
- LAYOUT_CONTAINER + nesting：默认 children 区域、强组合关系双向声明
- 工作流程 5 步（精简）
- 常见错误 10 项

`references/traits.md` 含按 trait 索引的 SDK 文档导航 + DataScope 详细入参表（对象型 vs 数组型容器）。

### 重构阶段：精简到 token 目标 ✅

初稿 141 行 / 629 词，超目标。压缩措施：

| 措施 | 收益 |
|---|---|
| DATA_FIELD「必做」子节合并入「自动注入清单」段 | 去掉冗余条目 |
| DATA_CONTAINER「DataScope 关键参数」表移到 `references/traits.md` | SKILL.md 减 5 行表格 |
| 工作流程 5 步从分项压缩为单行 | 减 15 行 |
| 常见错误从 12 项删 2 项重复 + 合并语义相近项 | 减 4 行 |
| 完成检查从 8 项压缩为 6 项 | 减 2 行 |

终稿 114 行 / 539 词。

### 后续可能的漏洞（待真实子智能体验证）

- LLM 看 DATA_FIELD 自动注入清单密集，可能记混或漏看 → 已强调"勿重复声明"，但需真实测试
- DataScope 入参表已移 references，LLM 可能不读 references → 但 SKILL.md 工作流程明确指引；初次开发 Form 时按需读取应该足够

---

## 3. cdp-component-manifest-basics（进行中）

### 红色阶段：应用场景与基线失败模式

#### 场景 1：给现有组件加 props（ColorPicker placeholder + disabled）

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 把 React `onChange` / 回调函数写进 props | 🅰 | LLM 默认 React 思维，不区分 manifest 契约与运行时接口 |
| 重复声明 trait 自动注入字段（DATA_FIELD 的 `value` / `readOnly` 等） | 🅰 | 与 traits skill 同源问题；这里加二次防线 |
| 漏写 `title` | 🅰 | LLM 简化为 `{ placeholder: { type: 'string' } }`；validateManifest warning |
| 默认值写在 React 组件参数而非 schema `default` | 🅱 | LLM 默认 React 习惯；设计器看不到 |
| 把第三方 prop 名直接当 manifest key | 🅱 | LLM 看到第三方 `selectedValue` 就用这个名；该走 `adapter.propMapping` |

#### 场景 2：配置设计器元信息（Avatar 显示名 / 分类 / 图标）

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 漏写 `meta.title` 或 `meta.category` | 🅱 | validateManifest error |
| `subGroup` 字符串散乱（"用户信息" vs "user-info" vs "用户"） | 🅲 | 同包内不复用常量 |
| 把业务态图标（如「在线/离线」）放进 `meta.icon` | 🅲 | 概念混淆 meta 与 runtime |
| 缺 `meta.description` | 🅲 | 影响 AI / Tooltip 理解 |

#### 场景 3：隐藏子部件（TabPane 不想单独出现在面板）

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 不知道 `hiddenInComponentList` 字段存在 | 🅰 | LLM 不熟悉 CDP 特定字段；可能用 `disabled: true` 等不存在字段 |
| 用 `hiddenInComponentList` 来"软删除"未实现组件 | 🅲 | 概念误用 |

#### 场景 4：嵌套数组 props（Table columns）

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 数组 `items` 漏 `type: 'object'` 或 `properties` | 🅰 | LLM 嵌套 schema 易写错 |
| 嵌套字段缺 `title` | 🅱 | 同场景 1 |
| `dataIndex` 字段不用 `format: 'dataField'` | 🅱 | 设计器渲染普通文本框，丢失字段选择器 |
| 平铺嵌套（直接列出 col1/col2/col3） | 🅲 | 用户希望按数据驱动，不应硬编码 |

#### 场景 5：枚举字段（size: small/medium/large）

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 用 `enum` 列字符串，设计器只显示英文值 | 🅰 | LLM 默认 enum；缺差异化标签 |
| 用 `oneOf` 但忘了 `title` | 🅱 | 同场景 1 |

### 绿色阶段：最小技能 ✅

写出 `skills/cdp-component-manifest-basics/SKILL.md`（110 行 / 571 词）。覆盖范围：

- props（JSON Schema）：顶层结构、必填 title、`default` 写 schema、`oneOf` vs `enum`、嵌套对象/数组、`format` 控件提示、与 trait 自动注入字段的边界、与 `adapter.propMapping` 的边界
- meta：必填 `title` / `category`、`description` / `subGroup` / `icon` / `hiddenInComponentList` 用法
- `hiddenInComponentList` 三种适用场景（父子绑定子部件 / 内部辅助 / 过渡废弃）+ 反对软删除

`references/manifest-basics.md` 含 SDK 文档导航 + ExtendedJSONSchema7 扩展字段表。

### 重构阶段：精简到 token 目标 ✅

初稿 114 行 / 594 词，超目标 19%。压缩措施：

| 措施 | 收益 |
|---|---|
| 常见错误 13 项 → 11 项（合并 `format` 多场景为单行；删 subGroup 散乱、业务态图标两个 🅲 低优先级项） | 减 2 行 / 约 25 词 |
| 完成检查 8 项 → 6 项（合并语义相近项） | 减 2 行 / 约 15 词 |

终稿 110 行 / 571 词。

### 后续可能的漏洞（待真实子智能体验证）

- LLM 看到"props 不要写运行时回调"可能与 `adapter.events.transform` 内的 transform 函数概念混淆 → 实际两者层级不同（manifest props 是声明，transform 是适配函数体），但 LLM 可能搞混 → 需要真实测试观察
- ExtendedJSONSchema7 的 `x-*` 字段（动态枚举、x-slot 等）只在 references 中提，LLM 可能不读；但典型场景下用不到，先观察

---

## 4. cdp-component-events-actions-state（进行中）

### 红色阶段：应用场景与基线失败模式

#### 场景 1：加自定义事件（DataTable 的 rowClick）

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 用 `events` 而非 `customEvents` 声明 namespaced 自定义事件 | 🅰 | LLM 看到"加事件"默认进 events |
| 自定义事件名漏 namespace 前缀（写 `rowClick` 而非 `acme:rowClick`） | 🅰 | LLM 默认简单命名 |
| 漏 `payloadSchema` | 🅰 | 自定义事件强校验，validateManifest error |
| 标准事件能覆盖却新声明 customEvents（如 `itemClick` 已是标准） | 🅱 | LLM 可能不查标准事件表 |

#### 场景 2：暴露命令式方法（refresh action）

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 漏 `action.title` | 🅰 | validateManifest 报错 |
| `params.type` 不是 `'object'` | 🅰 | 强校验；LLM 可能写 array 或单一 type |
| Action key 与 ref 方法名不一致 | 🅰 | useImperativeHandle 命名错；diagnoseMissingActionImpls 检出 |
| 只在 manifest 声明，没在 ref 实现方法 | 🅰 | 宿主调用失败 |
| 漏 `returns` | 🅱 | warning 级别但建议补 |

#### 场景 3：暴露运行时状态（loading / selectedRowKeys）

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| state key 没暴露在 `COMPONENT_STATE_KEY` 下 | 🅰 | LLM 默认写 ref 顶层；diagnoseMissingStateKeys 报错 |
| 用 `'__state'` 字符串而非 `COMPONENT_STATE_KEY` 常量 | 🅱 | 保留 key 拼写易错 |
| state 漏 `schema` 或 `title` | 🅱 | LLM 简化 |
| useImperativeHandle 依赖数组漏 state 值 | 🅰 | stale closure；外部读到旧值，UI 看似变了但 state 不更新 |
| state 用于写操作（外部 setState） | 🅲 | 概念误用；写操作必须走 action |

#### 场景 4：DATA_FIELD 自动注入字段重复声明

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 重复声明 `valueChange` / `getValue` / `setValue` / `value` state | 🅰 | 见 traits skill；本 skill 加二次防线 |

#### 场景 5：adapter 引用未声明事件

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| `adapter.events` 引用 manifest 未声明的事件 | 🅰 | validateManifest error |
| `adapter.customEvents` 同上 | 🅰 | 同 |

### 绿色阶段：最小技能 ✅

写出 `skills/cdp-component-events-actions-state/SKILL.md`（116 行 / 564 词）。覆盖范围：

- events：标准事件优先策略、自定义事件 namespaced + payloadSchema、adapter 事件必须先声明
- actions：title 必填、`params.type === 'object'`、key === ref method、diagnoseMissingActionImpls
- state：COMPONENT_STATE_KEY 常量、useImperativeHandle 依赖数组完整、只读快照、diagnoseMissingStateKeys
- 给出 forwardRef + useImperativeHandle 的标准实现骨架（10 行代码示例）
- 与 DATA_FIELD 自动注入字段的边界 + adapter 边界

`references/events-actions-state.md` 含 SDK 文档导航 + 标准事件速查表。

### 重构阶段：无需大幅压缩 ✅

初稿即落在目标范围（116 行 / 564 词，比目标 100 行 / 500 词略超 16%/12%，但内容密度合理）。骨架代码示例占 11 行但有显著教学价值——保留。

### 后续可能的漏洞（待真实子智能体验证）

- LLM 看 namespace 用冒号 `:`（如 `acme:rowAction`）而非点 `.`，可能写错符号 → SKILL.md 给了例子但没硬约束符号；如真实测试出现混淆，可加规则
- LLM 可能在 useImperativeHandle 依赖数组中放置不必要的项（过度依赖） → 漏的危害大于多放，先观察

---

## 5. cdp-component-runtime-behavior（进行中）

### 红色阶段：应用场景与基线失败模式

#### 场景 1：Card 配置 rootPath

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 漏 rootPath 声明（用宿主 div 兜底） | 🅰 | 设计器选中 / 显隐定位偏移；正式组件应显式声明 |
| 写 `INJECT_PATH_SLOT_PROPS` 但组件没展开 `slotProps.root` | 🅰 | 强约定但 LLM 可能漏 |
| 字段路径写错（`engine.injection` 漏 `render`） | 🅱 | LLM 可能拼错层级 |
| 自定义 rootPath 但路径上的 props 未透传 | 🅲 | 罕见但难排查 |

#### 场景 2：包装第三方 DatePicker 的 rootPath

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 把 `INJECT_PATH_SLOT_PROPS` 直接给第三方组件（不透传未知 DOM 属性） | 🅰 | 宿主注入失效 |
| 不知道要外层加 wrapper DOM 节点 | 🅰 | LLM 默认直接渲染第三方 |

#### 场景 3：Button 配置 Loading

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 漏 loading 配置 | 🅱 | 不知道有此能力 |
| 用 `wrapper` 包 Button（应该用 `native`） | 🅱 | 选错策略 |
| `native` 但 loading 时未阻断点击 | 🅰 | 要求组件实现真正禁用交互 |
| prop 名不是 `loading` 时漏 `propName` | 🅲 | 边缘场景 |

#### 场景 4：Table 配置 Loading

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 用 `wrapper` 整体遮罩（破坏 Table 局部 loading 体验） | 🅰 | LLM 默认 wrapper 万能 |
| 用 `native` 但 Table 没 loading prop | 🅰 | 选错策略 |
| 用 `none` 但没自实现 setLoading / getLoading actions | 🅱 | LLM 不知道需要补 actions |
| 不知道 `useConcurrentLoading` / `useDualLoading` 存在，自己造引用计数 | 🅱 | LLM 不熟悉 SDK hook |

#### 场景 5：重复声明引擎基础能力

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 重复声明 `hidden` action / `setHidden` / `getHidden` / `toggleHidden` / `mount` / `unmount` | 🅰 | 宿主自动补充；重复会冲突 |

### 绿色阶段：最小技能 ✅

写出 `skills/cdp-component-runtime-behavior/SKILL.md`（118 行 / 624 词）。覆盖范围：

- rootPath 决策表（自研 / 透传 / 包装第三方 / 自定义路径 / 黑盒兜底）+ 实现侧契约
- Loading 三策略对比表（native / wrapper / none）+ 各自实现契约
- `useConcurrentLoading` / `useDualLoading` 辅助 hook 触发条件与搭配建议
- 引擎基础能力清单（hidden / setHidden / getHidden / toggleHidden / mount / unmount）勿重复声明
- 字段路径完整性（`engine.render.injection.rootPath` / `engine.render.loading`）

`references/runtime-behavior.md` 含 SDK 文档导航 + 公共 API 入口（INJECT_PATH_SLOT_PROPS、BaseUIProps、loading hook、validateManifest）。

### 重构阶段：无需大幅压缩 ✅

初稿 118 行 / 624 词，比目标超 18% / 25%，但内容均为事实/决策型表格（rootPath 5 行决策 + Loading 3 策略 + 辅助 hook + 基础能力清单），不宜删。保留。

### 后续可能的漏洞（待真实子智能体验证）

- LLM 可能困惑 `useConcurrentLoading` 与 `useDualLoading` 的边界 → 已在 hook 触发条件段说明，需测试
- 包装第三方组件场景与 `cdp-component-adapter-and-wrap` skill 有重叠 → 本 skill 只点 rootPath 部分，详细决策走 adapter skill；如 LLM 在主线串错，需调整引用关系

---

## 6. cdp-component-adapter-and-wrap（进行中）

### 红色阶段：应用场景与基线失败模式

#### 场景 1：包装 AntD Select（值 prop 名不同）

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 用 `mapProps` 只做改名（应用 `propMapping`） | 🅰 | LLM 看到 mapProps 灵活就全用它，错过类型化的 propMapping |
| 用 `propMapping` 做值变换（应回 wrapper） | 🅰 | propMapping 只能改名 |
| 不写 wrapper 直接注册第三方 + 全靠 adapter | 🅱 | 第三方组件 props 协议会渗透 |
| 重复声明 DATA_FIELD 自动注入的 valueChange | 🅰 | LLM 看到事件需要适配就在 events 中加 |

#### 场景 2：第三方 Button 事件名 onPress

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 在 wrapper 内手写 `onPress={onClick}` 转 prop 名（应用 `adapter.events.propName`） | 🅰 | 协议形状渗透到 wrapper |
| `adapter.events` 引用未在 manifest 声明的事件 | 🅰 | validateManifest error |
| 自定义事件未 namespaced | 🅰 | 见 events-actions-state skill |

#### 场景 3：第三方 List `onItemTap(item, index)` 行作用域

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 不用 `adapter.events.toScope`，在 wrapper 中手写作用域注入 | 🅰 | LLM 不知道 toScope 存在 |
| 用 `transform` 把 record/index 塞进 payload，丢失作用域元信息 | 🅱 | 应分别走 transform + toScope |

#### 场景 4：第三方 DatePicker 值类型不同（Moment vs Date）

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 用 `propMapping` 却需要值类型转换（漏处理） | 🅰 | propMapping 只改名不变值 |
| 用 `mapProps` 做值变换（应回 wrapper） | 🅱 | mapProps 是逃生舱，复杂值变换在 manifest 中难维护 |
| 不知道这是 wrapper 领域（值变换 / 默认值 / 受控转换） | 🅰 | 三层视角缺失 |

#### 场景 5：第三方组件无根 DOM 注入入口

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 把 `slotProps.root` 直接传给第三方组件 | 🅰 | 不透传未知 DOM 属性 |
| 不知道要外层加 wrapper DOM | 🅰 | LLM 默认直接渲染第三方 |
| 用 `$root` 给第三方 | 🅲 | 同上 |

### 绿色阶段：最小技能 ✅

写出 `skills/cdp-component-adapter-and-wrap/SKILL.md`（127 行 / 691 词）。覆盖范围：

- 三层决策框架表（事件层 / Props 层 / 结构层 → adapter or wrapper 推荐）
- adapter 原语速查代码块（propMapping / events.*.propName/transform/toScope / customEvents）
- wrapper 标准模板代码块（forwardRef + slotProps.root + BaseUIProps）
- adapter 引用事件必须先声明
- DATA_FIELD valueChange 适配走 adapter，不重复声明
- React peerDependencies

`references/adapter-and-wrap.md` 含 SDK 文档导航 + 关联 skill 索引。

### 重构阶段：精简代码示例与解释 ✅

初稿 149 行 / 735 词，超目标 49% / 47%。压缩措施：

| 措施 | 收益 |
|---|---|
| 三层决策详细解释段（事件层主场 / 结构层永远 wrapper / 协议解耦 / 混合策略）合并为 4 个要点 bullet | 减 4 行 |
| wrapper 模板代码块从 18 行精简到 8 行（合并 interface 与 forwardRef 类型参数） | 减 10 行 |
| adapter 原语代码块去掉注释行 | 减 4 行 |
| 常见错误从 10 项 → 8 项（合并 mapProps 多场景、合并 wrapper 重塑 payload 多场景） | 减 2 行 |

终稿 127 行 / 691 词。仍略超目标，但代码示例提供具体可复用模式，删后会损害教学价值。

### 后续可能的漏洞（待真实子智能体验证）

- LLM 看三层决策表后可能仍把所有适配都塞进 wrapper（"wrapper 更熟悉"），违反"事件层 adapter 主场"原则 → 三层表的强约束 + 常见错误反驳，需测试
- `adapter.events.toScope` vs `transform` 边界 LLM 可能搞混（toScope 提取作用域元信息，transform 重塑 payload） → SKILL.md 已分别列出但需测试

---

## 7. cdp-component-manifest-validation（进行中）

主线 skill：交付前自检 + 排障入口。设计原则——给"症状→原子 skill"路由表，不重复原子 skill 内容；只做校验工具速查 + SDK 导入边界。

### 红色阶段：应用场景与基线失败模式

#### 场景 1：交付前自检

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 不知道 validateManifest / validateManifests / printValidationResult 的存在 | 🅰 | 项目特定 API |
| 不知道有 diagnoseMissingActionImpls / diagnoseMissingStateKeys | 🅱 | 同上 |
| 跳过 SDK 导入边界检查 | 🅱 | 项目特定 |
| 不会区分 error / warning 处理建议 | 🅲 | 不熟悉级别 |

#### 场景 2：组件渲染失败

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 直接修改宿主代码而不先验证 manifest | 🅰 | LLM 默认进入"调试代码"模式 |
| 不查 type 在 plugin.ts 中是否已注册 | 🅱 | 项目特定 |
| 不会区分 manifest 结构问题 vs 组件实现问题 | 🅱 | 系统化排错思路 |

#### 场景 3：事件不触发

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 不知道 DATA_FIELD trait 自动注入 valueChange，漏声明 trait | 🅰 | 见 traits skill |
| 直接看宿主代码而非校验 manifest | 🅱 | 同场景 2 |
| 不知道 adapter.events 引用必须先在 manifest 声明 | 🅱 | 见 events-actions-state skill |

#### 场景 4：action 调用失败

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 不会用 diagnoseMissingActionImpls 自检 | 🅰 | 工具不知 |
| 不知道 action key 必须 = ref method name | 🅱 | 见 events-actions-state skill |

#### 场景 5：state 过期 / 拿不到值

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| useImperativeHandle deps 数组漏 state 值 | 🅰 | stale closure |
| state 不在 COMPONENT_STATE_KEY 下 | 🅱 | 同场景 4 |
| 不会用 diagnoseMissingStateKeys | 🅱 | 工具不知 |

#### 场景 6：rootPath 选中偏移

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| INJECT_PATH_SLOT_PROPS 但组件没 spread slotProps.root | 🅰 | 见 runtime-behavior skill |
| 字段路径写错（漏 render） | 🅱 | 同上 |

### 绿色阶段：最小技能 ✅

写出 `skills/cdp-component-manifest-validation/SKILL.md`（91 行 / 298 词，**主线 skill 自然紧凑**）。覆盖范围：

- 触发情境表（交付前自检 / 排障入口）
- 校验工具速查代码块（validateManifest / validateManifests / printValidationResult / diagnoseMissingActionImpls / diagnoseMissingStateKeys）
- error / warning 处理建议
- SDK 导入边界（portable / host-react / 禁止宿主内部）
- **症状 → 原子 skill 路由表**（9 种典型症状映射到对应 skill）
- 工作流程 6 步（不先改宿主 / 静态校验 / 一致性诊断 / 边界 / 路由到原子 skill / 闭环）

### 重构阶段：无需大幅压缩 ✅

主线 skill 的设计原则——只做调度+速查+路由，不重复原子 skill 内容——使其自然落在目标范围内（91 行 / 298 词，远低于 100/500 目标）。

### 后续可能的漏洞（待真实子智能体验证）

- 症状路由表 9 行——LLM 可能直接修对应症状所在文件而忘了切到原子 skill 系统化排查。已在工作流程"用症状→原子 skill 路由表跳到对应原子 skill 修复"显式约束，需测试
- LLM 可能跳过"先校验 manifest"这一步直接进入"看宿主代码"模式 → 工作流程第 1 步"不要先改宿主代码"已强约束，需测试

---

## 8. cdp-component-add-to-existing-package（进行中）

主线 skill：仓库已有 CDP 组件包结构、用户只想新增 + 注册 + 验证一个组件时使用。设计原则——只做调度+注册清单+顺序，能力实现走原子 skill。

### 红色阶段：应用场景与基线失败模式

#### 场景 1：在已有 CDP 组件包内新增一个 Card 组件

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 重建组件包结构 / 替换构建工具 | 🅰 | 用户没要求；过度操作 |
| 改写其他不相关组件 | 🅰 | 同上 |
| 不知道现有注册位置（plugin.ts / manifest 聚合文件） | 🅰 | 项目特定，必须先发现 |
| 跳过 validateManifest | 🅱 | 见 manifest-validation skill |

#### 场景 2：漏注册

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 创建了 manifest.ts 和 index.tsx 但忘加入聚合文件 / plugin.ts 注册 | 🅰 | 设计器找不到组件 |
| 新组件 `type` 与已有组件冲突 | 🅱 | type 必须全局唯一 |
| `type` 缺命名空间前缀 | 🅱 | 易与其他包冲突 |

#### 场景 3：复制粘贴老组件然后修改

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 没移除老组件特有的 trait / event / action / state（与新组件无关） | 🅰 | 配置漂移；validateManifest 报 warning/error |
| 复用相同 `type` 字符串 | 🅰 | 同场景 2 |

#### 场景 4：能力裁剪

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 不基于实际需求加能力（trait / events / actions / state / loading 全加） | 🅰 | 过度声明，维护负担 |
| 不知道哪些是必填（type / meta.title / meta.category） | 🅱 | 见 manifest-basics skill |

### 绿色阶段：最小技能 ✅

写出 `skills/cdp-component-add-to-existing-package/SKILL.md`（88 行 / 234 词）。覆盖范围：

- "何时使用 / 何时不使用"路由（区分新增 / 从零创建 / 修改 / 排障 4 种情境）
- 工作流程 5 步（发现注册约定 → 仅加新文件 → 注册 → 按需实现 → 校验）
- 需求 → 原子 skill 路由表（6 类能力）
- 命名空间与 type 唯一性约束
- 常见错误清单（重建结构 / 改无关组件 / 漏注册 / type 冲突 / 复制粘贴未清理 / 全加能力 / 跳过校验）

### 重构阶段：无需大幅压缩 ✅

主线 skill 设计原则——只做调度+清单+顺序——使其自然落在 88 行 / 234 词，远低于 100/500 目标。

### 后续可能的漏洞（待真实子智能体验证）

- LLM 复制粘贴老组件后是否能正确清理无关 trait / event / action？已在常见错误明示，需测试
- "需求→原子 skill 路由表"6 行——LLM 是否能按需裁剪而不是凭直觉全加？已在第 4 步显式约束，需测试

---

## 9. cdp-component-getting-started（进行中）

主线 skill：从零开始的总调度入口。设计原则——给阶段路线图 + 调度到原子 skill / 其他主线 skill，不重复任何具体内容。**注意**：现有 skill 强制 "ASK pattern"（必须与用户确认），违反"不规定 agent 必须按某种方式问用户"的设计原则；同时引用了旧 skill 名（data-field-container / actions-state-events-slots / rootpath-loading / wrap-react-library），需要重写。

### 红色阶段：应用场景与基线失败模式

#### 场景 1：从零创建 CDP 组件库

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 凭印象用 `BASIC` / `FORM` / `CONTAINER` 等不存在的 category | 🅰 | 必须取自 `COMPONENT_CATEGORY` 真实导出 |
| `EngineComponentPackage` 用 `name` 字段而非 `id` | 🅰 | API 名一致性陷阱 |
| React 版本不是 19（peerDep 不匹配） | 🅰 | SDK 要求 |
| 创建组件包但漏 plugin 入口（`EngineComponentPlugin`） | 🅱 | 项目结构 |
| 主动创建 demo 组件而非按用户需求 | 🅱 | 越权扩展 |

#### 场景 2：包装已有第三方 React 组件库从零开始

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 不知道这是 `adapter-and-wrap` 的领域 | 🅰 | 总调度路由缺失 |
| React peerDep 与 SDK 不一致（重复打包 react） | 🅱 | 见 adapter-and-wrap skill |

#### 场景 3：建好骨架后接入第一个组件

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 不知道该走哪些原子 skill | 🅰 | 总调度路由缺失 |
| 直接全加能力 | 🅰 | 见 add-to-existing-package |

#### 场景 4：旧 skill 强制 ASK pattern

| 失败模式 | 置信度 | 原因 |
|---|---|---|
| 在每一步都强制要求与用户确认才能进 | 🅰 | 违反设计原则；LLM 应自主决定何时询问 |
| 引用已废弃的 skill 名 | 🅰 | 旧 skill 已重命名为 traits / events-actions-state / runtime-behavior / adapter-and-wrap |

### 绿色阶段：最小技能 ✅

写出 `skills/cdp-component-getting-started/SKILL.md`（129 行 / 617 词，主线总调度 skill）。覆盖范围：

- "何时使用 / 何时不使用"路由（区分 4 种情境）
- 必填决策点表（包 id / type 命名空间 / React 版本 / 首个组件来源）+ **自主获取顺序**列（取代旧 skill 的强制 ASK pattern）
- 5 阶段路线图（环境与依赖 / 搭骨架 / 首个组件按来源路由 / 能力按需添加 / 交付前自检）
- 阶段 3 路由表（4 种来源 → 对应 skill）
- 阶段 4 路由表（5 类能力 → 对应原子 skill）
- SDK 实际接口要点（防印象错；BASIC/FORM/CONTAINER 不存在 / id vs name / EngineComponentPlugin 字段 / React 19 peerDep）
- 常见错误清单 8 项

### 重构阶段：保持当前长度 ✅

129 行 / 617 词，比目标超 29% / 23%。但内容均为决策路由型表格（4 决策点 / 3 路由表 / 5 阶段 / 8 常见错误 / 5 接口要点 / 9 完成检查），全部为总调度 skill 的核心职责，删后会损害调度完整性。保留。

### 关键改进 vs 旧版

| 旧 skill 问题 | 修复 |
|---|---|
| "需求澄清"段强制要求"必须与用户确认" | 改为"必填决策点"+ "自主获取顺序"列（npm 包名 → 仓库名 → 询问 / 读 package.json / 现有组件包模式 → 询问），让 LLM 自主决定何时问 |
| 工作流程第 3 步"询问首个组件来源"让用户在 a/b/c/d 中选 | 改为"阶段 3 路由表"，4 种来源由 LLM 推断 |
| 阶段 5 "逐项询问是否补齐 manifest 声明" | 改为"阶段 4 能力按需添加"路由表，由 LLM 按组件实际需求挑选 |
| 引用旧 skill 名（data-field-container / actions-state-events-slots / rootpath-loading / wrap-react-library） | 全部更新为新名（traits / events-actions-state / runtime-behavior / adapter-and-wrap） |
| 缺少 manifest-basics 路由（旧版没有这个 skill） | 阶段 4 表第 1 行加入 |
| 各阶段文档长度不均衡 | 5 阶段统一格式（标题 + bullet 列表 / 表） |

### 后续可能的漏洞（待真实子智能体验证）

- LLM 看到"决策点 → 自主获取顺序"是否会直接默认填值而非按顺序尝试？已在表头说明"不要默认填值"，需测试
- 阶段 3 路由表 LLM 选错来源（如把"自研业务组件"误归到"包装第三方"）→ 来源判断需要上下文理解，可能不稳定，需测试
- 阶段 4 5 类能力路由 LLM 是否会全选？已在阶段 4 标题"按组件实际需求挑选，不要全加"约束，需测试

---

# 整体重构总结

## 9 个 skill 完成状态

| # | Skill | 类型 | 行 | 词 | 字符 |
|---|---|---|---:|---:|---:|
| 1 | cdp-component-slots | 原子 | 85 | 447 | 3596 |
| 2 | cdp-component-traits | 原子 | 114 | 539 | 4946 |
| 3 | cdp-component-manifest-basics | 原子 | 110 | 571 | 4231 |
| 4 | cdp-component-events-actions-state | 原子 | 116 | 564 | 4774 |
| 5 | cdp-component-runtime-behavior | 原子 | 118 | 624 | 5233 |
| 6 | cdp-component-adapter-and-wrap | 原子 | 127 | 691 | 5254 |
| 7 | cdp-component-manifest-validation | 主线 | 91 | 298 | 3339 |
| 8 | cdp-component-add-to-existing-package | 主线 | 88 | 234 | 2727 |
| 9 | cdp-component-getting-started | 主线 | 129 | 617 | 4993 |
| **合计** | | | **978** | **4585** | **39093** |

平均原子 skill：112 行 / 573 词；平均主线 skill：103 行 / 383 词。

## 清理与发版闭环 ✅

- ✅ `src/skillCatalog.js` SKILL_IDS 更新为新 9 skill
- ✅ `tests/install/skill-catalog.test.js` 与 `tests/install/install-targets.test.js` 重写：
  - count 7 → 9
  - 新 expectedReferences 表（按"主线 3 + 原子 6"实际目录结构）
  - header 契约：`## 概述` / `## 何时使用` / `## 工作流程` 或 `## 阶段路线图` / `## 引导路径` / `## 完成检查` / `## 维护来源`（取代旧 `## 适用场景` / `## 前置检查` / `## 运行时参考` / `## 需求澄清|决策点`）
  - 删除强制 npm install URL 校验（安装指引归 README）
  - references frontmatter 仅校验 `sdk-docs:` 指向 `cdp-material-sdk/docs/component-development/`，不再要求 `sdk: cdp-material-sdk@0.0.4` 行
- ✅ `references/component-docs-map.md` 重写：补回 SDK 新文档路径（声明props.md / 配置设计器元信息.md / 声明布局容器组件.md / 配置DOM根节点注入.md / DOM根节点注入模型.md / 引擎基础能力模型.md），删除 RootPath注入模型.md（已合并到 DOM根节点注入模型）
- ✅ `README.md` skill 列表替换为 9 skill；用例段落更新（traits / events-actions-state / runtime-behavior / adapter-and-wrap）
- ✅ `CHANGELOG.md` 增加 `[0.2.0] - 2026-04-28` 段：Changed (Breaking) / Removed / Migration 三块
- ✅ `tests/scenarios/` 重构：新增 `cdp-component-{manifest-basics,traits,events-actions-state,slots,runtime-behavior,adapter-and-wrap}.md` 6 份，删除旧 4 份
- ✅ 删除 4 个旧 skill 目录：actions-state-events-slots / data-field-container / rootpath-loading / wrap-react-library
- ✅ 修复 SKILL.md 微调（满足测试）：
  - getting-started SKILL.md 引导路径段补充 references/ 5 份导航说明
  - add-to-existing-package SKILL.md 补 SDK 导入边界段（含 `cdp-material-sdk/portable`）+ references/ 3 份导航说明
  - adapter-and-wrap SKILL.md 引导路径段补 references/adapter-and-wrap.md 导航说明

### 最终验证

```text
$ npm test
# tests 19
# pass 19
# fail 0
```

```text
$ node ./src/cli.js list --agents
windsurf / claude / cursor / copilot-cli / antigravity / trae / openclaw / qwen-code / opencode / custom — 全部正常
```

```text
$ ls skills/
cdp-component-adapter-and-wrap         cdp-component-manifest-basics
cdp-component-add-to-existing-package  cdp-component-manifest-validation
cdp-component-events-actions-state     cdp-component-runtime-behavior
cdp-component-getting-started          cdp-component-slots
                                       cdp-component-traits
```

## 后续待办

- **决策**：是否将 `cdp-material-sdk` 文档修正一起 push / 发版（旧 SDK doc 已被新 skill 引用为事实源）
- **真实子智能体验证**：每个 skill 都列了"后续可能的漏洞"清单，需要在真实使用场景跑一轮端到端测试，按反馈微调。重点验证：
  - LLM 是否会在三层决策表（adapter-and-wrap）正确分流到 adapter / wrapper
  - LLM 是否会在主线 skill 的"症状/需求 → 原子 skill"路由表准确跳转
  - getting-started 的"自主获取顺序"列是否真的能让 LLM 自然询问而非默认填值
