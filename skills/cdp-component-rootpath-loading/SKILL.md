---
name: cdp-component-rootpath-loading
description: Configures CDP root DOM injection and loading behavior for component manifests and wrappers. Use when working with slotProps.root, rootPath, INJECT_PATH_SLOT_PROPS, engine.render.injection, or engine.render.loading strategies.
---

# CDP RootPath and Loading

## When to use

Use this skill when a component needs design-time selection, visibility control, root DOM metadata injection, or host-controlled loading state.

Do not declare rootPath or loading policies just because they exist. Add them only when the component needs the behavior and can satisfy the contract.

## Workflow

1. Configure root DOM injection.
   - Prefer `INJECT_PATH_SLOT_PROPS` for controlled components and wrappers.
   - Pass `slotProps.root` to a real DOM node.
   - Use `$root` only when component props are spread directly to the real root DOM.
   - Use a custom rootPath only if that path is actually forwarded to a real DOM node.

2. Decide whether rootPath can be skipped.
   - Skipping is acceptable for black-box or temporary components.
   - Formal long-lived components should usually declare and implement rootPath.
   - If skipped, accept the host fallback outer wrapper.

3. Configure loading at the correct path.
   - The correct path is `engine.render.loading`.
   - Do not write `engine.loading`.

4. Choose loading strategy.
   - Use `native` when the component has a loading prop and blocks user interaction.
   - Add `propName` when the prop is not named `loading`.
   - Use `wrapper` when the component can be covered by an external mask.
   - Use `none` for internally managed complex async components.

5. Validate.
   - Confirm root injection reaches a real DOM node.
   - Confirm loading behavior matches the declared strategy.
   - Run `validateManifest()`.

## Completion checklist

- [ ] `rootPath` points to props that reach a real DOM node.
- [ ] `slotProps.root` is passed when using `INJECT_PATH_SLOT_PROPS`.
- [ ] The loading field path is `engine.render.loading`.
- [ ] `native` loading blocks interaction, not only visual animation.
- [ ] `wrapper` loading can safely cover the whole component.
- [ ] `none` is used when loading remains component-owned.
- [ ] `validateManifest()` has no error.

## Authoritative sources

- `docs/组件开发/recipes/配置rootPath.md`
- `docs/组件开发/recipes/配置Loading策略.md`
- `docs/组件开发/reference/RootPath注入模型.md`
- `docs/组件开发/reference/Loading策略模型.md`
- `docs/组件开发/reference/Manifest字段参考.md`
