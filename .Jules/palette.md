## 2024-06-23 - Form Accessibility with shadcn/ui
**Learning:** Even when using well-designed UI components like shadcn/ui, native HTML accessibility features like explicit `<label>` association (`htmlFor` and `id`) and `aria-describedby` for helper text are often missed, especially in complex forms. This makes screen reader navigation difficult.
**Action:** Always verify that `<label>` components explicitly link to their target inputs via `htmlFor`/`id` pairs, and ensure any descriptive helper text is linked using `aria-describedby` to provide full context to assistive technologies.
