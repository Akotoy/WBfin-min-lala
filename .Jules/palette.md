## 2024-11-20 - [Proper Label Association in Settings Form]
**Learning:** Using `shadcn/ui` or generic components, ensure strict pairing of `<label htmlFor="id">` with `<Input id="id">`. Also use `aria-describedby` to link inputs to helper text.
**Action:** Always check `htmlFor` and `id` when modifying forms to ensure screen readers announce them properly.
