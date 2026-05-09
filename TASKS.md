# TASKS — Frontend: Real Backend + Redux + CI/CD/Docker

> **Workflow constraints (per user):**
> - Do **NOT** commit anything. The user will commit manually.
> - Do **NOT** use git worktree isolation.
> - All work goes directly into `/home/andrey/repos/ms_web_dev_frontend/` (current working directory).

Format: `- [ ] T<N> [CODE|INFRA] <description> (deps: T<M>, T<K>)`
Tags: `[CODE]` = behavioral / testable code; `[INFRA]` = build/deploy/scaffold/docs.
Tasks without `(deps: …)` are independent and may run in parallel.

---

## Wave 1 — Independent scaffolding (all parallel)

### Test plumbing

- [ ] T1 [CODE] Add `src/test/fetchMock.ts` helpers and update `src/test/setup.ts` to reset `fetch` between tests
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/test/fetchMock.ts`, `/home/andrey/repos/ms_web_dev_frontend/src/test/setup.ts`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/test/fetchMock.test.ts`
    - Cases: (a) `mockFetchOnce({foo:1})` makes one `fetch(url)` resolve with `{foo:1}` and 200; subsequent call falls through. (b) `mockFetchOnce({err:true}, 500)` returns res.ok=false. (c) `mockFetchSequence([…])` returns each entry in order then throws on overflow. (d) `setup.ts` resets the spy between tests so a mock from test A does not leak into test B.
  - **AC**:
    - **Given** a test calls `mockFetchOnce({x:1})`, **when** code under test calls `fetch('/api/x')`, **then** it resolves with a `Response` whose `.json()` is `{x:1}` and `.ok` is `true`.
    - **Given** `mockFetchOnce(body, 404)`, **when** consumer calls `fetch`, **then** `res.ok` is `false` and `res.status` is `404`.
    - **Given** `mockFetchSequence([a,b])`, **when** `fetch` is invoked thrice, **then** the third call rejects/throws an explicit "no more mocked responses" error.

- [ ] T2 [CODE] Add `src/test/renderWithStore.tsx` provider-wrapping render helper
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/test/renderWithStore.tsx`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/test/renderWithStore.test.tsx`
    - Cases: (a) renders children inside `<Provider>` so `useAppSelector` works. (b) accepts `preloadedState` and exposes the resulting store on the return value. (c) accepts `route` and mounts inside `<MemoryRouter initialEntries={[route]}>`.
  - **AC**:
    - **Given** `renderWithProviders(<Probe/>, {preloadedState:{cart:{items:[{id:'a',qty:2,snapshot:{name:'X',price:10}}]}}})`, **when** Probe selects `state.cart.items.length`, **then** it renders `1`.
    - **Given** `renderWithProviders(<UseLocationProbe/>, {route:'/cart'})`, **then** `location.pathname` is `/cart`.

### Redux store + slices

- [ ] T3 [CODE] Add Redux store factory and typed hooks (`src/store/index.ts`, `src/store/hooks.ts`)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/store/index.ts`, `/home/andrey/repos/ms_web_dev_frontend/src/store/hooks.ts`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/store/index.test.ts`
    - Cases: (a) `makeStore()` returns a configured store with `products`, `cart`, `orders`, `reviews` keys. (b) When `localStorage['lm_cart']` contains valid JSON, the cart slice is preloaded from it. (c) When localStorage is corrupt, store still constructs (cart starts empty). (d) After dispatching a cart action, `localStorage['lm_cart']` reflects the new cart state.
  - **AC**:
    - **Given** `localStorage.setItem('lm_cart', '{"items":[{"id":"p1","qty":3,"snapshot":{"name":"X","price":5}}]}')`, **when** `makeStore()`, **then** `store.getState().cart.items[0].qty === 3`.
    - **Given** an invalid JSON string in `lm_cart`, **when** `makeStore()`, **then** it does not throw and `store.getState().cart.items` is `[]`.
    - **Given** any cart dispatch, **when** state updates, **then** `localStorage.getItem('lm_cart')` equals `JSON.stringify(state.cart)`.

- [ ] T4 [CODE] Implement `cartSlice` reducers + selectors (deps: T3)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/store/slices/cartSlice.ts`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/store/slices/cartSlice.test.ts`
    - Cases: addItem (new id appends; existing id increments qty); setQty (qty<=0 removes line); removeItem; clear; selectors: itemCount, subtotal, discount (sum over `(oldPrice-price)*qty` when `oldPrice>price`), total (subtotal positive only).
  - **AC**:
    - **Given** empty cart, **when** `addItem({id:'a', qty:2, snapshot:{name:'A',price:10}})`, **then** items length is 1, qty is 2.
    - **Given** existing line `{id:'a', qty:2}`, **when** `addItem({id:'a', qty:3, snapshot:…})`, **then** qty is 5 and the snapshot is updated to the latest one.
    - **Given** line qty 5, **when** `setQty({id:'a', qty:0})`, **then** the line is removed.
    - **Given** items `[{price:10, oldPrice:15, qty:2},{price:5, qty:3}]`, **then** `selectSubtotal` is 35, `selectDiscount` is 10, `selectTotal` is 35.

- [ ] T5 [CODE] Implement `productsSlice` (thunks: `fetchProducts`, `fetchProductById`, `fetchDictionaries`) (deps: T3)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/store/slices/productsSlice.ts`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/store/slices/productsSlice.test.ts`
    - Cases: pending sets `listStatus='loading'` & clears error; fulfilled stores items/total/page/size & sets status `ok`; rejected sets status `error` and stores message; `fetchProductById.fulfilled` writes to `currentById[id]`; `fetchDictionaries.fulfilled` populates all 6 collections.
  - **AC**:
    - **Given** initial state, **when** `fetchProducts.pending` is dispatched, **then** `listStatus==='loading'` and `listError===null`.
    - **Given** fulfilled payload `{items:[…], total:7, page:2, size:12}`, **then** state mirrors all four fields and `listStatus==='ok'`.
    - **Given** `fetchProducts.rejected` with `error.message='boom'`, **then** `listStatus==='error'` and `listError==='boom'`.

- [ ] T6 [CODE] Implement `ordersSlice` (thunk: `createOrder`; state: `lastOrder`/`status`/`error`) (deps: T3)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/store/slices/ordersSlice.ts`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/store/slices/ordersSlice.test.ts`
    - Cases: pending → status `creating`; fulfilled → status `ok`, lastOrder set; rejected → status `error`, error message stored.
  - **AC**:
    - **Given** `createOrder.fulfilled` with order payload, **then** `state.lastOrder` equals payload and `state.status==='ok'`.
    - **Given** `createOrder.rejected`, **then** `state.status==='error'` and `state.error` is non-empty.

- [ ] T7 [CODE] Implement `reviewsSlice` (thunks: `fetchReviews`, `createReview`; state: `byProductId` map) (deps: T3)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/store/slices/reviewsSlice.ts`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/store/slices/reviewsSlice.test.ts`
    - Cases: fetch fulfilled writes list to `byProductId[productId]`; `createReview` fulfilled appends to its product bucket; status transitions per-product.
  - **AC**:
    - **Given** `fetchReviews.fulfilled` for product `p1` with 3 reviews, **then** `state.byProductId['p1'].length===3`.
    - **Given** existing 3 reviews for `p1`, **when** `createReview.fulfilled` for `p1`, **then** length is 4 and the new one is last.

### HTTP + mappers

- [ ] T8 [CODE] Implement `src/api/http.ts` (fetch wrapper + `ApiError` + `productsHttp` / `ordersHttp`)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/api/http.ts`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/api/http.test.ts`
    - Cases: builds URL by concatenating base + path; sets `Content-Type: application/json` by default; merges custom headers; returns parsed JSON; throws `ApiError` with status+body on non-2xx; handles empty response body without throwing.
  - **AC**:
    - **Given** mocked `fetch` returning a 200 response with body `{"a":1}`, **when** `productsHttp('/x')`, **then** result is `{a:1}` and the URL passed to fetch ends with `/x`.
    - **Given** mocked 404 response with body `{detail:'nope'}`, **when** `ordersHttp('/y')`, **then** it throws `ApiError` with `status===404` and `body.detail==='nope'`.
    - **Given** caller passes `headers:{X-Trace:'t'}`, **then** the actual fetch init has both `Content-Type` and `X-Trace`.

- [ ] T9 [CODE] Implement `src/api/mappers/product.ts` (`fromApiProduct` / `toApiProduct`)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/api/mappers/product.ts`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/api/mappers/product.test.ts`
    - Cases: snake_case→camelCase; `price` string→number; `quantity>0` → `inStock=true`; missing optional fields default (`imageUrl='/placeholder.png'`, `rating=0`, `reviewsCount=0`, `popularity=0`); `availableFrom` null→undefined; `promo_id` null→undefined; `toApiProduct` produces snake_case body and `price` as string.
  - **AC**:
    - **Given** `{id:'u', title:'T', price:'12.50', quantity:3, brightness_lm:800, is_archived:false, available_from:null, category_id:1, bulb_type_id:1, bulb_shape_id:1, socket_id:1, supplier_id:1, promo_id:null}`, **then** mapped product has `name:'T'`, `price:12.5`, `inStock:true`, `imageUrl:'/placeholder.png'`, `availableFrom===undefined`, `promoId===undefined`.
    - **Given** `quantity:0`, **then** `inStock===false`, `stockQty===0`.
    - **Given** partial frontend product `{name:'X', price:9.99, stockQty:2}`, **then** `toApiProduct` returns `{title:'X', price:'9.99', quantity:2}` (other keys absent or `undefined`).

- [ ] T10 [CODE] Implement `src/api/mappers/order.ts` (`toApiOrder` + `fromApiOrder`, status mapping, comment folding, totals)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/api/mappers/order.ts`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/api/mappers/order.test.ts`
    - Cases: outbound folds `deliveryMethod` into `comment` ("Доставка: курьер\n\n<user>"); maps email/phone to snake_case; status outbound `new→NEW`, `processing→IN_PROGRESS`, `shipped→IN_PROGRESS`, `delivered→DELIVERED`, `cancelled→CANCELLED`; inbound inverse with `IN_PROGRESS→processing`; `fromApiOrder` computes total from items (`Σ price*qty`).
  - **AC**:
    - **Given** input `{deliveryMethod:'курьер', comment:'позвонить'}`, **when** `toApiOrder`, **then** `body.comment === 'Доставка: курьер\n\nпозвонить'`.
    - **Given** input `{deliveryMethod:'самовывоз', comment:''}`, **then** `body.comment` is `'Доставка: самовывоз'` (no trailing whitespace problems).
    - **Given** outbound status `'shipped'`, **then** `body.status==='IN_PROGRESS'`.
    - **Given** inbound order `{status:'IN_PROGRESS', items:[{price:'10', quantity:2},{price:'5', quantity:1}]}`, **then** `fromApiOrder` returns `status:'processing'` and `total:25`.

- [ ] T11 [CODE] Implement `src/api/mappers/review.ts` (drop `author`; default to "Аноним" on read)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/api/mappers/review.ts`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/api/mappers/review.test.ts`
    - Cases: `toApiReview` does not include `author`; `fromApiReview` returns `author:'Аноним'`; `rating`/`text`/`productId` round-trip.
  - **AC**:
    - **Given** input `{productId:'p', rating:5, text:'good', author:'Bob'}`, **when** `toApiReview`, **then** the resulting body has no `author` key (and no `author_name`).
    - **Given** API review `{id:'r1', product_id:'p1', rating:4, text:'ok', created_at:'2026-01-01T00:00:00Z'}`, **then** mapped review has `author:'Аноним'`.

- [ ] T12 [CODE] Implement `src/api/mappers/dictionaries.ts` (snake_case → camelCase pass-through)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/api/mappers/dictionaries.ts`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/api/mappers/dictionaries.test.ts`
    - Cases: `fromApi*` retains numeric `id` and renames `created_at→createdAt`; `toApi*` send snake_case bodies; covers categories, bulbTypes, shapes, sockets, suppliers, promos.
  - **AC**:
    - **Given** API category `{id:1, name:'Лампы', created_at:'…'}`, **then** mapped is `{id:1, name:'Лампы', createdAt:'…'}`.
    - **Given** new promo `{name:'X', discountPercent:10}`, **then** `toApiPromo` body is `{name:'X', discount_percent:10}`.

### Infra: Docker + nginx + compose + DB init

- [ ] T13 [INFRA] Create multi-stage `Dockerfile` (`node:20-alpine` build → `nginx:alpine` runtime) with `VITE_PRODUCTS_API_URL` / `VITE_ORDERS_API_URL` build args, plus `.dockerignore`
  - **files_to_produce**: `/home/andrey/repos/ms_web_dev_frontend/Dockerfile`, `/home/andrey/repos/ms_web_dev_frontend/.dockerignore`
  - **smoke verification**:
    - `hadolint Dockerfile` reports no `error`-severity findings.
    - `docker buildx build --check .` reports no failures.
    - `.dockerignore` excludes `node_modules`, `dist`, `.git`, `.github`, `coverage`, `*.md`, `.env*`.

- [ ] T14 [INFRA] Create `nginx.conf` with SPA fallback + reverse-proxy `/api/products/`→`products_service:8002/api/v1/` and `/api/orders/`→`orders_service:8003/api/v1/`
  - **files_to_produce**: `/home/andrey/repos/ms_web_dev_frontend/nginx.conf`
  - **smoke verification**:
    - `docker run --rm -v "$PWD/nginx.conf:/etc/nginx/conf.d/default.conf:ro" nginx:alpine nginx -t` exits 0.
    - File contains `try_files $uri $uri/ /index.html`, `proxy_pass http://products_service:8002/api/v1/;`, and `proxy_pass http://orders_service:8003/api/v1/;`.

- [ ] T15 [INFRA] Create `init-db.sh` (creates `products_db` + `orders_db`, executable bit set)
  - **files_to_produce**: `/home/andrey/repos/ms_web_dev_frontend/init-db.sh`
  - **smoke verification**:
    - `bash -n init-db.sh` exits 0.
    - `test -x init-db.sh` is true.
    - `grep -q 'CREATE DATABASE products_db' init-db.sh && grep -q 'CREATE DATABASE orders_db' init-db.sh`.

- [ ] T16 [INFRA] Create `docker-compose.yml` (postgres:16-alpine + products + orders + frontend, healthchecks + bridge network) (deps: T13, T14, T15)
  - **files_to_produce**: `/home/andrey/repos/ms_web_dev_frontend/docker-compose.yml`
  - **smoke verification**:
    - `docker compose config -q` exits 0.
    - `docker compose config` lists services `postgres`, `products_service`, `orders_service`, `frontend` and a `pgdata` volume.
    - `docker compose build frontend` succeeds.

- [ ] T17 [INFRA] Add `.env.example` documenting `VITE_PRODUCTS_API_URL=/api/products` and `VITE_ORDERS_API_URL=/api/orders`
  - **files_to_produce**: `/home/andrey/repos/ms_web_dev_frontend/.env.example`
  - **smoke verification**:
    - `grep -q '^VITE_PRODUCTS_API_URL=/api/products$' .env.example && grep -q '^VITE_ORDERS_API_URL=/api/orders$' .env.example`.

### Infra: CI release pipeline

- [ ] T18 [INFRA] Add `.github/workflows/release.yml` (npm ci → lint → test → build → semantic-release; logs into GHCR)
  - **files_to_produce**: `/home/andrey/repos/ms_web_dev_frontend/.github/workflows/release.yml`
  - **smoke verification**:
    - `actionlint .github/workflows/release.yml` clean (or `yamllint` valid YAML if actionlint absent).
    - Workflow contains `actions/setup-node@v4` with node 20, runs `npm ci`, `npm run lint`, `npm test`, `npm run build`, then `npx semantic-release`.
    - Triggers only `on: push: branches: [main]`.

- [ ] T19 [INFRA] Add `.releaserc.json` (commit-analyzer, release-notes-generator, changelog, exec docker-buildx-push, git, github)
  - **files_to_produce**: `/home/andrey/repos/ms_web_dev_frontend/.releaserc.json`
  - **smoke verification**:
    - `node -e "JSON.parse(require('fs').readFileSync('.releaserc.json','utf8'))"` exits 0.
    - JSON contains `branches:["main"]` and an `@semantic-release/exec` plugin whose `publishCmd` includes `docker buildx build --push` and references `${nextRelease.version}`.

---

## Wave 2 — depends on Wave 1

### Dependency manifest

- [ ] T20 [INFRA] Update `package.json`: add deps `@reduxjs/toolkit`, `react-redux`; devDeps `semantic-release` + plugins (`commit-analyzer`, `release-notes-generator`, `changelog`, `exec`, `git`, `github`); add `engines.node>=20`; add `release` script
  - **files_to_produce**: `/home/andrey/repos/ms_web_dev_frontend/package.json`, `/home/andrey/repos/ms_web_dev_frontend/package-lock.json`
  - **smoke verification**:
    - `npm install` exits 0; lockfile updated.
    - `node -e "const p=require('./package.json'); if(!p.dependencies['@reduxjs/toolkit']||!p.dependencies['react-redux']) process.exit(1)"`.
    - `npm run release -- --dry-run` shows the semantic-release plugin chain loading (actual release skipped without env).

### API rewrites (use http + mappers)

- [ ] T21 [CODE] Rewrite `src/api/products.ts` (real fetch; forward only `category_id`/`is_archived`/`page`/`size`; map via `fromApiProduct`) (deps: T8, T9, T20)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/api/products.ts`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/api/products.test.ts` (rewrite)
    - Cases: `list({categoryId:5, isArchived:false, page:2, size:24, search:'foo'})` calls `/products?category_id=5&is_archived=false&page=2&size=24` (no `search`); response `{items:[apiProduct], total:1, page:1, size:12}` mapped to domain shape; `getById(uuid)` GETs `/products/{uuid}`; `create`/`update`/`remove` send mapped bodies and methods POST/PATCH/DELETE.
  - **AC**:
    - **Given** mocked fetch, **when** `productsApi.list({categoryId:3, page:1, size:12, search:'lamp', minPrice:100})`, **then** the URL passed to fetch contains `category_id=3`, `page=1`, `size=12` and **does NOT** contain `search` or `minPrice`.
    - **Given** API response with one product, **then** `result.items[0].name` equals API `title` and `imageUrl==='/placeholder.png'`.
    - **Given** `productsApi.create(input)`, **then** request method is `POST`, path is `/products`, body matches `toApiProduct(input)`.

- [ ] T22 [CODE] Rewrite `src/api/orders.ts` (`create`/`list`/`getById`/`patchStatus`; status + comment mapping) (deps: T8, T10, T20)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/api/orders.ts`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/api/orders.test.ts` (rewrite)
    - Cases: `create` POSTs to orders base with `client_email`, `client_phone`, `comment` (folded), `items[]`; `list({page,size})` GETs `/orders?page=…&size=…`; `getById` GETs `/orders/{uuid}`; `patchStatus(id, 'shipped')` PATCHes with `{status:'IN_PROGRESS'}`; inbound mapping returns `status:'processing'` etc.
  - **AC**:
    - **Given** input `{email:'a@b', phone:'+7', deliveryMethod:'курьер', comment:'note', items:[{productId:'p1', qty:2, price:9.99}]}`, **when** `ordersApi.create`, **then** the JSON body has `client_email:'a@b'`, `client_phone:'+7'`, `comment:'Доставка: курьер\n\nnote'`, and `items:[{product_id:'p1', quantity:2, price:'9.99'}]`.
    - **Given** `ordersApi.patchStatus('o1','delivered')`, **then** request is PATCH `/orders/o1` with body `{status:'DELIVERED'}`.

- [ ] T23 [CODE] Rewrite `src/api/reviews.ts` (`listByProduct` GETs `?product_id=…`; no author sent) (deps: T8, T11, T20)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/api/reviews.ts`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/api/reviews.test.ts` (rewrite)
    - Cases: `listByProduct('p1')` issues GET `/reviews?product_id=p1`; `create({productId:'p1', rating:5, text:'…', author:'Bob'})` POST body has no `author`/`author_name` key; mapped read returns `author:'Аноним'`.
  - **AC**:
    - **Given** mocked fetch, **when** `reviewsApi.listByProduct('p1')`, **then** the URL contains `product_id=p1`.
    - **Given** `reviewsApi.create({productId:'p1', rating:5, text:'ok', author:'Bob'})`, **then** the POST body is `{product_id:'p1', rating:5, text:'ok'}` exactly (no author key).

- [ ] T24 [CODE] Rewrite `src/api/dictionaries.ts` (real fetch for all 6 dictionaries) (deps: T8, T12, T20)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/api/dictionaries.ts`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/api/dictionaries.test.ts` (rewrite)
    - Cases: each `list*` calls correct path (`/categories`, `/bulb-types`, `/bulb-shapes`, `/sockets`, `/suppliers`, `/promos`); `create*` POST body in snake_case; `delete*` DELETEs `/{path}/{id}`.
  - **AC**:
    - **Given** mocked fetch, **when** `dictionariesApi.listCategories()`, **then** URL ends with `/categories`.
    - **Given** `dictionariesApi.createPromo({name:'X', discountPercent:10})`, **then** request method POST to `/promos`, body `{name:'X', discount_percent:10}`.
    - **Given** `dictionariesApi.deleteSocket(7)`, **then** request method DELETE to `/sockets/7`.

- [ ] T25 [INFRA] Verify `src/api/_latency.ts` and `src/api/auth.ts` remain untouched and still type-check
  - **files_to_produce**: (no edits — verification task only)
  - **smoke verification**:
    - `tsc -b --noEmit` exits 0 with these files unchanged.
    - `git diff --name-only src/api/_latency.ts src/api/auth.ts` shows no changes.

---

## Wave 3 — depends on Wave 2

- [ ] T26 [CODE] Wire `<Provider store={store}>` in `src/main.tsx` and remove `<CartProvider>` from `src/App.tsx` (keep `<AuthProvider>`) (deps: T3, T20)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/main.tsx`, `/home/andrey/repos/ms_web_dev_frontend/src/App.tsx`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/App.integration.test.tsx`
    - Cases: app renders without throwing under the real store; `<CartProvider>` is no longer mounted (no `cart-context` data attribute / no provider in tree); `<AuthProvider>` still present.
  - **AC**:
    - **Given** mounting `<App/>` with a store provided by main, **when** rendered, **then** `useAppSelector(s=>s.cart)` returns initial cart state (no React context error).
    - **Given** the rendered tree, **then** querying for the legacy `CartProvider` displayName/test-id finds none.

- [ ] T27 [CODE] Rewrite `src/hooks/useCart.tsx` as a thin Redux shim preserving the existing public API (deps: T4, T26)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/hooks/useCart.tsx`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/hooks/useCart.test.tsx` (modify)
    - Cases: `addItem` dispatches `cart/addItem`; `removeItem`/`setQty`/`clear` pass through; `getProduct(id)` returns the cart line snapshot (`{name, price, oldPrice?, imageUrl}`) or undefined; `itemCount`/`subtotal`/`discount`/`total` come from selectors.
  - **AC**:
    - **Given** `renderWithProviders(<CartConsumer/>)`, **when** `addItem({id:'p1', qty:2, snapshot:{name:'X', price:10}})` called, **then** `itemCount===2` and `subtotal===20`.
    - **Given** an item in cart, **when** `getProduct('p1')`, **then** returns the snapshot object identical to what was inserted.
    - **Given** consumer also calls `setQty('p1', 0)`, **then** `itemCount===0` and `getProduct('p1')===undefined`.

- [ ] T28 [INFRA] Add `server.proxy` block to `vite.config.ts` for `/api/products` and `/api/orders` (deps: T20)
  - **files_to_produce**: `/home/andrey/repos/ms_web_dev_frontend/vite.config.ts`
  - **smoke verification**:
    - `npx vite --help` runs (config still parseable).
    - `npm run build` succeeds.
    - File contains both `'/api/products'` with `target:'http://localhost:8002'` and `'/api/orders'` with `target:'http://localhost:8003'`, each with a `rewrite` to `/api/v1`.

---

## Wave 4 — page refactors (parallel; all depend on T26 + T27)

- [ ] T29 [CODE] Refactor `HomePage` to dispatch `fetchProducts` + `fetchDictionaries`, select from Redux, show loading/error UI (deps: T5, T26, T27)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/pages/HomePage/HomePage.tsx`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/pages/HomePage/HomePage.test.tsx` (modify)
    - Cases: on mount fetches both endpoints; renders skeleton/loader while `listStatus==='loading'`; renders product grid on success; renders error message on rejection.
  - **AC**:
    - **Given** mocked fetch returning a paged product list, **when** `renderWithProviders(<HomePage/>)`, **then** the global `fetch` is called for `/products` and dictionary endpoints, and after resolving the page renders product names from the response.
    - **Given** mocked fetch rejecting with 500, **then** an error message containing "ошиб" (case-insensitive) is shown and no product cards render.

- [ ] T30 [CODE] Refactor `CatalogPage`: dispatch thunks; apply backend-unsupported filters client-side post-fetch (deps: T5, T26, T27)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/pages/CatalogPage/CatalogPage.tsx`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/pages/CatalogPage/CatalogPage.test.tsx` (modify)
    - Cases: `categoryId` change re-issues fetch with `category_id=…`; `search`/`minPrice`/`maxPrice` filtering happens locally on the loaded page (no extra fetch); pagination dispatches new fetch with correct `page`/`size`.
  - **AC**:
    - **Given** loaded page with 3 products `[A,B,C]` whose names are `Alpha/Beta/Gamma`, **when** user types `alp` in the search input, **then** only `Alpha` is visible and `fetch` was NOT called again.
    - **Given** category filter changes from `1` to `2`, **then** `fetch` is called with URL containing `category_id=2`.

- [ ] T31 [CODE] Refactor `ProductPage`: dispatch `fetchProductById`, `fetchReviews`, `createReview`; remove author input from review form (deps: T5, T7, T26, T27)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/pages/ProductPage/ProductPage.tsx`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/pages/ProductPage/ProductPage.test.tsx` (modify)
    - Cases: on mount fetches product + reviews; review form has no author input; submitting valid review POSTs without author and prepends/appends to list; existing reviews render as "Аноним".
  - **AC**:
    - **Given** mocked fetch returning a product and 2 reviews, **when** rendered at `/product/:id`, **then** product name and both reviews are visible, each labelled "Аноним".
    - **Given** the review form, **then** `screen.queryByLabelText(/имя|author/i)` returns null.
    - **Given** user submits rating 5 + text "good", **then** `fetch` was called with `POST /reviews` and a JSON body that does NOT contain an `author` key.

- [ ] T32 [CODE] CartPage adjustment: ensure it works through the `useCart` shim with no UX change (deps: T27)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/pages/CartPage/CartPage.tsx` (only if imports/types need adjusting — otherwise no edit)
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/pages/CartPage/CartPage.test.tsx` (modify to use `renderWithProviders`)
    - Cases: shows lines from preloaded cart state; quantity update changes total; remove button clears the line.
  - **AC**:
    - **Given** `renderWithProviders(<CartPage/>, {preloadedState:{cart:{items:[{id:'a', qty:2, snapshot:{name:'X',price:10,imageUrl:'/p.png'}}]}}})`, **then** the page shows `X` with qty 2 and total 20.
    - **Given** user clicks "+", **then** displayed total updates to 30.

- [ ] T33 [CODE] Refactor `CheckoutPage`: dispatch `createOrder().unwrap()`, on success `clear()` + navigate to `/order-success` (deps: T4, T6, T22, T26, T27)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/pages/CheckoutPage/CheckoutPage.tsx`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/pages/CheckoutPage/CheckoutPage.test.tsx` (modify)
    - Cases: form submission calls `fetch('/orders', {method:'POST'})`; success path navigates to `/order-success` and empties cart; failure path shows error and keeps cart intact.
  - **AC**:
    - **Given** preloaded cart with 1 item and mocked successful POST, **when** user fills form and submits, **then** `fetch` is called once with method POST and body containing `client_email`, the route changes to `/order-success`, and `state.cart.items` is empty.
    - **Given** mocked POST returns 500, **then** an error message is rendered, route remains `/checkout`, and cart still has the item.

- [ ] T34 [CODE] Refactor `OrderSuccessPage`: read `lastOrder` from `state.orders.lastOrder` for total display (deps: T6, T26, T27)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/pages/OrderSuccessPage/OrderSuccessPage.tsx`
  - **tests_to_write**: `/home/andrey/repos/ms_web_dev_frontend/src/pages/OrderSuccessPage/OrderSuccessPage.test.tsx` (modify)
    - Cases: with `lastOrder` in state, shows order id and total; without `lastOrder` shows fallback message and link back to `/`.
  - **AC**:
    - **Given** `preloadedState:{orders:{lastOrder:{id:'o1', total:42, …}}}`, **when** rendered, **then** `o1` and `42` are visible.
    - **Given** `preloadedState:{orders:{lastOrder:null}}`, **then** a fallback message is shown and a link to `/` exists.

- [ ] T35 [CODE] Update `src/router.test.tsx` to use `renderWithProviders` and mock fetch responses (deps: T2, T26)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/router.test.tsx` (modify)
  - **tests_to_write**: same file (modify)
    - Cases: each existing route renders inside Provider; mocked fetch prevents network errors; navigation between routes still works.
  - **AC**:
    - **Given** the route table mounted via `renderWithProviders(…, {route:'/'})`, **when** asserted, **then** the Home route resolves and no React context errors are logged.
    - **Given** navigation to `/cart`, **then** CartPage renders with items from preloaded state.

- [ ] T36 [CODE] Update `src/layouts/PublicLayout.test.tsx` to use `renderWithProviders` (deps: T2, T26)
  - **files_to_implement**: `/home/andrey/repos/ms_web_dev_frontend/src/layouts/PublicLayout.test.tsx` (modify)
  - **tests_to_write**: same file
    - Cases: header cart counter reads from Redux; navigation links render; layout renders children.
  - **AC**:
    - **Given** preloaded cart with 3 total items, **when** PublicLayout renders, **then** the cart badge shows `3`.
    - **Given** preloaded empty cart, **then** the cart badge shows `0` (or is hidden, matching current behaviour).

---

## Wave 5 — verification gates (run last)

- [ ] T37 [INFRA] Run full quality gate locally: `npm run lint && npm test && npm run build` clean (deps: T29, T30, T31, T32, T33, T34, T35, T36, T28)
  - **smoke verification**: all three commands exit 0; no TypeScript errors; coverage of new test files counted.

- [ ] T38 [INFRA] `docker compose up --build` smoke: postgres healthy, both backends respond on `/health`, frontend serves `index.html` on `:8080`, proxied paths reachable (deps: T16, T13, T14, T15, T17, T28, T37)
  - **smoke verification**:
    - `curl -fsS http://localhost:8002/health` exits 0.
    - `curl -fsS http://localhost:8003/health` exits 0.
    - `curl -fsS http://localhost:8080/` returns HTML containing `<div id="root">`.
    - `curl -fsS http://localhost:8080/api/products/categories` returns 200 (JSON list).
    - `docker compose down -v` cleans up.

---

## Summary

- **Total tasks**: 38
- **Wave 1 (independent)**: T1–T19 (19 tasks: 12 CODE, 7 INFRA)
- **Wave 2 (deps on W1)**: T20–T25 (6 tasks: 4 CODE, 2 INFRA)
- **Wave 3 (deps on W2)**: T26–T28 (3 tasks: 2 CODE, 1 INFRA)
- **Wave 4 (page refactors, deps on W3)**: T29–T36 (8 tasks: all CODE)
- **Wave 5 (verification, deps on W4)**: T37–T38 (2 tasks: both INFRA)

Counts by tag: **CODE = 26**, **INFRA = 12**.
