## 2024-05-24 - Accessibility gaps in Forms and Icon Buttons
**Learning:** Found multiple instances where form inputs lacked `id` attributes matching their `htmlFor` label counterparts in standard form groups. Also observed that icon-only buttons (like mobile hamburger menus) missing `aria-label`s are a common accessibility gap in this application's layout components.
**Action:** Always verify `htmlFor` and `id` pair correspondence when building forms, and mandate an `aria-label` for any button that relies solely on a Lucide icon for its content.
