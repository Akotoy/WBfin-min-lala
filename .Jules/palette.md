## 2024-03-24 - Accessibility improvements for labels and helper text
**Learning:** Proper HTML label associations using `htmlFor` and `id`, as well as connecting helper texts via `aria-describedby`, are essential for screen reader accessibility in form fields. Furthermore, visually styling the required asterisk must not detract from screen reader flow.
**Action:** Always ensure any `<label>` explicitly uses `htmlFor` connected to its `<input>`'s `id`. For any supplementary helper text, assign an `id` and use `aria-describedby` on the input to establish the relationship programmatically.
