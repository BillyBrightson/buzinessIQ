import type { AppRole } from "./types"

export interface FeaturePermission {
  id: string
  label: string
  description: string
  path: string
  category: string
  roles: AppRole[]
}

export const FEATURE_PERMISSIONS: FeaturePermission[] = [
  // Core
  { id: "dashboard", label: "Dashboard", description: "View business overview and key metrics", path: "/dashboard", category: "Core", roles: ["admin", "store_keeper", "accountant"] },
  // HR & People
  { id: "employees", label: "Employees", description: "Manage employee records and profiles", path: "/employees", category: "HR & People", roles: ["admin"] },
  { id: "attendance", label: "Attendance", description: "Track and record daily attendance", path: "/attendance", category: "HR & People", roles: ["admin"] },
  { id: "payroll", label: "Payroll", description: "Process employee payroll", path: "/payroll", category: "HR & People", roles: ["admin"] },
  // Projects
  { id: "projects", label: "Projects", description: "Manage projects and tasks", path: "/projects", category: "Projects", roles: ["admin", "accountant"] },
  // Finance
  { id: "finance", label: "Finance Overview", description: "View financial summary", path: "/finance", category: "Finance", roles: ["admin", "accountant"] },
  { id: "invoices", label: "Invoices", description: "Create and manage client invoices", path: "/finance/invoices", category: "Finance", roles: ["admin", "accountant"] },
  { id: "payments", label: "Payments", description: "Record and track payments", path: "/finance/payments", category: "Finance", roles: ["admin", "accountant"] },
  // Accounting
  { id: "accounting", label: "Accounting", description: "Accounting entries and chart of accounts", path: "/accounting", category: "Accounting", roles: ["admin", "accountant"] },
  // Reports
  { id: "reports", label: "Reports", description: "Generate and export business reports", path: "/reports", category: "Reports", roles: ["admin", "accountant"] },
  // Point of Sale
  { id: "pos_terminal", label: "POS Terminal", description: "Process sales transactions at the counter", path: "/pos", category: "Point of Sale", roles: ["admin", "store_keeper"] },
  { id: "pos_products", label: "Products & Inventory", description: "Manage products, pricing, and stock levels", path: "/pos/products", category: "Point of Sale", roles: ["admin", "store_keeper"] },
  { id: "pos_sales", label: "Sales History", description: "View and search past sales records", path: "/pos/sales", category: "Point of Sale", roles: ["admin", "store_keeper", "accountant"] },
  // Point of Sale — additional
  { id: "stock_transfer", label: "Stock Transfer", description: "Transfer inventory between branches", path: "/pos/stock-transfer", category: "Point of Sale", roles: ["admin", "store_keeper"] },
  { id: "cash_drawer", label: "Cash Drawer", description: "Open and close branch cash drawer", path: "/pos/cash-drawer", category: "Point of Sale", roles: ["admin", "store_keeper"] },

  // Settings
  { id: "settings", label: "Settings", description: "Configure company, users, and system settings", path: "/settings", category: "Settings", roles: ["admin"] },
  { id: "branch_management", label: "Branch Management", description: "Create and manage store branches", path: "/settings", category: "Settings", roles: ["admin"] },
]

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  store_keeper: "Store Keeper",
  accountant: "Accountant",
}

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  admin: "Full access to all features and settings",
  store_keeper: "POS terminal, products, inventory management, and sales history",
  accountant: "Finance, accounting, invoices, payments, projects, and reports",
}

export const ROLE_COLORS: Record<AppRole, string> = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  store_keeper: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  accountant: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
}

/** Check if a role has access to a given path. Admin always has full access. */
export function canAccess(role: AppRole, path: string): boolean {
  if (role === "admin") return true
  const feature = FEATURE_PERMISSIONS.find(
    (f) => path === f.path || path.startsWith(f.path + "/")
  )
  if (!feature) return false
  return feature.roles.includes(role)
}

/** Get all paths accessible by a role */
export function getAccessiblePaths(role: AppRole): string[] {
  if (role === "admin") return FEATURE_PERMISSIONS.map((f) => f.path)
  return FEATURE_PERMISSIONS.filter((f) => f.roles.includes(role)).map((f) => f.path)
}

/** Group features by category for the permissions matrix UI */
export function getPermissionsByCategory(): Record<string, FeaturePermission[]> {
  const byCategory: Record<string, FeaturePermission[]> = {}
  FEATURE_PERMISSIONS.forEach((p) => {
    if (!byCategory[p.category]) byCategory[p.category] = []
    byCategory[p.category].push(p)
  })
  return byCategory
}
