## 2024-05-18 - [Form Input Accessibility]
**Learning:** Found a pattern where `shadcn/ui` inputs within standard `<form>` elements were missing proper `<label>` associations (`htmlFor` / `id`) and helper text connections (`aria-describedby`), causing poor screen reader accessibility.
**Action:** When working with forms or settings pages, always explicitly link `<label>` and `<Input>` using matching `htmlFor` and `id` attributes, and use `aria-describedby` for any explanatory text below the input.
