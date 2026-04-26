---
name: cdp-component-data-field-container
description: Declares CDP data field and data container component semantics. Use when a component participates in value management, form fields, container data scope, DATA_FIELD, DATA_CONTAINER, or valueSchema design.
---

# CDP Data Field and Data Container

## When to use

Use this skill when a component needs to read/write business values or manage child field data.

Do not add data traits to pure display components or layout-only containers.

## Workflow

1. Decide the data role.
   - Use `DATA_FIELD` for input-like components with one primary value.
   - Use `DATA_CONTAINER` for Form, Table, List, or CardList components that manage child field data.
   - Use layout traits instead when the component only arranges children.

2. Declare field semantics.
   - Add `COMPONENT_TRAIT.DATA_FIELD`.
   - Add `meta.valueSchema` describing the value type and default.
   - Ensure the component accepts `value`.
   - Ensure value changes call `onChange(nextValue)`.
   - Support `name` when the field can live inside a data container.

3. Declare container semantics.
   - Add `COMPONENT_TRAIT.DATA_CONTAINER`.
   - Add `meta.valueSchema` for the container value structure.
   - Add layout trait or slots when the container accepts child components.
   - Use `host-react` data container hooks only after confirming shared React runtime and context identity.

4. Choose `valueSchema` deliberately.
   - Form-like containers usually use an object default.
   - Table/List/CardList usually use an array default with object items.
   - Key-value containers can use an object with additional properties.

5. Validate.
   - Run `validateManifest()`.
   - Treat missing `valueSchema` on data traits as a warning that usually needs fixing.

## Completion checklist

- [ ] `DATA_FIELD` components accept `value` and call `onChange(nextValue)`.
- [ ] `DATA_CONTAINER` components describe their container value shape.
- [ ] `meta.valueSchema` is present for data traits.
- [ ] Layout-only components are not mislabeled as data containers.
- [ ] `host-react` is used only when runtime sharing is confirmed.
- [ ] `validateManifest()` has no error.

## Authoritative sources

- `docs/组件开发/recipes/声明数据字段组件.md`
- `docs/组件开发/recipes/声明数据容器组件.md`
- `docs/组件开发/reference/Traits能力模型.md`
- `docs/组件开发/reference/SDK导入边界.md`
