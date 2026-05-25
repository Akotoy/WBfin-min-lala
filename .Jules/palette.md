## 2026-05-25 - Form Input Accessibility with shadcn/ui
**Learning:** When using shadcn/ui `<Input>` components, wrapping them in a `<label>` doesn't automatically associate them in all assistive technologies. Explicitly linking the `<label>` and `<Input>` using `htmlFor` and `id` respectively, and using `aria-describedby` for helper text ensures complete screen reader compatibility.
**Action:** Always verify that custom form components have explicit `id` and `htmlFor` links, and leverage `aria-describedby` for related informative text nodes.
