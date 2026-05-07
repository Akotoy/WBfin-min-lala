## 2024-05-07 - Accessible Form Labels
**Learning:** Proper association between form `<label>` and `<input>` using `htmlFor` and `id` is crucial for both screen readers and usability (clicking the label focuses the input). Using `aria-describedby` helps associate helper text with inputs.
**Action:** Always ensure inputs have an `id` matching their label's `htmlFor`, and use `aria-describedby` for any additional descriptive text or hints.
