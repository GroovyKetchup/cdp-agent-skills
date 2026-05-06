import {
  type ComponentManifest,
  COMPONENT_CATEGORY,
  COMPONENT_TRAIT,
  INJECT_PATH_SLOT_PROPS,
  LOADING_STRATEGY,
} from 'cdp-material-sdk/portable';

/**
 * OldButton — 一个功能完整的"老"按钮组件。
 *
 * 用作 e2e 场景 09 的 baseline：复制成 NewActionBar 时，
 * Agent 必须清理与新需求无关的：
 *   - engine.render.loading（用户不要 loading）
 *   - actions.setLoading / getLoading（同上）
 *   - state.loading（同上）
 *   - traits 中的 DATA_FIELD（不要 readOnly / value 注入）
 *   - adapter.propMapping（DATA_FIELD 没了，readOnly 不存在）
 *   - events.focus / events.blur（不要焦点态）
 *   - props.placeholder（DATA_FIELD 语义遗留）
 *
 * 保留：INTERACTION_CLICKABLE / events.click / actions.click / props.label。
 */
const manifest: ComponentManifest = {
  type: 'acme.OldButton',
  engine: {
    render: {
      injection: { rootPath: INJECT_PATH_SLOT_PROPS },
      loading: { strategy: LOADING_STRATEGY.NATIVE },
    },
  },
  traits: [COMPONENT_TRAIT.INTERACTION_CLICKABLE, COMPONENT_TRAIT.DATA_FIELD],
  meta: {
    title: '老按钮',
    category: COMPONENT_CATEGORY.GENERAL,
    description: '历史按钮组件，含 loading 与 disabled 支持',
    valueSchema: { type: 'string', default: '' },
  },
  adapter: {
    propMapping: {
      readOnly: 'disabled',
    },
  },
  props: {
    type: 'object',
    properties: {
      label: { type: 'string', title: '按钮文字' },
      placeholder: { type: 'string', title: '提示文本' },
      variant: {
        type: 'string',
        title: '样式',
        oneOf: [
          { const: 'default', title: '默认' },
          { const: 'primary', title: '主要' },
          { const: 'danger', title: '危险' },
        ],
      },
    },
  },
  events: {
    click: {},
    focus: {},
    blur: {},
  },
  actions: {
    click: {
      title: '点击',
      description: '命令式触发按钮 click 事件',
    },
    setLoading: {
      title: '设置加载状态',
      description: '外部命令式控制按钮 loading',
      params: {
        type: 'object',
        properties: {
          loading: { type: 'boolean', title: '加载中' },
        },
      },
    },
    getLoading: {
      title: '读取加载状态',
      description: '读取按钮当前 loading 值',
      returns: { type: 'boolean' },
    },
  },
  state: {
    loading: {
      title: '加载中',
      schema: { type: 'boolean' },
    },
  },
};

export default manifest;
