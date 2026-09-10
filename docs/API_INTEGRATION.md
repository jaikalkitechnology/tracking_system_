# Integrating an external e-commerce site with this API

This describes how a **separate** website (your storefront, a different e-commerce
app, etc.) can call this system's API to read order and shipment data — for
example, to show "Order Details" or "Track My Order" on that site.

Base URL: `http://localhost:8000/api/v1` in development. Swap the host for your
deployed backend's URL in production. Full interactive reference (every field,
try-it-out): `http://localhost:8000/docs`.

There is no separate API-key mechanism — every non-public endpoint uses the
same JWT auth as the admin dashboard. The external site authenticates as a
user of this system (typically a staff account, or the customer themselves)
and sends that token on every request.

## 1. Two integration modes

| Need | Endpoint | Auth required? |
|---|---|---|
| Full order details (items, addresses, customer, payment/order status) | `GET /api/v1/orders/{id}` | Yes (JWT) |
| Search/list orders | `GET /api/v1/orders` | Yes (JWT) |
| Just shipment status + tracking timeline | `GET /api/v1/track/{tracking_number}` | **No** — public |

If the other site only needs to show delivery status (a "Track your order"
widget), use the public tracking endpoint — no login, no token, nothing to
manage. Use the authenticated order endpoints only when you actually need
order/customer/payment data.

## 2. Authenticate (for order endpoints)

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Password@123"}'
```

```json
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": { "id": 2, "name": "Noah Admin", "role": "ADMIN", "status": "ACTIVE", "...": "..." }
}
```

- `access_token` — send as `Authorization: Bearer <access_token>` on every request. Expires after `ACCESS_TOKEN_EXPIRE_MINUTES` (default 30 min).
- `refresh_token` — exchange for a new token pair via `POST /api/v1/auth/refresh` with `{"refresh_token": "..."}` once the access token expires. Don't log in again on every request.
- Use a dedicated integration account (staff role, e.g. `ADMIN` or `MANAGER`) rather than a real customer's login. A `CUSTOMER`-role token only sees that one customer's own orders (see [Permissions](#4-permissions--what-each-role-can-see) below).

## 3. Get order details

By ID:

```bash
curl http://localhost:8000/api/v1/orders/123 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

```json
{
  "id": 123,
  "order_number": "ORD-20260910-000001",
  "customer_id": 5,
  "total_amount": 2497.00,
  "payment_status": "PAID",
  "order_status": "CONFIRMED",
  "shipping_address_id": 8,
  "billing_address_id": 8,
  "created_at": "2026-09-10T10:00:00",
  "updated_at": "2026-09-10T10:00:00",
  "customer": { "id": 5, "customer_code": "CUST000005", "name": "...", "email": "...", "phone": "...", "status": "ACTIVE" },
  "shipping_address": { "address_line1": "...", "city": "...", "state": "...", "pincode": "...", "country": "India" },
  "billing_address": { "...": "..." },
  "items": [
    {
      "id": 1,
      "product_id": 3,
      "quantity": 2,
      "price": 499.0,
      "total": 998.0,
      "product": { "sku": "SKU-TSHIRT-001", "name": "Classic Cotton T-Shirt", "price": 499.0 }
    }
  ]
}
```

`payment_status` is one of `PENDING | PAID | FAILED | REFUNDED`.
`order_status` is one of `PENDING | CONFIRMED | PACKED | CANCELLED | COMPLETED`.

By search (list, paginated):

```bash
curl "http://localhost:8000/api/v1/orders?search=ORD-2026&order_status=CONFIRMED&page=1&limit=20" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

```json
{
  "items": [ { "id": 123, "order_number": "ORD-20260910-000001", "...": "..." } ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "pages": 1
}
```

Supported query params: `search` (matches order number), `order_status`,
`payment_status`, `page`, `limit`.

## 4. Permissions — what each role can see

Enforced server-side, not just in the UI:

| Token's role | `GET /orders` and `GET /orders/{id}` returns |
|---|---|
| `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `WAREHOUSE` | All orders |
| `CUSTOMER` | Only that customer's own orders — others 404 |

## 5. Public tracking (no auth)

For a lightweight "Track your order" integration with no login flow at all:

```bash
curl http://localhost:8000/api/v1/track/TRK337467769
```

```json
{
  "tracking_number": "TRK337467769",
  "status": "OUT_FOR_DELIVERY",
  "estimated_delivery": "2026-09-13",
  "origin": "Mumbai",
  "destination": "Thane",
  "events": [
    { "id": 1, "status": "ORDER_CONFIRMED", "title": "Order Confirmed", "location": null, "event_time": "2026-09-10T04:00:00" },
    { "id": 2, "status": "PACKED", "title": "Packed", "location": "Mumbai Central Warehouse", "event_time": "2026-09-10T06:00:00" }
  ]
}
```

No customer PII is included in this response — safe to expose directly to an
end user on a public page.

## 6. Example: Node/browser (fetch)

```js
const API_BASE = "http://localhost:8000/api/v1";

async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json(); // { access_token, refresh_token, user }
}

async function getOrder(orderId, accessToken) {
  const res = await fetch(`${API_BASE}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Order lookup failed: ${res.status}`);
  return res.json();
}

async function trackShipment(trackingNumber) {
  const res = await fetch(`${API_BASE}/track/${encodeURIComponent(trackingNumber)}`);
  if (!res.ok) throw new Error(`Tracking lookup failed: ${res.status}`);
  return res.json();
}
```

## 7. Errors

All errors share one shape:

```json
{ "success": false, "message": "Order not found", "error_code": "ORDER_NOT_FOUND" }
```

Common statuses: `401` (missing/expired token — refresh or re-login), `403`
(token's role can't access this resource), `404` (not found or, for a
`CUSTOMER` token, not theirs), `422` (validation error on request params).

## 8. Security notes for whoever operates the *other* website

- Never put `email`/`password` or `access_token`/`refresh_token` in
  client-side JavaScript shipped to end users. Do the login + order lookup
  from your own backend, then forward only what the page needs to render.
- Store the integration account's credentials as server-side secrets on the
  other site (its own `.env`), not in its repo.
- Prefer a `MANAGER` or `WAREHOUSE`-scoped account over `SUPER_ADMIN` for a
  read-only integration, per least privilege.
