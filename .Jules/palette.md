## 2025-03-01 - Add Dynamic ARIA Labels to Repeating Data Tables
**Learning:** In complex data tables with interactive elements (like inputs or action buttons) per row, static or generic ARIA labels (e.g. "Себестоимость" or "+100 ₽") provide a poor experience for screen readers as they lose context of which row/item is being interacted with.
**Action:** Always use dynamic `aria-label`s for repeating interactive elements in lists and tables, injecting row-specific context (e.g., `aria-label={\`Себестоимость для \${product.title}\`}`) so users know exactly which item they are modifying.
