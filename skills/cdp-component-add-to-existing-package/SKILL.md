---
name: cdp-component-add-to-existing-package
description: Adds a new component to an existing CDP component package without rebuilding the whole project. Use when the user has an existing CDP component package and wants to add, register, validate, or minimally wire one new component.
---

# Add Component to Existing CDP Package

## When to use

Use this skill when the repository already contains CDP package structure and the task is to add a new component to it.

Do not recreate the component library, replace package tooling, or rewrite unrelated package registration files unless the user asks for that.

## Workflow

1. Locate the existing package conventions.
   - Find the current component directory pattern.
   - Find where component manifests are aggregated.
   - Find the plugin entry that calls package registration.

2. Add only the new component files.
   - Create a focused component directory.
   - Add `index.tsx` or equivalent implementation.
   - Add `manifest.ts` beside the component.
   - Follow existing naming and namespace conventions.

3. Register the component.
   - Add the component and manifest to the existing package aggregation.
   - Keep existing package metadata and existing components unchanged.
   - Ensure the component `type` is stable and namespaced.

4. Implement the minimum runnable contract.
   - Use React `forwardRef` when the component exposes root DOM or actions/state.
   - Pass root injection props to the real DOM root when rootPath is declared.
   - Add optional capabilities only when the component actually needs them.

5. Validate.
   - Run the package's manifest validation command if present.
   - Otherwise run `validateManifest()` for the new manifest.
   - Build or type-check with the package's existing command when available.

## Completion checklist

- [ ] Only the new component and required registration files changed.
- [ ] The component manifest is included in the existing package aggregation.
- [ ] The component `type` is stable, unique, and namespaced.
- [ ] Optional capabilities are not added without a clear reason.
- [ ] `validateManifest()` has no error for the new manifest.
- [ ] Existing components were not rewritten.

## Authoritative sources

- `docs/组件开发/getting-started/02-创建组件包并注册.md`
- `docs/组件开发/getting-started/03-开发最小可运行组件.md`
- `docs/组件开发/getting-started/05-自检与排错.md`
- `docs/组件开发/reference/示例代码索引.md`
