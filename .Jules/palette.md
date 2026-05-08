## 2024-05-08 - Accessible Forms
**Learning:** Found a recurring pattern in the app where form inputs lack programmatic association with their labels, breaking screen reader experience. Helper texts are also visually present but not connected to inputs for assistive technologies.
**Action:** Always ensure `<label>` uses `htmlFor` matching the input's `id`. When helper text is provided alongside an input, link it using `aria-describedby` on the input, pointing to the `id` of the helper text element. Establish this as a reusable UX pattern for the design system across all tabs and forms.
