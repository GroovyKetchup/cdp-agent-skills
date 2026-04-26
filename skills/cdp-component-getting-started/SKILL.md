---
name: cdp-component-getting-started
description: Guides an agent through creating or onboarding a deliverable CDP component library project. Use when the user wants to start CDP component development from scratch, prepare package structure, register a component package, build an ESM plugin, or run first-time validation.
---

# CDP Component Getting Started

## When to use

Use this skill when the task is to create a new CDP component library, onboard an existing UI library into CDP, or establish the first working component package.

Do not use this skill when the user already has a CDP component package and only wants to add one component. Use `cdp-component-add-to-existing-package` instead.

## Workflow

1. Confirm the project scope.
   - New library: create a package-oriented project.
   - Existing UI library: add a CDP adapter layer.
   - Existing CDP package: switch to the add-to-existing-package skill.

2. Create the package layout.
   - Put React components or wrappers under `src/components/*/index.tsx`.
   - Put each component manifest beside its component as `manifest.ts`.
   - Put package aggregation in `src/manifests.ts` or equivalent.
   - Put host loading entry in `src/plugin.ts`.

3. Use the public SDK boundary.
   - Default imports must come from `cdp-material-sdk/portable`.
   - Use `cdp-material-sdk/host-react` only when the package is confirmed to share React runtime and context identity with the host.
   - Never import host internal modules or SDK source paths.

4. Configure packaging.
   - Build as ESM library output.
   - Keep `react`, `react-dom`, and `react/jsx-runtime` external.
   - Set React dependencies as peer dependencies.
   - Keep `cdp-material-sdk/portable` available to the package.

5. Register the package.
   - Build an `EngineComponentPackage` with component entries.
   - Export an `EngineComponentPlugin` whose `install(api)` calls `api.registerPackage(package)`.

6. Validate before handoff.
   - Run `validateManifest()` or `validateManifests()` from `cdp-material-sdk/portable`.
   - Ensure the project can run its build command.
   - Confirm the output is ESM and React is not bundled.

## Completion checklist

- [ ] Project has component implementation, manifest, package aggregation, and plugin entry.
- [ ] SDK imports use `cdp-material-sdk/portable` by default.
- [ ] React runtime packages are externalized.
- [ ] Each manifest has `type`, `meta.title`, and `meta.category`.
- [ ] `validateManifest()` or `validateManifests()` has no error.
- [ ] The package can be dynamically imported by the CDP host.

## Authoritative sources

- `docs/组件开发/getting-started/01-创建或接入组件库工程.md`
- `docs/组件开发/getting-started/02-创建组件包并注册.md`
- `docs/组件开发/getting-started/03-开发最小可运行组件.md`
- `docs/组件开发/getting-started/04-构建发布与宿主接入.md`
- `docs/组件开发/getting-started/05-自检与排错.md`
- `docs/组件开发/reference/SDK导入边界.md`
