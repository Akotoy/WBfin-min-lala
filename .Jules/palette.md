
## 2024-05-18 - Form Accessibility with shadcn/ui
**Learning:** When using `shadcn/ui` custom form components (like `Input` that wrap standard HTML elements), explicitly linking `<label>` and `<Input>` using `htmlFor` and `id` attributes respectively, and using `aria-describedby` for helper text is critical to ensure screen reader accessibility and clickable labels, as these associations are not inherently built into the basic component markup.
**Action:** Always verify that every custom form input has a directly associated `<label>` or `aria-label`, and use `aria-describedby` to link explanatory text to the relevant input field.
