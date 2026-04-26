# SDK 公开入口参考

CDP 组件作者应面向 `cdp-material-sdk` 公开入口编程，不依赖宿主内部实现。

## 默认入口

```ts
import type { ComponentManifest, EngineComponentPlugin } from 'cdp-material-sdk/portable';
```

`cdp-material-sdk/portable` 可用于：

- `ComponentManifest`
- `EngineComponentPackage`
- `EngineComponentPlugin`
- `COMPONENT_TRAIT`
- `COMPONENT_CATEGORY`
- `INJECT_PATH_SLOT_PROPS`
- `BaseUIProps`
- `COMPONENT_STATE_KEY`
- `validateManifest()`
- `validateManifests()`
- `printValidationResult()`
- `diagnoseMissingActionImpls()`
- `diagnoseMissingStateKeys()`

## 高级入口

`cdp-material-sdk/host-react` 只在确认组件包与宿主共享 React runtime 和 Context 身份时使用。

可用于：

- `useDataContainer`
- `useDataContainerApi`
- `PageContext`
- `DataContainerRuntimeContext`

## 禁止依赖

- 宿主源码路径。
- SDK 源码路径。
- 未从公开入口导出的对象。
- 组件加载、注册、运行时增强、页面状态管理等宿主内部模块。

## 当前参考版本

当前组件开发文档验证的 SDK 版本为 `cdp-material-sdk@0.0.4`。
