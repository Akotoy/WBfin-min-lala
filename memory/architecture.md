# Архитектура WBfin

## Обзор потока данных
```
[Браузер] → /api/wb-proxy (Vercel Serverless) → [WB API]
                                                    ↓
[Браузер] ← JSON ← /api/wb-proxy ← ← ← ← ← ← [WB API]
```
Фронтенд НИКОГДА не обращается к WB API напрямую. Всегда через серверлесс-прокси.

## Потоки авторизации
```
[Auth.tsx]
  ↓ signUp / signIn
[Supabase Auth] → session token → [App.tsx]
  ↓
[App.tsx] → useEffect(session) → загрузка user_settings и product_cogs из Supabase
  ↓
[App.tsx] → fetchData() → wbService → api/wb-proxy → WB API
```

## Ключевые файлы и их ответственность

| Файл | Зона | Описание |
|---|---|---|
| `App.tsx` | Ядро | Стейт-менеджмент, авторизация, все табы UI |
| `components/Auth.tsx` | Авторизация | Форма входа/регистрации |
| `api/wb-proxy.ts` | Бекенд | Серверлесс-прокси для CORS |
| `src/services/wbService.ts` | Данные | Обёртки для WB API (продукты, продажи, заказы, остатки, отчёты) |
| `src/lib/financeEngine.ts` | Бизнес-логика | Расчёт P&L по каждому товару |
| `lib/supabase.ts` | Инфра | Инициализация Supabase-клиента |

## Supabase
- **URL:** https://hleouquclfdacjgspixg.supabase.co
- **Таблицы:** `user_settings` (JSONB), `product_cogs` (nm_id + cost)
- **RLS:** Включен. Каждый пользователь видит только свои записи.
- **Политики:** SELECT, INSERT, UPDATE для обеих таблиц (привязка к `auth.uid()`)

## Vercel
- **Проект:** w-bfin-min-lala.vercel.app
- **GitHub:** github.com/Akotoy/WBfin-min-lala
- **Конфигурация:** `vercel.json` — buildCommand + outputDirectory + rewrites
- **Env vars:** VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (должны быть в Vercel Dashboard)
