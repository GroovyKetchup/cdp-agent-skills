# cdp-agent-skills 端到端验证矩阵（Gate 1）

本文档定义 9-skill 集合的端到端验证方案，覆盖 9 个独立靠场场景。

> **重要前提：本矩阵仅对应 Gate 1（内部最小可行验证），通过 ≠ 投产 ready。**
> 投产判定还需要 Gate 2（跨 LLM × IDE × N 次重复）和 Gate 3（真实开发者灰度），见末尾"投产门槛"章节。

## 目录

- [一、设计原则](#一设计原则)
- [二、9 场景一览](#二9-场景一览)
- [三、场景详设（Tier A 必跑）](#三场景详设tier-a-必跑)
  - [场景 01 — 零知识开发者](#场景-01--零知识开发者)
  - [场景 02 — 从零做颜色字段组件](#场景-02--从零做颜色字段组件)
  - [场景 03 — 包装第三方 DatePicker](#场景-03--包装第三方-datepicker)
  - [场景 04 — 已有项目加 Card 容器](#场景-04--已有项目加-card-容器)
  - [场景 05 — 修一个故障的 manifest](#场景-05--修一个故障的-manifest)
- [四、场景详设（Tier B 进阶）](#四场景详设tier-b-进阶)
  - [场景 06 — DataTable 动态作用域 slot](#场景-06--datatable-动态作用域-slot)
  - [场景 07 — Button + native loading + onPress](#场景-07--button--native-loading--onpress)
  - [场景 08 — useDataContainer 误用切换](#场景-08--usedatacontainer-误用切换)
  - [场景 09 — 复制粘贴老组件清理](#场景-09--复制粘贴老组件清理)
- [五、跑测流程](#五跑测流程)
- [六、评分表](#六评分表)
- [七、投产门槛与未来 Gate](#七投产门槛与未来-gate)

---

## 一、设计原则

### 1.1 每场景独立靠场

不同场景的"初始仓库状态"差异极大，且 Agent 看到上一轮痕迹会让路由判断失真。每个场景对应 `tests/e2e-fixtures/<scenario-id>/`，跑前复制到独立工作目录，跑完丢弃。

### 1.2 Prompt 不暗示 skill

触发 Prompt 用**真实开发者会用的措辞**，禁止出现 skill 名（如"用 cdp-component-traits 完成"）或工具名（如"调用 validateManifest"）。skill 是否被路由到由 Agent 自主决定。

### 1.3 三类观察维度

每场景跑完按三类评分（满分 100）：

| 维度 | 权重 | 评估什么 |
|---|---|---|
| **路由准确性** | 40 | Agent 是否调用了**期望的** skill 集合，没有过度调用或漏调 |
| **决策落地** | 30 | skill 中的决策表 / 路由表 / 引导路径，**实际行为**与设计一致 |
| **失败模式回避** | 30 | tdd-progress 中标 🅰 的高置信度失败模式**未出现** |

### 1.4 fixture 不强制可执行

fixture 是给 Agent **读**的代码骨架，不需要 `npm install` 通过或 `tsc` 通过。但是：

- `package.json` 的 `dependencies` 写真实版本号（让 Agent 看出已依赖哪些库）
- 类型与 import 路径写正确（避免 Agent 把"修编译错误"当任务）
- 故意写错的代码必须是**语义错误**（如 manifest action key 与 ref method 不一致），不是语法错误

---

## 二、9 场景一览

### Tier A — 必跑（5 个核心场景）

| # | 场景 | 主调 skill | 串联 skill | 等级（你的角度） |
|---|---|---|---|---|
| **01** | **零知识开发者** | getting-started | — | **完全不懂** |
| **02** | 从零做颜色字段组件 | getting-started | manifest-basics / traits / events-actions-state / manifest-validation | **半懂** |
| **03** | 包装第三方 DatePicker | adapter-and-wrap | manifest-basics / runtime-behavior | **中级** |
| **04** | 已有项目加 Card 容器 | add-to-existing-package | traits / slots / manifest-basics | **中级** |
| **05** | 修故障 manifest | manifest-validation | events-actions-state / runtime-behavior | **进阶** |

### Tier B — 进阶（4 个，覆盖剩余 skill 触发面）

| # | 场景 | 主调 skill | 串联 skill |
|---|---|---|---|
| **06** | DataTable 动态作用域 slot | slots | manifest-basics |
| **07** | Button + native loading + onPress | runtime-behavior | adapter-and-wrap |
| **08** | useDataContainer 误用切换 | traits | runtime-behavior |
| **09** | 复制粘贴老组件清理 | add-to-existing-package | traits / events-actions-state |

### skill 触发覆盖率

| skill | 触发场景 |
|---|---|
| cdp-component-getting-started | 01, 02 |
| cdp-component-manifest-basics | 02, 03, 04, 06 |
| cdp-component-traits | 02, 04, 08, 09 |
| cdp-component-events-actions-state | 02, 05, 09 |
| cdp-component-slots | 04, 06 |
| cdp-component-runtime-behavior | 03, 05, 07, 08 |
| cdp-component-adapter-and-wrap | 03, 07 |
| cdp-component-manifest-validation | 02, 05 |
| cdp-component-add-to-existing-package | 04, 09 |

---

## 三、场景详设（Tier A 必跑）

### 场景 01 — 零知识开发者

**对应你提到的"完全不懂任何契约/CDP 概念的开发者"。这是 skill 体系是否能给出"傻瓜路径"的核心检验点。**

#### 触发 prompt（原样复制给 Agent）

> 我同事让我帮 CDP 平台开发一个组件，但我从来没听说过 CDP，也不知道要怎么开始。你能告诉我从哪里入手吗？

#### 初始靠场

`tests/e2e-fixtures/01-zero-knowledge/` 完全空目录，只放 `prompt.md`（给测试者看的说明）。**注意**：连 `package.json` 都不要预设——这模拟"开发者刚拿到任务，电脑里什么都没"。

#### 期望 Agent 行为

| 项 | 期望 |
|---|---|
| **首先调用** | `cdp-component-getting-started`（总调度入口） |
| **先做什么** | 走"必填决策点表"自主获取信息，而不是直接给出**通用** React 组件库教程 |
| **自主获取顺序** | 依次尝试：读 `package.json`（无）→ 看是否有现有组件包模式（无）→ **此时才能问**用户 |
| **要询问的内容** | 包名（不能凭印象起 `my-cdp-components`）、组件类型（数据字段 / 容器 / 包装第三方等） |
| **路线图** | 给出 5 阶段路线图（环境与依赖 / 搭骨架 / 首个组件按来源路由 / 能力按需添加 / 交付前自检） |
| **不应做** | 直接 `npm init` 一个通用 React 组件库；凭印象用 `BASIC` / `FORM` / `CONTAINER` 等不存在的 category；React 版本不指定为 19 |

#### 必须回避的高置信度漏洞（来自 tdd-progress.md）

- 🅰 凭印象用 `BASIC` / `FORM` / `CONTAINER` 等不存在的 category（必须从 `COMPONENT_CATEGORY` 真实导出取）
- 🅰 `EngineComponentPackage` 用 `name` 而非 `id`
- 🅰 React 版本不是 19
- 🅰 在每一步都强制 ASK pattern（旧版 skill 有此问题；新版应让 LLM 自主决定何时询问）
- 🅱 主动创建 demo 组件而非按用户需求

#### fixture 文件

```
tests/e2e-fixtures/01-zero-knowledge/
  README.md       # 给测试者：靠场目的、跑测步骤
  prompt.md       # 给 Agent 的原 prompt（即上文）
```

**无任何源码** — 这就是"零知识"的起点。

---

### 场景 02 — 从零做颜色字段组件

#### 触发 prompt

> 我要从头做一个 CDP 组件库，先做一个颜色选择器（ColorField），让用户能在表单里选颜色。值要支持 hex 字符串（如 `#FF0000`），还要有 placeholder 和 disabled。

#### 初始靠场

```
tests/e2e-fixtures/02-from-scratch-field/
  README.md
  prompt.md
  package.json    # 已 npm init，name: "@acme/cdp-components"
                  # 已声明 cdp-material-sdk: latest 依赖、react: ^19
  tsconfig.json   # 基础配置
```

**没有任何源码**。Agent 需要自己创建 `src/` 结构。

#### 期望 Agent 行为

| 阶段 | 期望 skill | 关键检验点 |
|---|---|---|
| 1. 总规划 | getting-started | 给出阶段路线图，识别这是"从零创建 + 数据字段"路径 |
| 2. props/meta 设计 | manifest-basics | `placeholder` 写 `title`；`default` 在 schema 内；不重复声明 `value` / `readOnly` 等 DATA_FIELD 自动注入字段 |
| 3. trait 决定 | traits | 只标 `DATA_FIELD`（不要 `LAYOUT_CONTAINER`）；`valueSchema` 写 hex 格式约束 |
| 4. 事件/动作 | events-actions-state | 不重复声明 `valueChange`（自动注入）；如有 reset 之类自定义动作，`params.type === 'object'` |
| 5. 组件实现 | — | `onChange(nextValue)` 传值不传 event；用 `forwardRef`；ref 上用 `COMPONENT_STATE_KEY` |
| 6. 自检 | manifest-validation | 给出 `validateManifest()` + `diagnoseMissingActionImpls()` 调用；区分 error / warning |

#### 必须回避的高置信度漏洞

- 🅰 重复声明 DATA_FIELD 自动注入的 `value` / `readOnly` / `required` / `name` / `label` props
- 🅰 重复声明 `getValue` / `setValue` / `valueChange`
- 🅰 `onChange` 传整个 event 对象而非值
- 🅰 漏 `meta.title` / `meta.category`
- 🅰 漏 props 字段的 `title`
- 🅰 凭印象用不存在的 category

#### fixture 文件

```
tests/e2e-fixtures/02-from-scratch-field/
  README.md
  prompt.md
  package.json
  tsconfig.json
```

---

### 场景 03 — 包装第三方 DatePicker

#### 触发 prompt

> 我们用了一个第三方日期选择器 `@vendor-x/date-picker`，需要把它接到 CDP 里给设计器用。它的值是 `selectedDate`（Date 对象），变化事件是 `onDateChange(date)`，不是标准的 `value` / `onChange`。怎么做？

#### 初始靠场

```
tests/e2e-fixtures/03-wrap-third-party-datepicker/
  README.md
  prompt.md
  package.json    # 已声明 cdp-material-sdk + @vendor-x/date-picker (stub) + react@19
  tsconfig.json
  vendor/
    date-picker.tsx   # 仿 antd DatePicker：值 prop=selectedDate, 事件=onDateChange
                      # 不接受未知 DOM 属性（必须外层加 wrapper 承接 slotProps.root）
```

#### 期望 Agent 行为

**核心是三层决策表的执行。**

| 层 | 期望选择 | 检验点 |
|---|---|---|
| **结构层** | wrapper（forwardRef + 外层 DOM 节点 + spread `slotProps.root`） | `vendor/date-picker.tsx` 不接受未知 DOM 属性，**必须**外层包 wrapper |
| **Props 层** | wrapper 内做值变换（Date ↔ hex/iso 字符串）；**不能**用 `propMapping`（那个只改名，不改值） | propMapping 只改名；值类型转换必须在 wrapper 内 |
| **事件层** | `adapter.events.valueChange.propName: 'onDateChange'` + 必要时 `transform` 把 Date 转 string | 事件适配是 adapter 主场，不在 wrapper 里手写 |

#### 必须回避的高置信度漏洞

- 🅰 用 `propMapping` 试图做值类型转换（应回 wrapper）
- 🅰 在 wrapper 里手写所有事件适配（事件层是 adapter 主场）
- 🅰 把 `slotProps.root` 直接传给第三方组件（应外层加 wrapper DOM）
- 🅰 `adapter.events` 引用未在 manifest `events` / `customEvents` 中声明的事件
- 🅰 重复声明 DATA_FIELD 自动注入的 `valueChange`
- 🅱 React peerDependency 配置错误（重复打包 react）

#### fixture 文件清单

```
tests/e2e-fixtures/03-wrap-third-party-datepicker/
  README.md
  prompt.md
  package.json
  tsconfig.json
  vendor/
    date-picker.tsx        # 第三方组件 stub（含 selectedDate / onDateChange 协议）
    package.json           # vendor 假装是个 npm 包（让 import 路径成立）
```

---

### 场景 04 — 已有项目加 Card 容器

#### 触发 prompt

> 我们的 CDP 组件包里已经有 ColorField 组件了。现在想加一个 Card 组件，要能放任意子组件，还要有标题区（header）和操作区（footer）。

#### 初始靠场

```
tests/e2e-fixtures/04-add-card-to-existing/
  README.md
  prompt.md
  package.json
  tsconfig.json
  src/
    plugin.ts             # 已注册 ColorField，含 EngineComponentPlugin 入口
    components.ts         # 聚合 manifest 数组
    components/
      ColorField/
        index.tsx         # forwardRef + 简单实现
        manifest.ts       # 完整 DATA_FIELD manifest（作 Agent 的"抄作业"参考）
```

#### 期望 Agent 行为

| 项 | 期望 |
|---|---|
| **路由起点** | `cdp-component-add-to-existing-package`（不是 getting-started） |
| **结构操作** | **只新增**：Card 组件实现 + manifest，并接入既有组件包注册入口；**不重写** plugin 结构、构建工具或现有组件 |
| **trait 决定** | 标 `LAYOUT_CONTAINER`（提供默认 children 区域）+ `slots: { header: { title: ... }, footer: { title: ... } }`；**slots 字段必须含 `title`** |
| **不应做** | 同时给 Card 加 `LAYOUT_CONTAINER` 又把 children 当 slot 命名；用 React `children` 实现 header/footer |
| **type 命名** | 与 ColorField 同命名空间（如 `acme.Card`），不与已有 type 冲突 |

#### 必须回避的高置信度漏洞

- 🅰 重建组件包结构 / 替换构建工具
- 🅰 改写其他不相关组件
- 🅰 创建了 manifest 和实现但未接入组件包注册入口
- 🅰 漏 slot 的 `title` 字段
- 🅰 组件实现忘记渲染 `_slots.header` / `_slots.footer`，用 `<header>{children}</header>` 凑数
- 🅰 误以为 LAYOUT_CONTAINER 必须配 slots（旧 SDK 文档暗示，已修）
- 🅱 type 缺命名空间前缀

#### fixture 文件

```
tests/e2e-fixtures/04-add-card-to-existing/
  README.md
  prompt.md
  package.json
  tsconfig.json
  src/
    plugin.ts
    components.ts
    components/
      ColorField/
        index.tsx
        manifest.ts
```

---

### 场景 05 — 修一个故障的 manifest

#### 触发 prompt

> 我刚加了一个 ColorField 组件，但是接到 CDP 之后 reset 这个 action 调用没反应，state 也读不到 selectedColor。帮我看看哪里出了问题。

#### 初始靠场

```
tests/e2e-fixtures/05-broken-manifest/
  README.md
  prompt.md
  package.json
  tsconfig.json
  src/
    plugin.ts
    components.ts
    components/
      ColorField/
        index.tsx       # 故意问题：
                        #   1. ref 上方法叫 resetValue，但 manifest action key 是 reset → diagnoseMissingActionImpls 会报
                        #   2. state selectedColor 直接挂在 ref 顶层，没在 COMPONENT_STATE_KEY 下 → diagnoseMissingStateKeys 会报
                        #   3. useImperativeHandle 依赖数组缺 selectedColor → stale closure
        manifest.ts     # 故意问题：
                        #   4. action `reset` 漏 title → validateManifest warning
                        #   5. action `reset.params` 没有 type='object' → validateManifest error
                        #   6. state `selectedColor` 漏 schema → validateManifest warning
```

#### 期望 Agent 行为

| 项 | 期望 |
|---|---|
| **第一步** | **不**先改宿主代码 / 不直接看 CDP 引擎源码；**先校验 manifest** |
| **路由** | `cdp-component-manifest-validation` → 症状路由表 → "action 调用失败" 跳到 `cdp-component-events-actions-state` |
| **工具调用** | `validateManifest()` + `diagnoseMissingActionImpls()` + `diagnoseMissingStateKeys()` |
| **修复 1**（action key 不一致） | 改 manifest action key 为 `resetValue`，或 ref method 改为 `reset`；二选一保持一致 |
| **修复 2**（state 不在 COMPONENT_STATE_KEY 下） | 用 `useImperativeHandle` 把 state 放进 `[COMPONENT_STATE_KEY]: { selectedColor }` |
| **修复 3**（依赖数组） | `useImperativeHandle(ref, () => ({...}), [selectedColor, ...])` 完整 |
| **修复 4-6**（manifest 字段） | 按 `validateManifest` 输出修，区分 error 必修 / warning 建议修 |

#### 必须回避的高置信度漏洞

- 🅰 直接修改宿主代码而不先验证 manifest
- 🅰 不会用 `diagnoseMissingActionImpls` / `diagnoseMissingStateKeys` 自检
- 🅰 不知道 action key 必须 = ref method name
- 🅰 不会区分 error / warning
- 🅱 不查 type 在 plugin.ts 中是否已注册

#### fixture 文件

```
tests/e2e-fixtures/05-broken-manifest/
  README.md
  prompt.md
  package.json
  tsconfig.json
  src/
    plugin.ts
    components.ts
    components/
      ColorField/
        index.tsx     # 故意写错（见上文）
        manifest.ts   # 故意写错
```

---

## 四、场景详设（Tier B 进阶）

### 场景 06 — DataTable 动态作用域 slot

#### 触发 prompt

> 我要给 DataTable 加 columns，每列要能让用户配置自定义渲染模板，模板里能拿到当前行的 record 和 index。

#### 期望 Agent 行为

| 项 | 期望 |
|---|---|
| **路由** | `cdp-component-slots`（核心） + `cdp-component-manifest-basics`（columns 数组 schema） |
| **slot 类型** | 动态作用域 slot：`dynamicSource: 'columns'` + `dynamicKey: 'col-{index}'` + `scoped: true` + `scopeDescription` |
| **实现侧** | 用 `_scopedSlots[name]?.(scope)` 而非 `_slots[name]`；scope 字段名从 SDK recipe 复制 |
| **columns schema** | 每列定义里 `dataIndex` 字段用 `format: 'dataField'` |

#### 必须回避的漏洞

- 🅰 为每一列硬编码 slot 名（不动态）
- 🅰 漏 `dynamicSource` / `dynamicKey`
- 🅰 漏 `scoped: true`
- 🅰 实现侧用 `_slots[name]` 而非 `_scopedSlots[name]`
- 🅰 用 React render prop 自建 context

#### fixture 文件

```
tests/e2e-fixtures/06-data-table-dynamic-slot/
  README.md
  prompt.md
  package.json
  tsconfig.json
  src/
    plugin.ts            # 空 plugin，等 Agent 加 DataTable
    components.ts
```

---

### 场景 07 — Button + native loading + onPress

#### 触发 prompt

> 我们用了一个第三方 `@vendor-x/button`（事件是 `onPress` 不是 `onClick`），需要包装成 CDP 组件。要支持 loading 状态，loading 时按钮自己变灰显示加载图标且不能点。

#### 期望 Agent 行为

| 项 | 期望 |
|---|---|
| **路由** | `cdp-component-runtime-behavior`（loading 决策） + `cdp-component-adapter-and-wrap`（事件名适配） |
| **rootPath 决策** | 第三方组件不接受未知 DOM 属性，需 wrapper 外层 + `INJECT_PATH_SLOT_PROPS` |
| **Loading 策略** | `native`（VendorButton 自带 loading）；不能用 `wrapper`（整体遮罩破坏视觉） |
| **事件适配** | `adapter.events.click.propName: 'onPress'`（自动映射到 SDK 标准 click） |
| **不重复声明** | `hidden` / `setHidden` / `mount` / `unmount` 是引擎自动补充，不要在 manifest 重复声明 |

#### 必须回避的漏洞

- 🅰 用 `wrapper` 整体遮罩（破坏 native button loading 体验）
- 🅰 用 `native` 但忘了"loading 时阻断点击"
- 🅰 把 `INJECT_PATH_SLOT_PROPS` 给第三方组件直接渲染
- 🅰 重复声明引擎基础能力

#### fixture 文件

```
tests/e2e-fixtures/07-button-native-loading/
  README.md
  prompt.md
  package.json
  tsconfig.json
  vendor/
    button.tsx           # 仿 arco/antd Button：事件 onPress、loading prop 内置
    package.json
```

---

### 场景 08 — useDataContainer 误用切换

#### 触发 prompt

> 我们的 Form 组件用了 `useDataContainer`，但是发现每输入一个字符全表单都重渲染，性能很差。怎么优化？

#### 初始靠场

```
tests/e2e-fixtures/08-data-container-hook/
  src/
    plugin.ts
    components.ts
    components/
      MyForm/
        index.tsx   # 错误用法：用 useDataContainer 订阅整个 dataContainer
                    # 每次任意字段变化都重渲染
        manifest.ts
```

#### 期望 Agent 行为

| 项 | 期望 |
|---|---|
| **路由** | `cdp-component-traits`（DATA_CONTAINER 三 hook 选择） + `cdp-component-runtime-behavior`（如涉及 loading） |
| **诊断** | 识别"订阅式 vs 命令式"误用：`useDataContainer` 是订阅式，订阅整个容器导致频繁重渲染 |
| **方案** | 切换到 `useDataContainerApi`（命令式），只在需要时读值；字段订阅由 `useFieldRegistry` / `DataScope` 处理 |
| **不应做** | 自己手写字段注册表 |

#### 必须回避的漏洞

- 🅱 用 `useDataContainer` 替代 `useDataContainerApi`（订阅式性能差）
- 🅲 自己手写字段注册表而不用 `useFieldRegistry`

---

### 场景 09 — 复制粘贴老组件清理

#### 触发 prompt

> 帮我把 `OldButton` 复制一份改成 `NewActionBar`。NewActionBar 不需要 loading 和 disabled，但要能显示一个图标。

#### 初始靠场

```
tests/e2e-fixtures/09-copy-paste-cleanup/
  src/
    plugin.ts
    components.ts
    components/
      OldButton/
        index.tsx
        manifest.ts   # 含一堆 traits/events/actions/state（loading / disabled / setLoading / hidden 等）
```

#### 期望 Agent 行为

| 项 | 期望 |
|---|---|
| **路由** | `cdp-component-add-to-existing-package` |
| **关键操作** | 复制后**清理**与新组件无关的：`loading` 配置、`setLoading` action、与 disabled 相关的 props/state |
| **type 唯一** | 新组件 type 不与 OldButton 重复，且加正确命名空间 |
| **配置漂移检测** | 不应留下"老组件特有"的 trait / action / state |

#### 必须回避的漏洞

- 🅰 没移除老组件特有的 trait / event / action / state
- 🅰 复用相同 `type` 字符串

---

## 五、跑测流程

### 5.1 准备测试环境

```powershell
# 1. 在工作目录外建一个临时测试根
$testRoot = "$env:TEMP\cdp-skills-e2e-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
mkdir $testRoot

# 2. 把 fixture 复制到测试根（每场景独立目录）
Copy-Item "c:\project\js\CDP\cdp-agent-skills\tests\e2e-fixtures\01-zero-knowledge" -Destination "$testRoot\01-zero-knowledge" -Recurse

# 3. 在该目录安装 cdp-agent-skills 到目标 Agent（按 IDE 而定）
# 例：windsurf agent
cd "$testRoot\01-zero-knowledge"
npx cdp-agent-skills@latest install --agent windsurf

# 4. 用 IDE 打开该目录，开新对话，把 prompt.md 内容原样发给 Agent
```

### 5.2 单场景跑测步骤

1. **准备靠场**：复制 fixture 到独立目录（不能在源仓库内跑，避免污染）
2. **安装 skills**：`npx cdp-agent-skills install --agent <target>`
3. **重启 IDE / 新建对话**：确保 skill 被加载
4. **发送 prompt**：把 `prompt.md` 中的"用户请求"段原样粘贴
5. **不干预**：让 Agent 自主推进，不补充提示、不纠正方向
6. **记录**：截图 + 完整对话日志（用于评分）
7. **评分**：按 `e2e-evaluation-template.md` 填表

### 5.3 何时干预

只允许两类干预：

- Agent **明确询问开发者**才能给出的信息（如包名、组件类型）—— 按 prompt.md 的"测试者预设答案"段回答
- Agent **完全卡死** ≥ 5 分钟无任何动作 —— 终止并记为"失败-停滞"

**禁止**：纠正方向、追加约束、暗示用 skill。

---

## 六、评分表

详见 `tests/e2e-evaluation-template.md`（独立文件，便于复制）。

每场景得分 = CDP 契约落地(50) + 失败模式回避(30) + 任务完成度(20)。skill 路由独立填诊断观测（不计分）。

**Gate 1 通过门槛**：

- Tier A 5 个场景平均 ≥ 80 分
- 任何单场景"CDP 契约落地" ≥ 35/50（70%）
- 🅰 高置信度漏洞**总出现次数 ≤ 2**（9 场景合计）
- 🅰 失败模式 0 出现的场景数 ≥ 6
- **仅诊断**：期望主调 skill 触发率（不作门槛，用于反推 skill 设计）

---

## 七、投产门槛与未来 Gate

### Gate 1（本矩阵）

- 范围：9 场景 × **1 主力 LLM** × **1 主力 IDE** × 1 次
- 通过含义：**Agent 产出符合 CDP 契约**（轨道 A 通过），skill 路由命中率作诊断观测（轨道 B），仅在跑过的组合上证明
- **通过 ≠ 投产 ready**

### Gate 2（待规划）

- 范围：9 场景 × **3+ LLM**（Sonnet 4.5 / Gemini 2.5 Pro / Qwen3 Coder / GLM 4.6 / DeepSeek）× **3+ IDE**（Windsurf / Antigravity / Cursor / Copilot CLI / Claude Code）× **N=3 次**
- 通过门槛：单 LLM × IDE 组合稳定性 ≥ 80%（同 prompt 跑 3 次至少 2 次 pass）
- 发现的问题类型：跨模型语义差异、长上下文衰减、skill 标题理解差异
- 工作量：4-6 天（含数据汇总）

### Gate 3（投产前）

- 范围：3-5 个**真实组件开发者**用真实需求 + 真实仓库
- 通过门槛：卡点反馈数 < 阈值；按反馈补 skill / 补漏洞
- 工作量：2-4 周（依赖外部协作）
- 发现的问题类型：复合需求场景、含糊 prompt、隐含约束、教科书外问题

### 三 Gate 串联

```
Gate 1 ✅ 内部可用 → Gate 2 ✅ 跨平台稳定 → Gate 3 ✅ 真实灰度通过 → 投产
```

**任何一个 Gate 失败都不应进入下一阶段。**

---

## 八、附录

### 8.1 fixture 命名规则

`tests/e2e-fixtures/<NN>-<kebab-case-summary>/`，NN 为 01-09 两位数。

### 8.2 prompt.md 模板

```markdown
# Scenario NN — <场景标题>

## 测试者操作

1. 把当前目录复制到独立测试根
2. 在该目录运行 `npx cdp-agent-skills install --agent <target>`
3. 用 IDE 打开该目录
4. 把下方"用户请求"段原样发给 Agent
5. 按 e2e-evaluation-template.md 评分

## 用户请求（原样发给 Agent）

> <prompt 正文>

## 测试者预设答案（仅 Agent 主动询问时使用）

- 包名：<answer>
- 组件类型：<answer>
- ...其他可能问的项

## 不应干预

- 不要纠正方向
- 不要追加约束
- 不要暗示用 skill
```

### 8.3 与已有 `tests/scenarios/` 的关系

`tests/scenarios/*.md` 是 skill 设计期的"用户请求 / 期望 / 不期望"骨架，是 SKILL.md 的输入。本 e2e 矩阵是**实际跑测**的扩展，含 fixture + 评分 + Gate 门槛。两者不矛盾，e2e 是 scenarios 的可执行化。

### 8.4 跑测后产物

每次跑测产生：

- `<test-root>/results/<scenario-id>/conversation.md`：完整对话日志
- `<test-root>/results/<scenario-id>/score.md`：评分表（基于 e2e-evaluation-template.md）
- `<test-root>/results/summary.md`：9 场景汇总 + Gate 1 是否通过结论

跑完后建议反馈到 `cdp-agent-skills/tdd-progress.md` 的"后续可能的漏洞"清单：标记 ✅ 已验证 / ❌ 仍漏 / ➕ 新发现。
