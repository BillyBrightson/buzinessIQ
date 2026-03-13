export interface Employee {
  id: string
  fullName: string
  email?: string
  ghanaCardId: string
  healthInsurance?: string
  role: "admin" | "manager" | "worker"
  hourlyRate: number
  joinDate: string
  isActive: boolean
  deactivatedDate?: string
  momoNumber?: string
  momoNetwork?: "MTN" | "Telecel" | "AirtelTigo"
  momoName?: string
  bankAccount?: {
    bankName: string
    accountNumber: string
    branch: string
  }
  employmentType?: "full-time" | "part-time" | "contract"
  phone?: string
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  status: "present" | "absent" | "leave"
  hoursWorked?: number
}

export interface PayrollRecord {
  id: string
  employeeId: string
  period: string // ISO week string YYYY-W##
  totalHours: number
  ratePerHour: number
  totalAmount: number
  status: "pending" | "processed" | "paid"
  processedDate?: string
}

export interface Project {
  id: string
  name: string
  clientName: string
  location: string
  description?: string
  startDate: string
  estimatedEndDate?: string
  status: "planning" | "active" | "completed"
}

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  status: "todo" | "in-progress" | "done"
  assignedEmployees: string[] // employee IDs
  createdDate: string
  dueDate?: string
  priority?: "low" | "medium" | "high"
  tag?: string
  cost?: number
}

export interface Company {
  id: string
  userId: string
  name: string
  address?: string
  phone?: string
  email?: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  cost: number
  stock: number
  unit: string
  barcode: string
  lowStockThreshold: number
  isActive: boolean
  createdAt: string
}

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Sale {
  id: string
  receiptNumber: string
  items: SaleItem[]
  subtotal: number
  discount: number
  taxRate: number
  tax: number
  taxAmount: number
  total: number
  amountPaid: number
  amountTendered: number
  change: number
  paymentMethod: string
  cashierId?: string
  cashierName?: string
  branchId?: string
  branchName?: string
  date: string
  createdAt: string
}

export type AppRole = "admin" | "store_keeper" | "accountant"

export interface TeamMember {
  id: string
  email: string
  name: string
  role: "cashier" | "store_keeper" | "accountant"
  uid?: string // Firebase UID of the created account
  createdAt: string
  isActive: boolean
}

export interface RoleAssignment {
  uid: string // Firebase UID of the team member
  email: string
  name: string
  role: Exclude<AppRole, "admin">
  adminUid: string // Which admin created this
  branchId?: string // Lock this member to a specific branch
  branchName?: string
  createdAt: string
  isActive: boolean
}

export interface Branch {
  id: string
  name: string
  address?: string
  isDefault: boolean
  isActive: boolean
  createdAt: string
}

export interface StockTransferItem {
  productId: string
  productName: string
  quantity: number
}

export interface StockTransfer {
  id: string
  fromBranchId: string
  fromBranchName: string
  toBranchId: string
  toBranchName: string
  items: StockTransferItem[]
  status: "pending" | "completed" | "cancelled"
  notes?: string
  transferredBy?: string
  createdAt: string
  completedAt?: string
}

export interface CashDrawer {
  id: string
  branchId: string
  branchName: string
  date: string
  openingFloat: number
  closingFloat?: number
  totalSales?: number
  variance?: number
  notes?: string
  status: "open" | "closed"
  openedBy?: string
  closedBy?: string
  createdAt: string
}

export interface PrintSettings {
  showCompanyName: boolean
  showCompanyAddress: boolean
  showTax: boolean
  footerMessage: string
}

export interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  paymentMethod: "cash" | "momo" | "bank_transfer" | "card"
  projectId?: string
  receiptRef?: string
  createdAt: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface Invoice {
  id: string
  projectId?: string
  clientId?: string
  clientName: string // Denormalized for simpler UI if no separate Client entity
  invoiceNumber: string
  date: string
  dueDate: string
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  status: "draft" | "sent" | "paid" | "overdue"
  notes?: string
}

export interface Payment {
  id: string
  projectId: string
  amount: number
  date: string
  method: "cash" | "check" | "bank_transfer" | "momo"
  status: "part-payment" | "full-payment"
  reference?: string
  notes?: string
  invoiceId: string // Made required as per user instruction "without invoice you cant record a payment"
}

// Accounting Types
export interface ChartOfAccount {
  id: string
  code: string // e.g., "1000", "2000", "4000"
  name: string // e.g., "Cash", "Accounts Payable", "Revenue"
  type: "asset" | "liability" | "equity" | "revenue" | "expense"
  subType?: string // e.g., "current-asset", "fixed-asset", "operating-expense"
  parentId?: string // For hierarchical account structure
  isActive: boolean
  description?: string
  balance: number // Current balance
}

export interface JournalEntry {
  id: string
  date: string
  reference: string // e.g., "JE-001", "INV-2024-001"
  description: string
  type: "general" | "invoice" | "payment" | "payroll" | "adjustment"
  status: "draft" | "posted" | "void"
  createdBy?: string
  createdAt: string
  postedAt?: string
  lines: JournalEntryLine[]
  attachments?: string[]
  projectId?: string // Link to project if applicable
  invoiceId?: string // Link to invoice if applicable
  paymentId?: string // Link to payment if applicable
}

export interface JournalEntryLine {
  id: string
  accountId: string // Reference to ChartOfAccount
  accountCode: string // Denormalized for display
  accountName: string // Denormalized for display
  debit: number
  credit: number
  description?: string
}

export interface AccountTransaction {
  id: string
  date: string
  accountId: string
  journalEntryId: string
  reference: string
  description: string
  debit: number
  credit: number
  balance: number // Running balance after this transaction
  type: "general" | "invoice" | "payment" | "payroll" | "adjustment"
}

export interface BudgetItem {
  id: string
  accountId: string
  accountCode: string
  accountName: string
  projectId?: string // Optional: budget can be per project or overall
  period: string // e.g., "2024-Q1", "2024-12", "2024"
  budgetedAmount: number
  actualAmount: number
  variance: number
  notes?: string
}

export interface FinancialReport {
  id: string
  type: "balance-sheet" | "income-statement" | "cash-flow" | "trial-balance"
  name: string
  startDate: string
  endDate: string
  generatedAt: string
  data: any // Report-specific data structure
  projectId?: string // Optional: can generate reports per project
}
