## 2024-05-09 - Accessible Form Controls
**Learning:** Found patterns where forms lacked semantic label associations and screen reader support for helper text. Specifically, `label`s missed `htmlFor`, inputs missed `id`s, and helper text wasn't linked.
**Action:** Always verify `htmlFor` matching `id` in `Input`s, and ensure helper paragraphs are linked using `aria-describedby` to provide full context to screen readers.
