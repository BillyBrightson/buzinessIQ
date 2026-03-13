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

## Reminder: Roles summary

| Role | Default access |
|------|---------------|
| **Admin** | Everything — full control, settings, all modules |
| **Store Keeper** | Dashboard, POS terminal, products, inventory, sales history |
| **Accountant** | Dashboard, finance, invoices, payments, accounting, projects, reports, sales history |

> The RBAC config lives in [lib/rbac.ts](lib/rbac.ts). The `can(path)` helper is available via `useAuth()`. Sidebar filtering is automatic once `FEATURE_PERMISSIONS` is updated.