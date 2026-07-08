## 2024-07-08 - Added Dynamic ARIA Labels in Data Tables
**Learning:** For complex data tables with repeating interactive elements (e.g., inputs or buttons per row), static generic labels like "Себестоимость" or "Изменить цену" are not sufficient for screen reader users as they lose context of which row they belong to.
**Action:** Always use dynamic `aria-label`s referencing the row's specific context (like `product.title`) when adding interactive elements within mapped loops for data tables.
