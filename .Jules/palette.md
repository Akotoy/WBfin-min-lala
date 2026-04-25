## 2024-05-14 - Accessibility Improvements
**Learning:** Found multiple instances where form inputs were missing `id` attributes linked via `htmlFor` on their labels, reducing clickability and screen reader accessibility. Mobile menu buttons with only icons were missing `aria-label`.
**Action:** Always verify that `<label>` elements are properly linked to `<input>` elements using `htmlFor` and `id` in new forms. Ensure all icon-only buttons receive a descriptive `aria-label`.
