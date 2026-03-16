# Feature Access Control Checklist

Before implementing any new feature in BuzinessIQ, answer these questions to define access control. Do NOT proceed with implementation until access is confirmed.

---

## Step 1 — Describe the feature

What is the feature you are building?
- Feature name:
- Route/path (if applicable):
- What does it allow the user to do?

---

## Step 2 — Role access confirmation

For each role below, should they have access to this feature?

| Role | Access? | Reason |
|------|---------|--------|
| **Admin** | ✅ Always yes | Full access by default |
| **Store Keeper** | Yes / No | (relate to POS, inventory, stock) |
| **Accountant** | Yes / No | (relate to finance, reports, billing) |

---

## Step 3 — Permission level

For roles granted access, what level of permission applies?

- **Full CRUD** (create, read, update, delete)?
- **Read-only** (view only)?
- **Write-only** (e.g., cashier can create sales but not edit)?

---

## Step 4 — Sidebar visibility

Should this feature appear in the sidebar navigation?
- If yes: which section does it belong to?
- Should it be a top-level item or sub-item?

---

## Step 5 — Update `lib/rbac.ts`

After confirming the above, add the feature to `FEATURE_PERMISSIONS` in [lib/rbac.ts](lib/rbac.ts):

```typescript
{
  id: "feature_id",
  label: "Feature Label",
  description: "Short description of what it does",
  path: "/route/path",
  category: "Category Name",  // Core | HR & People | Projects | Finance | Accounting | Reports | Point of Sale | Settings
  roles: ["admin", /* "store_keeper", "accountant" — add as confirmed above */],
},
```

---

## Step 6 — Route protection (optional)

If the route should redirect unauthorized users, add a check at the top of the page component:

```typescript
const { can } = useAuth()
const router = useRouter()

useEffect(() => {
  if (!can("/your/route")) router.push("/dashboard")
}, [can])
```

---

## Step 7 — Update BuzinessIQ AI context ⚠️ REQUIRED

Every new feature with queryable data MUST be added to `buildContext()` in [components/ai-search-island.tsx](components/ai-search-island.tsx) so the AI can answer questions about it.

Ask yourself:
- Does this feature have data the user might ask the AI about? (e.g. "how many X?", "what is the price of Y?", "show me Z from today")
- If YES → add a `fetchCol<Type>("collectionName")` block inside the relevant `canAccess()` guard

Pattern:
```typescript
if (canAccess("/your/route")) {
  const items = await fetchCol<{ field: type }>("firestoreCollection")
  stats.your_feature = {
    total: items.length,
    // ...relevant aggregates and lists
  }
}
```

The AI reads the entire `stats` object — the more detail you include (names, prices, counts, dates), the more accurately it can answer user questions.

---

## Step 8 — Update suggestions in AI island (optional)

If the feature introduces common queries users will ask, add example prompts to the `suggestions` array in [components/ai-search-island.tsx](components/ai-search-island.tsx):

```typescript
const suggestions = [
  "How many sales today?",
  "What is the price of [your product]?",  // ← add relevant examples
  ...
]
```

---

## Reminder: Roles summary

| Role | Default access |
|------|---------------|
| **Admin** | Everything — full control, settings, all modules |
| **Store Keeper** | Dashboard, POS terminal, products, inventory, sales history |
| **Accountant** | Dashboard, finance, invoices, payments, accounting, projects, reports, sales history |

> The RBAC config lives in [lib/rbac.ts](lib/rbac.ts). The `can(path)` helper is available via `useAuth()`. Sidebar filtering is automatic once `FEATURE_PERMISSIONS` is updated.