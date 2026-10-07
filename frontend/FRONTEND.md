# Frontend Design Reference — Vastraliya Tracking System

This documents the design system actually in use in `frontend/`, generated from the live codebase so it stays accurate as a reference for anyone working on the UI.

## Stack

- React 18 + TypeScript, built with Vite 5
- Tailwind CSS 3 (utility classes only, no CSS-in-JS)
- React Router 6 for routing
- Axios for API calls (`src/api/axios.ts`) with JWT access/refresh token handling
- Recharts for charts (Dashboard, Reports)
- Font: **Inter** (loaded via `fontFamily.sans` in Tailwind config)

## Color Tokens

Defined in `tailwind.config.js`, used via Tailwind utility classes (`bg-brand-600`, `text-brand-400`, etc.):

| Token | Light value | Use |
|---|---|---|
| `brand.50`–`brand.900` | indigo scale (`#eef2ff` → `#312e81`) | Primary brand color — buttons, links, active nav state, focus rings |
| `surface.DEFAULT` | `#ffffff` | Light mode card/page background |
| `surface.subtle` | `#f8fafc` | Light mode secondary background |
| `surface.dark` | `#0f1424` | Dark mode page background |
| `surface.dark-subtle` | `#161c2e` | Dark mode card background |
| `surface.dark-border` | `#252c42` | Dark mode borders |

Outside these custom tokens, the app uses Tailwind's default **slate** scale as the neutral/gray palette (`text-slate-900`, `border-slate-200`, etc.), and semantic colors (`emerald`, `amber`, `red`, `sky`, `cyan`, `purple`, `indigo`, `orange`) for status badges — see below.

**Dark mode** is class-based (`darkMode: "class"`), toggled by `ThemeToggle.tsx` via `ThemeContext`, applied as a `dark` class on the root element. Every component pairs a light utility with a `dark:` variant — there is no separate dark theme file.

## Shadows & Motion

- `shadow-card` — subtle default card shadow (light)
- `shadow-card-hover` — slightly stronger, for hover states
- `shadow-card-dark` — dark-mode card shadow
- `animate-fade-in` / `animate-slide-up` — small entrance transitions (0.2–0.25s ease-out)

## Component Library (`src/components/ui/`)

| Component | Purpose |
|---|---|
| `Button.tsx` | Primary/secondary button variants |
| `Card.tsx` | `Card`, `CardHeader`, `CardBody` — the base container used on every page |
| `Badge.tsx` | Status pill with color + dot, driven by a status→color lookup table (see below) |
| `Input.tsx` | `Input`, `Select`, `Label` — form fields, shared styling via `FIELD_CLASSES` |
| `Modal.tsx` | Dialog overlay |
| `Pagination.tsx` | Page navigation + "Show 10/25/50/100" page-size selector, used on every list page |
| `EmptyState.tsx` | `EmptyState` / `ErrorState` — no-data and error placeholders |
| `Spinner.tsx` | `LoadingState` — loading spinner + label |
| `ThemeToggle.tsx` | Light/dark toggle button |
| `icons.tsx` | All inline SVG icons used across the app (no icon library dependency) |

Other shared building blocks:
- `src/components/tables/DataTable.tsx` — generic column-driven table used by every list page
- `src/components/charts/StatCard.tsx` — the KPI tiles at the top of list pages (value + icon + optional trend %)
- `src/components/charts/*.tsx` — Recharts wrappers for Dashboard/Reports (Sales Overview, Order Status, Shipment Status, Orders Over Time, Delivery Performance)
- `src/components/layout/Sidebar.tsx`, `Topbar.tsx`, `NotificationBell.tsx` — admin shell

### Status Badge Colors

`Badge.tsx` maps every status string (order, shipment, payment, stock, customer, user status) to a consistent color, e.g.:

- **Emerald** — success states: `DELIVERED`, `COMPLETED`, `PAID`, `ACTIVE`, `IN_STOCK`
- **Amber** — pending/attention: `PENDING`, `LOW_STOCK`
- **Red** — failure: `DELIVERY_FAILED`, `CANCELLED`, `OUT_OF_STOCK`, `FAILED`
- **Sky/Cyan** — in-progress movement: `IN_TRANSIT`, `ARRIVED_AT_HUB`, `OUT_FOR_DELIVERY`
- **Blue/Indigo/Purple** — early-stage order/shipment states: `CONFIRMED`, `PACKED`, `PICKED_UP`
- **Orange** — returns: `RETURN_REQUESTED`, `RETURNED`, `RTO`
- **Slate** — neutral/inactive: `INACTIVE`, `SUSPENDED`, `DISCONTINUED`, `ON_HOLD`, `REFUNDED`

Each status renders as `[dot] Label With Spaces` (underscores replaced with spaces automatically).

## Layouts (`src/layouts/`)

- **AdminLayout** — Sidebar + Topbar (with `NotificationBell`, `ThemeToggle`) wrapping all staff pages
- **AuthLayout** — centered single-column card (logo + form), used for `/login`
- **CustomerLayout** — shell for the customer-facing portal

## Pages / Routes (`src/routes/AppRoutes.tsx`)

**Public**
- `/track` — public tracking lookup (no login)
- `/login`

**Staff/Admin** (role: SUPER_ADMIN, ADMIN, MANAGER, WAREHOUSE)
- `/dashboard`
- `/reports`
- `/inventory`
- `/orders`, `/orders/new`, `/orders/:id`
- `/shipments`, `/shipments/:id`
- `/customers`, `/customers/:id`
- `/products`
- `/notifications`
- `/settings`

**Customer portal** (role: CUSTOMER)
- `/customer/orders`, `/customer/orders/:id`
- `/customer/shipments/:id`
- `/customer/notifications`
- `/customer/profile`

## Conventions

- **List pages** all follow the same shape: title + subtitle → row of `StatCard`s → `Card` containing filters, a `DataTable`, and `Pagination` at the bottom.
- **Currency**: always `formatCurrency()` — `Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })`.
- **Dates/times**: always `formatDate()` / `formatDateTime()` from `utils/format.ts` — both render in `Asia/Kolkata` time regardless of the viewer's browser timezone, since the backend sends naive UTC timestamps.
- **Icons**: all inline SVGs in `icons.tsx`, no external icon package.
- **No manual "+ Create" flows** on Orders/Customers/Products — these are populated via the vastraliya.com sync integration, not created by hand in the admin.
