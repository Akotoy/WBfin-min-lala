# Инфраструктура и деплой

## Vercel
- **Проект:** w-bfin-min-lala.vercel.app
- **GitHub-репо:** github.com/Akotoy/WBfin-min-lala (ветка `main`)
- **Автодеплой:** `git push origin main` → Vercel автоматически пересобирает

### vercel.json (текущий)
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)",     "destination": "/index.html" }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```
> ⚠️ НЕ добавлять `"framework": "vite"` — сломает Serverless Functions.

### Переменные окружения (Vercel Dashboard)
| Переменная | Описание | Обязательна |
|---|---|---|
| `VITE_SUPABASE_URL` | URL Supabase-проекта | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Публичный ключ Supabase | ✅ |

## Supabase
- **Проект ID:** hleouquclfdacjgspixg
- **URL:** https://hleouquclfdacjgspixg.supabase.co
- **Регион:** (по умолчанию)
- **Confirm Email:** ОТКЛЮЧЕНО (нет SMTP)
- **SQL-скрипт для инициализации:** `setup_supabase.sql` (в корне проекта)

## Полезные команды для отладки
```bash
# Проверить что Vercel видит API
curl -X POST https://w-bfin-min-lala.vercel.app/api/wb-proxy \
  -H "Content-Type: application/json" \
  -d '{"url":"https://common-api.wildberries.ru/api/v1/tariffs/box","token":"YOUR_TOKEN"}'

# Создать пользователя через Admin API (требует service_role key)
npx tsx -e "import {createClient} from '@supabase/supabase-js'; ..."
```
