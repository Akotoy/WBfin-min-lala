## 2026-05-17 - shadcn/ui form accessibility
**Learning:** By default, shadcn/ui `<Input>` components used alongside native `<label>`s lack inherent connection, requiring explicit `htmlFor` on the label and `id` on the input for screen reader accessibility. Helper text requires `aria-describedby`.
**Action:** Always verify form components have `id`s and `htmlFor` mappings, and use `aria-describedby` to link explanatory text to the related input.
