## 2026-05-30 - [Dynamic ARIA labels in tables]
**Learning:** When using data tables with repeating interactive elements (like inputs or action buttons per row), using static `aria-label`s creates a confusing experience for screen reader users as they hear the same label repeatedly without knowing which row it applies to.
**Action:** Always use dynamic `aria-label` attributes referencing a row's specific context (e.g. `aria-label={\`Себестоимость для ${product.title}\`}`) to ensure proper accessibility in dynamic lists and tables.
