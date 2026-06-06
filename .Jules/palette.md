## 2024-06-06 - Form accessibility with shadcn/ui components

**Learning:** When using shadcn/ui components (or React component wrappers in general), custom `Input` components don't always automatically link `<label>` elements unless explicitly associated. Screen readers will skip labels for inputs and custom form fields if they aren't properly linked with `htmlFor` and `id`. In addition, supplementary instructions (like example texts) need to be explicitly associated with the input using `aria-describedby` so they are announced by screen readers when focusing the input.
**Action:** Always link labels to inputs by setting `id` on the `<Input>` and `htmlFor` on the `<label>`. Additionally, give helper texts a unique `id` and reference them with `aria-describedby` on the `<Input>`.
