## 2024-06-04 - Dynamic ARIA Labels in Data Tables
**Learning:** In complex data tables where repeating elements like `Input` or `Button` don't have explicit text labels within their specific table cell, screen readers lose context. Applying static `aria-label`s isn't sufficient as it doesn't differentiate between rows.
**Action:** Always use dynamic `aria-label`s for interactive elements inside map loops (e.g. `aria-label={\`Увеличить цену для ${product.title}\`}`) so users relying on assistive technology understand exactly which item they are interacting with.
