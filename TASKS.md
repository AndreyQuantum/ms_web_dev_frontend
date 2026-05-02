# ЛампоМаркет Frontend — TDD Task Plan

## Project summary

Build the **ЛампоМаркет** React frontend (customer storefront + admin panel) on top of the existing Vite + React 19 + TypeScript boilerplate. The app is rendered fully client-side and works **without** a real backend: a `src/api/` layer returns Promises over mock data from `src/mocks/`, with function signatures that mirror the eventual REST contract (see `/docs/postman_collection.json`) so the mock layer can be swapped for a real HTTP client later by changing only the bodies of `src/api/*.ts`.

All UI copy is Russian (verbatim from `/docs/прототипы`). Cart state lives in `localStorage` under `lm_cart`; mock admin auth lives under `lm_admin_token`. Routing uses `react-router-dom` v6+. Styling is hand-rolled CSS modules / global tokens (no UI lib). Tests use **Vitest + @testing-library/react + jsdom**.

## Stack notes

- **Runtime**: React 19, React Compiler (already wired in `vite.config.ts`).
- **Language**: TypeScript ~6, strict mode (`noUnusedLocals`, `noUnusedParameters` already on).
- **Bundler**: Vite 8.
- **To be added in T1**: `react-router-dom`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`. Path alias `@/` → `src/` in `tsconfig.app.json` (`compilerOptions.paths`) and in `vite.config.ts` (`resolve.alias`). `vitest.config.ts` (or `test` block in vite config) wires `jsdom`, `globals: true`, and `setupFiles: ['./src/test/setup.ts']`. `package.json` scripts: `test`, `test:watch`.
- **Architecture (Clean)**:
  - `src/types/` — pure domain types (no framework imports).
  - `src/mocks/` — seed data typed against `src/types/`.
  - `src/api/` — Promise-returning functions over mocks; the only module that "knows" data is mocked.
  - `src/hooks/` — `useCart`, `useAuth` (state, no UI).
  - `src/components/` — reusable, unaware of routes/pages.
  - `src/layouts/` — `PublicLayout`, `AdminLayout`, `MinimalLayout`.
  - `src/pages/` — one folder per route; pages call `src/api` and use hooks/components.
  - `src/router.tsx` — route table.
  - `src/test/` — setup + test utilities.
- **TDD rule**: every `[CODE]` task’s acceptance criteria are written so a failing test can be authored from each bullet before implementation.

---

## Tasks

### T1 [CODE] Foundation: deps, path alias, test runner, router skeleton

**Description.** Install runtime + dev dependencies, configure path alias `@/` → `src/`, set up Vitest with jsdom and Testing Library, replace the Vite boilerplate `App.tsx` / `main.tsx` with a `react-router-dom` `<RouterProvider>` skeleton that mounts empty placeholder route stubs for every page listed in the spec. Wire `npm run test` and `npm run test:watch`. Update `index.html` `<title>` placeholder will happen later in T18; this task only needs the router shell to render.

**Files to create/modify.**
- Modify: `package.json` (add deps + scripts).
- Modify: `tsconfig.app.json` (`baseUrl: "."`, `paths: { "@/*": ["src/*"] }`).
- Modify: `vite.config.ts` (add `resolve.alias` for `@`, add `test` block or split into `vitest.config.ts`).
- Create: `src/test/setup.ts` (imports `@testing-library/jest-dom`, registers `afterEach(cleanup)`).
- Create: `src/router.tsx` (route table with empty stubs, lazy-loaded or eager).
- Replace: `src/App.tsx` (returns `<RouterProvider router={router} />`).
- Modify: `src/main.tsx` (drop boilerplate CSS import; keep `StrictMode` + `App`).
- Create: `src/App.test.tsx` (smoke test).
- Delete or empty: `src/App.css` (boilerplate styles).

**Acceptance criteria (test-first).**
- Given a fresh checkout, when `npm install && npm test` runs, then Vitest discovers tests and exits 0.
- Given `<App />` rendered with `MemoryRouter`-equivalent at `/`, when the test queries the document, then it renders without throwing.
- Given a navigation to `/catalog`, `/product/1`, `/about`, `/cart`, `/checkout`, `/order-success`, `/admin/login`, `/admin`, `/admin/products`, `/admin/import`, `/admin/dictionaries`, when the route resolves, then a stub element identifiable by `data-testid="route-stub-<name>"` (or page heading) is in the DOM for each.
- Given `import x from '@/types/whatever'` in any test, when Vitest resolves modules, then the alias resolves to `src/...`.
- Given `tsc -b`, when run, then it exits 0.

**deps.** —

---

### T2 [CODE] Domain types and mock seed data

**Description.** Define TypeScript interfaces in `src/types/` that match the backend schema in `/docs/postman_collection.json`. Author seed data in `src/mocks/` covering at least 30 products spanning multiple categories, bulb types, shapes, sockets, suppliers; plus dictionaries (categories, bulb types, shapes, sockets, suppliers, promos), 5+ orders with mixed statuses, and 10+ reviews tied to product ids.

**Files to create/modify.**
- Create: `src/types/product.ts` — `Product`, `ProductFilter`, `ProductListResponse`.
- Create: `src/types/dictionaries.ts` — `Category`, `BulbType`, `BulbShape`, `Socket`, `Supplier`, `Promo`.
- Create: `src/types/order.ts` — `Order`, `OrderItem`, `OrderStatus` (string-literal union: `'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled'`), `Customer`, `DeliveryMethod`.
- Create: `src/types/review.ts` — `Review`.
- Create: `src/types/auth.ts` — `AdminUser`, `LoginPayload`, `LoginResponse`.
- Create: `src/types/index.ts` — re-exports.
- Create: `src/mocks/products.ts` (≥30 entries, deterministic ids).
- Create: `src/mocks/categories.ts`, `src/mocks/bulbTypes.ts`, `src/mocks/bulbShapes.ts`, `src/mocks/sockets.ts`, `src/mocks/suppliers.ts`, `src/mocks/promos.ts`.
- Create: `src/mocks/orders.ts`, `src/mocks/reviews.ts`.
- Create: `src/mocks/index.ts`.
- Create: `src/mocks/mocks.test.ts`.

**Acceptance criteria (test-first).**
- Given the seed `products`, when its length is read, then it is `>= 30`.
- Given seed products, when their `id` values are collected into a Set, then the Set size equals the array length (unique ids).
- Given each product, when validated, then it has non-empty `name`, numeric `price > 0`, `categoryId` referencing a category in `src/mocks/categories.ts`, `bulbTypeId` referencing `bulbTypes`, `socketId` referencing `sockets`, `supplierId` referencing `suppliers`, and `inStock: boolean`.
- Given seed orders, when mapped to statuses, then at least 3 distinct `OrderStatus` values are present.
- Given seed reviews, when each `productId` is checked, then it exists in `products`.
- Given `tsc -b`, when run, then no type errors are reported.

**deps.** T1

---

### T3 [CODE] Mock API layer with simulated latency

**Description.** Implement `src/api/*.ts` modules that return Promises over the mock data. Each call awaits a tiny `setTimeout` (e.g. 10–50 ms; configurable via a `LATENCY` constant that tests can set to 0). Signatures mirror the future REST contract.

Modules:
- `src/api/products.ts` — `list(params: { search?; categoryId?; bulbTypeIds?; shapeIds?; socketIds?; minBrightness?; maxBrightness?; minPrice?; maxPrice?; inStockOnly?; supplierId?; sort?: 'priceAsc'|'priceDesc'|'popular'|'new'; page?; size? }) → Promise<ProductListResponse>`; `getById(id) → Promise<Product>`; `create`, `update`, `archive` (admin).
- `src/api/dictionaries.ts` — `listCategories`, `listBulbTypes`, `listShapes`, `listSockets`, `listSuppliers`, `listPromos`, plus CRUD per dictionary.
- `src/api/orders.ts` — `list`, `getById`, `create(payload)`.
- `src/api/reviews.ts` — `listByProduct(productId)`, `create({ productId, author, rating, text })`.
- `src/api/auth.ts` — `login({ login, password })` resolves with `{ token: 'mock-token', user: { role: 'admin' } }` only when credentials are `admin`/`admin`, otherwise rejects with a typed error.
- `src/api/_latency.ts` — exports `delay(ms?)` and a mutable `LATENCY` constant.

**Files to create/modify.**
- Create the modules listed above.
- Create: `src/api/products.test.ts`, `src/api/dictionaries.test.ts`, `src/api/orders.test.ts`, `src/api/reviews.test.ts`, `src/api/auth.test.ts`.

**Acceptance criteria (test-first).**
- Given `productsApi.list({ page: 1, size: 10 })`, when awaited, then the response contains `items.length <= 10`, `page === 1`, `size === 10`, and `total === <full mock count>`.
- Given `productsApi.list({ search: 'LED' })`, when awaited, then every returned item has `'led'` in `name.toLowerCase()` or `description.toLowerCase()`.
- Given `productsApi.list({ categoryId: <X> })`, when awaited, then all returned items have `categoryId === X`.
- Given `productsApi.list({ minPrice: 500, maxPrice: 1500 })`, when awaited, then every item satisfies `500 <= price <= 1500`.
- Given `productsApi.list({ inStockOnly: true })`, when awaited, then every item has `inStock === true`.
- Given `productsApi.list({ sort: 'priceAsc' })`, when awaited, then `items` is sorted non-decreasing by `price`; `priceDesc` is non-increasing.
- Given `productsApi.list({ bulbTypeIds: [a, b] })`, when awaited, then every item has `bulbTypeId` in `[a, b]`.
- Given `productsApi.getById(<existing id>)`, when awaited, then it resolves to the matching product; given a missing id, then it rejects.
- Given `ordersApi.create(payload)`, when awaited, then it resolves with an `Order` whose `id` is new and `status === 'new'`, and a subsequent `ordersApi.list()` includes it (in-memory store).
- Given `reviewsApi.create({ productId, … })`, when awaited, then `reviewsApi.listByProduct(productId)` includes it.
- Given `authApi.login({ login: 'admin', password: 'admin' })`, when awaited, then it resolves with a non-empty `token` and `user.role === 'admin'`. Wrong creds reject.
- Given `LATENCY = 0` in tests, when any api call is awaited, then it resolves on the next microtask (no flaky timeouts).

**deps.** T2

---

### T4 [CODE] Cart hook backed by localStorage

**Description.** Implement `useCart` in `src/hooks/useCart.ts` (with a small context provider `CartProvider` exported from the same file or `src/hooks/CartProvider.tsx`). Persist to `localStorage` key `lm_cart` as JSON `{ items: Array<{ productId: string; qty: number }> }`. Hook surface: `items`, `addItem(productId, qty=1)`, `removeItem(productId)`, `setQty(productId, qty)`, `clear()`, `itemCount`, `subtotal`, `discount`, `total`. Derived totals require resolving products (accept an injected `getProduct(id) => Product | undefined` or fetch from `productsApi`); for simplicity and testability, totals can be computed against an injected product lookup.

**Files to create/modify.**
- Create: `src/hooks/useCart.ts` (and `CartProvider`).
- Create: `src/hooks/useCart.test.tsx`.

**Acceptance criteria (test-first).**
- Given an empty `localStorage`, when `useCart` initializes, then `items` is `[]` and `itemCount === 0`.
- Given `addItem('p1', 2)` then `addItem('p1', 3)`, when `items` is read, then there is exactly one entry for `p1` with `qty === 5`.
- Given `addItem('p1')` (no qty), when read, then qty defaults to `1`.
- Given `setQty('p1', 0)`, when read, then `p1` is removed from `items`.
- Given `setQty('p1', -3)`, when read, then `p1` is removed (negatives normalized to removal).
- Given items in cart, when `clear()` is called, then `items === []` and `localStorage.getItem('lm_cart')` reflects empty state.
- Given mutations, when the test reloads `useCart` (re-renders fresh provider), then state is restored from `localStorage`.
- Given a product lookup mapping `p1 → { price: 100 }` and `qty=2`, when `subtotal` is computed, then it equals `200`.
- Given a corrupted `localStorage` value (`'not json'`), when `useCart` initializes, then it falls back to `[]` and does not throw.

**deps.** T2

---

### T5 [CODE] Auth hook + RequireAdmin guard

**Description.** Implement `useAuth` in `src/hooks/useAuth.ts` plus `<RequireAdmin>` guard component in `src/components/RequireAdmin.tsx`. Auth state is `{ token: string | null; role: 'admin' | null }`, persisted in `localStorage` under `lm_admin_token`. Methods: `login(login, password)` (delegates to `authApi.login`), `logout()`. `<RequireAdmin>` renders children when `role === 'admin'`, otherwise `<Navigate to="/admin/login" replace />`.

**Files to create/modify.**
- Create: `src/hooks/useAuth.ts` (+ `AuthProvider`).
- Create: `src/components/RequireAdmin.tsx`.
- Create: `src/hooks/useAuth.test.tsx`.
- Create: `src/components/RequireAdmin.test.tsx`.

**Acceptance criteria (test-first).**
- Given empty `localStorage`, when `useAuth` initializes, then `role === null` and `token === null`.
- Given `login('admin', 'admin')`, when awaited, then `role === 'admin'` and `localStorage.getItem('lm_admin_token')` is non-empty.
- Given `login('x', 'y')`, when awaited, then it rejects and `role` remains `null`.
- Given an authed state, when `logout()` is called, then `role === null` and `localStorage.getItem('lm_admin_token') === null`.
- Given `<RequireAdmin><div>SECRET</div></RequireAdmin>` and unauthed state, when rendered inside a memory router on `/admin`, then the document does not contain `'SECRET'` and the location is `/admin/login`.
- Given an authed state, when the same tree renders, then `'SECRET'` is in the document.

**deps.** T1

---

### T6 [CODE] Layouts and shared UI components

**Description.** Build the shared shell + atomic components used across pages.

Layouts:
- `<PublicLayout>` — header (logo "ЛампоМаркет", nav: Главная / Каталог / О компании, cart icon with badge from `useCart().itemCount`, search trigger), `<Outlet />`, footer.
- `<AdminLayout>` — fixed dark sidebar (`#1A252F`) with nav (Дашборд, Товары, Импорт, Справочники, Выход), top bar (admin email/avatar), content `<Outlet />`.
- `<MinimalLayout>` — centered content card for login.

Components:
- `<Button variant="primary|secondary|ghost|danger" size="sm|md|lg" disabled loading>` — green primary CTAs.
- `<Input>`, `<Textarea>`, `<Select>`, `<Checkbox>`, `<Chip selected onToggle>` (for sockets), `<RangeSlider min max value onChange>` for brightness/price.
- `<Modal open onClose title>` — focus-trapped, ESC closes.
- `<Pagination page totalPages onChange>`.
- `<Breadcrumbs items>`.
- `<Stars value max=5 onChange?>`.
- `<ProductCard product onAddToCart onWishlist>` — image, name, price, rating, in-stock badge, CTA.
- `<EmptyState icon title hint>`.

**Files to create/modify.**
- Create per component under `src/components/<Name>/<Name>.tsx` + `<Name>.test.tsx` (+ optional `<Name>.module.css`).
- Create: `src/layouts/PublicLayout.tsx` + `.test.tsx`, `src/layouts/AdminLayout.tsx` + `.test.tsx`, `src/layouts/MinimalLayout.tsx`.
- Create: `src/components/index.ts` barrel.

**Acceptance criteria (test-first).**
- Given `<PublicLayout>` rendered, when the document is queried, then it contains links to `/`, `/catalog`, `/about`, and a cart link to `/cart` with a badge whose textContent equals `useCart().itemCount` (when 0 the badge is hidden).
- Given `<AdminLayout>` rendered with auth role admin, when querying nav, then it contains links to `/admin`, `/admin/products`, `/admin/import`, `/admin/dictionaries` and a logout button.
- Given `<Button onClick={fn}>X</Button>`, when clicked, then `fn` is called once.
- Given `<Button loading>X</Button>`, when rendered, then the button is `disabled` and shows a spinner element.
- Given `<Modal open onClose>` rendered, when ESC is pressed, then `onClose` is called.
- Given `<Modal open={false}>`, when rendered, then no dialog is in the document.
- Given `<Pagination page={2} totalPages={5} onChange={fn} />`, when "next" is clicked, then `fn(3)` is called; when on page 5 the next button is disabled.
- Given `<Stars value={3} />`, when querying `[data-filled]` items, then exactly 3 are filled.
- Given `<Stars value={3} onChange={fn} />`, when the 5th star is clicked, then `fn(5)` is called.
- Given `<ProductCard product={p} onAddToCart={fn} />`, when the CTA is clicked, then `fn(p)` (or `fn(p.id)`) is called.
- Given a `<ProductCard>` for an out-of-stock product, when rendered, then the CTA is disabled and the card shows "Нет в наличии".
- Given `<Chip selected onToggle={fn} />`, when clicked, then `fn()` is called and `aria-pressed` reflects `selected`.

**deps.** T1, T4, T5

---

### T7 [CODE] HomePage `/`

**Description.** Implement `src/pages/HomePage/HomePage.tsx`. Sections (in order, copy verbatim from prototype): hero banner with CTA "Перейти в каталог" linking to `/catalog`; promo cards row (data from `dictionaries.listPromos()`); "Популярные товары" grid (8 items from `productsApi.list({ sort: 'popular', size: 8 })`); benefits row (4 tiles); footer is provided by `<PublicLayout>`.

**Files to create/modify.**
- Create: `src/pages/HomePage/HomePage.tsx`, `HomePage.module.css`, `HomePage.test.tsx`.
- Wire route in `src/router.tsx`.

**Acceptance criteria (test-first).**
- Given the page mounts, when `productsApi.list` is mocked to return 8 items, then exactly 8 `<ProductCard>`s render in the "Популярные товары" section.
- Given the page is rendered, when querying by role, then a heading containing "Популярные товары" exists.
- Given the hero CTA is clicked, when navigation resolves, then the URL is `/catalog`.
- Given `productsApi.list` rejects, when the page mounts, then an error/empty state is shown and no crash occurs.
- Given promos are fetched, when mocked to return 3 promos, then 3 promo card elements are rendered.

**deps.** T3, T6

---

### T8 [CODE] CatalogPage `/catalog`

**Description.** Implement `src/pages/CatalogPage/CatalogPage.tsx` with sidebar filters (category select, bulb-type checkboxes, shape checkboxes, socket chips, brightness range, price range, in-stock toggle, supplier select), top bar (search input, sort buttons "По популярности | Цена ↑ | Цена ↓ | Новинки", grid/list toggle), product grid, `<Pagination>`. Filters and pagination state live in URL query params (`?search=…&categoryId=…&page=…`) and are read on mount.

**Files to create/modify.**
- Create: `src/pages/CatalogPage/CatalogPage.tsx` + `.module.css` + `.test.tsx`.
- Create: `src/pages/CatalogPage/FiltersSidebar.tsx` + `.test.tsx`.
- Create: `src/pages/CatalogPage/SortBar.tsx` + `.test.tsx`.

**Acceptance criteria (test-first).**
- Given the page mounts at `/catalog`, when `productsApi.list` is mocked, then it is called once with `page: 1` and the default `size`.
- Given the user types "LED" in the search input and submits, when `productsApi.list` is observed, then it is called with `search: 'LED'` and the URL contains `?search=LED`.
- Given the user clicks "Цена ↑", when the api is observed, then it is called with `sort: 'priceAsc'`.
- Given the user toggles a bulb-type checkbox `id=2`, when api is observed, then `bulbTypeIds` includes `2`; toggling again removes it.
- Given the user toggles in-stock, when api is observed, then `inStockOnly: true` is passed.
- Given the user clicks page 2 in `<Pagination>`, when api is observed, then `page: 2` is passed and the URL contains `page=2`.
- Given `productsApi.list` resolves with 0 items, when rendered, then an empty state "Ничего не найдено" appears.
- Given the grid/list toggle is clicked, when re-rendered, then the container element’s class or `data-view` flips between `grid` and `list`.
- Given a direct mount at `/catalog?categoryId=3&page=2`, when api is observed, then `categoryId: '3'` (or numeric) and `page: 2` are passed on initial fetch.

**deps.** T3, T6

---

### T9 [CODE] ProductPage `/product/:id`

**Description.** Implement `src/pages/ProductPage/ProductPage.tsx`: breadcrumbs, gallery (main image + thumbnails), info block (name, sku, rating, price, in-stock, short description, qty selector, "В корзину", wishlist button), tabs ("Характеристики" / "Описание" / "Отзывы"), reviews list and review form (name, rating stars, text, submit calls `reviewsApi.create`).

**Files to create/modify.**
- Create: `src/pages/ProductPage/ProductPage.tsx` + `.module.css` + `.test.tsx`.
- Create: `src/pages/ProductPage/Gallery.tsx`, `Tabs.tsx`, `ReviewForm.tsx` (each with `.test.tsx`).

**Acceptance criteria (test-first).**
- Given the URL `/product/1` and `productsApi.getById('1')` mocked to return product `P`, when mounted, then the document contains `P.name` and the formatted `P.price`.
- Given an unknown id resolves to a rejection, when mounted, then an error state "Товар не найден" is shown and no crash occurs.
- Given qty starts at `1`, when "+" is clicked twice, then qty is `3`; "−" cannot go below `1`.
- Given the user clicks "В корзину", when observed, then `useCart().addItem` is called with the product id and current qty.
- Given the user clicks the "Характеристики" tab, when observed, then the spec list is visible and other tab panels are hidden (`hidden`/aria).
- Given `reviewsApi.listByProduct('1')` returns 2 reviews, when the Reviews tab is opened, then 2 review elements are rendered.
- Given the review form is filled (name, 5 stars, text) and submitted, when `reviewsApi.create` is mocked, then it is called once with `{ productId: '1', author, rating: 5, text }` and the new review appears in the list.
- Given the review form is submitted with empty fields, when observed, then `reviewsApi.create` is NOT called and validation errors render.
- Given the product is `inStock: false`, when rendered, then "В корзину" is disabled.

**deps.** T3, T4, T6

---

### T10 [CODE] AboutPage `/about`

**Description.** Implement `src/pages/AboutPage/AboutPage.tsx` with hero, "О производстве" block, three delivery cards ("Самовывоз", "Курьер", "Транспортная компания"), contacts block (address, phones, email, hours) and a map placeholder (static `<div>` with `data-testid="map-placeholder"`). Copy verbatim from prototype.

**Files to create/modify.**
- Create: `src/pages/AboutPage/AboutPage.tsx` + `.module.css` + `.test.tsx`.

**Acceptance criteria (test-first).**
- Given the page is rendered, when querying by role, then headings include "О компании" and "Доставка".
- Given the page is rendered, when querying for delivery cards, then exactly 3 cards are rendered with titles "Самовывоз", "Курьер", "Транспортная компания".
- Given the page is rendered, when querying contacts, then a `tel:` link and a `mailto:` link are present.
- Given the page is rendered, when querying by `data-testid="map-placeholder"`, then exactly one element is found.

**deps.** T6

---

### T11 [CODE] CartPage `/cart`

**Description.** Implement `src/pages/CartPage/CartPage.tsx`. Two-column layout: left = items table (image, name, unit price, qty controls, line total, remove); right = summary card (subtotal, discount, total, "Оформить заказ" CTA → `/checkout`). Empty state with CTA to `/catalog`.

**Files to create/modify.**
- Create: `src/pages/CartPage/CartPage.tsx` + `.module.css` + `.test.tsx`.
- Create: `src/pages/CartPage/CartItemRow.tsx` + `.test.tsx`.

**Acceptance criteria (test-first).**
- Given an empty cart, when the page is rendered, then "Корзина пуста" is in the document and the "Оформить заказ" CTA is not visible.
- Given the cart has 2 items resolved against the products mock (`p1: 100×2`, `p2: 50×1`), when rendered, then the subtotal text equals `250 ₽` (formatted) and the total reflects subtotal − discount.
- Given a "+" click on an item row, when observed, then `useCart().setQty(productId, qty+1)` is called and the rendered line total updates.
- Given the remove button is clicked, when observed, then `useCart().removeItem(productId)` is called and the row disappears.
- Given the user clicks "Оформить заказ", when navigation resolves, then the URL is `/checkout`.

**deps.** T4, T6

---

### T12 [CODE] CheckoutPage `/checkout` and OrderSuccessPage `/order-success`

**Description.** Implement `src/pages/CheckoutPage/CheckoutPage.tsx` with a 3-step indicator ("Контакты" → "Доставка" → "Подтверждение"), contact form (email, phone, comment), delivery method radio (pickup/courier/transport), order summary aside, "Оформить заказ" button that calls `ordersApi.create(...)` then navigates to `/order-success` with the new order id in router state. Implement `src/pages/OrderSuccessPage/OrderSuccessPage.tsx` showing order number, "Спасибо за заказ" message, and a CTA back to `/`. On mount of success page if there is no order in state, redirect to `/`.

**Files to create/modify.**
- Create: `src/pages/CheckoutPage/CheckoutPage.tsx` + `.test.tsx` + `.module.css`.
- Create: `src/pages/OrderSuccessPage/OrderSuccessPage.tsx` + `.test.tsx`.

**Acceptance criteria (test-first).**
- Given an empty cart, when `/checkout` mounts, then the user is redirected to `/cart` (or an empty-cart message renders and submit is disabled).
- Given the cart has items, when the page renders, then the order summary lists each cart item with line totals matching `useCart().subtotal`.
- Given the user submits with empty email, when observed, then validation error "Введите email" appears and `ordersApi.create` is NOT called.
- Given a malformed email "abc", when submitted, then an email-format error is shown.
- Given a malformed phone (less than 10 digits), when submitted, then a phone error is shown.
- Given valid contact data, valid delivery method, and a non-empty cart, when "Оформить заказ" is clicked, then `ordersApi.create` is called once with `{ customer, deliveryMethod, items, total }` matching the cart, the cart is cleared (`useCart().items === []`), and the URL becomes `/order-success`.
- Given `/order-success` is reached with `orderId` in router state, when rendered, then the document contains the order number.
- Given `/order-success` is reached without state, when rendered, then a redirect to `/` occurs.

**deps.** T3, T4, T6

---

### T13 [CODE] AdminLoginPage `/admin/login`

**Description.** Implement `src/pages/AdminLoginPage/AdminLoginPage.tsx` inside `<MinimalLayout>`. Form: login, password, submit "Войти". On success calls `useAuth().login`, redirects to `/admin`. On failure shows "Неверный логин или пароль".

**Files to create/modify.**
- Create: `src/pages/AdminLoginPage/AdminLoginPage.tsx` + `.test.tsx` + `.module.css`.

**Acceptance criteria (test-first).**
- Given the page is rendered, when querying for inputs, then both login and password inputs and a submit button labelled "Войти" are present.
- Given the user submits "admin"/"admin", when `authApi.login` is mocked to resolve, then the URL becomes `/admin` and `localStorage.getItem('lm_admin_token')` is non-empty.
- Given the user submits "x"/"y", when `authApi.login` rejects, then "Неверный логин или пароль" appears and the URL stays at `/admin/login`.
- Given empty fields, when submit is clicked, then `authApi.login` is NOT called and field errors render.
- Given an already-authed user, when the page mounts, then a redirect to `/admin` occurs.

**deps.** T5, T6

---

### T14 [CODE] AdminDashboardPage `/admin`

**Description.** Implement `src/pages/AdminDashboardPage/AdminDashboardPage.tsx` (protected by `<RequireAdmin>` in router). Four KPI cards (Заказы за месяц, Выручка, Новые клиенты, Конверсия) computed from mocks; a 7-day sales bar chart rendered with plain SVG (no chart lib); a top-5 products list with horizontal bars (popularity = sum of qty in mock orders); a recent orders table (last 10 orders).

**Files to create/modify.**
- Create: `src/pages/AdminDashboardPage/AdminDashboardPage.tsx` + `.test.tsx` + `.module.css`.
- Create: `src/pages/AdminDashboardPage/SalesBarChart.tsx` + `.test.tsx`.
- Create: `src/pages/AdminDashboardPage/TopProducts.tsx` + `.test.tsx`.

**Acceptance criteria (test-first).**
- Given an unauthed visit to `/admin`, when the route resolves, then the URL becomes `/admin/login`.
- Given an authed visit and `ordersApi.list` mocked, when rendered, then 4 KPI card elements (`role="group"` or `data-testid="kpi-card"`) are present.
- Given a fixed mock orders set, when KPIs are computed, then revenue card displays the sum of all `order.total` formatted as RUB; "Заказы за месяц" displays the count of orders in the last 30 days from a fixed `now`.
- Given the SalesBarChart, when rendered with 7 day buckets, then exactly 7 `<rect>` elements are present and each has a non-negative height proportional to its value.
- Given a TopProducts list, when rendered with mock data, then exactly 5 items are present and they are sorted by qty desc.
- Given the recent orders table, when rendered, then it shows at most 10 rows with columns "№", "Клиент", "Сумма", "Статус", "Дата".

**deps.** T3, T5, T6

---

### T15 [CODE] AdminProductsPage `/admin/products`

**Description.** Implement `src/pages/AdminProductsPage/AdminProductsPage.tsx` (protected). Toolbar (search, category filter, "Создать товар" CTA), products table with columns (image, name, sku, category, price, stock, статус, actions: Edit / Preview / Archive). Edit form opens in a modal or side-panel containing all product fields incl. dictionary selects for category/bulb type/shape/socket/supplier and image URL. Submitting calls `productsApi.create` or `productsApi.update`. Archive calls `productsApi.archive` after confirm.

**Files to create/modify.**
- Create: `src/pages/AdminProductsPage/AdminProductsPage.tsx` + `.test.tsx` + `.module.css`.
- Create: `src/pages/AdminProductsPage/ProductFormModal.tsx` + `.test.tsx`.

**Acceptance criteria (test-first).**
- Given an authed visit, when mounted, then `productsApi.list` is called and rows are rendered for the returned items.
- Given a search input change, when debounced/submitted, then `productsApi.list` is re-called with the `search` param.
- Given the "Создать товар" button is clicked, when observed, then the form modal opens with empty fields.
- Given the form is submitted with valid data, when `productsApi.create` is mocked, then it is called once with the form payload, the modal closes, and the new row appears in the list.
- Given the form is submitted with empty `name`, when observed, then `productsApi.create` is NOT called and a validation error is rendered.
- Given the user clicks "Edit" on a row, when observed, then the modal opens prefilled with that product’s data; submitting calls `productsApi.update(id, payload)`.
- Given the user clicks "Archive" and confirms, when observed, then `productsApi.archive(id)` is called and the row disappears (or its status flips to "Архив").
- Given the user clicks "Archive" and cancels, when observed, then `productsApi.archive` is NOT called.

**deps.** T3, T5, T6

---

### T16 [CODE] AdminImportPage `/admin/import`

**Description.** Implement `src/pages/AdminImportPage/AdminImportPage.tsx` (protected). Drag-drop file upload (CSV/XLSX accepted by extension only — parsing is simulated; if a CSV is provided, parse with a lightweight in-repo parser to populate preview), column mapping table (left: detected columns; right: select bound to product fields), preview table (first 10 rows post-mapping), "Импортировать" button that simulates server-side import by calling `productsApi.create` for each row sequentially and shows progress + final summary "Импортировано N товаров". All client-side, no real upload.

**Files to create/modify.**
- Create: `src/pages/AdminImportPage/AdminImportPage.tsx` + `.test.tsx` + `.module.css`.
- Create: `src/pages/AdminImportPage/parseCsv.ts` + `.test.ts`.

**Acceptance criteria (test-first).**
- Given a CSV string `"name,price\nLED A60,300\nLED G45,250"`, when `parseCsv` is called, then it returns `[{ name: 'LED A60', price: '300' }, { name: 'LED G45', price: '250' }]`.
- Given a malformed CSV (missing header row), when `parseCsv` is called, then it returns `[]` (or a typed error result).
- Given a `File` is dropped on the dropzone, when observed, then the dropzone enters an "uploaded" state and the column mapping table appears.
- Given the user maps column "name" → product.name and "price" → product.price, when "Импортировать" is clicked, then `productsApi.create` is called once per parsed row with the mapped payload.
- Given import completes for 2 rows, when observed, then the summary text contains "Импортировано 2".
- Given a row contains an empty `name`, when imported, then that row is skipped and the summary indicates the skip count.

**deps.** T3, T5, T6

---

### T17 [CODE] AdminDictionariesPage `/admin/dictionaries`

**Description.** Implement `src/pages/AdminDictionariesPage/AdminDictionariesPage.tsx` (protected). Tabs: "Типы ламп", "Формы", "Цоколи", "Категории", "Поставщики", "Промо". Each tab is a 2-column layout: left = add/edit form (name, optional fields per dictionary), right = list with edit/delete buttons. Delete shows a confirm modal. CRUD calls go through `src/api/dictionaries.ts`.

**Files to create/modify.**
- Create: `src/pages/AdminDictionariesPage/AdminDictionariesPage.tsx` + `.test.tsx` + `.module.css`.
- Create: `src/pages/AdminDictionariesPage/DictionaryTab.tsx` (generic, parameterised on api + fields) + `.test.tsx`.

**Acceptance criteria (test-first).**
- Given an authed visit, when mounted, then 6 tab triggers are present with the labels above and the first tab is active.
- Given a tab click, when observed, then only that tab's panel is visible.
- Given the active tab is "Цоколи" and the user submits "E40", when `dictionariesApi.createSocket` is mocked, then it is called once with `{ name: 'E40' }` and the new item appears in the right-hand list.
- Given the user clicks "Удалить" on an item and confirms, when observed, then the corresponding `delete*` api is called and the item disappears.
- Given the user clicks "Удалить" and cancels, when observed, then no delete call is made.
- Given the user clicks edit on an item, when observed, then the form prefills with the item; submitting calls the matching `update*` api.
- Given empty form submission, when observed, then no api call is made and a validation error is rendered.

**deps.** T3, T5, T6

---

### T18 [CODE] Global styles, theme tokens, document title

**Description.** Replace boilerplate `index.css` with a small design system: CSS custom properties for the prototype palette (primary green CTAs, dark sidebar `#1A252F`, surface, text, muted, danger, success, border, shadow), typography scale, spacing scale, container widths, focus ring. Update `index.html` `<title>` to "ЛампоМаркет" and add `<html lang="ru">`. Apply tokens across layouts/components by referencing the variables. Verify mobile breakpoints (≥1280, ≥1024, ≥768, <768) so catalog, cart, and admin layouts remain usable.

**Files to create/modify.**
- Modify: `index.html` (title + `lang`).
- Replace: `src/index.css` (tokens, base resets).
- Create: `src/styles/tokens.css` (imported by `index.css`).
- Create: `src/styles/tokens.test.ts` — sanity check (a tiny unit test importing tokens via a JS shim or a snapshot of a getComputedStyle on `document.documentElement` after appending the stylesheet in jsdom; if jsdom limitations apply, the test asserts that `tokens.css` defines a list of expected `--lm-*` properties via regex over the file source).
- Modify: `src/layouts/AdminLayout.tsx` — sidebar uses `var(--lm-color-sidebar)` equal to `#1A252F`.

**Acceptance criteria (test-first).**
- Given the `tokens.css` file content is read, when scanned, then it defines at least: `--lm-color-primary`, `--lm-color-primary-hover`, `--lm-color-sidebar`, `--lm-color-bg`, `--lm-color-surface`, `--lm-color-text`, `--lm-color-muted`, `--lm-color-border`, `--lm-color-danger`, `--lm-color-success`, `--lm-radius-sm`, `--lm-radius-md`, `--lm-space-1`..`--lm-space-6`, `--lm-font-base`.
- Given `tokens.css`, when read, then `--lm-color-sidebar` equals `#1A252F` and `--lm-color-primary` is a green-ish hex (regex `^#([0-9a-fA-F]{6})$` and matches the prototype palette).
- Given `index.html` is read, when scanned, then the `<title>` is `ЛампоМаркет` and the `<html>` tag has `lang="ru"`.
- Given `<AdminLayout>` is rendered, when the sidebar element is queried, then its `style` (or computed background) references `var(--lm-color-sidebar)`.

**deps.** T6

---

## Execution notes for the orchestrator

- **DAG roots that can run early in parallel after T1**: T2, T5.
- **Wave 2 after T2**: T3, T4.
- **Wave 3 after T3, T4, T5**: T6.
- **Wave 4 (mostly parallel) after T6**: T7, T8, T9, T10, T11, T12, T13, T14, T15, T16, T17, T18 — only their shared file is `src/router.tsx`, which each page task should patch additively (route entry only). Treat `src/router.tsx` as append-only across these tasks to minimise merge conflicts.
- **All tasks are `[CODE]`** — no `[INFRA]` work was scoped.
- **Test mocking convention**: pages mock `@/api/*` modules via `vi.mock(...)`; hooks tests use `localStorage` resets in `beforeEach` (already wired in `src/test/setup.ts`).
