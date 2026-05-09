# ms_web_dev_frontend

Фронтенд интернет-магазина: публичная витрина (каталог, корзина, оформление заказа). Состояние — Redux Toolkit, бэкенд — два FastAPI-микросервиса (`products` + `orders`), доставка — Docker Compose + CI с semantic-release и публикацией образа в GHCR.

> Админ-панель остаётся в репозитории как заготовка, но в публичном flow не используется.

## Стек

- **React 19** + **TypeScript** + **Vite 8**
- **Redux Toolkit** + **react-redux** — глобальное состояние (slices, thunks, типизированные хуки)
- **React Router v6** — маршрутизация (публичные и защищённые админ-маршруты)
- **React Compiler** (через `babel-plugin-react-compiler`) — автооптимизация ре-рендеров
- **Vitest** + **Testing Library** + **jsdom** — модульные и интеграционные тесты
- **ESLint** + **typescript-eslint** — линтинг
- **semantic-release** — автоматический выпуск версий, CHANGELOG и публикация Docker-образа
- **nginx** (`nginx:alpine`) — раздача SPA + reverse-proxy на бэкенды в production-образе

## Архитектура

- Браузер → nginx (фронтенд-контейнер) → reverse-proxy → `products_service` / `orders_service`
- Same-origin paths `/api/products/*` и `/api/orders/*` — без CORS
- В dev (`npm run dev`) тот же proxy реализован через `vite.config.ts → server.proxy`
- Постгрес — общий контейнер с двумя БД (`products_db`, `orders_db`), создаётся скриптом `init-db.sh`

## Скрипты

```bash
npm run dev          # dev-сервер Vite с HMR
npm run build        # тайпчек (tsc -b) + production-сборка
npm run preview      # предпросмотр production-сборки
npm run lint         # ESLint по всему проекту
npm test             # запуск тестов один раз
npm run test:watch   # тесты в watch-режиме
npm run release      # semantic-release (обычно вызывается из CI)
```

## Запуск

### Вариант 1: только фронтенд в dev-режиме (бэкенды в Docker)

```bash
docker compose up postgres products_service orders_service
npm install
npm run dev      # http://localhost:5173, прокси на :8002 / :8003
```

### Вариант 2: полный стек в Docker

```bash
chmod +x init-db.sh         # один раз
docker compose up --build   # http://localhost:8080
```

### Вариант 3: только бэкенды для интеграционных тестов

```bash
docker compose up postgres products_service orders_service
```

## Переменные окружения

- `VITE_PRODUCTS_API_URL` (default: `/api/products`)
- `VITE_ORDERS_API_URL` (default: `/api/orders`)
- В docker-compose можно переопределить `POSTGRES_USER` / `POSTGRES_PASSWORD` через `.env` (см. `.env.example`).

Vite `import.meta.env.VITE_*` запекается в бандл на этапе сборки, поэтому в production-образе значения фиксированы аргументами `--build-arg` в `docker-compose.yml` / `.releaserc.json`.

## Состояние (Redux Toolkit)

Slices:

- `products` — список + текущий товар + словари (categories, bulb-types, …); thunks `fetchProducts`, `fetchProductById`, `fetchDictionaries`.
- `cart` — позиции с snapshot'ами `{name, price, oldPrice, imageUrl}`; персистится в `localStorage` (`lm_cart`).
- `orders` — `createOrder` thunk, `lastOrder` для страницы успеха.
- `reviews` — `byProductId` map; thunks `fetchReviews`, `createReview`.

Хук `useCart` оставлен как тонкая обёртка над Redux — публичный API не изменился, страницы переписывать не пришлось. Типизированные хуки `useAppDispatch` / `useAppSelector` — в `src/store/hooks.ts`.

## Структура

```
src/
├── api/
│   ├── http.ts        # обёртка над fetch + ApiError
│   ├── mappers/       # маперы snake_case ↔ доменные типы
│   ├── products.ts    orders.ts    reviews.ts    dictionaries.ts    auth.ts
├── store/
│   ├── index.ts       # makeStore + персист cart в localStorage
│   ├── hooks.ts       # useAppDispatch / useAppSelector
│   └── slices/        # cartSlice, productsSlice, ordersSlice, reviewsSlice
├── components/   # переиспользуемые UI-компоненты (Button, Modal, Pagination, ProductCard, …)
├── hooks/        # глобальные хуки (useAuth, useCart)
├── layouts/      # PublicLayout, AdminLayout, MinimalLayout
├── pages/        # страницы маршрутов (HomePage, CatalogPage, ProductPage, Admin*, …)
├── mocks/        # моки для тестов и dev-окружения
├── test/
│   ├── fetchMock.ts        # утилиты мок-fetch
│   ├── renderWithStore.tsx # render с Provider + MemoryRouter
│   └── setup.ts            # глобальный setup vitest
├── types/        # доменные типы (product, order, review, auth, dictionaries)
├── utils/        # утилиты (format, …)
├── styles/       # глобальные стили
├── router.tsx    # конфигурация маршрутов
└── main.tsx      # точка входа
```

## Маршрутизация

- **Публичные** (`PublicLayout`): `/`, `/catalog`, `/product/:id`, `/about`, `/cart`, `/checkout`, `/order-success`
- **Минимальный layout**: `/admin/login`
- **Админ-зона** (`RequireAdmin` + `AdminLayout`): `/admin`, `/admin/products`, `/admin/import`, `/admin/dictionaries`

## API-маппинг (frontend ↔ backend)

Краткая таблица различий между доменными типами фронтенда и схемами OpenAPI бэкенда. Адаптация — в `src/api/mappers/*`.

- `Product`: backend не отдаёт `imageUrl` / `rating` / `reviewsCount` / `popularity` / `oldPrice` / `isNew` — мапер подставляет нейтральные дефолты (`/placeholder.png`, 0).
- `Order`: `deliveryMethod` упаковывается в `comment` (`"Доставка: курьер\n\n<user>"`); тоталы вычисляются на клиенте.
- Статусы заказа: `new ↔ NEW`, `processing ↔ IN_PROGRESS`, `delivered ↔ DELIVERED`, `cancelled ↔ CANCELLED`. Состояние `shipped` отображается на `IN_PROGRESS` (бэкенд его не различает).
- `Review`: бэкенд не хранит автора — после загрузки отображается «Аноним».

## CI / релизы

- `.github/workflows/release.yml` — на push в `main`: `npm ci → lint → test → build → npx semantic-release`.
- `semantic-release` (config `.releaserc.json`):
  - анализирует conventional commits,
  - бампит версию + пишет `CHANGELOG.md`,
  - собирает Docker-образ через `docker buildx build --push` и пушит в `ghcr.io/andreyquantum/ms_web_dev/frontend:{version,latest}`,
  - коммитит back на `main` с `[skip ci]`.
- Для первого релиза нужен хотя бы один коммит формата `feat: …` или `fix: …`.

## Docker

- `Dockerfile` — multi-stage: `node:20-alpine` → `nginx:alpine` (SPA-fallback + reverse-proxy `/api/products/*` и `/api/orders/*`).
- `docker-compose.yml` — `postgres:16-alpine` + `ghcr.io/.../products_microservice:latest` (8002) + `ghcr.io/.../orders_microservice:latest` (8003) + локально собранный фронтенд (8080).
- `init-db.sh` — создаёт `products_db` и `orders_db` при первом запуске postgres (нужен `chmod +x`).
- Хосты бэкендов прибиты к `127.0.0.1` (доступ только с локальной машины); для прод-выкладки убрать публикацию портов и оставить только nginx.

## Тестирование

- 307 тестов: модульные (slices, mappers, api), компонентные (страницы, layouts), вспомогательные (`fetchMock`, `renderWithStore`).
- В тестах `fetch` мокается через `vi.spyOn(globalThis, 'fetch')` либо помощник `mockFetchOnce` из `src/test/fetchMock.ts`.
- Хелпер `renderWithProviders(ui, { preloadedState, route })` обёртывает render в `<Provider store={makeStore(preloadedState)}>` + `<MemoryRouter>` для страничных тестов.
- Запуск: `npm test` (один проход) или `npm run test:watch`.

## Известные ограничения

- Каталог: бэкенд поддерживает фильтры только по `category_id`, `is_archived`, `page`, `size`. Поиск, цена, яркость, цоколь и пр. применяются клиентски на загруженной странице — **из-за этого пагинация и общее количество могут расходиться при активных клиентских фильтрах**.
- Сортировки `popular` / `new` отрабатывают на нулевых дефолтах (бэкенд не отдаёт `popularity` / `isNew`); UI пока сохраняет опции, но фактического эффекта не дают.
- Способ доставки сохраняется только в комментарии заказа (бэкенд не имеет отдельного поля).
- `shipped` отправляется на бэкенд как `IN_PROGRESS` (необратимое отображение).
- Автор отзыва не сохраняется — поле убрано из формы; существующие отзывы рисуются как «Аноним».
- Админ-панель использует те же api-модули, поэтому её CRUD теперь идёт в реальный бэкенд (а не в моки) — учитывайте при ручных проверках.

## Документация

В каталоге `docs/` находятся:

- `postman_collection.json`, `postman_collection_demo.json` — коллекции Postman для API
- `userflow/` — пользовательские сценарии
- `БД ER диаграмма/` — ER-диаграмма базы данных
- `архитектура микросервисов/` — схема микросервисной архитектуры
- `прототипы/` — UI-прототипы
- `страницы и права/` — матрица страниц и прав доступа
- `схема c4/` — C4-модель архитектуры

## Алиасы путей

В коде используется алиас `@/` для `src/` (см. `vite.config.ts` и `tsconfig.app.json`).
