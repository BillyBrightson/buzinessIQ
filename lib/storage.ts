import type { Employee, AttendanceRecord, PayrollRecord, Project, Task, Company, Invoice, Payment, ChartOfAccount, JournalEntry, AccountTransaction, BudgetItem, Product, Sale, TeamMember, PrintSettings } from "./types"


const getKeys = (userId?: string) => ({
  employees: userId ? `crm_${userId}_employees` : "crm_employees",
  attendance: userId ? `crm_${userId}_attendance` : "crm_attendance",
  payroll: userId ? `crm_${userId}_payroll` : "crm_payroll",
  projects: userId ? `crm_${userId}_projects` : "crm_projects",
  tasks: userId ? `crm_${userId}_tasks` : "crm_tasks",
  company: userId ? `crm_${userId}_company` : "crm_company",
  invoices: userId ? `crm_${userId}_invoices` : "crm_invoices",
  payments: userId ? `crm_${userId}_payments` : "crm_payments",
  chartOfAccounts: userId ? `crm_${userId}_chartOfAccounts` : "crm_chartOfAccounts",
  journalEntries: userId ? `crm_${userId}_journalEntries` : "crm_journalEntries",
  accountTransactions: userId ? `crm_${userId}_accountTransactions` : "crm_accountTransactions",
  budgets: userId ? `crm_${userId}_budgets` : "crm_budgets",
  products: userId ? `crm_${userId}_products` : "crm_products",
  sales: userId ? `crm_${userId}_sales` : "crm_sales",
  teamMembers: userId ? `crm_${userId}_teamMembers` : "crm_teamMembers",
})

// Initialize with sample data only if no userId is provided (Demo Mode)
function initializeSampleData(userId?: string) {
  if (userId || typeof window === "undefined") return

  const keys = getKeys()

  if (!localStorage.getItem(keys.employees)) {
    const sampleEmployees: Employee[] = [
      {
        id: "1",
        fullName: "Kwame Asante",
        ghanaCardId: "123456789012",
        healthInsurance: "National Health Insurance Scheme",
        role: "admin",
        hourlyRate: 50,
        joinDate: "2024-01-15",
        isActive: true,
      },
      {
        id: "2",
        fullName: "Ama Osei",
        ghanaCardId: "234567890123",
        healthInsurance: "Private Health Insurance",
        role: "manager",
        hourlyRate: 40,
        joinDate: "2024-02-01",
        isActive: true,
      },
      {
        id: "3",
        fullName: "Kofi Mensah",
        ghanaCardId: "345678901234",
        role: "worker",
        hourlyRate: 25,
        joinDate: "2024-03-10",
        isActive: true,
      },
      {
        id: "4",
        fullName: "Abena Kyei",
        ghanaCardId: "456789012345",
        role: "worker",
        hourlyRate: 25,
        joinDate: "2024-03-15",
        isActive: true,
        momoNumber: "0244123456",
        momoNetwork: "MTN",
        momoName: "Abena Kyei",
      },
    ]
    localStorage.setItem(keys.employees, JSON.stringify(sampleEmployees))
  }

  if (!localStorage.getItem(keys.projects)) {
    const sampleProjects: Project[] = [
      {
        id: "1",
        name: "Office Complex Construction",
        clientName: "Tech Solutions Ltd",
        location: "Accra Central",
        description: "Multi-story office building construction",
        startDate: "2024-12-01",
        estimatedEndDate: "2025-12-01",
        status: "active",
      },
      {
        id: "2",
        name: "Residential Complex",
        clientName: "Urban Homes",
        location: "East Legon",
        description: "Apartment complex with 50 units",
        startDate: "2024-10-15",
        estimatedEndDate: "2025-06-15",
        status: "active",
      },
    ]
    localStorage.setItem(keys.projects, JSON.stringify(sampleProjects))
  }

  if (!localStorage.getItem(keys.tasks)) {
    const sampleTasks: Task[] = [
      {
        id: "1",
        projectId: "1",
        title: "Foundation Excavation",
        description: "Excavate and prepare foundation",
        status: "done",
        assignedEmployees: ["3", "4"],
        createdDate: "2024-12-01",
        dueDate: "2024-12-15",
      },
      {
        id: "2",
        projectId: "1",
        title: "Foundation Pouring",
        description: "Pour concrete foundation",
        status: "in-progress",
        assignedEmployees: ["3"],
        createdDate: "2024-12-10",
        dueDate: "2024-12-25",
      },
      {
        id: "3",
        projectId: "1",
        title: "Structural Steel",
        description: "Install structural steel framework",
        status: "todo",
        assignedEmployees: [],
        createdDate: "2024-12-15",
        dueDate: "2025-01-15",
      },
    ]
    localStorage.setItem(keys.tasks, JSON.stringify(sampleTasks))
  }

  if (!localStorage.getItem(keys.invoices)) {
    const sampleInvoices: Invoice[] = [
      {
        id: "1",
        projectId: "1",
        clientName: "Tech Solutions Ltd",
        invoiceNumber: "INV-2024-001",
        date: "2024-12-01",
        dueDate: "2024-12-15",
        items: [
          { id: "1", description: "Foundation Works - Phase 1", quantity: 1, rate: 15000, amount: 15000 },
          { id: "2", description: "Materials", quantity: 1, rate: 5000, amount: 5000 }
        ],
        subtotal: 20000,
        taxRate: 0,
        taxAmount: 0,
        total: 20000,
        status: "sent"
      }
    ]
    localStorage.setItem(keys.invoices, JSON.stringify(sampleInvoices))
  }

  if (!localStorage.getItem(keys.payments)) {
    const samplePayments: Payment[] = [
      {
        id: "1",
        projectId: "1",
        amount: 10000,
        date: "2024-12-05",
        method: "bank_transfer",
        status: "full-payment",
        reference: "TRX-88392",
        invoiceId: "1",
        notes: "Partial payment for Phase 1"
      }
    ]
    localStorage.setItem(keys.payments, JSON.stringify(samplePayments))
  }

  // Initialize Chart of Accounts with construction-specific accounts
  if (!localStorage.getItem(keys.chartOfAccounts)) {
    const sampleChartOfAccounts: ChartOfAccount[] = [
      // Assets
      { id: "1000", code: "1000", name: "Cash", type: "asset", subType: "current-asset", isActive: true, balance: 50000, description: "Cash on hand and in bank" },
      { id: "1100", code: "1100", name: "Accounts Receivable", type: "asset", subType: "current-asset", isActive: true, balance: 20000, description: "Money owed by clients" },
      { id: "1200", code: "1200", name: "Inventory - Materials", type: "asset", subType: "current-asset", isActive: true, balance: 15000, description: "Construction materials inventory" },
      { id: "1500", code: "1500", name: "Equipment", type: "asset", subType: "fixed-asset", isActive: true, balance: 100000, description: "Construction equipment and machinery" },
      { id: "1600", code: "1600", name: "Vehicles", type: "asset", subType: "fixed-asset", isActive: true, balance: 75000, description: "Company vehicles" },

      // Liabilities
      { id: "2000", code: "2000", name: "Accounts Payable", type: "liability", subType: "current-liability", isActive: true, balance: 12000, description: "Money owed to suppliers" },
      { id: "2100", code: "2100", name: "Wages Payable", type: "liability", subType: "current-liability", isActive: true, balance: 8000, description: "Unpaid employee wages" },
      { id: "2500", code: "2500", name: "Equipment Loan", type: "liability", subType: "long-term-liability", isActive: true, balance: 50000, description: "Long-term equipment financing" },

      // Equity
      { id: "3000", code: "3000", name: "Owner's Equity", type: "equity", isActive: true, balance: 190000, description: "Owner's investment and retained earnings" },

      // Revenue
      { id: "4000", code: "4000", name: "Construction Revenue", type: "revenue", isActive: true, balance: 0, description: "Revenue from construction projects" },
      { id: "4100", code: "4100", name: "Service Revenue", type: "revenue", isActive: true, balance: 0, description: "Revenue from services" },

      // Expenses
      { id: "5000", code: "5000", name: "Materials Expense", type: "expense", subType: "cost-of-goods", isActive: true, balance: 0, description: "Cost of construction materials" },
      { id: "5100", code: "5100", name: "Labor Expense", type: "expense", subType: "cost-of-goods", isActive: true, balance: 0, description: "Direct labor costs" },
      { id: "5200", code: "5200", name: "Subcontractor Expense", type: "expense", subType: "cost-of-goods", isActive: true, balance: 0, description: "Payments to subcontractors" },
      { id: "6000", code: "6000", name: "Equipment Rental", type: "expense", subType: "operating-expense", isActive: true, balance: 0, description: "Equipment rental costs" },
      { id: "6100", code: "6100", name: "Fuel Expense", type: "expense", subType: "operating-expense", isActive: true, balance: 0, description: "Fuel for vehicles and equipment" },
      { id: "6200", code: "6200", name: "Office Supplies", type: "expense", subType: "operating-expense", isActive: true, balance: 0, description: "Office supplies and materials" },
      { id: "6300", code: "6300", name: "Insurance Expense", type: "expense", subType: "operating-expense", isActive: true, balance: 0, description: "Insurance premiums" },
      { id: "6400", code: "6400", name: "Utilities", type: "expense", subType: "operating-expense", isActive: true, balance: 0, description: "Electricity, water, internet" },
    ]
    localStorage.setItem(keys.chartOfAccounts, JSON.stringify(sampleChartOfAccounts))
  }

  // Initialize sample journal entries
  if (!localStorage.getItem(keys.journalEntries)) {
    const sampleJournalEntries: JournalEntry[] = [
      {
        id: "je-001",
        date: "2024-12-01",
        reference: "INV-2024-001",
        description: "Invoice for Office Complex Construction - Phase 1",
        type: "invoice",
        status: "posted",
        createdAt: "2024-12-01T10:00:00Z",
        postedAt: "2024-12-01T10:00:00Z",
        projectId: "1",
        invoiceId: "1",
        lines: [
          { id: "1", accountId: "1100", accountCode: "1100", accountName: "Accounts Receivable", debit: 20000, credit: 0 },
          { id: "2", accountId: "4000", accountCode: "4000", accountName: "Construction Revenue", debit: 0, credit: 20000 }
        ]
      },
      {
        id: "je-002",
        date: "2024-12-05",
        reference: "PMT-001",
        description: "Payment received from Tech Solutions Ltd",
        type: "payment",
        status: "posted",
        createdAt: "2024-12-05T14:30:00Z",
        postedAt: "2024-12-05T14:30:00Z",
        projectId: "1",
        paymentId: "1",
        lines: [
          { id: "1", accountId: "1000", accountCode: "1000", accountName: "Cash", debit: 10000, credit: 0 },
          { id: "2", accountId: "1100", accountCode: "1100", accountName: "Accounts Receivable", debit: 0, credit: 10000 }
        ]
      }
    ]
    localStorage.setItem(keys.journalEntries, JSON.stringify(sampleJournalEntries))
  }
}

export const storage = {
  company: {
    get: (userId?: string): Company | null => {
      const keys = getKeys(userId)
      const data = localStorage.getItem(keys.company)
      return data ? JSON.parse(data) : null
    },
    set: (company: Company, userId?: string) => {
      const keys = getKeys(userId)
      localStorage.setItem(keys.company, JSON.stringify(company))
    }
  },
  employees: {
    getAll: (userId?: string): Employee[] => {
      initializeSampleData(userId)
      const keys = getKeys(userId)
      return JSON.parse(localStorage.getItem(keys.employees) || "[]")
    },
    getActive: (userId?: string): Employee[] => {
      return storage.employees.getAll(userId).filter((e) => e.isActive)
    },
    getInactive: (userId?: string): Employee[] => {
      return storage.employees.getAll(userId).filter((e) => !e.isActive)
    },
    add: (employee: Employee, userId?: string) => {
      const all = storage.employees.getAll(userId)
      all.push(employee)
      const keys = getKeys(userId)
      localStorage.setItem(keys.employees, JSON.stringify(all))
    },
    update: (id: string, updates: Partial<Employee>, userId?: string) => {
      const all = storage.employees.getAll(userId)
      const index = all.findIndex((e) => e.id === id)
      if (index >= 0) {
        all[index] = { ...all[index], ...updates }
        const keys = getKeys(userId)
        localStorage.setItem(keys.employees, JSON.stringify(all))
      }
    },
    delete: (id: string, userId?: string) => {
      const all = storage.employees.getAll(userId)
      const index = all.findIndex((e) => e.id === id)
      if (index >= 0) {
        all[index].isActive = false
        all[index].deactivatedDate = new Date().toISOString().split("T")[0]
        const keys = getKeys(userId)
        localStorage.setItem(keys.employees, JSON.stringify(all))
      }
    },
  },
  projects: {
    getAll: (userId?: string): Project[] => {
      initializeSampleData(userId)
      const keys = getKeys(userId)
      return JSON.parse(localStorage.getItem(keys.projects) || "[]")
    },
    add: (project: Project, userId?: string) => {
      const all = storage.projects.getAll(userId)
      all.push(project)
      const keys = getKeys(userId)
      localStorage.setItem(keys.projects, JSON.stringify(all))
    },
    update: (id: string, updates: Partial<Project>, userId?: string) => {
      const all = storage.projects.getAll(userId)
      const index = all.findIndex((p) => p.id === id)
      if (index >= 0) {
        all[index] = { ...all[index], ...updates }
        const keys = getKeys(userId)
        localStorage.setItem(keys.projects, JSON.stringify(all))
      }
    },
    getById: (id: string, userId?: string): Project | undefined => {
      return storage.projects.getAll(userId).find((p) => p.id === id)
    },
  },
  tasks: {
    getAll: (userId?: string): Task[] => {
      initializeSampleData(userId)
      const keys = getKeys(userId)
      return JSON.parse(localStorage.getItem(keys.tasks) || "[]")
    },
    getByProject: (projectId: string, userId?: string): Task[] => {
      return storage.tasks.getAll(userId).filter((t) => t.projectId === projectId)
    },
    add: (task: Task, userId?: string) => {
      const all = storage.tasks.getAll(userId)
      all.push(task)
      const keys = getKeys(userId)
      localStorage.setItem(keys.tasks, JSON.stringify(all))
    },
    update: (id: string, updates: Partial<Task>, userId?: string) => {
      const all = storage.tasks.getAll(userId)
      const index = all.findIndex((t) => t.id === id)
      if (index >= 0) {
        all[index] = { ...all[index], ...updates }
        const keys = getKeys(userId)
        localStorage.setItem(keys.tasks, JSON.stringify(all))
      }
    },
    getById: (id: string, userId?: string): Task | undefined => {
      return storage.tasks.getAll(userId).find((t) => t.id === id)
    },
    delete: (id: string, userId?: string) => {
      const all = storage.tasks.getAll(userId)
      const filtered = all.filter((t) => t.id !== id)
      const keys = getKeys(userId)
      localStorage.setItem(keys.tasks, JSON.stringify(filtered))
    },
  },
  attendance: {
    getAll: (userId?: string): AttendanceRecord[] => {
      const keys = getKeys(userId)
      return JSON.parse(localStorage.getItem(keys.attendance) || "[]")
    },
    getByDate: (date: string, userId?: string): AttendanceRecord[] => {
      return storage.attendance.getAll(userId).filter((a) => a.date === date)
    },
    getByEmployee: (employeeId: string, userId?: string): AttendanceRecord[] => {
      return storage.attendance.getAll(userId).filter((a) => a.employeeId === employeeId)
    },
    add: (record: AttendanceRecord, userId?: string) => {
      const all = storage.attendance.getAll(userId)
      all.push(record)
      const keys = getKeys(userId)
      localStorage.setItem(keys.attendance, JSON.stringify(all))
    },
    update: (id: string, updates: Partial<AttendanceRecord>, userId?: string) => {
      const all = storage.attendance.getAll(userId)
      const index = all.findIndex((a) => a.id === id)
      if (index >= 0) {
        all[index] = { ...all[index], ...updates }
        const keys = getKeys(userId)
        localStorage.setItem(keys.attendance, JSON.stringify(all))
      }
    },
  },
  payroll: {
    getAll: (userId?: string): PayrollRecord[] => {
      const keys = getKeys(userId)
      return JSON.parse(localStorage.getItem(keys.payroll) || "[]")
    },
    getByEmployee: (employeeId: string, userId?: string): PayrollRecord[] => {
      return storage.payroll.getAll(userId).filter((p) => p.employeeId === employeeId)
    },
    add: (record: PayrollRecord, userId?: string) => {
      const all = storage.payroll.getAll(userId)
      all.push(record)
      const keys = getKeys(userId)
      localStorage.setItem(keys.payroll, JSON.stringify(all))
    },
    update: (id: string, updates: Partial<PayrollRecord>, userId?: string) => {
      const all = storage.payroll.getAll(userId)
      const index = all.findIndex((p) => p.id === id)
      if (index >= 0) {
        all[index] = { ...all[index], ...updates }
        const keys = getKeys(userId)
        localStorage.setItem(keys.payroll, JSON.stringify(all))
      }
    },
  },
  invoices: {
    getAll: (userId?: string): Invoice[] => {
      initializeSampleData(userId)
      const keys = getKeys(userId)
      return JSON.parse(localStorage.getItem(keys.invoices) || "[]")
    },
    getByProject: (projectId: string, userId?: string): Invoice[] => {
      return storage.invoices.getAll(userId).filter((i) => i.projectId === projectId)
    },
    add: (invoice: Invoice, userId?: string) => {
      const all = storage.invoices.getAll(userId)
      all.push(invoice)
      const keys = getKeys(userId)
      localStorage.setItem(keys.invoices, JSON.stringify(all))
    },
    update: (id: string, updates: Partial<Invoice>, userId?: string) => {
      const all = storage.invoices.getAll(userId)
      const index = all.findIndex((i) => i.id === id)
      if (index >= 0) {
        all[index] = { ...all[index], ...updates }
        const keys = getKeys(userId)
        localStorage.setItem(keys.invoices, JSON.stringify(all))
      }
    },
    delete: (id: string, userId?: string) => {
      const all = storage.invoices.getAll(userId)
      const filtered = all.filter((i) => i.id !== id)
      const keys = getKeys(userId)
      localStorage.setItem(keys.invoices, JSON.stringify(filtered))
    },
  },
  payments: {
    getAll: (userId?: string): Payment[] => {
      initializeSampleData(userId)
      const keys = getKeys(userId)
      return JSON.parse(localStorage.getItem(keys.payments) || "[]")
    },
    getByProject: (projectId: string, userId?: string): Payment[] => {
      return storage.payments.getAll(userId).filter((p) => p.projectId === projectId)
    },
    add: (payment: Payment, userId?: string) => {
      const all = storage.payments.getAll(userId)
      all.push(payment)
      const keys = getKeys(userId)
      localStorage.setItem(keys.payments, JSON.stringify(all))
    },
    update: (id: string, updates: Partial<Payment>, userId?: string) => {
      const all = storage.payments.getAll(userId)
      const index = all.findIndex((p) => p.id === id)
      if (index >= 0) {
        all[index] = { ...all[index], ...updates }
        const keys = getKeys(userId)
        localStorage.setItem(keys.payments, JSON.stringify(all))
      }
    },
    delete: (id: string, userId?: string) => {
      const all = storage.payments.getAll(userId)
      const filtered = all.filter((p) => p.id !== id)
      const keys = getKeys(userId)
      localStorage.setItem(keys.payments, JSON.stringify(filtered))
    },
  },
  chartOfAccounts: {
    getAll: (userId?: string): ChartOfAccount[] => {
      initializeSampleData(userId)
      const keys = getKeys(userId)
      return JSON.parse(localStorage.getItem(keys.chartOfAccounts) || "[]")
    },
    getActive: (userId?: string): ChartOfAccount[] => {
      return storage.chartOfAccounts.getAll(userId).filter((a) => a.isActive)
    },
    getByType: (type: string, userId?: string): ChartOfAccount[] => {
      return storage.chartOfAccounts.getAll(userId).filter((a) => a.type === type && a.isActive)
    },
    add: (account: ChartOfAccount, userId?: string) => {
      const all = storage.chartOfAccounts.getAll(userId)
      all.push(account)
      const keys = getKeys(userId)
      localStorage.setItem(keys.chartOfAccounts, JSON.stringify(all))
    },
    update: (id: string, updates: Partial<ChartOfAccount>, userId?: string) => {
      const all = storage.chartOfAccounts.getAll(userId)
      const index = all.findIndex((a) => a.id === id)
      if (index >= 0) {
        all[index] = { ...all[index], ...updates }
        const keys = getKeys(userId)
        localStorage.setItem(keys.chartOfAccounts, JSON.stringify(all))
      }
    },
  },
  journalEntries: {
    getAll: (userId?: string): JournalEntry[] => {
      initializeSampleData(userId)
      const keys = getKeys(userId)
      return JSON.parse(localStorage.getItem(keys.journalEntries) || "[]")
    },
    getByDateRange: (startDate: string, endDate: string, userId?: string): JournalEntry[] => {
      return storage.journalEntries.getAll(userId).filter((je) => je.date >= startDate && je.date <= endDate)
    },
    getByProject: (projectId: string, userId?: string): JournalEntry[] => {
      return storage.journalEntries.getAll(userId).filter((je) => je.projectId === projectId)
    },
    add: (entry: JournalEntry, userId?: string) => {
      const all = storage.journalEntries.getAll(userId)
      all.push(entry)
      const keys = getKeys(userId)
      localStorage.setItem(keys.journalEntries, JSON.stringify(all))
    },
    update: (id: string, updates: Partial<JournalEntry>, userId?: string) => {
      const all = storage.journalEntries.getAll(userId)
      const index = all.findIndex((je) => je.id === id)
      if (index >= 0) {
        all[index] = { ...all[index], ...updates }
        const keys = getKeys(userId)
        localStorage.setItem(keys.journalEntries, JSON.stringify(all))
      }
    },
  },
  accountTransactions: {
    getAll: (userId?: string): AccountTransaction[] => {
      const keys = getKeys(userId)
      return JSON.parse(localStorage.getItem(keys.accountTransactions) || "[]")
    },
    getByAccount: (accountId: string, userId?: string): AccountTransaction[] => {
      return storage.accountTransactions.getAll(userId).filter((t) => t.accountId === accountId)
    },
    add: (transaction: AccountTransaction, userId?: string) => {
      const all = storage.accountTransactions.getAll(userId)
      all.push(transaction)
      const keys = getKeys(userId)
      localStorage.setItem(keys.accountTransactions, JSON.stringify(all))
    },
  },
  budgets: {
    getAll: (userId?: string): BudgetItem[] => {
      const keys = getKeys(userId)
      return JSON.parse(localStorage.getItem(keys.budgets) || "[]")
    },
    getByProject: (projectId: string, userId?: string): BudgetItem[] => {
      return storage.budgets.getAll(userId).filter((b) => b.projectId === projectId)
    },
    add: (budget: BudgetItem, userId?: string) => {
      const all = storage.budgets.getAll(userId)
      all.push(budget)
      const keys = getKeys(userId)
      localStorage.setItem(keys.budgets, JSON.stringify(all))
    },
    update: (id: string, updates: Partial<BudgetItem>, userId?: string) => {
      const all = storage.budgets.getAll(userId)
      const index = all.findIndex((b) => b.id === id)
      if (index >= 0) {
        all[index] = { ...all[index], ...updates }
        const keys = getKeys(userId)
        localStorage.setItem(keys.budgets, JSON.stringify(all))
      }
    },
  },
  products: {
    getAll: (userId?: string): Product[] => {
      const keys = getKeys(userId)
      return JSON.parse(localStorage.getItem(keys.products) || "[]")
    },
    getActive: (userId?: string): Product[] => {
      return storage.products.getAll(userId).filter((p) => p.isActive)
    },
    add: (product: Product, userId?: string) => {
      const all = storage.products.getAll(userId)
      all.push(product)
      const keys = getKeys(userId)
      localStorage.setItem(keys.products, JSON.stringify(all))
    },
    update: (id: string, updates: Partial<Product>, userId?: string) => {
      const all = storage.products.getAll(userId)
      const index = all.findIndex((p) => p.id === id)
      if (index >= 0) {
        all[index] = { ...all[index], ...updates }
        const keys = getKeys(userId)
        localStorage.setItem(keys.products, JSON.stringify(all))
      }
    },
    delete: (id: string, userId?: string) => {
      const all = storage.products.getAll(userId)
      const index = all.findIndex((p) => p.id === id)
      if (index >= 0) {
        all[index].isActive = false
        const keys = getKeys(userId)
        localStorage.setItem(keys.products, JSON.stringify(all))
      }
    },
    adjustStock: (id: string, delta: number, userId?: string) => {
      const all = storage.products.getAll(userId)
      const index = all.findIndex((p) => p.id === id)
      if (index >= 0) {
        all[index].stock = Math.max(0, all[index].stock + delta)
        const keys = getKeys(userId)
        localStorage.setItem(keys.products, JSON.stringify(all))
      }
    },
  },
  sales: {
    getAll: (userId?: string): Sale[] => {
      const keys = getKeys(userId)
      return JSON.parse(localStorage.getItem(keys.sales) || "[]")
    },
    getByDate: (date: string, userId?: string): Sale[] => {
      return storage.sales.getAll(userId).filter((s) => s.date === date)
    },
    add: (sale: Sale, userId?: string) => {
      const all = storage.sales.getAll(userId)
      all.push(sale)
      const keys = getKeys(userId)
      localStorage.setItem(keys.sales, JSON.stringify(all))
      // Deduct stock for each item sold
      sale.items.forEach((item) => {
        storage.products.adjustStock(item.productId, -item.quantity, userId)
      })
    },
  },
  teamMembers: {
    getAll: (userId?: string): TeamMember[] => {
      const keys = getKeys(userId)
      return JSON.parse(localStorage.getItem(keys.teamMembers) || "[]")
    },
    add: (member: TeamMember, userId?: string) => {
      const all = storage.teamMembers.getAll(userId)
      all.push(member)
      const keys = getKeys(userId)
      localStorage.setItem(keys.teamMembers, JSON.stringify(all))
    },
    update: (id: string, updates: Partial<TeamMember>, userId?: string) => {
      const all = storage.teamMembers.getAll(userId)
      const index = all.findIndex((m) => m.id === id)
      if (index >= 0) {
        all[index] = { ...all[index], ...updates }
        const keys = getKeys(userId)
        localStorage.setItem(keys.teamMembers, JSON.stringify(all))
      }
    },
  },
  printSettings: {
    get: (): PrintSettings => {
      if (typeof window === "undefined") return { showCompanyName: true, showCompanyAddress: true, showTax: false, footerMessage: "Thank you for your business!" }
      const data = localStorage.getItem("crm_printSettings")
      return data ? JSON.parse(data) : { showCompanyName: true, showCompanyAddress: true, showTax: false, footerMessage: "Thank you for your business!" }
    },
    set: (settings: PrintSettings) => {
      localStorage.setItem("crm_printSettings", JSON.stringify(settings))
    },
  },
}
