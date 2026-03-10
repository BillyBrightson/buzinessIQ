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
}

export interface Company {
  id: string
  userId: string
  name: string
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
