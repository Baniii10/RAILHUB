# Graph Report - .  (2026-11-04)

## Corpus Check
- 75 files · ~83,786 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 273 nodes · 597 edges · 15 communities (12 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.77)
- Token cost: 1,200 input · 450 output

## Community Hubs (Navigation)
- Booking & Payment Workflow
- Authentication & User Access
- Admin Journey Operations
- External UI Libraries
- Midtrans Payment API
- Train Search & Station Catalog
- Build & Linter Configuration
- Admin Staff Management
- About Page & Fleet Portfolio
- Mobile Super App Portal
- Supabase Client & Auth Callback
- PRD Functional Specifications
- JSConfig Aliases
- ESLint Configuration
- Next.js Framework Config

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 35 edges
2. `useAuth()` - 27 edges
3. `formatDate()` - 19 edges
4. `formatTime()` - 19 edges
5. `Navbar()` - 18 edges
6. `formatIDR()` - 15 edges
7. `MobilePortalHeader()` - 13 edges
8. `useLang()` - 13 edges
9. `getJourneyStatusLabel()` - 12 edges
10. `POST()` - 11 edges

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

## Communities (15 total, 3 thin omitted)

### Community 0 - "Booking & Payment Workflow"
Cohesion: 0.12
Nodes (22): AdminDashboardContent(), PassengerDashboardContent(), TABS, StaffDashboardContent(), blankPassenger(), BookingFlow(), getSeatRows(), BookingPayment() (+14 more)

### Community 1 - "Authentication & User Access"
Cohesion: 0.08
Nodes (24): LoginPage(), RegisterPage(), PassengerDashboard(), metadata, viewport, FAQS, FEATURES, GALLERY_ITEMS (+16 more)

### Community 2 - "Admin Journey Operations"
Cohesion: 0.12
Nodes (21): addDateDays(), AdminJourneysPage(), jakartaDateInputValue(), jakartaDateStart(), splitIntoChunks(), StatusBadge(), statusColors, ADMIN_TABS (+13 more)

### Community 3 - "External UI Libraries"
Cohesion: 0.09
Nodes (23): date-fns, framer-motion, jsqr, lucide-react, next, dependencies, date-fns, framer-motion (+15 more)

### Community 4 - "Midtrans Payment API"
Cohesion: 0.20
Nodes (19): amountMatches(), POST(), FOOD_METHODS, GET(), getFinishUrl(), getMissingPaymentConfiguration(), paymentConfigurationError(), POST() (+11 more)

### Community 5 - "Train Search & Station Catalog"
Cohesion: 0.15
Nodes (16): firstValue(), metadata, TrainsPageContent(), addDays(), getDayLabel(), TrainSearchResults(), ScheduleCardSkeleton(), TrainTrackLoader() (+8 more)

### Community 6 - "Build & Linter Configuration"
Cohesion: 0.09
Nodes (21): babel-plugin-react-compiler, eslint, eslint-config-next, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss (+13 more)

### Community 7 - "Admin Staff Management"
Cohesion: 0.20
Nodes (15): AdminStaffPage(), assignableScheduleId(), jakartaDateInputValue(), jakartaDateStart(), FoodOrdersPage(), PassengerReportsPage(), Navbar(), publicNavLinks() (+7 more)

### Community 8 - "About Page & Fleet Portfolio"
Cohesion: 0.16
Nodes (8): FLEET_PORTFOLIO, TEAM_MEMBERS, TIMELINE, STATION_DESKS, FAQ_CATEGORIES, FAQ_ITEMS, Footer(), footerLinks

### Community 9 - "Mobile Super App Portal"
Cohesion: 0.32
Nodes (12): MobilePortalHeader(), IconAntarKota(), IconBandara(), IconGrabFeeder(), IconKomuter(), IconLebihBanyak(), IconLokal(), IconLRT() (+4 more)

### Community 10 - "Supabase Client & Auth Callback"
Cohesion: 0.29
Nodes (7): GET(), createUnconfiguredSupabaseClient(), getSupabaseEnv(), MISSING_SUPABASE_ENV_MESSAGE, createClient(), config, middleware()

### Community 11 - "PRD Functional Specifications"
Cohesion: 0.25
Nodes (9): Fitur: Live Tracking Perjalanan Kereta, Fitur: Simulasi Pembayaran & Tiket, Fitur: Pemilihan Kursi Real-Time, Fitur: Validasi Tiket QR Petugas, Fitur: Cari Tiket & Jadwal Kereta, RAILHUB PRD Specification, Role: Administrator, Role: Penumpang (+1 more)

## Knowledge Gaps
- **80 isolated node(s):** `eslintConfig`, `paths`, `nextConfig`, `name`, `version` (+75 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Booking & Payment Workflow` to `Authentication & User Access`, `Admin Journey Operations`, `Train Search & Station Catalog`, `Admin Staff Management`, `Supabase Client & Auth Callback`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Supabase Client & Auth Callback` to `Midtrans Payment API`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `getSupabaseEnv()` connect `Supabase Client & Auth Callback` to `Booking & Payment Workflow`, `Admin Staff Management`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `paths`, `nextConfig` to the rest of the system?**
  _80 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Booking & Payment Workflow` be split into smaller, more focused modules?**
  _Cohesion score 0.11666666666666667 - nodes in this community are weakly interconnected._
- **Should `Authentication & User Access` be split into smaller, more focused modules?**
  _Cohesion score 0.08377896613190731 - nodes in this community are weakly interconnected._
- **Should `Admin Journey Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.12169312169312169 - nodes in this community are weakly interconnected._