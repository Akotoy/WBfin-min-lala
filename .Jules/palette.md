## 2026-05-06 - [Form Accessibility]
**Learning:** Forms without matching `id` and `htmlFor` properties, and missing `aria-describedby` for helper text, make it difficult for screen reader users to understand inputs.
**Action:** Add `htmlFor` to `<label>`s and matching `id` to `<Input>`s. Use `aria-describedby` on inputs to link to helper text.
