---
name: cdp-component-wrap-react-library
description: Wraps third-party React components so they follow CDP component contracts. Use when integrating Ant Design, Arco, Material UI, ECharts, internal UI kits, or legacy React components into CDP.
---

# Wrap React Library Component for CDP

## When to use

Use this skill when the UI comes from a third-party or legacy React component and needs a CDP-compatible wrapper.

Do not directly register a third-party component if it does not expose CDP-friendly `value`, `onChange`, root DOM injection, events, or loading behavior.

## Workflow

1. Create a CDP wrapper.
   - Wrap the third-party component in a React component controlled by CDP-facing props.
   - Prefer `forwardRef` when the component needs root DOM injection or imperative APIs.
   - Add a stable outer DOM wrapper when the third-party component has no root injection path.

2. Normalize value and event APIs.
   - Convert third-party value props to CDP-friendly `value` and `onChange`.
   - Convert event names in the wrapper when logic is non-trivial.
   - Use manifest `adapter.propMapping`, `adapter.events`, or `adapter.customEvents` only for simple mapping.

3. Configure root injection.
   - Prefer `INJECT_PATH_SLOT_PROPS` and pass `slotProps.root` to a real DOM node.
   - Use `$root` only when props are directly spread to the real root DOM.
   - Do not declare a rootPath unless the path reaches a real DOM node.

4. Configure loading if needed.
   - Use `engine.render.loading.strategy = 'native'` when the third-party component has a real loading prop that blocks interaction.
   - Add `propName` when the prop is not named `loading`.
   - Use `wrapper` when the component has no native loading capability.

5. Validate.
   - Ensure adapter events are declared before mapping.
   - Run `validateManifest()`.
   - Confirm React packages are not bundled into the output.

## Completion checklist

- [ ] A wrapper exists instead of naked third-party registration.
- [ ] `value` and `onChange` are normalized when the component is a data field.
- [ ] Root injection reaches a real DOM node.
- [ ] Loading strategy matches the third-party component behavior.
- [ ] Adapter mapping is simple and does not hide complex business logic.
- [ ] `validateManifest()` has no error.

## Authoritative sources

- `docs/组件开发/recipes/接入第三方React组件库.md`
- `docs/组件开发/recipes/使用Adapter适配组件API.md`
- `docs/组件开发/recipes/配置rootPath.md`
- `docs/组件开发/recipes/配置Loading策略.md`
- `docs/组件开发/reference/SDK导入边界.md`
