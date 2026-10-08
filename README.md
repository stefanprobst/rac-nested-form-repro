# react-aria-components: a nested `Form` inherits the outer `Form`'s props

Minimal reproduction for `react-aria-components@1.22.0` (react 19.3.0).

```sh
pnpm install
pnpm test   # 3 failing tests, one per symptom
pnpm dev    # interactive demo
```

## Description

`Form` provides all of its props via `FormContext`, and also consumes `FormContext` via
`useContextProps` (since #6302, "Make FormContext match our other contexts"). A `Form` rendered
inside another `Form` in the React tree — typically an independent form in a `Modal`/portal, e.g. a
"create related item" dialog inside an edit form — therefore merges the outer form's props into its
own with `mergeProps`:

1. **Event handlers are chained**, outer first. Submitting the inner form calls the outer form's
   `onSubmit` with `event.currentTarget` being the _inner_ form element. If that handler dispatches
   a server action (e.g. `onSubmit={(e) => { e.preventDefault(); action(new FormData(e.currentTarget)) }}`),
   the outer action runs with the inner form's data.
2. **`id` and `className` are inherited**: the inner form gets the outer form's `id` (a duplicate id
   in the document) and its class names.
3. **Props the inner form leaves `undefined` are inherited**, e.g. `validationErrors`: the outer
   form's server errors are shown on the inner form's fields with the same `name`, and set as custom
   validity, which blocks submitting the inner form.

The DOM contains no nested `<form>` elements, since the inner form is rendered into a portal.

## Expected

A nested `Form` is an independent form: it does not inherit the outer form's `onSubmit`, `id`,
`className`, `validationErrors`, etc. Fields still pick up `validationBehavior` and validation
errors from their nearest `Form`.

## Actual

See `src/nested-forms.test.tsx`:

- submitting the inner form calls the outer `onSubmit` for the inner form element
- the inner `<form>` has `id="outer-form"` and `class="outer-form …"`
- the inner "Name" field shows the outer form's validation error for `name`

(The test's outer `onSubmit` ignores events whose `target` is not its own form element, since React
also bubbles the inner form's submit event through the portal to the outer form — that part is
expected React behaviour and not what this issue is about.)

## Workaround

Reset the context around each form, so that a form never consumes an enclosing form's context:

```tsx
<FormContext.Provider value={null}>
	<Form {...props} />
</FormContext.Provider>
```

With this, all three tests pass.

## Possible fix

`Form` could provide a context to its children which a nested `Form` does not consume as its own
props (e.g. keep the slotted `FormContext` for configuring a `Form` from outside, but expose
`validationBehavior` to fields through a separate context, or clear `FormContext` for nested
`Form`s), similar to how #10293 stopped nested `Tabs` from inheriting the parent's values.
