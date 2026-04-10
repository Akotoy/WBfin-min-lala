# Wildberries API — Справочник для WBfin

Полная карта API Wildberries для нашего дашборда. Обновлена: 2026-04-10.

---

## 1. Базовые домены

| Домен | Что покрывает |
|---|---|
| `https://statistics-api.wildberries.ru` | Статистика: продажи, заказы, остатки, финотчёты |
| `https://content-api.wildberries.ru` | Контент: карточки товаров, медиа, характеристики |
| `https://common-api.wildberries.ru` | Тарифы, цены |
| `https://discounts-prices-api.wildberries.ru` | Цены, скидки, массовое обновление |
| `https://advert-api.wildberries.ru` | Реклама (кампании, ставки, бюджеты) |
| `https://marketplace-api.wildberries.ru` | Маркетплейс (FBS/DBS) |
| `https://seller-analytics-api.wildberries.ru` | Аналитика (воронки, отчёты) |
| `https://supplies-api.wildberries.ru` | Поставки (FBW) |
| `https://feedbacks-api.wildberries.ru` | Отзывы, вопросы |
| `https://returns-api.wildberries.ru` | Возвраты |
| `https://documents-api.wildberries.ru` | Документы |

> ⚠️ Старый домен `suppliers-api.wildberries.ru` отключён в 2025. НЕ ИСПОЛЬЗОВАТЬ.

---

## 2. Токены

### Типы токенов
| Тип | Для чего |
|---|---|
| **Персональный** | Собственные интеграции (наш случай) |
| **Сервисный** | SaaS из каталога WB |
| **Базовый** | Устаревший, лимиты ниже |
| **Тестовый** | Песочница (sandbox) |

### Создание и особенности
- **Где:** Личный кабинет WB → Профиль → Интеграция по API → Создать токен
- **Срок жизни:** 180 дней (потом протухает!)
- **Лимит:** Макс. 20 активных токенов на магазин
- **Показывается ОДИН раз** — при создании. Потом не восстановить, только создать новый.

### Категории доступа (scope)
При создании токена выбираешь, к каким разделам он даёт доступ:
- **Контент** — карточки товаров
- **Статистика** — продажи, заказы, остатки, финотчёты
- **Аналитика** — воронки, отчёты по регионам
- **Маркетплейс** — заказы FBS/DBS, остатки
- **Продвижение** — рекламные кампании
- **Цены и скидки** — обновление цен
- Финансы, Документы, Чат с покупателями…

### Авторизация
```
Header: Authorization: <TOKEN>
```
> ⚠️ Некоторые API требуют `Bearer <TOKEN>`, другие — голый токен. Проверяй конкретный endpoint.

---

## 3. Используемые эндпоинты (WBfin)

### 3.1. Карточки товаров
```
POST https://content-api.wildberries.ru/content/v2/get/cards/list
Token scope: Контент
```
**Body:**
```json
{
  "settings": {
    "cursor": { "limit": 100 },
    "filter": { "withPhoto": -1 }
  }
}
```
**Ответ:** `{ cards: [ { nmID, vendorCode, title, subjectName, sizes: [{ price, discount }] } ] }`
**Используется в:** `wbService.ts → getProducts()`

### 3.2. Продажи
```
GET https://statistics-api.wildberries.ru/statistics/v1/supplier/sales?dateFrom={YYYY-MM-DD}
Token scope: Статистика
```
**Формат dateFrom:** RFC3339 (`2026-01-01` или `2026-01-01T00:00:00`)
**Ответ:** Массив `WBSale[]` (см. `types.ts`)
**Ключевые поля:** `finishedPrice` (цена продажи), `forPay` (к выплате), `nmId`, `date`
**Используется в:** `wbService.ts → getSales()`

### 3.3. Заказы
```
GET https://statistics-api.wildberries.ru/statistics/v1/supplier/orders?dateFrom={YYYY-MM-DD}
Token scope: Статистика
```
**Ответ:** Массив `WBOrder[]` (см. `types.ts`)
**Ключевые поля:** `priceWithDisc`, `nmId`, `date`
**Используется в:** `wbService.ts → getOrders()`

### 3.4. Остатки на складах
```
GET https://statistics-api.wildberries.ru/statistics/v1/supplier/stocks?dateFrom={YYYY-MM-DD}
Token scope: Статистика
```
> ⚠️ **DEPRECATED!** Будет отключён 23 июня 2026.
> Новый: `POST /api/analytics/v1/stocks-report/wb-warehouses`

**Используется в:** `wbService.ts → getStocks()`

### 3.5. Финансовый отчёт (детализация по периоду)
```
GET https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod?dateFrom={}&dateTo={}
Token scope: Статистика
```
**Пагинация:** Использует `rrdid`. Начинать с `rrdid=0`, запрашивать пока не вернётся `204 No Content`.
**Ответ:** Массив `WBReportDetail[]` (см. `types.ts`)

**Ключевые финансовые поля:**
| Поле | Описание |
|---|---|
| `retail_amount` | Розничная цена продажи |
| `retail_price_withdisc_rub` | Цена со скидкой (руб.) |
| `sale_percent` | Процент скидки |
| `commission_percent` | Комиссия WB (%) |
| `ppvz_for_pay` | Итого к выплате продавцу |
| `delivery_rub` | Стоимость логистики |
| `penalty` | Штрафы |
| `additional_payment` | Доплаты |
| `supplier_oper_name` | Тип операции: "Продажа", "Возврат", "Штраф", "Логистика" |
| `doc_type_name` | Тип документа |

**Используется в:** `wbService.ts → getReportDetailByPeriod()` → `financeEngine.ts`

### 3.6. Обновление цен
```
POST https://discounts-prices-api.wildberries.ru/api/v2/upload/task
Token scope: Цены и скидки
```
**Body:**
```json
[{ "nmId": 12345, "price": 2500 }]
```
**Асинхронно:** Возвращает ID задачи. Нужно проверять статус.
**Используется в:** `wbService.ts → updatePrice()` (⚠️ сейчас вызывает legacy URL)

---

## 4. Rate Limits

Алгоритм: **Token Bucket** (ведро токенов)

### Заголовки ответа
| Заголовок | Описание |
|---|---|
| `X-Ratelimit-Limit` | Макс. запросов в текущем окне |
| `X-Ratelimit-Remaining` | Сколько запросов осталось |
| `X-Ratelimit-Retry` | Через сколько секунд можно повторить (при 429) |

### Стратегия обработки
1. Проверять `X-Ratelimit-Remaining` → если 0, ждать
2. При 429 → читать `X-Ratelimit-Retry` → спать → повторить
3. Экспоненциальный backoff при повторных ошибках

---

## 5. Коды ответов

| Код | Описание | Действие |
|---|---|---|
| `200` | Успех | — |
| `204` | Нет данных (конец пагинации) | Остановить запросы |
| `401` | Невалидный/просроченный токен | Проверить токен, пересоздать если истёк |
| `403` | Нет прав (scope не тот) | Создать токен с нужными правами |
| `429` | Rate limit | Ждать `X-Ratelimit-Retry` секунд |
| `409` | Конфликт данных | Считается как несколько запросов (!) |

---

## 6. Известные проблемы и подводные камни

1. **Токен протухает за 180 дней.** Нет автоматического обновления. Пользователь должен вручную создать новый в ЛК WB.
2. **`/v1/supplier/stocks` будет отключён 23.06.2026.** Нужно мигрировать на новый endpoint.
3. **`getProducts()` не возвращает остатки.** Поле `stock` всегда 0 — остатки приходят из отдельного API.
4. **`updatePrice()` использует неправильный URL в коде.** Сначала делает лишний вызов к content API. Нужно исправить на `discounts-prices-api.wildberries.ru/api/v2/upload/task`.
5. **Финотчёт (`reportDetailByPeriod`) требует пагинацию через `rrdid`.** Текущий код не реализует пагинацию — может получать неполные данные для больших магазинов.
6. **dateFrom формат:** Для Statistics API — RFC3339 (`YYYY-MM-DD`). Для FBS/DBS — Unix Timestamp. Не путать!
7. **Создание карточки товара асинхронно.** `200` в ответе ≠ карточка создана. Нужно опрашивать `/content/v2/cards/error/list`.

---

## 7. Эндпоинты на будущее (не используются пока)

| Endpoint | Описание |
|---|---|
| `POST /api/analytics/v3/sales-funnel/products` | Воронка продаж по товарам |
| `POST /api/analytics/v3/sales-funnel/products/history` | Воронка по дням/неделям |
| `POST /api/analytics/v1/stocks-report/wb-warehouses` | Новый API остатков (замена deprecated) |
| `POST /content/v3/media/file` | Загрузка фото для карточек |
| `POST /content/v2/cards/upload` | Создание карточки (макс. 100 за раз) |
| `POST /content/v2/barcodes` | Генерация штрих-кодов |
| Advert API (`advert-api.wildberries.ru`) | Управление рекламой — бюджеты, ставки, статистика |
