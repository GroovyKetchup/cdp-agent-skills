---
name: cdp-component-manifest-validation
description: Validates CDP component manifests and diagnoses common integration failures. Use when a component package fails to render, events/actions/state do not work, validation warnings appear, or the user asks for pre-release self-checks.
---

# CDP Manifest Validation and Troubleshooting

## When to use

Use this skill before handing off a CDP component package or when a component renders incorrectly, does not emit events, cannot execute actions, exposes stale state, or has root/loading issues.

Do not start by changing host runtime code. First verify the public component contract and SDK import boundary.

## Workflow

1. Check SDK imports.
   - Use `cdp-material-sdk/portable` for manifests, traits, categories, root injection constants, validation, and diagnostics.
   - Use `cdp-material-sdk/host-react` only for confirmed shared React runtime scenarios.
   - Do not import host internals or SDK source paths.

2. Run static validation.
   - Use `validateManifest(manifest)` for one component.
   - Use `validateManifests(package.components.map((item) => item.manifest))` for a package.
   - Print results with `printValidationResult()`.
   - Treat errors as must-fix. Review warnings and document intentional exceptions.

3. Check common manifest errors.
   - `type`, `meta`, `meta.title`, and `meta.category` are required.
   - Data traits should have `meta.valueSchema`.
   - Custom events need namespaced names and `payloadSchema`.
   - Actions need `title`; params must use `type: 'object'`.
   - State needs `title` and `schema`.
   - Slots need `title`; dynamic slots need `dynamicSource` and `dynamicKey`.

4. Diagnose runtime action/state mismatches.
   - Use `diagnoseMissingActionImpls()` to compare manifest actions and ref methods.
   - Use `diagnoseMissingStateKeys()` to compare manifest state and `COMPONENT_STATE_KEY` values.
   - Fix component implementation when manifest and ref disagree.

5. Check root and loading issues.
   - Confirm `engine.render.injection.rootPath` points to a real DOM path.
   - Confirm `engine.render.loading` is used, not `engine.loading`.
   - Confirm native loading blocks interaction.

## Completion checklist

- [ ] SDK imports respect the public boundary.
- [ ] `validateManifest()` or `validateManifests()` has no error.
- [ ] Warnings are either fixed or intentionally accepted.
- [ ] Action declarations match ref methods.
- [ ] State declarations match `COMPONENT_STATE_KEY` keys.
- [ ] RootPath and loading behavior match the manifest.

## Authoritative sources

- `docs/组件开发/getting-started/05-自检与排错.md`
- `docs/组件开发/reference/validateManifest校验规则.md`
- `docs/组件开发/reference/Manifest字段参考.md`
- `docs/组件开发/reference/SDK导入边界.md`
- `docs/组件开发/FAQ.md`
