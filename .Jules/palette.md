## 2024-05-03 - Form Input Accessibility
**Learning:** Proper programmatic association of form labels and inputs using `htmlFor` and `id` is crucial for screen readers. Similarly, helper texts should be linked using `aria-describedby` so that users with assistive technologies receive the context for inputs like 'Налоговая ставка (%)'.
**Action:** Always ensure `htmlFor` maps to the input's `id`, and use `aria-describedby` to link inputs to their instructional or helper text.
