## 2024-05-04 - Settings Tab Accessibility Improvement
**Learning:** React form elements require programmatic connection for accessibility. Specifically, `htmlFor` on a `<label>` must correspond exactly with the `id` on an `<Input>` to provide context to screen readers, while helper or subtext should be tied to input components with an `aria-describedby` matching the text `id`.
**Action:** Always verify `id` and `htmlFor` matches on forms and leverage `aria-describedby` when a tooltip or description contextually aids input understanding.
