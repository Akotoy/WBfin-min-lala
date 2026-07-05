## 2024-05-20 - Form Accessibility Labels
**Learning:** Found that `<label>` elements were missing `htmlFor` properties to link to the corresponding input fields (`<Input>`) missing their `id`s. Helper text was not tied using `aria-describedby`.
**Action:** Added proper associations in `src/components/tabs/SettingsTab.tsx` to make screen reader and focus behaviors accurate. Always make sure to use `htmlFor` and `id` when using `shadcn/ui` components for forms and `aria-describedby` for helpers.
