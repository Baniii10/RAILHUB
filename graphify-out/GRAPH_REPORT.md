# Graph Report - RAILHUB-1  (2026-11-04)

## Corpus Check
- 68 files · ~81,493 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 278 nodes · 593 edges · 16 communities (12 shown, 4 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6eb94701`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RAILHUB
- app/page.js
- admin/page.js
- dependencies
- midtrans/route.js
- TrainSearchResults.jsx
- package.json
- createClient
- about/page.js
- MobilePortalHeader.jsx
- createClient
- Role: Penumpang
- compilerOptions
- eslint.config.mjs
- next.config.mjs
- AGENTS.md

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 35 edges
2. `useAuth()` - 27 edges
3. `formatDate()` - 19 edges
4. `formatTime()` - 19 edges
5. `Navbar()` - 18 edges
6. `formatIDR()` - 15 edges
7. `MobilePortalHeader()` - 13 edges
8. `useLang()` - 13 edges
9. `AdminJourneysPage()` - 11 edges
10. `getJourneyStatusLabel()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `createClient()`  [EXTRACTED]
  src/app/api/payments/midtrans/route.js → src/lib/supabase/server.js
- `POST()` --calls--> `createClient()`  [EXTRACTED]
  src/app/api/payments/midtrans/route.js → src/lib/supabase/server.js
- `GET()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/callback/route.js → src/lib/supabase/server.js
- `LoginPage()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/login/page.js → src/lib/supabase/client.js
- `RegisterPage()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/register/page.js → src/lib/supabase/client.js

## Import Cycles
- None detected.

## Communities (16 total, 4 thin omitted)

### Community 0 - "RAILHUB"
Cohesion: 0.22
Nodes (8): Create an admin account, Current functionality, Deploy on Vercel, Getting Started, Learn More, Local development, RAILHUB, Validation

### Community 1 - "app/page.js"
Cohesion: 0.09
Nodes (21): LoginPage(), RegisterPage(), metadata, viewport, FLEET_CLASSES, HomePage(), POPULAR_ROUTES, PROMO_BANNERS (+13 more)

### Community 2 - "admin/page.js"
Cohesion: 0.10
Nodes (26): addDateDays(), AdminJourneysPage(), jakartaDateInputValue(), jakartaDateStart(), splitIntoChunks(), StatusBadge(), statusColors, ADMIN_TABS (+18 more)

### Community 3 - "dependencies"
Cohesion: 0.09
Nodes (23): date-fns, framer-motion, jsqr, lucide-react, next, dependencies, date-fns, framer-motion (+15 more)

### Community 4 - "midtrans/route.js"
Cohesion: 0.19
Nodes (19): amountMatches(), POST(), FOOD_METHODS, GET(), getFinishUrl(), getMissingPaymentConfiguration(), paymentConfigurationError(), POST() (+11 more)

### Community 5 - "TrainSearchResults.jsx"
Cohesion: 0.14
Nodes (17): blankPassenger(), BookingFlow(), getSeatRows(), addDays(), getDayLabel(), TrainSearchResults(), ScheduleCardSkeleton(), TrainTrackLoader() (+9 more)

### Community 6 - "package.json"
Cohesion: 0.09
Nodes (21): babel-plugin-react-compiler, eslint, eslint-config-next, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss (+13 more)

### Community 7 - "createClient"
Cohesion: 0.12
Nodes (28): AdminDashboardContent(), AdminStaffPage(), assignableScheduleId(), jakartaDateInputValue(), jakartaDateStart(), FoodOrdersPage(), PassengerDashboardContent(), TABS (+20 more)

### Community 8 - "about/page.js"
Cohesion: 0.16
Nodes (8): FLEET_PORTFOLIO, TEAM_MEMBERS, TIMELINE, STATION_DESKS, FAQ_CATEGORIES, FAQ_ITEMS, Footer(), FOOTER_LINKS

### Community 9 - "MobilePortalHeader.jsx"
Cohesion: 0.31
Nodes (11): MobilePortalHeader(), IconAntarKota(), IconBandara(), IconGrabFeeder(), IconKomuter(), IconLebihBanyak(), IconLokal(), IconLRT() (+3 more)

### Community 10 - "createClient"
Cohesion: 0.29
Nodes (7): GET(), createUnconfiguredSupabaseClient(), getSupabaseEnv(), MISSING_SUPABASE_ENV_MESSAGE, createClient(), config, middleware()

### Community 11 - "Role: Penumpang"
Cohesion: 0.25
Nodes (9): Fitur: Live Tracking Perjalanan Kereta, Fitur: Simulasi Pembayaran & Tiket, Fitur: Pemilihan Kursi Real-Time, Fitur: Validasi Tiket QR Petugas, Fitur: Cari Tiket & Jadwal Kereta, RAILHUB PRD Specification, Role: Administrator, Role: Penumpang (+1 more)

## Knowledge Gaps
- **85 isolated node(s):** `eslintConfig`, `paths`, `nextConfig`, `name`, `version` (+80 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `createClient` to `app/page.js`, `admin/page.js`, `createClient`, `TrainSearchResults.jsx`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Why does `createClient()` connect `createClient` to `midtrans/route.js`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `getSupabaseEnv()` connect `createClient` to `createClient`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `paths`, `nextConfig` to the rest of the system?**
  _85 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app/page.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09475806451612903 - nodes in this community are weakly interconnected._
- **Should `admin/page.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09634146341463415 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._