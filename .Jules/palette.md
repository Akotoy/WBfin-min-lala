## 2024-05-18 - Form Accessibility in Settings
**Learning:** Found that the standard settings form in the app lacked label associations (`htmlFor` -> `id`), meaning screen readers wouldn't announce the field names properly when focusing inputs, and clicking labels wouldn't focus the inputs. Also, helper text was not linked to inputs via `aria-describedby`.
**Action:** Always link `<label>` with `<input>` using `htmlFor` and `id`, and link helper text using `aria-describedby` to ensure full form accessibility.

## 2024-05-18 - Form Accessibility in Auth
**Learning:** Found that the authentication form lacked label elements entirely, relying only on placeholders. Placeholders are insufficient for screen readers and can disappear when the user starts typing, making it difficult for users with cognitive disabilities to remember the field's purpose.
**Action:** Always use explicit `<label>` elements linked with `htmlFor` and `id` for all form inputs, even if placeholders are present.
