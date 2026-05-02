# ms_web_dev_frontend

Фронтенд интернет-магазина: публичная витрина с каталогом, корзиной и оформлением заказа, а также административная панель для управления товарами, импортом и справочниками.

## Стек

- **React 19** + **TypeScript** + **Vite 8**
- **React Router v6** — маршрутизация (публичные и защищённые админ-маршруты)
- **React Compiler** (через `babel-plugin-react-compiler`) — автооптимизация ре-рендеров
- **Vitest** + **Testing Library** + **jsdom** — модульные и интеграционные тесты
- **ESLint** + **typescript-eslint** — линтинг

## Скрипты

```bash
npm run dev          # dev-сервер Vite с HMR
npm run build        # тайпчек (tsc -b) + production-сборка
npm run preview      # предпросмотр production-сборки
npm run lint         # ESLint по всему проекту
npm test             # запуск тестов один раз
npm run test:watch   # тесты в watch-режиме
```

## Структура

```
src/
├── api/          # клиенты REST API (auth, products, orders, reviews, dictionaries) + тесты
├── components/   # переиспользуемые UI-компоненты (Button, Modal, Pagination, ProductCard, …)
├── hooks/        # глобальные хуки (useAuth, useCart)
├── layouts/      # PublicLayout, AdminLayout, MinimalLayout
├── pages/        # страницы маршрутов (HomePage, CatalogPage, ProductPage, Admin*, …)
├── mocks/        # моки для тестов и dev-окружения
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

## Тестирование

Тесты лежат рядом с исходниками (`*.test.ts` / `*.test.tsx`). Окружение — `jsdom`, утилиты — `@testing-library/react` и `@testing-library/user-event`. Запуск:

```bash
npm test
```
