---
name: cdp-component-actions-state-events-slots
description: Declares and verifies CDP events, actions, state, and slots for a component manifest and implementation. Use when adding outbound events, imperative component methods, readable runtime state, named slots, scoped slots, or dynamic slots.
---

# CDP Actions, State, Events, and Slots

## When to use

Use this skill when a component needs to notify the host, expose command-style methods, expose read-only runtime state, or provide regions for child content.

Do not add these capabilities when the component is static, purely prop-driven, or only needs one data field value.

## Workflow

1. Decide which capability is needed.
   - Use events for notifications from component to host.
   - Use actions for host or workflow commands into the component.
   - Use state for read-only runtime snapshots.
   - Use slots when users can place child content in the component.

2. Declare events.
   - Put standard events in `events`.
   - Put custom events in `customEvents`.
   - Custom event names must be namespaced, such as `acme.rowClick`.
   - Custom events must include `payloadSchema`.
   - Adapter events must reference events already declared in the manifest.

3. Declare actions and implement them.
   - Every action needs `title`.
   - `params.type` must be `object` when params are declared.
   - `returns` is recommended.
   - The action key must match the method exposed through React ref.

4. Declare state and implement it.
   - Every state entry needs `title` and `schema`.
   - Runtime state must be exposed under `COMPONENT_STATE_KEY`.
   - State is read-only; use actions for writes.
   - Include state values in `useImperativeHandle` dependencies.

5. Declare slots and render them.
   - Every slot needs `title`.
   - Dynamic slots need `dynamicSource` and `dynamicKey`.
   - Scoped slots should include `scopeDescription`.
   - Components must actually render `_slots` or `_scopedSlots`.

6. Validate implementation consistency.
   - Use `validateManifest()` for manifest structure.
   - Use `diagnoseMissingActionImpls()` for ref method coverage.
   - Use `diagnoseMissingStateKeys()` for state key coverage.

## Completion checklist

- [ ] Unneeded capabilities were not added.
- [ ] Adapter events reference already declared events.
- [ ] Action keys match ref method names.
- [ ] State keys are exposed under `COMPONENT_STATE_KEY`.
- [ ] Slot declarations are rendered by the component.
- [ ] `validateManifest()` has no error.

## Authoritative sources

- `docs/组件开发/recipes/声明事件.md`
- `docs/组件开发/recipes/声明动作与状态.md`
- `docs/组件开发/recipes/声明插槽.md`
- `docs/组件开发/reference/Events模型.md`
- `docs/组件开发/reference/ActionsState模型.md`
- `docs/组件开发/reference/Slots模型.md`
