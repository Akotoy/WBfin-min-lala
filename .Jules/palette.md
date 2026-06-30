
## 2024-06-30 - Link Labels and Inputs for shadcn/ui Forms
**Learning:** For forms constructed with `shadcn/ui` components (like `Input`), ensuring proper HTML label associations is crucial for accessibility. `label` elements need an `htmlFor` attribute that matches the `id` attribute of the corresponding `Input`. Furthermore, any helper text should be associated with the input using the `aria-describedby` attribute referencing the `id` of the element containing the helper text.
**Action:** When adding or modifying forms, especially those using custom UI components like `shadcn/ui`, always explicitly link `<label>` and `<Input>` using `htmlFor` and `id` attributes respectively, and use `aria-describedby` for helper text.
