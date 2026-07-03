## 2026-07-03 - Form Accessibility in SettingsTab
**Learning:** When using `shadcn/ui` components for forms, inputs and labels must be explicitly linked using `htmlFor` and `id` attributes respectively. Helper text should be associated using `aria-describedby` to ensure screen reader accessibility.
**Action:** Ensure proper HTML label associations (`htmlFor` and `id`) and utilize `aria-describedby` for helper text in all form components.
