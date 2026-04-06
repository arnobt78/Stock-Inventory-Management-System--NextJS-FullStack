# PR #3 — Plan & Documentation (attach this file when ready to execute)

## 1. What this is

- **Repository:** `arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack` (or the local clone used in this workspace, e.g. `stock-inventory`).
- **PR #3:** "feat: Implement Stock Movement Ledger and UI refinements"
- **Author:** `rawalharshvardhan26-byte` (external contributor; repo owner does not know this person).
- **Scope:** 1 commit, 37 files changed (+1,569 / -771). Adds Move History page, Stock overview, warehouse enhancements (code/location/description/isActive), replaces StockAllocation with Stock/StockMovement, new API routes and UI.
- **CodeRabbit:** Automated review left **16 actionable comments** — Critical (auth, userId, tenant scoping, transactions, delete order), Major (validation, error messages, formula injection), Minor, and Nitpick. These should be fixed before merging for a stable, production-ready codebase.
- **Do not merge PR #3 directly into main.** We use our own branch and apply fixes there, then merge that branch into main and close PR #3 without merging it.

---

## 2. Agreed plan (no one else’s branch merged into main)

1. **Create a new branch from main** (in the repo owner’s repo), e.g. `feature/stock-ledger-with-fixes`. Main stays untouched.
2. **Bring the PR’s code into that branch** (not the other way around):
   - Option A: On GitHub, open PR #3 and change the base branch from `main` to `feature/stock-ledger-with-fixes`, then merge the PR into that branch.
   - Option B: Add the contributor’s repo as a remote and merge their branch `feature/backend-stabilization-fixes-final` into `feature/stock-ledger-with-fixes`.
   - Result: `feature/stock-ledger-with-fixes` = current main + all 37-file Stock Ledger changes.
3. **Work only on that branch:** In the workspace, checkout `feature/stock-ledger-with-fixes`. The AI assistant reads the files in the workspace and the CodeRabbit suggestions in this doc, then applies fixes (auth, userId, validation, error handling, transactions, delete order, etc.) in that branch. No need to copy-paste 37 files; one repo with that branch checked out is enough.
4. **When everything is fixed and tested:** Merge `feature/stock-ledger-with-fixes` into `main`. Then **close PR #3 without merging it**. Optionally delete the temporary branch. Result: main has the feature + fixes; we never merged the unknown contributor’s branch directly.

---

## 3. What to do when you’re ready (for you or the AI)

- **You:** Create the branch from main (e.g. `feature/stock-ledger-with-fixes`), then bring PR #3’s changes into it (step 2 above). Checkout that branch in your workspace.
- **You:** Tell the AI: “Apply all CodeRabbit suggestions from GITHUB_CODERABBIT_SUGGESTION_PR.md on this branch” (and attach this file if needed).
- **AI:** Uses this file as the list of required fixes, edits the code in the current branch only (no GitHub merge), following the Critical/Major/Minor/Nitpick items and the “Suggested change” / “Prompt for AI Agents” text in the sections below.
- **You:** Commit, push, run tests/build, then merge the branch into main and close PR #3.

---

## 4. CodeRabbit summary (must-fix vs nice-to-fix)

- **Critical (must fix):** Auth and `userId` in stock-movements route; `userId` in stocks `[id]` update; require `userId` in `getAllMovements` and scope move-history page by user; make stock create + movement atomic (transaction); delete order in `delete-all-data.ts` (Stock before Product).
- **Major:** Validate filter params and numeric payloads (400 for bad input); don’t expose `error.message` in API responses; scope warehouse duplicate checks by tenant; validate `reservedQuantity`; formula sanitization in warehouse export; use shared `queryKeys.stocks` in StockOverview and add error state.
- **Minor/Nitpick:** Card copy vs metric (e.g. “Movements today”), time format, comment and route constant cleanup, `any[]` → concrete type, normalize search term once, aria-labels, Prisma indexes. Fix as part of the same pass when convenient.

---

## 5. Raw PR / CodeRabbit content (below)

The rest of this file is the original email thread and full CodeRabbit review (inline comments, suggested changes, prompts). Use it as the reference when applying the fixes above.

---

[arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack] feat:Implement Stock Movement Ledger and UI refinements (PR #3)4

github.com
From:
<notifications@github.com>
Unsubscribe
To:
arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack
Cc:
Subscribed

Sat, Mar 14 at 11:41 AM

You can view, comment on, or merge this pull request online at:
<https://github.com/arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack/pull/3>

Commit Summary
f337bf4 Implement Stock Movement Ledger and UI refinements
File Changes (37 files)
M app/api/portal/client/browse-meta/route.ts (4)
D app/api/stock-allocations/route.ts (224)
A app/api/stock-movements/route.ts (59)
A app/api/stocks/[id]/route.ts (54)
A app/api/stocks/product/[productId]/route.ts (36)
A app/api/stocks/route.ts (69)
A app/api/stocks/warehouse/[warehouseId]/route.ts (36)
M app/api/warehouses/route.ts (86)
A app/inventory/move-history/page.tsx (31)
A app/inventory/stock/page.tsx (25)
R app/settings/warehouses/[id]/page.tsx (0)
R app/settings/warehouses/page.tsx (0)
M components/Pages/WarehouseDetailPage.tsx (30)
M components/admin/AdminMyActivityContent.tsx (4)
M components/layouts/AdminSidebar.tsx (9)
M components/layouts/Navbar.tsx (3)
M components/layouts/SidebarLayout.tsx (3)
M components/warehouses/WarehouseDialog.tsx (118)
M components/warehouses/WarehouseFilters.tsx (29)
M components/warehouses/WarehouseList.tsx (44)
M components/warehouses/WarehouseTable.tsx (9)
M components/warehouses/WarehouseTableColumns.tsx (36)
M hooks/queries/use-stock-allocation.ts (6)
M lib/react-query/config.ts (14)
M lib/react-query/invalidate-all.ts (2)
M lib/server/dashboard-data.ts (8)
M lib/server/warehouses-data.ts (14)
A modules/stock-movement/api/stock-movement.service.ts (96)
A modules/stock-movement/components/MoveHistory.tsx (272)
A modules/stock/api/stock.service.ts (151)
A modules/stock/components/StockDetailsModal.tsx (101)
A modules/stock/components/StockOverview.tsx (330)
M package-lock.json (26)
M prisma/schema.prisma (54)
D prisma/stock-allocation.ts (332)
M scripts/delete-all-data.ts (4)
M types/warehouse.ts (21)
Patch Links:
<https://github.com/arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack/pull/3.patch>
<https://github.com/arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack/pull/3.diff>
—
Reply to this email directly, view it on GitHub, or unsubscribe.
You are receiving this because you are subscribed to this thread.

vercel[bot]

github.com
From:
<notifications@github.com>
Unsubscribe
To:
arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack
Cc:
Subscribed

Sat, Mar 14 at 11:41 AM

vercel[bot]
left a comment
(arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack#3)
@Pacho-sudo is attempting to deploy a commit to the Arnob Mahmud's projects Team on Vercel.

A member of the Team first needs to authorize it.

—
Reply to this email directly, view it on GitHub, or unsubscribe.
You are receiving this because you are subscribed to this thread.

coderabbitai[bot]

github.com
From:
<notifications@github.com>
Unsubscribe
To:
arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack
Cc:
Subscribed

Sat, Mar 14 at 11:42 AM

coderabbitai[bot]
left a comment
(arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack#3)
Note

Currently processing new changes in this PR. This may take a few minutes, please wait...

⚙️ Run configuration
Configuration used: defaults

Review profile: CHILL

Plan: Pro

Run ID: 8b7ad195-5150-403f-8604-6a46f9e15441

📥 Commits
Reviewing files that changed from the base of the PR and between 82488e9 and f337bf4.

⛔ Files ignored due to path filters (1)
package-lock.json is excluded by !\*\*/package-lock.json
📒 Files selected for processing (36)
app/api/portal/client/browse-meta/route.ts
app/api/stock-allocations/route.ts
app/api/stock-movements/route.ts
app/api/stocks/[id]/route.ts
app/api/stocks/product/[productId]/route.ts
app/api/stocks/route.ts
app/api/stocks/warehouse/[warehouseId]/route.ts
app/api/warehouses/route.ts
app/inventory/move-history/page.tsx
app/inventory/stock/page.tsx
app/settings/warehouses/[id]/page.tsx
app/settings/warehouses/page.tsx
components/Pages/WarehouseDetailPage.tsx
components/admin/AdminMyActivityContent.tsx
components/layouts/AdminSidebar.tsx
components/layouts/Navbar.tsx
components/layouts/SidebarLayout.tsx
components/warehouses/WarehouseDialog.tsx
components/warehouses/WarehouseFilters.tsx
components/warehouses/WarehouseList.tsx
components/warehouses/WarehouseTable.tsx
components/warehouses/WarehouseTableColumns.tsx
hooks/queries/use-stock-allocation.ts
lib/react-query/config.ts
lib/react-query/invalidate-all.ts
lib/server/dashboard-data.ts
lib/server/warehouses-data.ts
modules/stock-movement/api/stock-movement.service.ts
modules/stock-movement/components/MoveHistory.tsx
modules/stock/api/stock.service.ts
modules/stock/components/StockDetailsModal.tsx
modules/stock/components/StockOverview.tsx
prisma/schema.prisma
prisma/stock-allocation.ts
scripts/delete-all-data.ts
types/warehouse.ts

---

< Bugs in your code are closer than they appear. >

---

\
 \ \
 \ /\
 ( )
.( o ).
✨ Finishing Touches 🧪 Generate unit tests (beta)
Create PR with unit tests
Post copyable unit tests in a comment
📝 Coding Plan
Generate coding plan for human review comments
Thanks for using CodeRabbit! It's free for OSS, and your support helps us grow. If you like it, consider giving us a shout-out.

❤️ Share
X
Mastodon
Reddit
LinkedIn
Comment @coderabbitai help to get the list of available commands and usage tips.

Tip

You can make CodeRabbit's review stricter and more nitpicky using the `assertive` profile, if that's what you prefer.
Change the reviews.profile setting to assertive to make CodeRabbit's nitpick more issues in your PRs.

—
Reply to this email directly, view it on GitHub, or unsubscribe.
You are receiving this because you are subscribed to this thread.

coderabbitai[bot]

github.com
From:
<notifications@github.com>
Unsubscribe
To:
arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack
Cc:
Subscribed

Sat, Mar 14 at 11:56 AM

@coderabbitai[bot] commented on this pull request.

Actionable comments posted: 16

Note

Due to the large number of review comments, Critical, Major severity comments were prioritized as inline comments.

Caution

Some comments are outside the diff and can’t be posted inline due to platform limitations.

⚠️ Outside diff range comments (2)
components/warehouses/WarehouseDialog.tsx (1)
112-114: ⚠️ Potential issue | 🟠 Major

Validate code before submit to block whitespace-only values.

On Line 114 only name is validated. A code like " " passes HTML required but becomes "" after trim() on Lines 120/130.

🔧 Suggested fix
const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();

- if (!name.trim()) return;

- if (!name.trim() || !code.trim()) return;
  Also applies to: 120-123, 130-133

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@components/warehouses/WarehouseDialog.tsx` around lines 112 - 114, The submit
handler handleSubmit currently only validates name and allows whitespace-only
values for code; change it to also check code.trim() (e.g., if (!name.trim() ||
!code.trim()) return;) so whitespace-only codes are blocked before submission,
and apply the same additional validation where similar submission paths exist
(the other branches that trim code around the create/update logic inside the
component) to ensure code is trimmed and validated consistently before use.
components/warehouses/WarehouseFilters.tsx (1)
95-107: ⚠️ Potential issue | 🟠 Major

Sanitize CSV/XLSX cell values to prevent formula injection.

Exported fields (name, code, location, description) can start with =, +, -, or @. Opening such files in spreadsheet software can execute formulas.

💡 Suggested fix

- const safeSpreadsheetCell = (value: string) =>
- /^[=+\-@]/.test(value) ? `'${value}` : value;

  const csvData = filteredWarehouses.map((warehouse) => ({

-        Name: warehouse.name,
-        Code: warehouse.code,

-        Name: safeSpreadsheetCell(warehouse.name),
-        Code: safeSpreadsheetCell(warehouse.code),
         Status: warehouse.isActive ? "Active" : "Inactive",

-        Location: warehouse.location || "-",
-        Description: warehouse.description || "-",

-        Location: safeSpreadsheetCell(warehouse.location || "-"),
-        Description: safeSpreadsheetCell(warehouse.description || "-"),
  Apply the same sanitization in the Excel mapping block as well.

Also applies to: 151-163

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@components/warehouses/WarehouseFilters.tsx` around lines 95 - 107, Sanitize
exported spreadsheet cell values to prevent formula injection by creating/using
a helper (e.g., sanitizeCellValue) and applying it to all user-controlled fields
(warehouse.name, warehouse.code, warehouse.location, warehouse.description) when
building csvData and the Excel mapping; the helper should detect leading
characters '=', '+', '-', '@' and neutralize them (for example by prefixing with
an apostrophe or otherwise escaping) and then replace the direct uses in the
csvData mapping and the Excel export block so both CSV and XLSX exports use the
sanitized values.
🟡 Minor comments (5)
modules/stock-movement/components/MoveHistory.tsx-122-125 (1)
122-125: ⚠️ Potential issue | 🟡 Minor

Card copy does not match the computed metric.

The card says “Movements in last 24h” (Line 124), but the logic uses isSameDay(...) (Line 66), which is calendar day, not rolling 24 hours.

Also applies to: 66-66

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@modules/stock-movement/components/MoveHistory.tsx` around lines 122 - 125,
The card copy “Movements in last 24h” is incorrect for the metric computed by
isSameDay(...) in MoveHistory (stats.today); either update the description to
match the calendar-day metric (e.g., "Movements today") or change the
calculation for stats.today to use a 24-hour window (e.g., replace
isSameDay(...) logic with a check like eventDate >= now - 24 hours). Locate the
code that computes stats.today (uses isSameDay) and the card rendering that
passes description="Movements in last 24h" and make them consistent by applying
one of the two fixes.
lib/server/dashboard-data.ts-616-616 (1)
616-616: ⚠️ Potential issue | 🟡 Minor

Normalize description before fallback to avoid blank chart labels.

On Line 616, whitespace-only descriptions bypass the fallback and produce empty labels. Trim before fallback.

🔧 Suggested fix

- type: g.description || "(Unspecified)",

- type: g.description?.trim() || "(Unspecified)",
  🤖 Prompt for AI Agents
  Verify each finding against the current code and only fix it if needed.

In `@lib/server/dashboard-data.ts` at line 616, The assignment for the chart label
uses g.description directly so whitespace-only strings produce empty labels;
update the logic that sets the object property type (where it currently reads
type: g.description || "(Unspecified)") to trim g.description first and fall
back when the trimmed value is empty — i.e., compute a trimmedDesc from
g.description?.trim() and use trimmedDesc || "(Unspecified)" for the type field
in the same mapping/return block.
modules/stock-movement/components/MoveHistory.tsx-201-201 (1)
201-201: ⚠️ Potential issue | 🟡 Minor

Use hh:mm a instead of HH:mm a for 12-hour time format.

Line 201 uses HH:mm a, which incorrectly combines a 24-hour token (HH = 00–23) with an AM/PM marker (a). Use hh:mm a for 12-hour format (01–12 with AM/PM), or HH:mm for 24-hour format without the marker.

🔧 Suggested fix

-                        {format(new Date(movement.createdAt), "HH:mm a")}

-                        {format(new Date(movement.createdAt), "hh:mm a")}
  🤖 Prompt for AI Agents
  Verify each finding against the current code and only fix it if needed.

In `@modules/stock-movement/components/MoveHistory.tsx` at line 201, The time
format is using a 24-hour token with an AM/PM marker in the MoveHistory
component; update the format call that renders movement.createdAt (the
expression format(new Date(movement.createdAt), "HH:mm a")) to use the 12-hour
token "hh:mm a" instead of "HH:mm a" so the displayed time matches AM/PM
notation.
components/warehouses/WarehouseList.tsx-43-44 (1)
43-44: ⚠️ Potential issue | 🟡 Minor

Update the route comment to match the new path.

The comment still references /warehouses, but logic now checks /settings/warehouses, which can mislead future edits.

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@components/warehouses/WarehouseList.tsx` around lines 43 - 44, The inline
comment above the isUserWarehousesPage constant is outdated—update the comment
to reference the actual route checked ("/settings/warehouses") so it matches the
logic that computes isUserWarehousesPage (uses pathname ===
"/settings/warehouses"); edit the comment text near isUserWarehousesPage to
accurately describe that store-wide state cards are shown only on the user
warehouses page at "/settings/warehouses".
modules/stock/components/StockOverview.tsx-34-42 (1)
34-42: ⚠️ Potential issue | 🟡 Minor

Render a dedicated error state instead of “No stock found”.

If /api/stocks fails, users currently fall through to empty-state messaging, which is misleading and hides actual fetch failures.

💡 Suggested fix

-              ) : groupedStocks.length === 0 ? (

-              ) : error ? (
-                <tr>
-                  <td colSpan={6} className="px-6 py-12 text-center text-rose-600 dark:text-rose-400">
-                    Failed to load stock data. Please try again.
-                  </td>
-                </tr>
-              ) : groupedStocks.length === 0 ? (
  Also applies to: 235-245

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@modules/stock/components/StockOverview.tsx` around lines 34 - 42, The
component currently uses useQuery (queryKey ["stocks-all"]) and only renders an
empty-state ("No stock found") when data is falsy, which hides fetch errors;
update the StockOverview render logic to check the query's error and isLoading
first: if isLoading return a loading state, if error return a dedicated error UI
showing the error.message (or a user-friendly message) instead of the
empty-state, and only show the "No stock found" empty state when data is defined
and data.length === 0; apply the same change to the other stocks listing block
that also uses useQuery/error handling.
🧹 Nitpick comments (6)
prisma/schema.prisma (1)
156-171: Index the tenant key on the new stock collections.

Both new models persist userId. Once the required tenant scoping is in place, stock lists and movement history will otherwise scan the full collection. StockMovement especially wants a (userId, createdAt) index because the new history reads are naturally tenant-scoped and newest-first.

Suggested indexes
model Stock {
@@
@@unique([productId, warehouseId])
@@index([productId])
@@index([warehouseId])

- @@index([userId])
  }
  @@
  model StockMovement {
  @@
  @@index([productId])
- @@index([userId, createdAt])
  @@index([sourceWarehouseId])
  @@index([destinationWarehouseId])
  @@index([createdAt])
  }
  Also applies to: 395-416

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@prisma/schema.prisma` around lines 156 - 171, Add tenant-scoped indexes to
the new models so queries filter by userId efficiently: in the Stock model add
an index on userId (e.g., @@index([userId])) in addition to existing indexes; in
the StockMovement model add an index on userId and createdAt to support
tenant-scoped newest-first reads (e.g., @@index([userId, createdAt])). Locate
the Stock model (symbols: Stock, userId) and the StockMovement model (symbols:
StockMovement, userId, createdAt) and add these @@index declarations.
hooks/queries/use-stock-allocation.ts (1)
20-20: Finish the StockAllocation → stocks rename here.

The cache keys now use stocks, but the file name, exported hook names, API client namespace, and toast copy still use stock allocation. Keeping both terms around makes the new stock surface harder to trace and easier to invalidate incorrectly later.

Also applies to: 33-33, 46-46

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@hooks/queries/use-stock-allocation.ts` at line 20, The file still uses
"StockAllocation" terminology in names and messages even though cache keys moved
to queryKeys.stocks; update all remaining identifiers and user-facing text in
this file to "stocks" — rename the exported hook (e.g., useStockAllocation ->
useStocks or useStocks\*), change the API client namespace/instance references
(e.g., stockAllocationClient -> stocksClient or client.stocks), and update any
toast/copy that mentions "stock allocation" to "stocks" so the hook name, API
client calls, and toasts match queryKeys.stocks (also apply the same rename at
the other two occurrences referenced).
modules/stock-movement/components/MoveHistory.tsx (1)
152-166: Add accessible names to search and filter controls.

The native input/select controls have no explicit label. Add aria-label (or visible labels) for screen-reader clarity.

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@modules/stock-movement/components/MoveHistory.tsx` around lines 152 - 166, In
MoveHistory.tsx the search input (bound to searchTerm / setSearchTerm) and the
type filter select (bound to typeFilter / setTypeFilter) lack accessible names;
add descriptive aria-label attributes (or visible <label> elements) to both
controls—for example an aria-label like "Search by product, SKU or reference" on
the input and "Filter by activity type" on the select—so screen readers can
identify their purpose while keeping the existing class names and change
handlers intact.
components/layouts/Navbar.tsx (1)
192-193: Unify warehouse route definitions across navigation surfaces.

Navbar now routes Warehouses to /settings/warehouses, while components/layouts/AdminSidebar.tsx still points to /admin/warehouses (Line 95). Centralizing route constants will prevent split navigation behavior.

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@components/layouts/Navbar.tsx` around lines 192 - 193, Navbar currently uses
"/settings/warehouses" while AdminSidebar still uses "/admin/warehouses",
causing inconsistent navigation; create a single exported route constant (e.g.,
WAREHOUSE_ROUTE or ROUTES.WAREHOUSES) in a central routes/constants module and
update both components (Navbar.tsx entry with label "Warehouses" and
AdminSidebar.tsx's warehouses link) to import and use that constant so both
navigation surfaces point to the same path.
components/warehouses/WarehouseList.tsx (1)
49-51: Avoid any[] for badge collections.

Using any[] here drops compile-time safety. Prefer a concrete badge type (or inline [] directly at call sites).

♻️ Suggested typing cleanup

- const warehouseTypeBadges: any[] = [];
- const warehousesPageTypeBadges: any[] = [];

- const warehouseTypeBadges: Array<{ label: string; value: number }> = [];
- const warehousesPageTypeBadges: Array<{ label: string; value: number }> = [];
  🤖 Prompt for AI Agents
  Verify each finding against the current code and only fix it if needed.

In `@components/warehouses/WarehouseList.tsx` around lines 49 - 51, The two arrays
warehouseTypeBadges and warehousesPageTypeBadges use the unsafe any[] type;
change them to a concrete badge type such as React.ReactNode[] or JSX.Element[]
(or a specific BadgeProps[] if you store prop objects) to restore compile-time
safety, or remove the arrays and construct badges inline at call sites; update
usages in WarehouseList.tsx where warehouseTypeBadges and
warehousesPageTypeBadges are pushed/returned so their element type matches the
chosen concrete type.
components/warehouses/WarehouseTable.tsx (1)
61-66: Normalize the search term once before field checks.

Current logic recomputes searchTerm.toLowerCase() multiple times per row.

⚡ Optional micro-refactor
const filteredData = useMemo(() => {

- const normalizedSearch = searchTerm.toLowerCase();
  return data.filter((warehouse) => {
  const searchMatch =
  !searchTerm ||

-        warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
-        warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||

-        warehouse.name.toLowerCase().includes(normalizedSearch) ||
-        warehouse.code.toLowerCase().includes(normalizedSearch) ||
         (warehouse.location &&

-          warehouse.location.toLowerCase().includes(searchTerm.toLowerCase()));

-          warehouse.location.toLowerCase().includes(normalizedSearch));
  🤖 Prompt for AI Agents
  Verify each finding against the current code and only fix it if needed.

In `@components/warehouses/WarehouseTable.tsx` around lines 61 - 66, The search
logic recomputes searchTerm.toLowerCase() for each field; fix by normalizing the
term once before the check (e.g., compute a local const like normalizedSearch =
searchTerm?.toLowerCase() || '') and then use normalizedSearch in the
searchMatch expression (replace calls to searchTerm.toLowerCase() in the
searchMatch calculation that references warehouse.name, warehouse.code, and
warehouse.location). This keeps the existing behavior but avoids repeated
lowercase calls in the WarehouseTable component's searchMatch logic.
🤖 Prompt for all review comments with AI agents
Verify each finding against the current code and only fix it if needed.

Inline comments:
In `@app/api/stock-movements/route.ts`:

- Around line 2-4: Both GET and POST handlers in route.ts must authenticate
  requests: resolve the session up front (use the same helper as siblings, e.g.
  getSessionFromRequest(req) or getSession) and if no session return a 401
  response, then pass the authenticated user id into StockMovementService methods
  instead of using a hardcoded placeholder; update both the GET handler (where
  movements are currently publicly returned) and the POST handler (where new
  movements are being created under a placeholder owner) to call/get session
  before any work and forward session.id into StockMovementService methods (refer
  to StockMovementService and StockMovementType in this file).
- Around line 11-16: Validate and reject malformed filter params before calling
  the service: check that movementType (from movementType variable) is either
  undefined or one of the StockMovementType enum values and that startDate/endDate
  strings parse to valid dates (new Date(...) yields a valid date and not NaN); if
  any validation fails return a 400 response (e.g., throw new Response or
  NextResponse with status 400 and a clear error message). Also ensure you stop
  execution when rejecting (don’t call the Prisma/service methods) and optionally
  validate startDate <= endDate if both provided. Use the existing variables
  movementType, startDate, endDate and the StockMovementType enum to implement
  these checks.

In `@app/api/stocks/`[id]/route.ts:

- Around line 30-39: The update call omits the user id, causing downstream
  movement logging to see data.userId as undefined; add the authenticated user's
  id into the update payload (e.g., set dataToUpdate.userId = user.id) before
  calling StockService.updateStock(id, dataToUpdate) so movement/ledger flows have
  the required userId; if your updateStock signature expects a separate userId
  parameter, pass user.id as that argument instead and ensure references to
  data.userId in movement logging will receive a valid value.
- Around line 31-36: When parsing incoming numeric fields `quantity` and
  `reservedQuantity` in the route handler (where `dataToUpdate.quantity` and
  `dataToUpdate.reservedQuantity` are set using `parseInt`), validate the parsed
  values and reject invalid payloads with a 400 error before calling the service:
  parse each value, check Number.isInteger(result) (or !Number.isNaN(result)), and
  if invalid return a 400/Bad Request with a clear message; only assign the parsed
  integer to `dataToUpdate` when the value is valid to avoid letting `NaN`
  propagate to the service layer.

In `@app/api/stocks/product/`[productId]/route.ts:

- Around line 29-33: The catch block currently returns error.message to the
  client which can leak internals; instead keep logging the full error server-side
  (e.g., via console.error or processLogger) including productId, but change the
  NextResponse.json payload to a generic client-safe message (e.g., "Failed to
  fetch stock for product" or "Internal server error") and a 500 status; update
  the catch in route.ts (the block referencing productId and NextResponse.json) to
  remove error.message from the response body while retaining detailed server-side
  logging.

In `@app/api/stocks/route.ts`:

- Around line 36-50: The POST handler currently does quantity: quantity ?
  parseInt(String(quantity), 10) : 0 which allows malformed numeric strings (NaN)
  to propagate and cause 500s; update the request validation in the route handler
  to explicitly parse and validate quantity (use Number or parseInt and check
  Number.isFinite/Number.isInteger or isNaN) and return NextResponse.json({
  success: false, error: "Invalid quantity" }, { status: 400 }) when parsing fails
  or the value is negative/non-integer as per business rules; apply the same
  validation fix to the corresponding update branch that calls
  StockService.createStock (and any StockService.update/modify calls in the 54-67
  region) so all entry points reject bad quantity input with a 400 instead of
  allowing NaN to reach the service.

In `@app/api/stocks/warehouse/`[warehouseId]/route.ts:

- Around line 29-33: The catch block in the route handler currently returns
  error.message to the client; instead keep detailed diagnostics in server logs
  and return a generic error payload. Update the catch for the route (where
  warehouseId is referenced and NextResponse.json is used) to log the full error
  (console.error or processLogger) but change the response body to { success:
  false, error: "Failed to fetch stock for warehouse" } (or similar generic text)
  and preserve the 500 status; do not include error.message or any stack trace in
  the JSON response.

In `@app/api/warehouses/route.ts`:

- Around line 68-79: The duplicate-name/code pre-checks
  (prisma.warehouse.findFirst that sets existingWarehouse) are not scoped to the
  tenant and should include userId in the where clause so the OR becomes OR: [{
  userId, name: name.trim() }, { userId, code: code.trim() }]; apply the same
  scope to the other duplicate-check block later (the one checking code/name
  around the same logic at the other location). Also update the Prisma schema to
  enforce compound unique constraints on (userId, name) and (userId, code) in the
  Warehouse model so the DB-level uniques match the API behavior.

In `@app/inventory/move-history/page.tsx`:

- Around line 16-19: MoveHistoryPage currently calls
  StockMovementService.getAllMovements({}) with no user/tenant context; change the
  page to enforce authentication, obtain the current user's id (and tenant id if
  applicable) and call StockMovementService.getAllMovements({ userId, tenantId })
  instead; also update StockMovementService.getAllMovements to accept and apply
  filtering by userId/tenantId so it returns only movements scoped to that
  user/tenant (ensure both the page uses the auth method you have in the app and
  the service validates/filters by those IDs).

In `@components/warehouses/WarehouseFilters.tsx`:

- Around line 66-69: The current filter predicate in WarehouseFilters.tsx only
  checks warehouse.name and warehouse.location; update the predicate(s) (the
  boolean expression using searchTerm and warehouse.name/warehouse.location) to
  also check warehouse.code (e.g., include
  warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) with proper
  null/undefined guards), and apply the same change to the other identical
  predicate used elsewhere in the component so the UI contract "search by code" is
  honored.

In `@modules/stock-movement/api/stock-movement.service.ts`:

- Around line 33-50: createMovement currently only inserts into stockMovement
  which can leave Stock balances stale; wrap the movement insert, the affected
  Stock updates, and the ledger insert inside a single Prisma transaction (use
  prisma.$transaction) so all three actions succeed or fail together. In
  createMovement, within one transaction: create the stockMovement (existing
  behavior), adjust sourceStock and/or destinationStock rows' quantity deltas
  according to movementType (decrement source for OUT/TRANSFER, increment
  destination for IN/TRANSFER, or apply adjustment sign for ADJUSTMENT), and
  insert the StockLedger/stockLedger record referencing the movementId; ensure you
  update Stocks by productId+warehouseId (the Stock model) and create missing
  Stock rows if appropriate, and return the created movement with includes as
  before. Use the function name createMovement and the models stockMovement, Stock
  (or stocks), and StockLedger (or ledger) to locate code to change.
- Around line 56-94: The getAllMovements function currently allows callers to
  omit userId which exposes all tenants' movements; make userId required in the
  filters type (remove optional on userId) and ensure you seed where.userId =
  filters.userId before building other where clauses so the Prisma query
  (prisma.stockMovement.findMany) always filters by user; update any callers
  (e.g., app/inventory/move-history/page.tsx) to pass the current user's id when
  calling getAllMovements.

In `@modules/stock/api/stock.service.ts`:

- Around line 56-67: The current read-then-create duplicate check
  (prisma.stock.findUnique) and separate writes cause race conditions and ledger
  divergence if movement creation fails; replace both operations with a single DB
  transaction that creates the stock and the corresponding movement inside the
  same transaction (use prisma.$transaction with prisma.stock.create and
  prisma.movement.create), remove the pre-check and rely on the DB unique
  constraint, and catch Prisma unique-constraint errors (P2002) to rethrow a
  friendly "Stock record already exists..." error while letting other errors
  bubble up so the transaction can rollback.
- Around line 129-131: Before persisting, validate the computed reservedQuantity
  (the expression data.reservedQuantity ?? stock.reservedQuantity used where you
  set quantity: updatedQuantity) to ensure it's not negative and does not exceed
  the total (updatedQuantity); if invalid, return/throw a validation error (or
  reject the update) rather than saving. Update the stock update routine in
  stock.service.ts (the function that builds the object with quantity:
  updatedQuantity, reservedQuantity: ...) to compute newReserved =
  data.reservedQuantity ?? stock.reservedQuantity, check newReserved >= 0 &&
  newReserved <= updatedQuantity, and handle failures by throwing a descriptive
  error or returning a 4xx validation response before calling the persistence
  layer.

In `@modules/stock/components/StockOverview.tsx`:

- Line 35: The component StockOverview uses a hardcoded queryKey ["stocks-all"]
  which diverges from the shared query namespace and prevents proper cache
  invalidation; update StockOverview to import the shared queryKeys (e.g.,
  queryKeys.stocks.all) and replace the literal ["stocks-all"] with that imported
  key so mutations targeting queryKeys.stocks.all will invalidate this query
  correctly.

In `@scripts/delete-all-data.ts`:

- Around line 38-39: The deletions are currently out of dependency order; move
  the call to prisma.stock.deleteMany({}) so it runs before
  prisma.product.deleteMany({}) to delete child Stock records prior to parent
  Product records; update the sequence where prisma.stock.deleteMany and
  console.log(`Stock: ${stock.count}`) appear before the
  prisma.product.deleteMany and its log to maintain children-before-parents
  deletion.

---

Outside diff comments:
In `@components/warehouses/WarehouseDialog.tsx`:

- Around line 112-114: The submit handler handleSubmit currently only validates
  name and allows whitespace-only values for code; change it to also check
  code.trim() (e.g., if (!name.trim() || !code.trim()) return;) so whitespace-only
  codes are blocked before submission, and apply the same additional validation
  where similar submission paths exist (the other branches that trim code around
  the create/update logic inside the component) to ensure code is trimmed and
  validated consistently before use.

In `@components/warehouses/WarehouseFilters.tsx`:

- Around line 95-107: Sanitize exported spreadsheet cell values to prevent
  formula injection by creating/using a helper (e.g., sanitizeCellValue) and
  applying it to all user-controlled fields (warehouse.name, warehouse.code,
  warehouse.location, warehouse.description) when building csvData and the Excel
  mapping; the helper should detect leading characters '=', '+', '-', '@' and
  neutralize them (for example by prefixing with an apostrophe or otherwise
  escaping) and then replace the direct uses in the csvData mapping and the Excel
  export block so both CSV and XLSX exports use the sanitized values.

---

Minor comments:
In `@components/warehouses/WarehouseList.tsx`:

- Around line 43-44: The inline comment above the isUserWarehousesPage constant
  is outdated—update the comment to reference the actual route checked
  ("/settings/warehouses") so it matches the logic that computes
  isUserWarehousesPage (uses pathname === "/settings/warehouses"); edit the
  comment text near isUserWarehousesPage to accurately describe that store-wide
  state cards are shown only on the user warehouses page at
  "/settings/warehouses".

In `@lib/server/dashboard-data.ts`:

- Line 616: The assignment for the chart label uses g.description directly so
  whitespace-only strings produce empty labels; update the logic that sets the
  object property type (where it currently reads type: g.description ||
  "(Unspecified)") to trim g.description first and fall back when the trimmed
  value is empty — i.e., compute a trimmedDesc from g.description?.trim() and use
  trimmedDesc || "(Unspecified)" for the type field in the same mapping/return
  block.

In `@modules/stock-movement/components/MoveHistory.tsx`:

- Around line 122-125: The card copy “Movements in last 24h” is incorrect for
  the metric computed by isSameDay(...) in MoveHistory (stats.today); either
  update the description to match the calendar-day metric (e.g., "Movements
  today") or change the calculation for stats.today to use a 24-hour window (e.g.,
  replace isSameDay(...) logic with a check like eventDate >= now - 24 hours).
  Locate the code that computes stats.today (uses isSameDay) and the card
  rendering that passes description="Movements in last 24h" and make them
  consistent by applying one of the two fixes.
- Line 201: The time format is using a 24-hour token with an AM/PM marker in the
  MoveHistory component; update the format call that renders movement.createdAt
  (the expression format(new Date(movement.createdAt), "HH:mm a")) to use the
  12-hour token "hh:mm a" instead of "HH:mm a" so the displayed time matches AM/PM
  notation.

In `@modules/stock/components/StockOverview.tsx`:

- Around line 34-42: The component currently uses useQuery (queryKey
  ["stocks-all"]) and only renders an empty-state ("No stock found") when data is
  falsy, which hides fetch errors; update the StockOverview render logic to check
  the query's error and isLoading first: if isLoading return a loading state, if
  error return a dedicated error UI showing the error.message (or a user-friendly
  message) instead of the empty-state, and only show the "No stock found" empty
  state when data is defined and data.length === 0; apply the same change to the
  other stocks listing block that also uses useQuery/error handling.

---

Nitpick comments:
In `@components/layouts/Navbar.tsx`:

- Around line 192-193: Navbar currently uses "/settings/warehouses" while
  AdminSidebar still uses "/admin/warehouses", causing inconsistent navigation;
  create a single exported route constant (e.g., WAREHOUSE_ROUTE or
  ROUTES.WAREHOUSES) in a central routes/constants module and update both
  components (Navbar.tsx entry with label "Warehouses" and AdminSidebar.tsx's
  warehouses link) to import and use that constant so both navigation surfaces
  point to the same path.

In `@components/warehouses/WarehouseList.tsx`:

- Around line 49-51: The two arrays warehouseTypeBadges and
  warehousesPageTypeBadges use the unsafe any[] type; change them to a concrete
  badge type such as React.ReactNode[] or JSX.Element[] (or a specific
  BadgeProps[] if you store prop objects) to restore compile-time safety, or
  remove the arrays and construct badges inline at call sites; update usages in
  WarehouseList.tsx where warehouseTypeBadges and warehousesPageTypeBadges are
  pushed/returned so their element type matches the chosen concrete type.

In `@components/warehouses/WarehouseTable.tsx`:

- Around line 61-66: The search logic recomputes searchTerm.toLowerCase() for
  each field; fix by normalizing the term once before the check (e.g., compute a
  local const like normalizedSearch = searchTerm?.toLowerCase() || '') and then
  use normalizedSearch in the searchMatch expression (replace calls to
  searchTerm.toLowerCase() in the searchMatch calculation that references
  warehouse.name, warehouse.code, and warehouse.location). This keeps the existing
  behavior but avoids repeated lowercase calls in the WarehouseTable component's
  searchMatch logic.

In `@hooks/queries/use-stock-allocation.ts`:

- Line 20: The file still uses "StockAllocation" terminology in names and
  messages even though cache keys moved to queryKeys.stocks; update all remaining
  identifiers and user-facing text in this file to "stocks" — rename the exported
  hook (e.g., useStockAllocation -> useStocks or useStocks\*), change the API
  client namespace/instance references (e.g., stockAllocationClient ->
  stocksClient or client.stocks), and update any toast/copy that mentions "stock
  allocation" to "stocks" so the hook name, API client calls, and toasts match
  queryKeys.stocks (also apply the same rename at the other two occurrences
  referenced).

In `@modules/stock-movement/components/MoveHistory.tsx`:

- Around line 152-166: In MoveHistory.tsx the search input (bound to searchTerm
  / setSearchTerm) and the type filter select (bound to typeFilter /
  setTypeFilter) lack accessible names; add descriptive aria-label attributes (or
  visible <label> elements) to both controls—for example an aria-label like
  "Search by product, SKU or reference" on the input and "Filter by activity type"
  on the select—so screen readers can identify their purpose while keeping the
  existing class names and change handlers intact.

In `@prisma/schema.prisma`:

- Around line 156-171: Add tenant-scoped indexes to the new models so queries
  filter by userId efficiently: in the Stock model add an index on userId (e.g.,
  @@index([userId])) in addition to existing indexes; in the StockMovement model
  add an index on userId and createdAt to support tenant-scoped newest-first reads
  (e.g., @@index([userId, createdAt])). Locate the Stock model (symbols: Stock,
  userId) and the StockMovement model (symbols: StockMovement, userId, createdAt)
  and add these @@index declarations.
  ℹ️ Review info ⚙️ Run configuration
  Configuration used: defaults

Review profile: CHILL

Plan: Pro

Run ID: 8b7ad195-5150-403f-8604-6a46f9e15441

📥 Commits
Reviewing files that changed from the base of the PR and between 82488e9 and f337bf4.

⛔ Files ignored due to path filters (1)
package-lock.json is excluded by !\*\*/package-lock.json
📒 Files selected for processing (36)
app/api/portal/client/browse-meta/route.ts
app/api/stock-allocations/route.ts
app/api/stock-movements/route.ts
app/api/stocks/[id]/route.ts
app/api/stocks/product/[productId]/route.ts
app/api/stocks/route.ts
app/api/stocks/warehouse/[warehouseId]/route.ts
app/api/warehouses/route.ts
app/inventory/move-history/page.tsx
app/inventory/stock/page.tsx
app/settings/warehouses/[id]/page.tsx
app/settings/warehouses/page.tsx
components/Pages/WarehouseDetailPage.tsx
components/admin/AdminMyActivityContent.tsx
components/layouts/AdminSidebar.tsx
components/layouts/Navbar.tsx
components/layouts/SidebarLayout.tsx
components/warehouses/WarehouseDialog.tsx
components/warehouses/WarehouseFilters.tsx
components/warehouses/WarehouseList.tsx
components/warehouses/WarehouseTable.tsx
components/warehouses/WarehouseTableColumns.tsx
hooks/queries/use-stock-allocation.ts
lib/react-query/config.ts
lib/react-query/invalidate-all.ts
lib/server/dashboard-data.ts
lib/server/warehouses-data.ts
modules/stock-movement/api/stock-movement.service.ts
modules/stock-movement/components/MoveHistory.tsx
modules/stock/api/stock.service.ts
modules/stock/components/StockDetailsModal.tsx
modules/stock/components/StockOverview.tsx
prisma/schema.prisma
prisma/stock-allocation.ts
scripts/delete-all-data.ts
types/warehouse.ts
💤 Files with no reviewable changes (2)
app/api/stock-allocations/route.ts
prisma/stock-allocation.ts
In app/api/stock-movements/route.ts:

> +import { getSession } from "next-auth/react"; // Assuming next-auth is used
> +import { StockMovementService } from "@/modules/stock-movement/api/stock-movement.service";
> +import { StockMovementType } from "@prisma/client";
> ⚠️ Potential issue | 🔴 Critical

Use the authenticated user in both handlers.

Sibling inventory routes already call getSessionFromRequest(req), but this endpoint is public on GET and writes movements under a hardcoded placeholder on POST. That exposes movement history and breaks ownership/auditability for writes. Resolve the session up front in both handlers, return 401 when absent, and pass session.id into the service.

Suggested change
import { NextRequest, NextResponse } from "next/server";
-import { getSession } from "next-auth/react"; // Assuming next-auth is used
+import { getSessionFromRequest } from "@/utils/auth";
import { StockMovementService } from "@/modules/stock-movement/api/stock-movement.service";
import { StockMovementType } from "@prisma/client";
@@
export async function GET(req: NextRequest) {
try {

- const session = await getSessionFromRequest(req);
- if (!session) {
-      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
- }
-      const { searchParams } = new URL(req.url);
  @@
  const movements = await StockMovementService.getAllMovements({
-      userId: session.id,
         productId,
         warehouseId,
         movementType,

  @@
  export async function POST(req: NextRequest) {
  try {

- // In a real app, you'd get the user ID from the session
- // const session = await getSession({ req });
- const userId = "manual_admin"; // Placeholder

- const session = await getSessionFromRequest(req);
- if (!session) {
-      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
- }

  const body = await req.json();
  const movement = await StockMovementService.createMovement({
  ...body,

-      userId,

-      userId: session.id,
       });
  Also applies to: 9-26, 39-49

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@app/api/stock-movements/route.ts` around lines 2 - 4, Both GET and POST
handlers in route.ts must authenticate requests: resolve the session up front
(use the same helper as siblings, e.g. getSessionFromRequest(req) or getSession)
and if no session return a 401 response, then pass the authenticated user id
into StockMovementService methods instead of using a hardcoded placeholder;
update both the GET handler (where movements are currently publicly returned)
and the POST handler (where new movements are being created under a placeholder
owner) to call/get session before any work and forward session.id into
StockMovementService methods (refer to StockMovementService and
StockMovementType in this file).
In app/api/stock-movements/route.ts:

> - const { searchParams } = new URL(req.url);

- const productId = searchParams.get("productId") || undefined;
- const warehouseId = searchParams.get("warehouseId") || undefined;
- const movementType = searchParams.get("movementType") as StockMovementType | undefined;
- const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
- const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;
  ⚠️ Potential issue | 🟠 Major

Reject malformed filter params with 400.

An arbitrary movementType string or an invalid date currently falls through to the service and becomes a server error. Validate the enum/date inputs here before calling Prisma so bad requests stay bad requests instead of turning into 500s.

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@app/api/stock-movements/route.ts` around lines 11 - 16, Validate and reject
malformed filter params before calling the service: check that movementType
(from movementType variable) is either undefined or one of the StockMovementType
enum values and that startDate/endDate strings parse to valid dates (new
Date(...) yields a valid date and not NaN); if any validation fails return a 400
response (e.g., throw new Response or NextResponse with status 400 and a clear
error message). Also ensure you stop execution when rejecting (don’t call the
Prisma/service methods) and optionally validate startDate <= endDate if both
provided. Use the existing variables movementType, startDate, endDate and the
StockMovementType enum to implement these checks.
In app/api/stocks/[id]/route.ts:

> - const dataToUpdate: any = {};

- if (quantity !== undefined) {
-      dataToUpdate.quantity = parseInt(String(quantity), 10);
- }
- if (reservedQuantity !== undefined) {
-      dataToUpdate.reservedQuantity = parseInt(String(reservedQuantity), 10);
- }
-
- const updatedStock = await StockService.updateStock(id, dataToUpdate);
- ⚠️ Potential issue | 🔴 Critical

Pass user.id into stock updates to prevent ledger write failures.

On Line 38, StockService.updateStock is called without userId. When quantity changes, movement logging uses data.userId; this becomes undefined, causing update flows to fail after the stock row update has already happened.

💡 Suggested fix

- const dataToUpdate: any = {};

- const dataToUpdate: {
-      userId: string;
-      quantity?: number;
-      reservedQuantity?: number;
- } = { userId: user.id };
  🤖 Prompt for AI Agents
  Verify each finding against the current code and only fix it if needed.

In `@app/api/stocks/`[id]/route.ts around lines 30 - 39, The update call omits the
user id, causing downstream movement logging to see data.userId as undefined;
add the authenticated user's id into the update payload (e.g., set
dataToUpdate.userId = user.id) before calling StockService.updateStock(id,
dataToUpdate) so movement/ledger flows have the required userId; if your
updateStock signature expects a separate userId parameter, pass user.id as that
argument instead and ensure references to data.userId in movement logging will
receive a valid value.
In app/api/stocks/[id]/route.ts:

> - if (quantity !== undefined) {

-      dataToUpdate.quantity = parseInt(String(quantity), 10);
- }
- if (reservedQuantity !== undefined) {
-      dataToUpdate.reservedQuantity = parseInt(String(reservedQuantity), 10);
- }
  ⚠️ Potential issue | 🟠 Major

Reject invalid numeric payloads before calling the service.

On Line 32 and Line 35, parseInt can yield NaN (e.g., "abc"), which currently falls into a 500 path instead of a 400 validation response.

💡 Suggested fix
if (quantity !== undefined) {

-      dataToUpdate.quantity = parseInt(String(quantity), 10);

-      const parsedQuantity = Number(quantity);
-      if (!Number.isInteger(parsedQuantity)) {
-        return NextResponse.json(
-          { success: false, error: "quantity must be an integer." },
-          { status: 400 }
-        );
-      }
-      dataToUpdate.quantity = parsedQuantity;

  }
  if (reservedQuantity !== undefined) {

-      dataToUpdate.reservedQuantity = parseInt(String(reservedQuantity), 10);

-      const parsedReserved = Number(reservedQuantity);
-      if (!Number.isInteger(parsedReserved)) {
-        return NextResponse.json(
-          { success: false, error: "reservedQuantity must be an integer." },
-          { status: 400 }
-        );
-      }
-      dataToUpdate.reservedQuantity = parsedReserved;
       }
  📝 Committable suggestion
  ‼️ IMPORTANT
  Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

⬇️ Suggested change

- if (quantity !== undefined) {
-      dataToUpdate.quantity = parseInt(String(quantity), 10);
- }
- if (reservedQuantity !== undefined) {
-      dataToUpdate.reservedQuantity = parseInt(String(reservedQuantity), 10);
- }

- if (quantity !== undefined) {
-      const parsedQuantity = Number(quantity);
-      if (!Number.isInteger(parsedQuantity)) {
-        return NextResponse.json(
-          { success: false, error: "quantity must be an integer." },
-          { status: 400 }
-        );
-      }
-      dataToUpdate.quantity = parsedQuantity;
- }
- if (reservedQuantity !== undefined) {
-      const parsedReserved = Number(reservedQuantity);
-      if (!Number.isInteger(parsedReserved)) {
-        return NextResponse.json(
-          { success: false, error: "reservedQuantity must be an integer." },
-          { status: 400 }
-        );
-      }
-      dataToUpdate.reservedQuantity = parsedReserved;
- }
  🤖 Prompt for AI Agents
  Verify each finding against the current code and only fix it if needed.

In `@app/api/stocks/`[id]/route.ts around lines 31 - 36, When parsing incoming
numeric fields `quantity` and `reservedQuantity` in the route handler (where
`dataToUpdate.quantity` and `dataToUpdate.reservedQuantity` are set using
`parseInt`), validate the parsed values and reject invalid payloads with a 400
error before calling the service: parse each value, check
Number.isInteger(result) (or !Number.isNaN(result)), and if invalid return a
400/Bad Request with a clear message; only assign the parsed integer to
`dataToUpdate` when the value is valid to avoid letting `NaN` propagate to the
service layer.
In app/api/stocks/product/[productId]/route.ts:

> - } catch (error: any) {

- console.error(`Error fetching stock for product ${productId || 'unknown'}:`, error);
- return NextResponse.json(
-      { success: false, error: error.message || "Failed to fetch stock for product" },
-      { status: 500 }
  ⚠️ Potential issue | 🟠 Major

Do not expose raw exception messages in API responses.

Returning error.message can leak internal details. Log full errors server-side and return a generic client-safe message.

🛡️ Suggested error-handling hardening

- } catch (error: any) {
- console.error(`Error fetching stock for product ${productId || 'unknown'}:`, error);

- } catch (error: unknown) {
- console.error(`Error fetching stock for product ${productId || "unknown"}:`, error);
  return NextResponse.json(

-      { success: false, error: error.message || "Failed to fetch stock for product" },

-      { success: false, error: "Failed to fetch stock for product" },
         { status: 500 }
       );
  }
  📝 Committable suggestion
  ‼️ IMPORTANT
  Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

⬇️ Suggested change

- } catch (error: any) {
- console.error(`Error fetching stock for product ${productId || 'unknown'}:`, error);
- return NextResponse.json(
-      { success: false, error: error.message || "Failed to fetch stock for product" },
-      { status: 500 }

- } catch (error: unknown) {
- console.error(`Error fetching stock for product ${productId || "unknown"}:`, error);
- return NextResponse.json(
-      { success: false, error: "Failed to fetch stock for product" },
-      { status: 500 }
- );
- }
  🤖 Prompt for AI Agents
  Verify each finding against the current code and only fix it if needed.

In `@app/api/stocks/product/`[productId]/route.ts around lines 29 - 33, The catch
block currently returns error.message to the client which can leak internals;
instead keep logging the full error server-side (e.g., via console.error or
processLogger) including productId, but change the NextResponse.json payload to
a generic client-safe message (e.g., "Failed to fetch stock for product" or
"Internal server error") and a 500 status; update the catch in route.ts (the
block referencing productId and NextResponse.json) to remove error.message from
the response body while retaining detailed server-side logging.
In app/api/stocks/route.ts:

> - const body = await req.json();

- const { productId, warehouseId, quantity } = body;
-
- if (!productId || !warehouseId) {
-      return NextResponse.json(
-        { success: false, error: "Product ID and Warehouse ID are required." },
-        { status: 400 }
-      );
- }
-
- const stock = await StockService.createStock({
-      productId,
-      warehouseId,
-      quantity: quantity ? parseInt(String(quantity), 10) : 0,
-      userId: user.id,
  ⚠️ Potential issue | 🟠 Major

Harden POST quantity parsing and return 400 for invalid values.

On Line 49, quantity ? parseInt(...) : 0 accepts malformed numeric strings (resulting in NaN) and those failures currently bubble to 500. Validate explicitly and return 400 for bad input.

💡 Suggested fix
const body = await req.json();
const { productId, warehouseId, quantity } = body;

- let parsedQuantity = 0;
-
- if (quantity !== undefined) {
-      parsedQuantity = Number(quantity);
-      if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
-        return NextResponse.json(
-          { success: false, error: "quantity must be a non-negative integer." },
-          { status: 400 }
-        );
-      }
- }

  const stock = await StockService.createStock({
  productId,
  warehouseId,

-      quantity: quantity ? parseInt(String(quantity), 10) : 0,

-      quantity: parsedQuantity,
         userId: user.id,
       });
  Also applies to: 54-67

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@app/api/stocks/route.ts` around lines 36 - 50, The POST handler currently
does quantity: quantity ? parseInt(String(quantity), 10) : 0 which allows
malformed numeric strings (NaN) to propagate and cause 500s; update the request
validation in the route handler to explicitly parse and validate quantity (use
Number or parseInt and check Number.isFinite/Number.isInteger or isNaN) and
return NextResponse.json({ success: false, error: "Invalid quantity" }, {
status: 400 }) when parsing fails or the value is negative/non-integer as per
business rules; apply the same validation fix to the corresponding update branch
that calls StockService.createStock (and any StockService.update/modify calls in
the 54-67 region) so all entry points reject bad quantity input with a 400
instead of allowing NaN to reach the service.
In app/api/stocks/warehouse/[warehouseId]/route.ts:

> - } catch (error: any) {

- console.error(`Error fetching stock for warehouse ${warehouseId || 'unknown'}:`, error);
- return NextResponse.json(
-      { success: false, error: error.message || "Failed to fetch stock for warehouse" },
-      { status: 500 }
  ⚠️ Potential issue | 🟠 Major

Avoid returning raw backend exception messages.

error.message should not be sent to clients; keep detailed diagnostics in server logs and return a generic message.

🛡️ Suggested fix

- } catch (error: any) {
- console.error(`Error fetching stock for warehouse ${warehouseId || 'unknown'}:`, error);

- } catch (error: unknown) {
- console.error(`Error fetching stock for warehouse ${warehouseId || "unknown"}:`, error);
  return NextResponse.json(

-      { success: false, error: error.message || "Failed to fetch stock for warehouse" },

-      { success: false, error: "Failed to fetch stock for warehouse" },
         { status: 500 }
       );
  }
  📝 Committable suggestion
  ‼️ IMPORTANT
  Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

⬇️ Suggested change

- } catch (error: any) {
- console.error(`Error fetching stock for warehouse ${warehouseId || 'unknown'}:`, error);
- return NextResponse.json(
-      { success: false, error: error.message || "Failed to fetch stock for warehouse" },
-      { status: 500 }

- } catch (error: unknown) {
- console.error(`Error fetching stock for warehouse ${warehouseId || "unknown"}:`, error);
- return NextResponse.json(
-      { success: false, error: "Failed to fetch stock for warehouse" },
-      { status: 500 }
- );
- }
  🤖 Prompt for AI Agents
  Verify each finding against the current code and only fix it if needed.

In `@app/api/stocks/warehouse/`[warehouseId]/route.ts around lines 29 - 33, The
catch block in the route handler currently returns error.message to the client;
instead keep detailed diagnostics in server logs and return a generic error
payload. Update the catch for the route (where warehouseId is referenced and
NextResponse.json is used) to log the full error (console.error or
processLogger) but change the response body to { success: false, error: "Failed
to fetch stock for warehouse" } (or similar generic text) and preserve the 500
status; do not include error.message or any stack trace in the JSON response.
In app/api/warehouses/route.ts:

> - // Check for unique name or code

- const existingWarehouse = await prisma.warehouse.findFirst({
-      where: {
-        OR: [{ name: name.trim() }, { code: code.trim() }]
-      }
- });
-
- if (existingWarehouse) {
-      return NextResponse.json(
-        { error: "Warehouse with this name or code already exists" },
-        { status: 400 },
-      );
  ⚠️ Potential issue | 🟠 Major

Scope duplicate checks to the current tenant.

Every other warehouse lookup in this handler is scoped by userId, but these two pre-checks search the whole collection. That lets one account learn another account's warehouse name/code and blocks valid duplicates across tenants before the write even happens. Add userId to both checks, and make the Prisma uniques compound on (userId, name) / (userId, code) so the model matches the API.

Suggested change
const existingWarehouse = await prisma.warehouse.findFirst({
where: {

-        OR: [{ name: name.trim() }, { code: code.trim() }]

-        userId,
-        OR: [{ name: name.trim() }, { code: code.trim() }],
         }
       });
  @@
  const duplicateCheck = await prisma.warehouse.findFirst({
  where: {
-        userId,
         id: { not: id },

-        OR: [{ name: name.trim() }, { code: code.trim() }]

-        OR: [{ name: name.trim() }, { code: code.trim() }],
         }
       });
  Also applies to: 153-165

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@app/api/warehouses/route.ts` around lines 68 - 79, The duplicate-name/code
pre-checks (prisma.warehouse.findFirst that sets existingWarehouse) are not
scoped to the tenant and should include userId in the where clause so the OR
becomes OR: [{ userId, name: name.trim() }, { userId, code: code.trim() }];
apply the same scope to the other duplicate-check block later (the one checking
code/name around the same logic at the other location). Also update the Prisma
schema to enforce compound unique constraints on (userId, name) and (userId,
code) in the Warehouse model so the DB-level uniques match the API behavior.
In app/inventory/move-history/page.tsx:

> +export default async function MoveHistoryPage() {

- // Fetch initial movements
- const movements = await StockMovementService.getAllMovements({});
- ⚠️ Potential issue | 🔴 Critical

🧩 Analysis chain
🏁 Script executed:

# !/bin/bash

# Verify whether StockMovementService.getAllMovements enforces user scoping internally

fd 'stock-movement.service.ts' --exec sed -n '1,260p' {}
rg -nP 'getAllMovements\s*\(' -C4 modules/stock-movement/api/stock-movement.service.ts
rg -nP 'stockMovement\.findMany|where:\s*\{' -C4 modules/stock-movement/api/stock-movement.service.ts
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 3619

Enforce auth + user scoping before fetching movement history.

On line 18, getAllMovements({}) is called without any filters. The service layer does not enforce tenant or user filtering—it returns all stock movements regardless of user context. This is a critical security issue that can expose cross-tenant inventory data.

🔧 Suggested direction
export default async function MoveHistoryPage() {

- // Fetch initial movements
- const movements = await StockMovementService.getAllMovements({});

- const session = await getSessionFromRequest(await headers());
- if (!session?.user?.id) {
- redirect("/login");
- }
- const movements = await StockMovementService.getAllMovements({
- userId: session.user.id,
- });
  Note: getAllMovements() will also need to be updated to accept and filter by userId.

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@app/inventory/move-history/page.tsx` around lines 16 - 19, MoveHistoryPage
currently calls StockMovementService.getAllMovements({}) with no user/tenant
context; change the page to enforce authentication, obtain the current user's id
(and tenant id if applicable) and call StockMovementService.getAllMovements({
userId, tenantId }) instead; also update StockMovementService.getAllMovements to
accept and apply filtering by userId/tenantId so it returns only movements
scoped to that user/tenant (ensure both the page uses the auth method you have
in the app and the service validates/filters by those IDs).
In components/warehouses/WarehouseFilters.tsx:

>          !searchTerm ||

         warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||

-        (warehouse.address &&
-          warehouse.address.toLowerCase().includes(searchTerm.toLowerCase()));

-        (warehouse.location &&
-          warehouse.location.toLowerCase().includes(searchTerm.toLowerCase()));
  ⚠️ Potential issue | 🟠 Major

Search logic no longer matches the UI contract.

Line 224 promises search by code, but Line 66–69 only checks name/location. Add warehouse.code back to the predicate.

💡 Suggested fix
const searchMatch =
!searchTerm ||
warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||

-        warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (warehouse.location &&
             warehouse.location.toLowerCase().includes(searchTerm.toLowerCase()));
  Also applies to: 224-224

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@components/warehouses/WarehouseFilters.tsx` around lines 66 - 69, The current
filter predicate in WarehouseFilters.tsx only checks warehouse.name and
warehouse.location; update the predicate(s) (the boolean expression using
searchTerm and warehouse.name/warehouse.location) to also check warehouse.code
(e.g., include warehouse.code.toLowerCase().includes(searchTerm.toLowerCase())
with proper null/undefined guards), and apply the same change to the other
identical predicate used elsewhere in the component so the UI contract "search
by code" is honored.
In modules/stock-movement/api/stock-movement.service.ts:

> - return await prisma.stockMovement.create({

-      data: {
-        productId: data.productId,
-        movementType: data.movementType,
-        quantity: data.quantity,
-        sourceWarehouseId: data.sourceWarehouseId,
-        destinationWarehouseId: data.destinationWarehouseId,
-        referenceType: data.referenceType,
-        referenceId: data.referenceId,
-        notes: data.notes,
-        userId: data.userId,
-      },
-      include: {
-        product: { select: { name: true, sku: true } },
-        sourceWarehouse: { select: { name: true } },
-        destinationWarehouse: { select: { name: true } },
-      },
- });
  ⚠️ Potential issue | 🔴 Critical

Apply stock deltas in the same transaction as the movement insert.

createMovement() currently only writes to stockMovement. Because this method backs the manual movement endpoint, a receipt/transfer/adjustment can appear in history while the affected Stock row(s) stay unchanged. Update the source/destination stock balances and insert the ledger record atomically.

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@modules/stock-movement/api/stock-movement.service.ts` around lines 33 - 50,
createMovement currently only inserts into stockMovement which can leave Stock
balances stale; wrap the movement insert, the affected Stock updates, and the
ledger insert inside a single Prisma transaction (use prisma.$transaction) so
all three actions succeed or fail together. In createMovement, within one
transaction: create the stockMovement (existing behavior), adjust sourceStock
and/or destinationStock rows' quantity deltas according to movementType
(decrement source for OUT/TRANSFER, increment destination for IN/TRANSFER, or
apply adjustment sign for ADJUSTMENT), and insert the StockLedger/stockLedger
record referencing the movementId; ensure you update Stocks by
productId+warehouseId (the Stock model) and create missing Stock rows if
appropriate, and return the created movement with includes as before. Use the
function name createMovement and the models stockMovement, Stock (or stocks),
and StockLedger (or ledger) to locate code to change.
In modules/stock-movement/api/stock-movement.service.ts:

> - static async getAllMovements(filters: {

- productId?: string;
- warehouseId?: string;
- movementType?: StockMovementType;
- startDate?: Date;
- endDate?: Date;
- }) {
- const where: any = {};
-
- if (filters.productId) {
-      where.productId = filters.productId;
- }
-
- if (filters.warehouseId) {
-      where.OR = [
-        { sourceWarehouseId: filters.warehouseId },
-        { destinationWarehouseId: filters.warehouseId },
-      ];
- }
-
- if (filters.movementType) {
-      where.movementType = filters.movementType;
- }
-
- if (filters.startDate || filters.endDate) {
-      where.createdAt = {};
-      if (filters.startDate) where.createdAt.gte = filters.startDate;
-      if (filters.endDate) where.createdAt.lte = filters.endDate;
- }
-
- return await prisma.stockMovement.findMany({
-      where,
-      include: {
-        product: { select: { name: true, sku: true } },
-        sourceWarehouse: { select: { name: true } },
-        destinationWarehouse: { select: { name: true } },
-      },
-      orderBy: { createdAt: "desc" },
- });
  ⚠️ Potential issue | 🔴 Critical

Require userId in movement reads.

StockMovement carries userId, but this query ignores it, and app/inventory/move-history/page.tsx currently calls getAllMovements({}). That page will render every tenant's movement history once data exists. Make userId mandatory here and seed where with it.

Suggested change
static async getAllMovements(filters: {

- userId: string;
  productId?: string;
  warehouseId?: string;
  movementType?: StockMovementType;
  startDate?: Date;
  endDate?: Date;
  }) {

- const where: any = {};

- const where: any = { userId: filters.userId };
  📝 Committable suggestion
  ‼️ IMPORTANT
  Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

⬇️ Suggested change

- static async getAllMovements(filters: {
- productId?: string;
- warehouseId?: string;
- movementType?: StockMovementType;
- startDate?: Date;
- endDate?: Date;
- }) {
- const where: any = {};
-
- if (filters.productId) {
-      where.productId = filters.productId;
- }
-
- if (filters.warehouseId) {
-      where.OR = [
-        { sourceWarehouseId: filters.warehouseId },
-        { destinationWarehouseId: filters.warehouseId },
-      ];
- }
-
- if (filters.movementType) {
-      where.movementType = filters.movementType;
- }
-
- if (filters.startDate || filters.endDate) {
-      where.createdAt = {};
-      if (filters.startDate) where.createdAt.gte = filters.startDate;
-      if (filters.endDate) where.createdAt.lte = filters.endDate;
- }
-
- return await prisma.stockMovement.findMany({
-      where,
-      include: {
-        product: { select: { name: true, sku: true } },
-        sourceWarehouse: { select: { name: true } },
-        destinationWarehouse: { select: { name: true } },
-      },
-      orderBy: { createdAt: "desc" },
- });

- static async getAllMovements(filters: {
- userId: string;
- productId?: string;
- warehouseId?: string;
- movementType?: StockMovementType;
- startDate?: Date;
- endDate?: Date;
- }) {
- const where: any = { userId: filters.userId };
-
- if (filters.productId) {
-      where.productId = filters.productId;
- }
-
- if (filters.warehouseId) {
-      where.OR = [
-        { sourceWarehouseId: filters.warehouseId },
-        { destinationWarehouseId: filters.warehouseId },
-      ];
- }
-
- if (filters.movementType) {
-      where.movementType = filters.movementType;
- }
-
- if (filters.startDate || filters.endDate) {
-      where.createdAt = {};
-      if (filters.startDate) where.createdAt.gte = filters.startDate;
-      if (filters.endDate) where.createdAt.lte = filters.endDate;
- }
-
- return await prisma.stockMovement.findMany({
-      where,
-      include: {
-        product: { select: { name: true, sku: true } },
-        sourceWarehouse: { select: { name: true } },
-        destinationWarehouse: { select: { name: true } },
-      },
-      orderBy: { createdAt: "desc" },
- });
  🤖 Prompt for AI Agents
  Verify each finding against the current code and only fix it if needed.

In `@modules/stock-movement/api/stock-movement.service.ts` around lines 56 - 94,
The getAllMovements function currently allows callers to omit userId which
exposes all tenants' movements; make userId required in the filters type (remove
optional on userId) and ensure you seed where.userId = filters.userId before
building other where clauses so the Prisma query (prisma.stockMovement.findMany)
always filters by user; update any callers (e.g.,
app/inventory/move-history/page.tsx) to pass the current user's id when calling
getAllMovements.
In modules/stock/api/stock.service.ts:

> - const existing = await prisma.stock.findUnique({

-      where: {
-        productId_warehouseId: {
-          productId: data.productId,
-          warehouseId: data.warehouseId,
-        },
-      },
- });
-
- if (existing) {
-      throw new Error("Stock record already exists for this product in this warehouse.");
- }
  ⚠️ Potential issue | 🔴 Critical

Make stock mutation + movement logging atomic.

Current flow performs stock writes before movement writes. If movement creation fails, the ledger diverges from actual stock. Also, the read-before-create duplicate check is race-prone under concurrent requests.

💡 Suggested direction

- const existing = await prisma.stock.findUnique(...)
- if (existing) throw new Error(...)
- const stock = await prisma.stock.create(...)
- if (data.quantity > 0) await StockMovementService.createMovement(...)

- // Prefer a single transactional write path:
- // 1) create/update stock
- // 2) insert movement
- // 3) rollback both on any failure
  Use one DB transaction for both operations, and rely on DB uniqueness guarantees for duplicate protection.

Also applies to: 73-96, 126-147

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@modules/stock/api/stock.service.ts` around lines 56 - 67, The current
read-then-create duplicate check (prisma.stock.findUnique) and separate writes
cause race conditions and ledger divergence if movement creation fails; replace
both operations with a single DB transaction that creates the stock and the
corresponding movement inside the same transaction (use prisma.$transaction with
prisma.stock.create and prisma.movement.create), remove the pre-check and rely
on the DB unique constraint, and catch Prisma unique-constraint errors (P2002)
to rethrow a friendly "Stock record already exists..." error while letting other
errors bubble up so the transaction can rollback.
In modules/stock/api/stock.service.ts:

> -        quantity: updatedQuantity,

-        reservedQuantity: data.reservedQuantity ?? stock.reservedQuantity,
-        updatedAt: new Date(),
  ⚠️ Potential issue | 🟠 Major

Validate reservedQuantity bounds before persisting.

reservedQuantity is updated without checks. Negative values or values above total quantity will produce invalid availability states.

💡 Suggested fix

- const updatedReserved = data.reservedQuantity ?? stock.reservedQuantity;
- if (updatedReserved < 0) {
-      throw new Error("Reserved quantity cannot be negative.");
- }
- if (updatedReserved > updatedQuantity) {
-      throw new Error("Reserved quantity cannot exceed total quantity.");
- }

  const updatedStock = await prisma.stock.update({
  where: { id },
  data: {
  quantity: updatedQuantity,

-        reservedQuantity: data.reservedQuantity ?? stock.reservedQuantity,

-        reservedQuantity: updatedReserved,
           updatedAt: new Date(),
         },
       });
  📝 Committable suggestion
  ‼️ IMPORTANT
  Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

⬇️ Suggested change

-        quantity: updatedQuantity,
-        reservedQuantity: data.reservedQuantity ?? stock.reservedQuantity,
-        updatedAt: new Date(),

- const updatedReserved = data.reservedQuantity ?? stock.reservedQuantity;
- if (updatedReserved < 0) {
-      throw new Error("Reserved quantity cannot be negative.");
- }
- if (updatedReserved > updatedQuantity) {
-      throw new Error("Reserved quantity cannot exceed total quantity.");
- }
-
- const updatedStock = await prisma.stock.update({
-      where: { id },
-      data: {
-        quantity: updatedQuantity,
-        reservedQuantity: updatedReserved,
-        updatedAt: new Date(),
-      },
- });
  🤖 Prompt for AI Agents
  Verify each finding against the current code and only fix it if needed.

In `@modules/stock/api/stock.service.ts` around lines 129 - 131, Before
persisting, validate the computed reservedQuantity (the expression
data.reservedQuantity ?? stock.reservedQuantity used where you set quantity:
updatedQuantity) to ensure it's not negative and does not exceed the total
(updatedQuantity); if invalid, return/throw a validation error (or reject the
update) rather than saving. Update the stock update routine in stock.service.ts
(the function that builds the object with quantity: updatedQuantity,
reservedQuantity: ...) to compute newReserved = data.reservedQuantity ??
stock.reservedQuantity, check newReserved >= 0 && newReserved <=
updatedQuantity, and handle failures by throwing a descriptive error or
returning a 4xx validation response before calling the persistence layer.
In modules/stock/components/StockOverview.tsx:

> - +export default function StockOverview() {

- const [isMounted, setIsMounted] = useState(false);
- const [searchTerm, setSearchTerm] = useState("");
- const [selectedWarehouse, setSelectedWarehouse] = useState<string | "all">("all");
- const [selectedProductStock, setSelectedProductStock] = useState<any[] | null>(null);
-
- const { isCheckingAuth } = useAuth();
-
- useEffect(() => {
- setIsMounted(true);
- }, []);
-
- // Fetch all stocks
- const { data, isLoading, error } = useQuery({
- queryKey: ["stocks-all"],
  ⚠️ Potential issue | 🟠 Major

🧩 Analysis chain
🏁 Script executed:

# !/bin/bash

# Verify key mismatch between this component and central query key config

rg -n 'queryKey:\s*\["stocks-all"\]' modules/stock/components/StockOverview.tsx
rg -n 'stocks:\s*\{' lib/react-query/config.ts -A12
rg -n 'queryKeys\.stocks' lib/react-query
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 1147

🏁 Script executed:

rg -n '\["stocks-all"\]' --type tsx --type ts
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 141

🏁 Script executed:

head -n 50 modules/stock/components/StockOverview.tsx
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 1739

🏁 Script executed:

rg -n 'invalidateQueries.\*stocks' lib/react-query -A2 -B2
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 662

🏁 Script executed:

rg '\["stocks-all"\]'
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 186

🏁 Script executed:

rg 'queryKeys\.stocks' lib/react-query/config.ts -A1 -B1
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 487

Update query key to match the shared stocks namespace.

Line 35 uses ["stocks-all"], but the shared config defines queryKeys.stocks.all as ["stocks"]. This breaks cache invalidation—mutations that target ["stocks"] won't invalidate this query, causing stale data.

Add the import and use the shared key:

Fix
+import { queryKeys } from "@/lib/react-query/config";
...

- queryKey: ["stocks-all"],

- queryKey: queryKeys.stocks.all,
  📝 Committable suggestion
  ‼️ IMPORTANT
  Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

⬇️ Suggested change

- queryKey: ["stocks-all"],
  +import { queryKeys } from "@/lib/react-query/config";

-
- queryKey: queryKeys.stocks.all,
  🤖 Prompt for AI Agents
  Verify each finding against the current code and only fix it if needed.

In `@modules/stock/components/StockOverview.tsx` at line 35, The component
StockOverview uses a hardcoded queryKey ["stocks-all"] which diverges from the
shared query namespace and prevents proper cache invalidation; update
StockOverview to import the shared queryKeys (e.g., queryKeys.stocks.all) and
replace the literal ["stocks-all"] with that imported key so mutations targeting
queryKeys.stocks.all will invalidate this query correctly.
In scripts/delete-all-data.ts:

> - const stock = await prisma.stock.deleteMany({});

- console.log(`Stock: ${stock.count}`);
  ⚠️ Potential issue | 🔴 Critical

🧩 Analysis chain
🏁 Script executed:

# !/bin/bash

set -euo pipefail

echo "Delete order in scripts/delete-all-data.ts:"
nl -ba scripts/delete-all-data.ts | rg -n "prisma\.(product|stock)\.deleteMany"

echo
echo "Stock model relation block in prisma/schema.prisma:"
python - <<'PY'
import re, pathlib
p = pathlib.Path("prisma/schema.prisma")
txt = p.read_text(encoding="utf-8")
m = re.search(r"model\s+Stock\s*{.*?^\}", txt, flags=re.S|re.M)
print(m.group(0) if m else "Stock model not found")
PY
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 215

🏁 Script executed:

# !/bin/bash

set -euo pipefail

echo "=== Delete order in scripts/delete-all-data.ts ==="
cat scripts/delete-all-data.ts | grep -n "prisma\." | grep "deleteMany"

echo
echo "=== Around the changed lines (35-39) ==="
sed -n '33,42p' scripts/delete-all-data.ts

echo
echo "=== Stock model definition in prisma/schema.prisma ==="
rg "model Stock" -A 20 prisma/schema.prisma
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 5119

🏁 Script executed:

# !/bin/bash

echo "=== Context around line 22 ==="
sed -n '15,30p' scripts/delete-all-data.ts

echo
echo "=== Check if there are any cascade or referential settings in schema ==="
grep -i "cascade\|referential\|ondelete" prisma/schema.prisma | head -20
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 1230

Move Stock deletion before Product to maintain stated dependency order.

Line 22 establishes the rule: "Delete in dependency order (children before parents)". The current code violates this by deleting Product (line 35) before Stock (line 38), even though Stock depends on Product via the productId foreign key. Reorder these deletions to delete Stock first, then Product.

Suggested fix

- const product = await prisma.product.deleteMany({});
- console.log(`Product: ${product.count}`);
- const stock = await prisma.stock.deleteMany({});
  console.log(`Stock: ${stock.count}`);

-
- const product = await prisma.product.deleteMany({});
- console.log(`Product: ${product.count}`);
  🤖 Prompt for AI Agents
  Verify each finding against the current code and only fix it if needed.

In `@scripts/delete-all-data.ts` around lines 38 - 39, The deletions are currently
out of dependency order; move the call to prisma.stock.deleteMany({}) so it runs
before prisma.product.deleteMany({}) to delete child Stock records prior to
parent Product records; update the sequence where prisma.stock.deleteMany and
console.log(`Stock: ${stock.count}`) appear before the
prisma.product.deleteMany and its log to maintain children-before-parents
deletion.
—
Reply to this email directly, view it on GitHub, or unsubscribe.
You are receiving this because you are subscribed to this thread.

Reply, Reply All or Forward

github:

feat:Implement Stock Movement Ledger and UI refinements

# 3

Open
rawalharshvardhan26-byte
wants to merge 1 commit into
arnobt78:main
from
rawalharshvardhan26-byte:feature/backend-stabilization-fixes-final
+1,569
-771
Lines changed: 1569 additions & 771 deletions
Conversation19 (19)
Commits1 (1)
Checks1 (1)
Files changed37 (37)
Open
feat:Implement Stock Movement Ledger and UI refinements#3
rawalharshvardhan26-byte
wants to merge 1 commit into
arnobt78:main
from
rawalharshvardhan26-byte:feature/backend-stabilization-fixes-final
Conversation
@rawalharshvardhan26-byte
rawalharshvardhan26-byte
commented
2 hours ago
•
Summary by CodeRabbit
New Features

Move History page to track all inventory movements and adjustments across warehouses.
Stock overview page displaying inventory levels, warehouse distribution, and reserved quantities.
Enhanced warehouse management with code, location, and description fields for better organization.
Soft delete for warehouses—deactivated warehouses are preserved in the system.
Refactor

Warehouse status model improved with active/inactive state management.
Stock management system restructured for improved tracking and reporting.
Navigation paths updated for warehouse and inventory management sections.
@Pacho-sudo
Implement Stock Movement Ledger and UI refinements
f337bf4
@vercel
Contributor
vercel bot
commented
2 hours ago
@Pacho-sudo is attempting to deploy a commit to the Arnob Mahmud's projects Team on Vercel.

A member of the Team first needs to authorize it.

@coderabbitai
coderabbitai bot
commented
2 hours ago
•
📝 Walkthrough
Walkthrough
This PR refactors the warehouse data model by renaming fields (address→location, type→description, status→isActive), replaces the StockAllocation pattern with a new Stock service and API layer, introduces StockMovement ledger tracking for inventory changes, and adds corresponding new pages and UI components for stock management and movement history.

Changes
Cohort / File(s) Summary
Warehouse Schema & Type Updates
types/warehouse.ts, prisma/schema.prisma, lib/server/warehouses-data.ts Warehouse model refactored: removed address/type/status fields; added code/location/description/isActive. Prisma schema updated with new fields, unique constraints on code, and new relationships to Stock and StockMovement models.
Stock & StockMovement Models
prisma/schema.prisma, modules/stock/api/stock.service.ts, modules/stock-movement/api/stock-movement.service.ts Introduced Stock model replacing StockAllocation with product-warehouse relationships and audit fields. New StockMovement ledger model (enum: RECEIPT/DELIVERY/TRANSFER/ADJUSTMENT) tracks inventory changes. StockService manages CRUD with validation; StockMovementService handles creation and filtering.
Stock API Routes
app/api/stocks/route.ts, app/api/stocks/[id]/route.ts, app/api/stocks/product/[productId]/route.ts, app/api/stocks/warehouse/[warehouseId]/route.ts Four new API endpoints: GET/POST all stocks with auth/validation; PUT to update stock by ID; GET stock by product across warehouses; GET stock by specific warehouse. All include error handling and authentication.
Stock Movement API
app/api/stock-movements/route.ts New GET/POST endpoints for stock movements: GET with filters (productId, warehouseId, movementType, date range); POST to create movements. Scaffolded for session-based user retrieval.
Stock UI Components & Pages
modules/stock/components/StockOverview.tsx, modules/stock/components/StockDetailsModal.tsx, app/inventory/stock/page.tsx, app/inventory/move-history/page.tsx, modules/stock-movement/components/MoveHistory.tsx New stock overview page with inventory statistics, search/warehouse filtering, and per-product details modal. New move history page displaying ledger of stock movements with filtering and statistics. Both pages include server-side data fetching.
Warehouse API & Dialog
app/api/warehouses/route.ts, components/warehouses/WarehouseDialog.tsx Warehouse POST/PUT/DELETE endpoints updated: replaced address/type/status with code/location/description/isActive in validation and persistence. DELETE now soft-deletes via isActive flag. Dialog UI refactored to match new fields (Input for code, location; Textarea for description; Switch for isActive).
Warehouse UI & Navigation
components/warehouses/WarehouseList.tsx, components/warehouses/WarehouseTable.tsx, components/warehouses/WarehouseTableColumns.tsx, components/warehouses/WarehouseFilters.tsx, components/Pages/WarehouseDetailPage.tsx Warehouse table columns updated: address→code (monospace badge), type→location (truncated with tooltip), status→isActive (badge styling). Search now matches code/location. Export/filter logic updated for new field mapping. Detail page displays location and description instead of address/type.
Navigation Updates
components/layouts/Navbar.tsx, components/layouts/AdminSidebar.tsx, components/layouts/SidebarLayout.tsx Warehouses route updated from /warehouses to /settings/warehouses. New Stock menu item at /inventory/stock. New Move History item at /inventory/move-history with Activity icon in admin sidebar.
Query Keys & Cache Invalidation
lib/react-query/config.ts, lib/react-query/invalidate-all.ts, hooks/queries/use-stock-allocation.ts Renamed stockAllocation query keys to stocks; updated related keys (lists, summary, byProduct, byWarehouse). Updated three React Query hooks to use new queryKeys.stocks prefix.
Dashboard & Utility Updates
lib/server/dashboard-data.ts, app/api/portal/client/browse-meta/route.ts, components/admin/AdminMyActivityContent.tsx, scripts/delete-all-data.ts Dashboard warehouse grouping changed from type to description; active filter uses isActive. Browse meta warehouse counts use isActive. Activity filter updated to isActive. Data cleanup script targets stock instead of stockAllocation.
Removed
app/api/stock-allocations/route.ts, prisma/stock-allocation.ts Deleted StockAllocation API route handler (GET/POST with caching, enrichment) and Prisma helpers (CRUD, transfers, warehouse summaries). Replaced by new Stock service and API layer.
Sequence Diagram(s)

Estimated Code Review Effort
🎯 4 (Complex) | ⏱️ ~60 minutes

Poem
🐰 Hop hop, the warehouse evolves!
No more address or type—now code, location, description thrive.
StockAllocation waves goodbye, Stock and StockMovement arrive,
With ledgers of receipts and transfers, inventory comes alive!
From fuzzy fields to crystal-clear flows, the rabbit dances with delight. 🥕✨

🚥 Pre-merge checks | ✅ 2 | ❌ 1
❌ Failed checks (1 warning)
Check name Status Explanation Resolution
Docstring Coverage ⚠️ Warning Docstring coverage is 60.71% which is insufficient. The required threshold is 80.00%. Write docstrings for the functions missing them to satisfy the coverage threshold.
✅ Passed checks (2 passed)
✏️ Tip: You can configure your own custom pre-merge checks in the settings.

✨ Finishing Touches
🧪 Generate unit tests (beta)
📝 Coding Plan
Generate coding plan for human review comments
Thanks for using CodeRabbit! It's free for OSS, and your support helps us grow. If you like it, consider giving us a shout-out.

❤️ Share
X
Mastodon
Reddit
LinkedIn
Comment @coderabbitai help to get the list of available commands and usage tips.

Tip

CodeRabbit can use your project's `biome` configuration to improve the quality of JS/TS/CSS/JSON code reviews.
Add a configuration file to your project to customize how CodeRabbit runs biome.

coderabbitai[bot]
coderabbitai bot reviewed 2 hours ago
coderabbitai bot
left a comment
Actionable comments posted: 16

Note

Due to the large number of review comments, Critical, Major severity comments were prioritized as inline comments.

Caution

Some comments are outside the diff and can’t be posted inline due to platform limitations.

⚠️ Outside diff range comments (2)
components/warehouses/WarehouseDialog.tsx (1)
112-114: ⚠️ Potential issue | 🟠 Major

Validate code before submit to block whitespace-only values.

On Line 114 only name is validated. A code like " " passes HTML required but becomes "" after trim() on Lines 120/130.

🔧 Suggested fix
const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();

- if (!name.trim()) return;

- if (!name.trim() || !code.trim()) return;
  Also applies to: 120-123, 130-133

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@components/warehouses/WarehouseDialog.tsx` around lines 112 - 114, The submit
handler handleSubmit currently only validates name and allows whitespace-only
values for code; change it to also check code.trim() (e.g., if (!name.trim() ||
!code.trim()) return;) so whitespace-only codes are blocked before submission,
and apply the same additional validation where similar submission paths exist
(the other branches that trim code around the create/update logic inside the
component) to ensure code is trimmed and validated consistently before use.
components/warehouses/WarehouseFilters.tsx (1)
95-107: ⚠️ Potential issue | 🟠 Major

Sanitize CSV/XLSX cell values to prevent formula injection.

Exported fields (name, code, location, description) can start with =, +, -, or @. Opening such files in spreadsheet software can execute formulas.

💡 Suggested fix
Also applies to: 151-163

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@components/warehouses/WarehouseFilters.tsx` around lines 95 - 107, Sanitize
exported spreadsheet cell values to prevent formula injection by creating/using
a helper (e.g., sanitizeCellValue) and applying it to all user-controlled fields
(warehouse.name, warehouse.code, warehouse.location, warehouse.description) when
building csvData and the Excel mapping; the helper should detect leading
characters '=', '+', '-', '@' and neutralize them (for example by prefixing with
an apostrophe or otherwise escaping) and then replace the direct uses in the
csvData mapping and the Excel export block so both CSV and XLSX exports use the
sanitized values.
🟡 Minor comments (5)
modules/stock-movement/components/MoveHistory.tsx-122-125 (1)
122-125: ⚠️ Potential issue | 🟡 Minor

Card copy does not match the computed metric.

The card says “Movements in last 24h” (Line 124), but the logic uses isSameDay(...) (Line 66), which is calendar day, not rolling 24 hours.

Also applies to: 66-66

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@modules/stock-movement/components/MoveHistory.tsx` around lines 122 - 125,
The card copy “Movements in last 24h” is incorrect for the metric computed by
isSameDay(...) in MoveHistory (stats.today); either update the description to
match the calendar-day metric (e.g., "Movements today") or change the
calculation for stats.today to use a 24-hour window (e.g., replace
isSameDay(...) logic with a check like eventDate >= now - 24 hours). Locate the
code that computes stats.today (uses isSameDay) and the card rendering that
passes description="Movements in last 24h" and make them consistent by applying
one of the two fixes.
lib/server/dashboard-data.ts-616-616 (1)
616-616: ⚠️ Potential issue | 🟡 Minor

Normalize description before fallback to avoid blank chart labels.

On Line 616, whitespace-only descriptions bypass the fallback and produce empty labels. Trim before fallback.

🔧 Suggested fix

- type: g.description || "(Unspecified)",

- type: g.description?.trim() || "(Unspecified)",
  🤖 Prompt for AI Agents
  Verify each finding against the current code and only fix it if needed.

In `@lib/server/dashboard-data.ts` at line 616, The assignment for the chart label
uses g.description directly so whitespace-only strings produce empty labels;
update the logic that sets the object property type (where it currently reads
type: g.description || "(Unspecified)") to trim g.description first and fall
back when the trimmed value is empty — i.e., compute a trimmedDesc from
g.description?.trim() and use trimmedDesc || "(Unspecified)" for the type field
in the same mapping/return block.
modules/stock-movement/components/MoveHistory.tsx-201-201 (1)
201-201: ⚠️ Potential issue | 🟡 Minor

Use hh:mm a instead of HH:mm a for 12-hour time format.

Line 201 uses HH:mm a, which incorrectly combines a 24-hour token (HH = 00–23) with an AM/PM marker (a). Use hh:mm a for 12-hour format (01–12 with AM/PM), or HH:mm for 24-hour format without the marker.

🔧 Suggested fix

-                        {format(new Date(movement.createdAt), "HH:mm a")}

-                        {format(new Date(movement.createdAt), "hh:mm a")}
  🤖 Prompt for AI Agents
  Verify each finding against the current code and only fix it if needed.

In `@modules/stock-movement/components/MoveHistory.tsx` at line 201, The time
format is using a 24-hour token with an AM/PM marker in the MoveHistory
component; update the format call that renders movement.createdAt (the
expression format(new Date(movement.createdAt), "HH:mm a")) to use the 12-hour
token "hh:mm a" instead of "HH:mm a" so the displayed time matches AM/PM
notation.
components/warehouses/WarehouseList.tsx-43-44 (1)
modules/stock/components/StockOverview.tsx-34-42 (1)
🧹 Nitpick comments (6)
prisma/schema.prisma (1)
156-171: Index the tenant key on the new stock collections.

Both new models persist userId. Once the required tenant scoping is in place, stock lists and movement history will otherwise scan the full collection. StockMovement especially wants a (userId, createdAt) index because the new history reads are naturally tenant-scoped and newest-first.

Suggested indexes
model Stock {
@@
@@unique([productId, warehouseId])
@@index([productId])
@@index([warehouseId])

- @@index([userId])
  }
  @@
  model StockMovement {
  @@
  @@index([productId])
- @@index([userId, createdAt])
  @@index([sourceWarehouseId])
  @@index([destinationWarehouseId])
  @@index([createdAt])
  }
  Also applies to: 395-416

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@prisma/schema.prisma` around lines 156 - 171, Add tenant-scoped indexes to
the new models so queries filter by userId efficiently: in the Stock model add
an index on userId (e.g., @@index([userId])) in addition to existing indexes; in
the StockMovement model add an index on userId and createdAt to support
tenant-scoped newest-first reads (e.g., @@index([userId, createdAt])). Locate
the Stock model (symbols: Stock, userId) and the StockMovement model (symbols:
StockMovement, userId, createdAt) and add these @@index declarations.
hooks/queries/use-stock-allocation.ts (1)
modules/stock-movement/components/MoveHistory.tsx (1)
components/layouts/Navbar.tsx (1)
components/warehouses/WarehouseList.tsx (1)
components/warehouses/WarehouseTable.tsx (1)
🤖 Prompt for all review comments with AI agents
Verify each finding against the current code and only fix it if needed.

Inline comments:
In `@app/api/stock-movements/route.ts`:

- Around line 2-4: Both GET and POST handlers in route.ts must authenticate
  requests: resolve the session up front (use the same helper as siblings, e.g.
  getSessionFromRequest(req) or getSession) and if no session return a 401
  response, then pass the authenticated user id into StockMovementService methods
  instead of using a hardcoded placeholder; update both the GET handler (where
  movements are currently publicly returned) and the POST handler (where new
  movements are being created under a placeholder owner) to call/get session
  before any work and forward session.id into StockMovementService methods (refer
  to StockMovementService and StockMovementType in this file).
- Around line 11-16: Validate and reject malformed filter params before calling
  the service: check that movementType (from movementType variable) is either
  undefined or one of the StockMovementType enum values and that startDate/endDate
  strings parse to valid dates (new Date(...) yields a valid date and not NaN); if
  any validation fails return a 400 response (e.g., throw new Response or
  NextResponse with status 400 and a clear error message). Also ensure you stop
  execution when rejecting (don’t call the Prisma/service methods) and optionally
  validate startDate <= endDate if both provided. Use the existing variables
  movementType, startDate, endDate and the StockMovementType enum to implement
  these checks.

In `@app/api/stocks/`[id]/route.ts:

- Around line 30-39: The update call omits the user id, causing downstream
  movement logging to see data.userId as undefined; add the authenticated user's
  id into the update payload (e.g., set dataToUpdate.userId = user.id) before
  calling StockService.updateStock(id, dataToUpdate) so movement/ledger flows have
  the required userId; if your updateStock signature expects a separate userId
  parameter, pass user.id as that argument instead and ensure references to
  data.userId in movement logging will receive a valid value.
- Around line 31-36: When parsing incoming numeric fields `quantity` and
  `reservedQuantity` in the route handler (where `dataToUpdate.quantity` and
  `dataToUpdate.reservedQuantity` are set using `parseInt`), validate the parsed
  values and reject invalid payloads with a 400 error before calling the service:
  parse each value, check Number.isInteger(result) (or !Number.isNaN(result)), and
  if invalid return a 400/Bad Request with a clear message; only assign the parsed
  integer to `dataToUpdate` when the value is valid to avoid letting `NaN`
  propagate to the service layer.

In `@app/api/stocks/product/`[productId]/route.ts:

- Around line 29-33: The catch block currently returns error.message to the
  client which can leak internals; instead keep logging the full error server-side
  (e.g., via console.error or processLogger) including productId, but change the
  NextResponse.json payload to a generic client-safe message (e.g., "Failed to
  fetch stock for product" or "Internal server error") and a 500 status; update
  the catch in route.ts (the block referencing productId and NextResponse.json) to
  remove error.message from the response body while retaining detailed server-side
  logging.

In `@app/api/stocks/route.ts`:

- Around line 36-50: The POST handler currently does quantity: quantity ?
  parseInt(String(quantity), 10) : 0 which allows malformed numeric strings (NaN)
  to propagate and cause 500s; update the request validation in the route handler
  to explicitly parse and validate quantity (use Number or parseInt and check
  Number.isFinite/Number.isInteger or isNaN) and return NextResponse.json({
  success: false, error: "Invalid quantity" }, { status: 400 }) when parsing fails
  or the value is negative/non-integer as per business rules; apply the same
  validation fix to the corresponding update branch that calls
  StockService.createStock (and any StockService.update/modify calls in the 54-67
  region) so all entry points reject bad quantity input with a 400 instead of
  allowing NaN to reach the service.

In `@app/api/stocks/warehouse/`[warehouseId]/route.ts:

- Around line 29-33: The catch block in the route handler currently returns
  error.message to the client; instead keep detailed diagnostics in server logs
  and return a generic error payload. Update the catch for the route (where
  warehouseId is referenced and NextResponse.json is used) to log the full error
  (console.error or processLogger) but change the response body to { success:
  false, error: "Failed to fetch stock for warehouse" } (or similar generic text)
  and preserve the 500 status; do not include error.message or any stack trace in
  the JSON response.

In `@app/api/warehouses/route.ts`:

- Around line 68-79: The duplicate-name/code pre-checks
  (prisma.warehouse.findFirst that sets existingWarehouse) are not scoped to the
  tenant and should include userId in the where clause so the OR becomes OR: [{
  userId, name: name.trim() }, { userId, code: code.trim() }]; apply the same
  scope to the other duplicate-check block later (the one checking code/name
  around the same logic at the other location). Also update the Prisma schema to
  enforce compound unique constraints on (userId, name) and (userId, code) in the
  Warehouse model so the DB-level uniques match the API behavior.

In `@app/inventory/move-history/page.tsx`:

- Around line 16-19: MoveHistoryPage currently calls
  StockMovementService.getAllMovements({}) with no user/tenant context; change the
  page to enforce authentication, obtain the current user's id (and tenant id if
  applicable) and call StockMovementService.getAllMovements({ userId, tenantId })
  instead; also update StockMovementService.getAllMovements to accept and apply
  filtering by userId/tenantId so it returns only movements scoped to that
  user/tenant (ensure both the page uses the auth method you have in the app and
  the service validates/filters by those IDs).

In `@components/warehouses/WarehouseFilters.tsx`:

- Around line 66-69: The current filter predicate in WarehouseFilters.tsx only
  checks warehouse.name and warehouse.location; update the predicate(s) (the
  boolean expression using searchTerm and warehouse.name/warehouse.location) to
  also check warehouse.code (e.g., include
  warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) with proper
  null/undefined guards), and apply the same change to the other identical
  predicate used elsewhere in the component so the UI contract "search by code" is
  honored.

In `@modules/stock-movement/api/stock-movement.service.ts`:

- Around line 33-50: createMovement currently only inserts into stockMovement
  which can leave Stock balances stale; wrap the movement insert, the affected
  Stock updates, and the ledger insert inside a single Prisma transaction (use
  prisma.$transaction) so all three actions succeed or fail together. In
  createMovement, within one transaction: create the stockMovement (existing
  behavior), adjust sourceStock and/or destinationStock rows' quantity deltas
  according to movementType (decrement source for OUT/TRANSFER, increment
  destination for IN/TRANSFER, or apply adjustment sign for ADJUSTMENT), and
  insert the StockLedger/stockLedger record referencing the movementId; ensure you
  update Stocks by productId+warehouseId (the Stock model) and create missing
  Stock rows if appropriate, and return the created movement with includes as
  before. Use the function name createMovement and the models stockMovement, Stock
  (or stocks), and StockLedger (or ledger) to locate code to change.
- Around line 56-94: The getAllMovements function currently allows callers to
  omit userId which exposes all tenants' movements; make userId required in the
  filters type (remove optional on userId) and ensure you seed where.userId =
  filters.userId before building other where clauses so the Prisma query
  (prisma.stockMovement.findMany) always filters by user; update any callers
  (e.g., app/inventory/move-history/page.tsx) to pass the current user's id when
  calling getAllMovements.

In `@modules/stock/api/stock.service.ts`:

- Around line 56-67: The current read-then-create duplicate check
  (prisma.stock.findUnique) and separate writes cause race conditions and ledger
  divergence if movement creation fails; replace both operations with a single DB
  transaction that creates the stock and the corresponding movement inside the
  same transaction (use prisma.$transaction with prisma.stock.create and
  prisma.movement.create), remove the pre-check and rely on the DB unique
  constraint, and catch Prisma unique-constraint errors (P2002) to rethrow a
  friendly "Stock record already exists..." error while letting other errors
  bubble up so the transaction can rollback.
- Around line 129-131: Before persisting, validate the computed reservedQuantity
  (the expression data.reservedQuantity ?? stock.reservedQuantity used where you
  set quantity: updatedQuantity) to ensure it's not negative and does not exceed
  the total (updatedQuantity); if invalid, return/throw a validation error (or
  reject the update) rather than saving. Update the stock update routine in
  stock.service.ts (the function that builds the object with quantity:
  updatedQuantity, reservedQuantity: ...) to compute newReserved =
  data.reservedQuantity ?? stock.reservedQuantity, check newReserved >= 0 &&
  newReserved <= updatedQuantity, and handle failures by throwing a descriptive
  error or returning a 4xx validation response before calling the persistence
  layer.

In `@modules/stock/components/StockOverview.tsx`:

- Line 35: The component StockOverview uses a hardcoded queryKey ["stocks-all"]
  which diverges from the shared query namespace and prevents proper cache
  invalidation; update StockOverview to import the shared queryKeys (e.g.,
  queryKeys.stocks.all) and replace the literal ["stocks-all"] with that imported
  key so mutations targeting queryKeys.stocks.all will invalidate this query
  correctly.

In `@scripts/delete-all-data.ts`:

- Around line 38-39: The deletions are currently out of dependency order; move
  the call to prisma.stock.deleteMany({}) so it runs before
  prisma.product.deleteMany({}) to delete child Stock records prior to parent
  Product records; update the sequence where prisma.stock.deleteMany and
  console.log(`Stock: ${stock.count}`) appear before the
  prisma.product.deleteMany and its log to maintain children-before-parents
  deletion.

---

Outside diff comments:
In `@components/warehouses/WarehouseDialog.tsx`:

- Around line 112-114: The submit handler handleSubmit currently only validates
  name and allows whitespace-only values for code; change it to also check
  code.trim() (e.g., if (!name.trim() || !code.trim()) return;) so whitespace-only
  codes are blocked before submission, and apply the same additional validation
  where similar submission paths exist (the other branches that trim code around
  the create/update logic inside the component) to ensure code is trimmed and
  validated consistently before use.

In `@components/warehouses/WarehouseFilters.tsx`:

- Around line 95-107: Sanitize exported spreadsheet cell values to prevent
  formula injection by creating/using a helper (e.g., sanitizeCellValue) and
  applying it to all user-controlled fields (warehouse.name, warehouse.code,
  warehouse.location, warehouse.description) when building csvData and the Excel
  mapping; the helper should detect leading characters '=', '+', '-', '@' and
  neutralize them (for example by prefixing with an apostrophe or otherwise
  escaping) and then replace the direct uses in the csvData mapping and the Excel
  export block so both CSV and XLSX exports use the sanitized values.

---

Minor comments:
In `@components/warehouses/WarehouseList.tsx`:

- Around line 43-44: The inline comment above the isUserWarehousesPage constant
  is outdated—update the comment to reference the actual route checked
  ("/settings/warehouses") so it matches the logic that computes
  isUserWarehousesPage (uses pathname === "/settings/warehouses"); edit the
  comment text near isUserWarehousesPage to accurately describe that store-wide
  state cards are shown only on the user warehouses page at
  "/settings/warehouses".

In `@lib/server/dashboard-data.ts`:

- Line 616: The assignment for the chart label uses g.description directly so
  whitespace-only strings produce empty labels; update the logic that sets the
  object property type (where it currently reads type: g.description ||
  "(Unspecified)") to trim g.description first and fall back when the trimmed
  value is empty — i.e., compute a trimmedDesc from g.description?.trim() and use
  trimmedDesc || "(Unspecified)" for the type field in the same mapping/return
  block.

In `@modules/stock-movement/components/MoveHistory.tsx`:

- Around line 122-125: The card copy “Movements in last 24h” is incorrect for
  the metric computed by isSameDay(...) in MoveHistory (stats.today); either
  update the description to match the calendar-day metric (e.g., "Movements
  today") or change the calculation for stats.today to use a 24-hour window (e.g.,
  replace isSameDay(...) logic with a check like eventDate >= now - 24 hours).
  Locate the code that computes stats.today (uses isSameDay) and the card
  rendering that passes description="Movements in last 24h" and make them
  consistent by applying one of the two fixes.
- Line 201: The time format is using a 24-hour token with an AM/PM marker in the
  MoveHistory component; update the format call that renders movement.createdAt
  (the expression format(new Date(movement.createdAt), "HH:mm a")) to use the
  12-hour token "hh:mm a" instead of "HH:mm a" so the displayed time matches AM/PM
  notation.

In `@modules/stock/components/StockOverview.tsx`:

- Around line 34-42: The component currently uses useQuery (queryKey
  ["stocks-all"]) and only renders an empty-state ("No stock found") when data is
  falsy, which hides fetch errors; update the StockOverview render logic to check
  the query's error and isLoading first: if isLoading return a loading state, if
  error return a dedicated error UI showing the error.message (or a user-friendly
  message) instead of the empty-state, and only show the "No stock found" empty
  state when data is defined and data.length === 0; apply the same change to the
  other stocks listing block that also uses useQuery/error handling.

---

Nitpick comments:
In `@components/layouts/Navbar.tsx`:

- Around line 192-193: Navbar currently uses "/settings/warehouses" while
  AdminSidebar still uses "/admin/warehouses", causing inconsistent navigation;
  create a single exported route constant (e.g., WAREHOUSE_ROUTE or
  ROUTES.WAREHOUSES) in a central routes/constants module and update both
  components (Navbar.tsx entry with label "Warehouses" and AdminSidebar.tsx's
  warehouses link) to import and use that constant so both navigation surfaces
  point to the same path.

In `@components/warehouses/WarehouseList.tsx`:

- Around line 49-51: The two arrays warehouseTypeBadges and
  warehousesPageTypeBadges use the unsafe any[] type; change them to a concrete
  badge type such as React.ReactNode[] or JSX.Element[] (or a specific
  BadgeProps[] if you store prop objects) to restore compile-time safety, or
  remove the arrays and construct badges inline at call sites; update usages in
  WarehouseList.tsx where warehouseTypeBadges and warehousesPageTypeBadges are
  pushed/returned so their element type matches the chosen concrete type.

In `@components/warehouses/WarehouseTable.tsx`:

- Around line 61-66: The search logic recomputes searchTerm.toLowerCase() for
  each field; fix by normalizing the term once before the check (e.g., compute a
  local const like normalizedSearch = searchTerm?.toLowerCase() || '') and then
  use normalizedSearch in the searchMatch expression (replace calls to
  searchTerm.toLowerCase() in the searchMatch calculation that references
  warehouse.name, warehouse.code, and warehouse.location). This keeps the existing
  behavior but avoids repeated lowercase calls in the WarehouseTable component's
  searchMatch logic.

In `@hooks/queries/use-stock-allocation.ts`:

- Line 20: The file still uses "StockAllocation" terminology in names and
  messages even though cache keys moved to queryKeys.stocks; update all remaining
  identifiers and user-facing text in this file to "stocks" — rename the exported
  hook (e.g., useStockAllocation -> useStocks or useStocks\*), change the API
  client namespace/instance references (e.g., stockAllocationClient ->
  stocksClient or client.stocks), and update any toast/copy that mentions "stock
  allocation" to "stocks" so the hook name, API client calls, and toasts match
  queryKeys.stocks (also apply the same rename at the other two occurrences
  referenced).

In `@modules/stock-movement/components/MoveHistory.tsx`:

- Around line 152-166: In MoveHistory.tsx the search input (bound to searchTerm
  / setSearchTerm) and the type filter select (bound to typeFilter /
  setTypeFilter) lack accessible names; add descriptive aria-label attributes (or
  visible <label> elements) to both controls—for example an aria-label like
  "Search by product, SKU or reference" on the input and "Filter by activity type"
  on the select—so screen readers can identify their purpose while keeping the
  existing class names and change handlers intact.

In `@prisma/schema.prisma`:

- Around line 156-171: Add tenant-scoped indexes to the new models so queries
  filter by userId efficiently: in the Stock model add an index on userId (e.g.,
  @@index([userId])) in addition to existing indexes; in the StockMovement model
  add an index on userId and createdAt to support tenant-scoped newest-first reads
  (e.g., @@index([userId, createdAt])). Locate the Stock model (symbols: Stock,
  userId) and the StockMovement model (symbols: StockMovement, userId, createdAt)
  and add these @@index declarations.
  ℹ️ Review info
  ⚙️ Run configuration
  Configuration used: defaults

Review profile: CHILL

Plan: Pro

Run ID: 8b7ad195-5150-403f-8604-6a46f9e15441

📥 Commits
Reviewing files that changed from the base of the PR and between 82488e9 and f337bf4.

⛔ Files ignored due to path filters (1)
package-lock.json is excluded by !\*\*/package-lock.json
📒 Files selected for processing (36)
app/api/portal/client/browse-meta/route.ts
app/api/stock-allocations/route.ts
app/api/stock-movements/route.ts
app/api/stocks/[id]/route.ts
app/api/stocks/product/[productId]/route.ts
app/api/stocks/route.ts
app/api/stocks/warehouse/[warehouseId]/route.ts
app/api/warehouses/route.ts
app/inventory/move-history/page.tsx
app/inventory/stock/page.tsx
app/settings/warehouses/[id]/page.tsx
app/settings/warehouses/page.tsx
components/Pages/WarehouseDetailPage.tsx
components/admin/AdminMyActivityContent.tsx
components/layouts/AdminSidebar.tsx
components/layouts/Navbar.tsx
components/layouts/SidebarLayout.tsx
components/warehouses/WarehouseDialog.tsx
components/warehouses/WarehouseFilters.tsx
components/warehouses/WarehouseList.tsx
components/warehouses/WarehouseTable.tsx
components/warehouses/WarehouseTableColumns.tsx
hooks/queries/use-stock-allocation.ts
lib/react-query/config.ts
lib/react-query/invalidate-all.ts
lib/server/dashboard-data.ts
lib/server/warehouses-data.ts
modules/stock-movement/api/stock-movement.service.ts
modules/stock-movement/components/MoveHistory.tsx
modules/stock/api/stock.service.ts
modules/stock/components/StockDetailsModal.tsx
modules/stock/components/StockOverview.tsx
prisma/schema.prisma
prisma/stock-allocation.ts
scripts/delete-all-data.ts
types/warehouse.ts
💤 Files with no reviewable changes (2)
app/api/stock-allocations/route.ts
prisma/stock-allocation.ts
app/api/stock-movements/route.ts
Comment on lines +2 to +4
import { getSession } from "next-auth/react"; // Assuming next-auth is used
import { StockMovementService } from "@/modules/stock-movement/api/stock-movement.service";
import { StockMovementType } from "@prisma/client";
@coderabbitai
coderabbitai bot
2 hours ago
⚠️ Potential issue | 🔴 Critical

Use the authenticated user in both handlers.

Sibling inventory routes already call getSessionFromRequest(req), but this endpoint is public on GET and writes movements under a hardcoded placeholder on POST. That exposes movement history and breaks ownership/auditability for writes. Resolve the session up front in both handlers, return 401 when absent, and pass session.id into the service.

Suggested change
import { NextRequest, NextResponse } from "next/server";
-import { getSession } from "next-auth/react"; // Assuming next-auth is used
+import { getSessionFromRequest } from "@/utils/auth";
import { StockMovementService } from "@/modules/stock-movement/api/stock-movement.service";
import { StockMovementType } from "@prisma/client";
@@
export async function GET(req: NextRequest) {
try {

- const session = await getSessionFromRequest(req);
- if (!session) {
-      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
- }
-      const { searchParams } = new URL(req.url);
  @@
  const movements = await StockMovementService.getAllMovements({
-      userId: session.id,
         productId,
         warehouseId,
         movementType,

  @@
  export async function POST(req: NextRequest) {
  try {

- // In a real app, you'd get the user ID from the session
- // const session = await getSession({ req });
- const userId = "manual_admin"; // Placeholder

- const session = await getSessionFromRequest(req);
- if (!session) {
-      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
- }

  const body = await req.json();
  const movement = await StockMovementService.createMovement({
  ...body,

-      userId,

-      userId: session.id,
       });
  Also applies to: 9-26, 39-49

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@app/api/stock-movements/route.ts` around lines 2 - 4, Both GET and POST
handlers in route.ts must authenticate requests: resolve the session up front
(use the same helper as siblings, e.g. getSessionFromRequest(req) or getSession)
and if no session return a 401 response, then pass the authenticated user id
into StockMovementService methods instead of using a hardcoded placeholder;
update both the GET handler (where movements are currently publicly returned)
and the POST handler (where new movements are being created under a placeholder
owner) to call/get session before any work and forward session.id into
StockMovementService methods (refer to StockMovementService and
StockMovementType in this file).
@arnobt78 Reply...
app/api/stock-movements/route.ts
Comment on lines +11 to +16
const { searchParams } = new URL(req.url);
const productId = searchParams.get("productId") || undefined;
const warehouseId = searchParams.get("warehouseId") || undefined;
const movementType = searchParams.get("movementType") as StockMovementType | undefined;
const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;
@coderabbitai
coderabbitai bot
2 hours ago
⚠️ Potential issue | 🟠 Major

Reject malformed filter params with 400.

An arbitrary movementType string or an invalid date currently falls through to the service and becomes a server error. Validate the enum/date inputs here before calling Prisma so bad requests stay bad requests instead of turning into 500s.

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@app/api/stock-movements/route.ts` around lines 11 - 16, Validate and reject
malformed filter params before calling the service: check that movementType
(from movementType variable) is either undefined or one of the StockMovementType
enum values and that startDate/endDate strings parse to valid dates (new
Date(...) yields a valid date and not NaN); if any validation fails return a 400
response (e.g., throw new Response or NextResponse with status 400 and a clear
error message). Also ensure you stop execution when rejecting (don’t call the
Prisma/service methods) and optionally validate startDate <= endDate if both
provided. Use the existing variables movementType, startDate, endDate and the
StockMovementType enum to implement these checks.
@arnobt78 Reply...
app/api/stocks/[id]/route.ts
Comment on lines +30 to +39
const dataToUpdate: any = {};
if (quantity !== undefined) {
dataToUpdate.quantity = parseInt(String(quantity), 10);
}
if (reservedQuantity !== undefined) {
dataToUpdate.reservedQuantity = parseInt(String(reservedQuantity), 10);
}

    const updatedStock = await StockService.updateStock(id, dataToUpdate);

@coderabbitai
coderabbitai bot
2 hours ago
⚠️ Potential issue | 🔴 Critical

Pass user.id into stock updates to prevent ledger write failures.

On Line 38, StockService.updateStock is called without userId. When quantity changes, movement logging uses data.userId; this becomes undefined, causing update flows to fail after the stock row update has already happened.

💡 Suggested fix

- const dataToUpdate: any = {};

- const dataToUpdate: {
-      userId: string;
-      quantity?: number;
-      reservedQuantity?: number;
- } = { userId: user.id };
  🤖 Prompt for AI Agents
  Verify each finding against the current code and only fix it if needed.

In `@app/api/stocks/`[id]/route.ts around lines 30 - 39, The update call omits the
user id, causing downstream movement logging to see data.userId as undefined;
add the authenticated user's id into the update payload (e.g., set
dataToUpdate.userId = user.id) before calling StockService.updateStock(id,
dataToUpdate) so movement/ledger flows have the required userId; if your
updateStock signature expects a separate userId parameter, pass user.id as that
argument instead and ensure references to data.userId in movement logging will
receive a valid value.
@arnobt78 Reply...
app/api/stocks/[id]/route.ts
Comment on lines +31 to +36
if (quantity !== undefined) {
dataToUpdate.quantity = parseInt(String(quantity), 10);
}
if (reservedQuantity !== undefined) {
dataToUpdate.reservedQuantity = parseInt(String(reservedQuantity), 10);
}
@coderabbitai
coderabbitai bot
2 hours ago
⚠️ Potential issue | 🟠 Major

Reject invalid numeric payloads before calling the service.

On Line 32 and Line 35, parseInt can yield NaN (e.g., "abc"), which currently falls into a 500 path instead of a 400 validation response.

💡 Suggested fix
📝 Committable suggestion
🤖 Prompt for AI Agents
@arnobt78 Reply...
app/api/stocks/product/[productId]/route.ts
Comment on lines +29 to +33
} catch (error: any) {
console.error(`Error fetching stock for product ${productId || 'unknown'}:`, error);
return NextResponse.json(
{ success: false, error: error.message || "Failed to fetch stock for product" },
{ status: 500 }
@coderabbitai
coderabbitai bot
2 hours ago
⚠️ Potential issue | 🟠 Major

Do not expose raw exception messages in API responses.

Returning error.message can leak internal details. Log full errors server-side and return a generic client-safe message.

🛡️ Suggested error-handling hardening

- } catch (error: any) {
- console.error(`Error fetching stock for product ${productId || 'unknown'}:`, error);

- } catch (error: unknown) {
- console.error(`Error fetching stock for product ${productId || "unknown"}:`, error);
  return NextResponse.json(

-      { success: false, error: error.message || "Failed to fetch stock for product" },

-      { success: false, error: "Failed to fetch stock for product" },
         { status: 500 }
       );
  }
  📝 Committable suggestion
  ‼️ IMPORTANT
  Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

Suggested change
} catch (error: any) {
console.error(`Error fetching stock for product ${productId || 'unknown'}:`, error);
return NextResponse.json(
{ success: false, error: error.message || "Failed to fetch stock for product" },
{ status: 500 }
} catch (error: unknown) {
console.error(`Error fetching stock for product ${productId || "unknown"}:`, error);
return NextResponse.json(
{ success: false, error: "Failed to fetch stock for product" },
{ status: 500 }
);
}
🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@app/api/stocks/product/`[productId]/route.ts around lines 29 - 33, The catch
block currently returns error.message to the client which can leak internals;
instead keep logging the full error server-side (e.g., via console.error or
processLogger) including productId, but change the NextResponse.json payload to
a generic client-safe message (e.g., "Failed to fetch stock for product" or
"Internal server error") and a 500 status; update the catch in route.ts (the
block referencing productId and NextResponse.json) to remove error.message from
the response body while retaining detailed server-side logging.
@arnobt78 Reply...
6 hidden conversations
Load more…
modules/stock-movement/api/stock-movement.service.ts
Comment on lines +56 to +94
static async getAllMovements(filters: {
productId?: string;
warehouseId?: string;
movementType?: StockMovementType;
startDate?: Date;
endDate?: Date;
}) {
const where: any = {};

    if (filters.productId) {
      where.productId = filters.productId;
    }

    if (filters.warehouseId) {
      where.OR = [
        { sourceWarehouseId: filters.warehouseId },
        { destinationWarehouseId: filters.warehouseId },
      ];
    }

    if (filters.movementType) {
      where.movementType = filters.movementType;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return await prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { name: true, sku: true } },
        sourceWarehouse: { select: { name: true } },
        destinationWarehouse: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

@coderabbitai
coderabbitai bot
2 hours ago
⚠️ Potential issue | 🔴 Critical

Require userId in movement reads.

StockMovement carries userId, but this query ignores it, and app/inventory/move-history/page.tsx currently calls getAllMovements({}). That page will render every tenant's movement history once data exists. Make userId mandatory here and seed where with it.

Suggested change
static async getAllMovements(filters: {

- userId: string;
  productId?: string;
  warehouseId?: string;
  movementType?: StockMovementType;
  startDate?: Date;
  endDate?: Date;
  }) {

- const where: any = {};

- const where: any = { userId: filters.userId };
  📝 Committable suggestion
  ‼️ IMPORTANT
  Carefully review the code before committing. Ensure that it accurately replaces the highlighted code, contains no missing lines, and has no issues with indentation. Thoroughly test & benchmark the code to ensure it meets the requirements.

Suggested change
static async getAllMovements(filters: {
productId?: string;
warehouseId?: string;
movementType?: StockMovementType;
startDate?: Date;
endDate?: Date;
}) {
const where: any = {};
if (filters.productId) {
where.productId = filters.productId;
}
if (filters.warehouseId) {
where.OR = [
{ sourceWarehouseId: filters.warehouseId },
{ destinationWarehouseId: filters.warehouseId },
];
}
if (filters.movementType) {
where.movementType = filters.movementType;
}
if (filters.startDate || filters.endDate) {
where.createdAt = {};
if (filters.startDate) where.createdAt.gte = filters.startDate;
if (filters.endDate) where.createdAt.lte = filters.endDate;
}
return await prisma.stockMovement.findMany({
where,
include: {
product: { select: { name: true, sku: true } },
sourceWarehouse: { select: { name: true } },
destinationWarehouse: { select: { name: true } },
},
orderBy: { createdAt: "desc" },
});
static async getAllMovements(filters: {
userId: string;
productId?: string;
warehouseId?: string;
movementType?: StockMovementType;
startDate?: Date;
endDate?: Date;
}) {
const where: any = { userId: filters.userId };
if (filters.productId) {
where.productId = filters.productId;
}
if (filters.warehouseId) {
where.OR = [
{ sourceWarehouseId: filters.warehouseId },
{ destinationWarehouseId: filters.warehouseId },
];
}
if (filters.movementType) {
where.movementType = filters.movementType;
}
if (filters.startDate || filters.endDate) {
where.createdAt = {};
if (filters.startDate) where.createdAt.gte = filters.startDate;
if (filters.endDate) where.createdAt.lte = filters.endDate;
}
return await prisma.stockMovement.findMany({
where,
include: {
product: { select: { name: true, sku: true } },
sourceWarehouse: { select: { name: true } },
destinationWarehouse: { select: { name: true } },
},
orderBy: { createdAt: "desc" },
});
🤖 Prompt for AI Agents
@arnobt78 Reply...
modules/stock/api/stock.service.ts
Comment on lines +56 to +67
const existing = await prisma.stock.findUnique({
where: {
productId_warehouseId: {
productId: data.productId,
warehouseId: data.warehouseId,
},
},
});

    if (existing) {
      throw new Error("Stock record already exists for this product in this warehouse.");
    }

@coderabbitai
coderabbitai bot
2 hours ago
⚠️ Potential issue | 🔴 Critical

Make stock mutation + movement logging atomic.

Current flow performs stock writes before movement writes. If movement creation fails, the ledger diverges from actual stock. Also, the read-before-create duplicate check is race-prone under concurrent requests.

💡 Suggested direction

- const existing = await prisma.stock.findUnique(...)
- if (existing) throw new Error(...)
- const stock = await prisma.stock.create(...)
- if (data.quantity > 0) await StockMovementService.createMovement(...)

- // Prefer a single transactional write path:
- // 1) create/update stock
- // 2) insert movement
- // 3) rollback both on any failure
  Use one DB transaction for both operations, and rely on DB uniqueness guarantees for duplicate protection.

Also applies to: 73-96, 126-147

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@modules/stock/api/stock.service.ts` around lines 56 - 67, The current
read-then-create duplicate check (prisma.stock.findUnique) and separate writes
cause race conditions and ledger divergence if movement creation fails; replace
both operations with a single DB transaction that creates the stock and the
corresponding movement inside the same transaction (use prisma.$transaction with
prisma.stock.create and prisma.movement.create), remove the pre-check and rely
on the DB unique constraint, and catch Prisma unique-constraint errors (P2002)
to rethrow a friendly "Stock record already exists..." error while letting other
errors bubble up so the transaction can rollback.
@arnobt78 Reply...
modules/stock/api/stock.service.ts
Comment on lines +129 to +131
quantity: updatedQuantity,
reservedQuantity: data.reservedQuantity ?? stock.reservedQuantity,
updatedAt: new Date(),
@coderabbitai
coderabbitai bot
2 hours ago
⚠️ Potential issue | 🟠 Major

Validate reservedQuantity bounds before persisting.

reservedQuantity is updated without checks. Negative values or values above total quantity will produce invalid availability states.

💡 Suggested fix
📝 Committable suggestion
🤖 Prompt for AI Agents
@arnobt78 Reply...
modules/stock/components/StockOverview.tsx

// Fetch all stocks
const { data, isLoading, error } = useQuery({
queryKey: ["stocks-all"],
@coderabbitai
coderabbitai bot
2 hours ago
⚠️ Potential issue | 🟠 Major

🧩 Analysis chain
🏁 Script executed:

# !/bin/bash

# Verify key mismatch between this component and central query key config

rg -n 'queryKey:\s*\["stocks-all"\]' modules/stock/components/StockOverview.tsx
rg -n 'stocks:\s*\{' lib/react-query/config.ts -A12
rg -n 'queryKeys\.stocks' lib/react-query
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 1147

🏁 Script executed:

rg -n '\["stocks-all"\]' --type tsx --type ts
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 141

🏁 Script executed:

head -n 50 modules/stock/components/StockOverview.tsx
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 1739

🏁 Script executed:

rg -n 'invalidateQueries.\*stocks' lib/react-query -A2 -B2
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 662

🏁 Script executed:

rg '\["stocks-all"\]'
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 186

🏁 Script executed:

rg 'queryKeys\.stocks' lib/react-query/config.ts -A1 -B1
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 487

Update query key to match the shared stocks namespace.

Line 35 uses ["stocks-all"], but the shared config defines queryKeys.stocks.all as ["stocks"]. This breaks cache invalidation—mutations that target ["stocks"] won't invalidate this query, causing stale data.

Add the import and use the shared key:

Fix
📝 Committable suggestion
🤖 Prompt for AI Agents
@arnobt78 Reply...
scripts/delete-all-data.ts
Comment on lines +38 to +39
const stock = await prisma.stock.deleteMany({});
console.log(`Stock: ${stock.count}`);
@coderabbitai
coderabbitai bot
2 hours ago
⚠️ Potential issue | 🔴 Critical

🧩 Analysis chain
Move Stock deletion before Product to maintain stated dependency order.

Line 22 establishes the rule: "Delete in dependency order (children before parents)". The current code violates this by deleting Product (line 35) before Stock (line 38), even though Stock depends on Product via the productId foreign key. Reorder these deletions to delete Stock first, then Product.

Suggested fix
🤖 Prompt for AI Agents
@arnobt78 Reply...
This branch has not been deployed
No deployments
Merge info
Some checks were not successful
1 failing, 2 successful checks

failing checks
Vercel
Vercel — Authorization required to deploy.
successful checks
CodeRabbit
CodeRabbit — Review completed
GitGuardian Security Checks
GitGuardian Security ChecksSuccessful in 32s — No secrets detected ✅
No conflicts with base branch
Merging can be performed automatically.⚠️ Potential issue | 🔴 Critical

Make stock mutation + movement logging atomic.

Current flow performs stock writes before movement writes. If movement creation fails, the ledger diverges from actual stock. Also, the read-before-create duplicate check is race-prone under concurrent requests.

💡 Suggested direction

- const existing = await prisma.stock.findUnique(...)
- if (existing) throw new Error(...)
- const stock = await prisma.stock.create(...)
- if (data.quantity > 0) await StockMovementService.createMovement(...)

- // Prefer a single transactional write path:

- // 1) create/update stock
- // 2) insert movement
- // 3) rollback both on any failure
  Use one DB transaction for both operations, and rely on DB uniqueness guarantees for duplicate protection.

Also applies to: 73-96, 126-147

🤖 Prompt for AI Agents
Verify each finding against the current code and only fix it if needed.

In `@modules/stock/api/stock.service.ts` around lines 56 - 67, The current
read-then-create duplicate check (prisma.stock.findUnique) and separate writes
cause race conditions and ledger divergence if movement creation fails; replace
both operations with a single DB transaction that creates the stock and the
corresponding movement inside the same transaction (use prisma.$transaction with
prisma.stock.create and prisma.movement.create), remove the pre-check and rely
on the DB unique constraint, and catch Prisma unique-constraint errors (P2002)
to rethrow a friendly "Stock record already exists..." error while letting other
errors bubble up so the transaction can rollback.
@arnobt78 Reply...
modules/stock/api/stock.service.ts
Comment on lines +129 to +131
quantity: updatedQuantity,
reservedQuantity: data.reservedQuantity ?? stock.reservedQuantity,
updatedAt: new Date(),
@coderabbitai
coderabbitai bot
2 hours ago
⚠️ Potential issue | 🟠 Major

Validate reservedQuantity bounds before persisting.

reservedQuantity is updated without checks. Negative values or values above total quantity will produce invalid availability states.

💡 Suggested fix
📝 Committable suggestion
🤖 Prompt for AI Agents
@arnobt78 Reply...
modules/stock/components/StockOverview.tsx

// Fetch all stocks
const { data, isLoading, error } = useQuery({
queryKey: ["stocks-all"],
@coderabbitai
coderabbitai bot
2 hours ago
⚠️ Potential issue | 🟠 Major

🧩 Analysis chain
🏁 Script executed:

# !/bin/bash

# Verify key mismatch between this component and central query key config

rg -n 'queryKey:\s*\["stocks-all"\]' modules/stock/components/StockOverview.tsx
rg -n 'stocks:\s*\{' lib/react-query/config.ts -A12
rg -n 'queryKeys\.stocks' lib/react-query
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 1147

🏁 Script executed:

rg -n '\["stocks-all"\]' --type tsx --type ts
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 141

🏁 Script executed:

head -n 50 modules/stock/components/StockOverview.tsx
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 1739

🏁 Script executed:

rg -n 'invalidateQueries.\*stocks' lib/react-query -A2 -B2
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 662

🏁 Script executed:

rg '\["stocks-all"\]'
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 186

🏁 Script executed:

rg 'queryKeys\.stocks' lib/react-query/config.ts -A1 -B1
Repository: arnobt78/Warehouse-Stock-Inventory-Management-System--NextJS-FullStack

Length of output: 487

Update query key to match the shared stocks namespace.

Line 35 uses ["stocks-all"], but the shared config defines queryKeys.stocks.all as ["stocks"]. This breaks cache invalidation—mutations that target ["stocks"] won't invalidate this query, causing stale data.

Add the import and use the shared key:

Fix
📝 Committable suggestion
🤖 Prompt for AI Agents
@arnobt78 Reply...
scripts/delete-all-data.ts
Comment on lines +38 to +39
const stock = await prisma.stock.deleteMany({});
console.log(`Stock: ${stock.count}`);
@coderabbitai
coderabbitai bot
2 hours ago
⚠️ Potential issue | 🔴 Critical

🧩 Analysis chain
Move Stock deletion before Product to maintain stated dependency order.

Line 22 establishes the rule: "Delete in dependency order (children before parents)". The current code violates this by deleting Product (line 35) before Stock (line 38), even though Stock depends on Product via the productId foreign key. Reorder these deletions to delete Stock first, then Product.

Suggested fix
🤖 Prompt for AI Agents
@arnobt78 Reply...
This branch has not been deployed
No deployments
Merge info
Some checks were not successful
1 failing, 2 successful checks

failing checks
Vercel
Vercel — Authorization required to deploy.
successful checks
CodeRabbit
CodeRabbit — Review completed
GitGuardian Security Checks
GitGuardian Security ChecksSuccessful in 32s — No secrets detected ✅
No conflicts with base branch
Merging can be performed automatically.
