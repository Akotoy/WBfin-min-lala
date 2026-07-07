## 2024-05-24 - Dynamic ARIA Labels in Data Tables
**Learning:** When dealing with complex data tables with repeating interactive elements (like inputs or buttons per row), static `aria-label`s provide insufficient context for screen reader users navigating row by row. They need to know which specific item the action applies to.
**Action:** Always use dynamic `aria-label`s that reference the row's specific context (e.g., `product.title` or `item.name`) on repeating interactive elements to ensure clear and actionable screen reader accessibility.
