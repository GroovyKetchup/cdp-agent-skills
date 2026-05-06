import {
  type ComponentManifest,
  COMPONENT_CATEGORY,
  COMPONENT_TRAIT,
  INJECT_PATH_SLOT_PROPS,
} from 'cdp-material-sdk/portable';

/**
 * 故意写错（用于 e2e 测试场景 05）：
 * - actions.reset 漏 title（validateManifest warning）
 * - actions.reset.params 没有 type: 'object'（validateManifest error）
 * - state.selectedColor 漏 schema（validateManifest warning）
 * - actions key `reset` 与 ref method `resetValue` 不一致（diagnoseMissingActionImpls 报）
 */
const manifest: ComponentManifest = {
  type: 'acme.ColorField',
  engine: {
    render: {
      injection: { rootPath: INJECT_PATH_SLOT_PROPS },
    },
  },
  traits: [COMPONENT_TRAIT.DATA_FIELD],
  meta: {
    title: '颜色字段',
    category: COMPONENT_CATEGORY.DATA_ENTRY,
    valueSchema: { type: 'string', default: '#000000' },
  },
  props: {
    type: 'object',
    properties: {
      placeholder: {
        type: 'string',
        title: '占位提示文本',
      },
    },
  },
  events: {
    valueChange: {},
  },
  actions: {
    // ❌ 故意错 1：key 是 `reset`，但 ref 实现的是 `resetValue` —— diagnoseMissingActionImpls 会报
    // ❌ 故意错 2：漏 title（validateManifest warning）
    // ❌ 故意错 3：params 不是 object 形态（validateManifest error）
    reset: {
      description: '重置颜色',
      params: { type: 'string' } as any, // 类型不对，应为 ObjectSchema
    } as any,
  },
  state: {
    // ❌ 故意错 4：state.selectedColor 漏 schema（validateManifest warning）
    selectedColor: {
      title: '当前颜色',
    } as any,
  },
};

export default manifest;
