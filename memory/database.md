# Суперпамять Supabase

## Полная схема БД

### Таблица: user_settings
```sql
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Формат JSONB `settings`:**
```json
{
  "tokens": {
    "standard": "...",
    "statistics": "...",
    "ads": "..."
  },
  "taxRate": 6
}
```

### Таблица: product_cogs
```sql
CREATE TABLE public.product_cogs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nm_id BIGINT NOT NULL,
  cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, nm_id)
);
```

## RLS-политики
Обе таблицы: `SELECT`, `INSERT`, `UPDATE` — привязка к `auth.uid() = user_id`.
DELETE-политики НЕТ (сознательно — данные не удаляются из UI).

## Паттерны доступа из кода

### Чтение настроек
```ts
const { data } = await supabase
  .from('user_settings')
  .select('*')
  .eq('user_id', session.user.id)
  .single();
```

### Сохранение настроек (upsert)
```ts
await supabase.from('user_settings').upsert({
  user_id: session.user.id,
  settings: newSettings,
  updated_at: new Date().toISOString()
});
```

### Сохранение себестоимости (upsert с конфликтом)
```ts
await supabase.from('product_cogs').upsert({
  user_id: session.user.id,
  nm_id: nmId,
  cost: cost,
  updated_at: new Date().toISOString()
}, { onConflict: 'user_id, nm_id' });
```
