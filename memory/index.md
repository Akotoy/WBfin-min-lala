# WBfin — Агентский Файл Памяти
# Этот файл автоматически загружается агентом при начале работы с проектом.
# Держать < 200 строк. Каждая строка должна «заслужить» своё место.

## Проект
SPA-дашборд для финансовой аналитики продавцов Wildberries.
React 18 + Vite + TypeScript. Стилизация: TailwindCSS + shadcn/ui.
Бекенд: Supabase (авторизация + хранение). Деплой: Vercel.

## Ключевые команды
```
npm run dev        # Локальный дев-сервер (Vite)
npm run build      # Продакшн-сборка → dist/
git push origin main  # Автодеплой на Vercel
```

## Структура проекта
```
api/               → Vercel Serverless Functions (прокси к WB API)
components/        → Auth.tsx + shadcn/ui компоненты
lib/               → supabase.ts (клиент), utils.ts
src/
  ├── App.tsx      → Главный компонент (стейт, роутинг, UI)
  ├── services/    → wbService.ts (все запросы к WB через прокси)
  ├── lib/         → financeEngine.ts (финансовый движок)
  └── types.ts     → Типы данных (WBProduct, WBSale, WBOrder...)
memory/            → База знаний агента (этот файл + детали)
```

## Архитектурные решения (НЕ МЕНЯТЬ без согласования)
1. Все запросы к WB API идут через `api/wb-proxy.ts` (CORS-прокси на Vercel).
   Напрямую из браузера к API WB обращаться НЕЛЬЗЯ — будет CORS-ошибка.
2. Авторизация через Supabase Email Auth. Confirm Email отключен.
3. Настройки и себестоимость хранятся в Supabase (`user_settings`, `product_cogs`), НЕ в localStorage.
4. RLS (Row Level Security) включен — каждый user видит только свои данные.

## Стиль кодирования
- Функциональные компоненты React (никаких классов)
- TypeScript strict mode, избегать `any`
- Все UI-компоненты из shadcn/ui (папка `components/ui/`)
- Цветовая палитра: фиолетовый `#7C3AED` (primary), фон `#F8F9FA`

## Известные грабли (GOTCHAS)
- `vercel.json` НЕ должен содержать `"framework": "vite"` — иначе Serverless Functions игнорируются, и `/api/wb-proxy` выдаёт 404.
- Supabase anon key и service_role key — разные вещи. Для создания пользователей напрямую нужен service_role.
- Путь `@/` в импортах резолвится в корень проекта (vite.config alias), НЕ в `src/`.
- Файл `.env` НЕ коммитится. Ключи Supabase хранить только локально и в Vercel Environment Variables.

## Тестовый доступ
- Email: demo@wbfin.ru
- Пароль: Demo2026!
