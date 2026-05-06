import {
  type ComponentManifest,
  COMPONENT_CATEGORY,
  COMPONENT_TRAIT,
  INJECT_PATH_SLOT_PROPS,
} from 'cdp-material-sdk/portable';

const manifest: ComponentManifest = {
  type: 'acme.MyForm',
  engine: {
    render: {
      injection: { rootPath: INJECT_PATH_SLOT_PROPS },
    },
  },
  // manifest 是对的：MyForm 既是数据容器（管理数据）又是布局容器（接子字段）
  traits: [COMPONENT_TRAIT.DATA_CONTAINER, COMPONENT_TRAIT.LAYOUT_CONTAINER],
  meta: {
    title: '表单',
    category: COMPONENT_CATEGORY.DATA_ENTRY,
    valueSchema: {
      type: 'object',
      default: {},
      description: '表单数据对象',
    },
  },
};

export default manifest;
