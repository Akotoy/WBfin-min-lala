## 2025-02-28 - [Accessible Forms in Settings]
**Learning:** React elements in Settings form lack explicit label associations and helper text associations, making it harder for screen readers to navigate form fields properly.
**Action:** Always link `<label>` and `<input>` using `htmlFor` and `id`, and link helper texts to their inputs using `aria-describedby` with matching `id`.