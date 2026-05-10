## 2026-05-10 - [Form Accessibility in Settings]
**Learning:** Discovered that input forms in settings were lacking proper HTML label associations and screen reader support for helper text. Ensuring `htmlFor` matches the `id` of the `Input` element, and using `aria-describedby` to link inputs to their helper texts, are critical for accessibility.
**Action:** Always check forms for proper label associations and ensure helper text is correctly linked to the input via `aria-describedby`.
