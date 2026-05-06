import {
  type ComponentManifest,
  COMPONENT_CATEGORY,
  COMPONENT_TRAIT,
  INJECT_PATH_SLOT_PROPS,
} from 'cdp-material-sdk/portable';

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
};

export default manifest;
