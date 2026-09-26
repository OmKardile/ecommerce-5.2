# Stock Monitor Employee Panel — Research & Specification

> **Status: RESEARCH ONLY — NOT IMPLEMENTED**
> This document outlines the proposed stock-monitoring employee panel feature.
> The schema, pages, and functionality described here are **design drafts** for
> client review. Nothing in this document has been built yet. Do NOT implement
> until the client confirms the requirement.

---

## 1. Purpose

A dedicated panel for warehouse/stock employees to monitor inventory levels in
real-time, receive low-stock alerts, log stock movements (in/out), and reconcile
physical counts against the database. This is separate from the admin command
center (which is for operations managers) — this panel is for the floor staff
who physically handle stock.

---

## 2. User Roles (proposed)

| Role | Access level | What they can do |
|---|---|---|
| `STOCK_MANAGER` | Full stock panel | View all inventory, adjust stock, approve/reject movements, generate reports |
| `STOCK_CLERK` | Limited stock panel | View assigned inventory, log movements (in/out), mark items counted |

These would be added to the existing `UserRole` enum in `prisma/schema.prisma`:
```prisma
enum UserRole {
  SUPER_ADMIN
  ADMIN
  INVENTORY_MANAGER    // renamed from STOCK_MANAGER for consistency
  ORDER_MANAGER
  CONTENT_MANAGER
  CUSTOMER
  STOCK_CLERK          // NEW — floor staff role
}
```

---

## 3. Proposed Database Schema

> ⚠️ These are DRAFT models. The existing `Inventory`, `InventoryMovement`, and
> `Sku` models already exist. The new additions are `StockReconciliation`,
> `StockAlert`, and `StockCountSession`.

### New models

```prisma
// Stock alert — triggered when inventory drops below threshold
model StockAlert {
  id          String   @id @default(uuid())
  skuId       String
  sku         Sku      @relation(fields: [skuId], references: [id], onDelete: Cascade)
  alertType   StockAlertType
  threshold   Int      // the level that triggered the alert
  currentStock Int     // snapshot at alert time
  status      StockAlertStatus @default(OPEN)
  acknowledgedBy String?
  acknowledgedAt DateTime?
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?

  @@index([status, createdAt])
  @@map("stock_alerts")
}

enum StockAlertType {
  LOW_STOCK
  OUT_OF_STOCK
  OVERSTOCK       // stock exceeds max threshold
  EXPIRY_WARNING  // for surveillance drives with warranty expiry
}

enum StockAlertStatus {
  OPEN
  ACKNOWLEDGED
  RESOLVED
}

// Stock reconciliation — physical count vs database
model StockReconciliation {
  id           String   @id @default(uuid())
  skuId        String
  sku          Sku      @relation(fields: [skuId], references: [id])
  expectedQty  Int      // what the DB says
  countedQty   Int      // what the physical count says
  variance     Int      // countedQty - expectedQty
  reason       String?  // explanation if variance != 0
  status       ReconciliationStatus @default(PENDING)
  countedBy    String   // employee user ID
  approvedBy   String?
  createdAt    DateTime @default(now())
  resolvedAt   DateTime?

  @@index([status, createdAt])
  @@map("stock_reconciliations")
}

enum ReconciliationStatus {
  PENDING
  MATCHED      // variance == 0
  DISCREPANCY  // variance != 0, needs approval
  RESOLVED
}

// Stock count session — a batch count event
model StockCountSession {
  id           String   @id @default(uuid())
  name         String   // e.g., "Q3 2026 Full Count"
  status       CountSessionStatus @default(SCHEDULED)
  startedAt    DateTime?
  completedAt  DateTime?
  assignedTo   String[] // user IDs of stock clerks
  createdBy    String
  createdAt    DateTime @default(now())

  reconciliations StockReconciliation[]

  @@map("stock_count_sessions")
}

enum CountSessionStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### Existing models (already in schema)

The existing models that this panel would use:

- **`Inventory`** — current stock levels per SKU (`currentStock`, `reservedStock`, `lowStockThreshold`)
- **`InventoryMovement`** — log of all stock changes (already has `MovementReason` enum with 7 values)
- **`Sku`** — the SKU with `code`, `barcode`, `weightGrams`, `dimensionsCm`
- **`User`** — the employee (with role `INVENTORY_MANAGER` or `STOCK_CLERK`)
- **`Product`** / **`ProductVariant`** — for displaying product names/images

### Schema changes summary

| Change | Type | Impact |
|---|---|---|
| Add `StockAlert` model | NEW | New table `stock_alerts` |
| Add `StockReconciliation` model | NEW | New table `stock_reconciliations` |
| Add `StockCountSession` model | NEW | New table `stock_count_sessions` |
| Add `STOCK_CLERK` to `UserRole` enum | MODIFY | Existing enum gets a new value |
| Add relations to `Sku` (alerts, reconciliations) | MODIFY | Backward-compatible |

**No destructive changes to existing tables.** All additions are new tables or
enum value additions.

---

## 4. Proposed Pages

### `/stock` — Stock Dashboard (main panel)

- Real-time inventory overview (total SKUs, total stock value, low-stock count, out-of-stock count)
- Live alert feed (newest first, color-coded by severity)
- Quick-action buttons: "New count session", "View movements", "Export report"
- A bar chart of stock levels by category (using Recharts, already installed)

### `/stock/alerts` — Alert Management

- Filterable list of all stock alerts (OPEN / ACKNOWLEDGED / RESOLVED)
- Acknowledge button (sets `acknowledgedBy` + `acknowledgedAt`)
- Resolve button (sets `resolvedAt`, optionally links to a stock adjustment)
- Auto-generated alerts: triggered by a cron job or a Prisma trigger when
  `currentStock` drops below `lowStockThreshold`

### `/stock/movements` — Movement Log

- Paginated table of all `InventoryMovement` records
- Filter by SKU, date range, movement reason, user
- Export to CSV (already implemented in admin reports, can reuse)
- Each row shows: SKU code, product name, type (IN/OUT/ADJUST), quantity,
  reason, user, timestamp

### `/stock/count` — Stock Count Sessions

- List of count sessions (scheduled / in progress / completed)
- "New session" button → creates a `StockCountSession`, assigns SKUs to clerks
- Per-session view: checklist of SKUs with expected vs counted quantity
- Submit count → creates `StockReconciliation` records
- If variance ≠ 0 → status = DISCREPANCY, requires manager approval

### `/stock/reconcile` — Reconciliation Approval (manager only)

- List of reconciliations with status = DISCREPANCY
- Approve (adjust DB to match counted qty) or Reject (keep DB qty, log reason)
- Shows full movement history for the SKU in question

---

## 5. Middleware / Auth Guards

```typescript
// In src/proxy.ts, add:
if (pathname.startsWith('/stock') && pathname !== '/stock/login') {
  const stockToken = request.cookies.get('pn_stock_session')?.value;
  if (!stockToken) {
    return NextResponse.redirect(new URL('/stock/login', request.url));
  }
  try {
    const payload = await jwtVerify(stockToken, JWT_KEY);
    if (!['INVENTORY_MANAGER', 'STOCK_CLERK'].includes(payload.role)) {
      return NextResponse.redirect(new URL('/stock/login', request.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/stock/login', request.url));
  }
}
```

**Separate session cookie** (`pn_stock_session`) — isolated from admin (`pn_admin_session`)
and customer (`pn_session`) sessions, per ADR-019's session isolation pattern.

---

## 6. Server Actions (proposed)

```typescript
// src/app/actions/stock.actions.ts

export async function acknowledgeAlertAction(alertId: string): Promise<ActionResult>
export async function resolveAlertAction(alertId: string, resolutionNote: string): Promise<ActionResult>
export async function createCountSessionAction(name: string, assignedSkus: string[]): Promise<ActionResult>
export async function submitStockCountAction(sessionId: string, counts: { skuId: string, countedQty: number }[]): Promise<ActionResult>
export async function approveReconciliationAction(reconciliationId: string, reason: string): Promise<ActionResult>
export async function rejectReconciliationAction(reconciliationId: string, reason: string): Promise<ActionResult>
export async function getStockDashboardDataAction(): Promise<ActionResult>
export async function getAlertsAction(status?: StockAlertStatus): Promise<ActionResult>
export async function getMovementsAction(filters: MovementFilters): Promise<ActionResult>
```

---

## 7. Components (proposed)

```
src/components/stock/
├── StockHeader.tsx              // top bar with employee name + role
├── StockSidebar.tsx             // nav: Dashboard / Alerts / Movements / Count / Reconcile
├── StockDashboard.tsx           // overview cards + alert feed + chart
├── AlertManagementTable.tsx     // sortable/filterable alert table
├── MovementLogTable.tsx         // paginated movement history
├── CountSessionList.tsx         // list of count sessions
├── CountSessionDetail.tsx       // per-session checklist UI
├── ReconciliationApproval.tsx   // manager approval queue
└── StockLogin.tsx               // separate login (stock clerk credentials)
```

---

## 8. Alert Generation Logic

Alerts should be generated automatically when inventory changes. Two approaches:

### Option A: Application-level (recommended — no DB triggers)

In the existing `adjustStockAction` (already in `cart.actions.ts` or
`admin.actions.ts`), after updating inventory:

```typescript
// After updating inventory.currentStock:
if (updatedStock.currentStock <= updatedStock.lowStockThreshold && updatedStock.currentStock > 0) {
  await prisma.stockAlert.create({
    data: {
      skuId: sku.id,
      alertType: 'LOW_STOCK',
      threshold: updatedStock.lowStockThreshold,
      currentStock: updatedStock.currentStock,
      status: 'OPEN',
    },
  });
} else if (updatedStock.currentStock === 0) {
  await prisma.stockAlert.create({
    data: {
      skuId: sku.id,
      alertType: 'OUT_OF_STOCK',
      threshold: 0,
      currentStock: 0,
      status: 'OPEN',
    },
  });
}
```

### Option B: Cron job (for periodic checks)

A scheduled job (via the webDevReview cron tool or a VPS cron) that scans
all inventory records and creates alerts for any below-threshold SKUs that
don't already have an OPEN alert.

---

## 9. Implementation Estimate (when approved)

| Phase | What | Time |
|---|---|---|
| 1 | Schema changes + migration (new models, enum value) | 1 hour |
| 2 | Auth: stock login + middleware guard + session cookie | 2 hours |
| 3 | Stock dashboard page (overview cards + alert feed) | 3 hours |
| 4 | Alert management page (acknowledge/resolve) | 2 hours |
| 5 | Movement log page (filterable table + CSV export) | 2 hours |
| 6 | Count session: create + checklist UI + submit | 4 hours |
| 7 | Reconciliation approval page (manager) | 2 hours |
| 8 | Alert generation logic (application-level triggers) | 2 hours |
| 9 | Aesthetic: dark cinematic design system (match the site) | 2 hours |
| **Total** | | **~20 hours** |

---

## 10. Open Questions for Client

1. **Who are the stock employees?** Are they the same people as the admin users, or a separate team that should NOT have access to orders/payments/customers?

2. **Barcode scanning?** Should the stock count UI support barcode scanning (via a phone camera or USB scanner) for faster counting? This would need a WebRTC/BarcodeDetector API integration.

3. **Mobile-first?** Stock clerks will likely use phones/tablets on the warehouse floor. Should the panel be mobile-first (not just responsive)?

4. **Multi-warehouse?** Currently the schema has no warehouse concept — all inventory is in one pool. If the client has multiple warehouses, we need a `Warehouse` model and `inventory.warehouseId`.

5. **Email/SMS alerts?** Should low-stock alerts also send an email or SMS to the stock manager, or is the in-app alert feed sufficient?

6. **Approval workflow for adjustments?** Currently `adjustStockAction` can be run by any admin. Should stock adjustments above a certain threshold (e.g., >10 units) require dual approval?

---

> **Do NOT implement any of this until the client confirms the requirement and answers the open questions above.** This document is a research artifact.

---

<p align="center">
<em>Authored by Omkar Kardile — Patel Networks / MegaTech</em><br/>
<sub>Research document — not implemented</sub>
</p>
