"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useAuth } from "@/components/auth-provider"
import { storage } from "@/lib/storage"
import type { Expense, Project } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Receipt, Plus, Trash2, X, TrendingDown, Calendar, Tag } from "lucide-react"

const CATEGORIES = [
  "Rent",
  "Utilities",
  "Salaries",
  "Supplies",
  "Transport",
  "Marketing",
  "Maintenance",
  "Equipment",
  "Miscellaneous",
]

const CATEGORY_COLORS: Record<string, string> = {
  Rent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Utilities: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Salaries: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Supplies: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  Transport: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Marketing: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  Maintenance: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  Equipment: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  Miscellaneous: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "momo", label: "Mobile Money" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Card" },
]

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount)

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

const getCurrentYear = () => String(new Date().getFullYear())

interface ExpenseFormData {
  date: string
  category: string
  description: string
  amount: string
  paymentMethod: "cash" | "momo" | "bank_transfer" | "card"
  projectId: string
  receiptRef: string
}

const emptyForm: ExpenseFormData = {
  date: new Date().toISOString().split("T")[0],
  category: "Miscellaneous",
  description: "",
  amount: "",
  paymentMethod: "cash",
  projectId: "",
  receiptRef: "",
}

export default function ExpensesPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth())
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [form, setForm] = useState<ExpenseFormData>(emptyForm)

  const loadData = () => {
    if (!user) return
    setExpenses(storage.expenses.getAll(user.uid))
    setProjects(storage.projects.getAll(user.uid))
  }

  useEffect(() => {
    loadData()
  }, [user])

  const filteredExpenses = expenses
    .filter((e) => e.date.startsWith(filterMonth))
    .sort((a, b) => b.date.localeCompare(a.date))

  const yearExpenses = expenses.filter((e) => e.date.startsWith(getCurrentYear()))

  const totalThisMonth = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalThisYear = yearExpenses.reduce((sum, e) => sum + e.amount, 0)

  const categoryTotals = filteredExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

  const openAdd = () => {
    setEditingExpense(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setForm({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: String(expense.amount),
      paymentMethod: expense.paymentMethod,
      projectId: expense.projectId || "",
      receiptRef: expense.receiptRef || "",
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!user || !form.description || !form.amount || isNaN(parseFloat(form.amount))) return
    const data: Expense = {
      id: editingExpense?.id || `exp-${Date.now()}`,
      date: form.date,
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount),
      paymentMethod: form.paymentMethod,
      projectId: form.projectId || undefined,
      receiptRef: form.receiptRef || undefined,
      createdAt: editingExpense?.createdAt || new Date().toISOString(),
    }
    if (editingExpense) {
      storage.expenses.update(data.id, data, user.uid)
    } else {
      storage.expenses.add(data, user.uid)
    }
    setShowModal(false)
    loadData()
  }

  const handleDelete = (id: string) => {
    if (!user || !confirm("Delete this expense?")) return
    storage.expenses.delete(id, user.uid)
    loadData()
  }

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null
    return projects.find((p) => p.id === projectId)?.name || projectId
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage="/accounting/expenses" onSearchOpen={onSearchOpen} />
      <main className="flex-1 overflow-auto md:ml-0 bg-muted/10">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
          <TopBar title="Expenses" />

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total This Month</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalThisMonth)}</div>
                <p className="text-xs text-muted-foreground">{filteredExpenses.length} transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total This Year</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalThisYear)}</div>
                <p className="text-xs text-muted-foreground">{yearExpenses.length} transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Most Spent Category</CardTitle>
                <Tag className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{topCategory ? topCategory[0] : "—"}</div>
                <p className="text-xs text-muted-foreground">
                  {topCategory ? formatCurrency(topCategory[1]) : "No data this month"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Header actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-muted-foreground">Filter Month:</label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <Button onClick={openAdd} className="flex items-center gap-2">
              <Plus size={16} />
              Add Expense
            </Button>
          </div>

          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Expenses — {filterMonth}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No expenses for this period</p>
                  <p className="text-sm">Click "Add Expense" to record one.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-left">
                        <th className="pb-3 pr-4 font-medium">Date</th>
                        <th className="pb-3 pr-4 font-medium">Category</th>
                        <th className="pb-3 pr-4 font-medium">Description</th>
                        <th className="pb-3 pr-4 font-medium">Payment</th>
                        <th className="pb-3 pr-4 font-medium text-right">Amount</th>
                        <th className="pb-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredExpenses.map((expense) => (
                        <tr
                          key={expense.id}
                          className="hover:bg-muted/40 cursor-pointer transition-colors"
                          onClick={() => openEdit(expense)}
                        >
                          <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                            {new Date(expense.date).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS["Miscellaneous"]}`}>
                              {expense.category}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <p className="font-medium text-foreground">{expense.description}</p>
                            {getProjectName(expense.projectId) && (
                              <p className="text-xs text-muted-foreground">{getProjectName(expense.projectId)}</p>
                            )}
                            {expense.receiptRef && (
                              <p className="text-xs text-muted-foreground">Ref: {expense.receiptRef}</p>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground capitalize">
                            {expense.paymentMethod.replace("_", " ")}
                          </td>
                          <td className="py-3 pr-4 text-right font-semibold text-foreground whitespace-nowrap">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={(ev) => { ev.stopPropagation(); handleDelete(expense.id) }}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border">
                        <td colSpan={4} className="pt-3 font-semibold text-foreground">Total</td>
                        <td className="pt-3 text-right font-bold text-red-600 text-base">{formatCurrency(totalThisMonth)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingExpense ? "Edit Expense" : "Add Expense"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="What was this expense for?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Amount (GHS)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Payment Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as ExpenseFormData["paymentMethod"] })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Project (optional)</label>
                <select
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">— No project —</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Receipt Reference (optional)</label>
                <input
                  type="text"
                  value={form.receiptRef}
                  onChange={(e) => setForm({ ...form, receiptRef: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="e.g. REC-001"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleSave} className="flex-1">
                {editingExpense ? "Save Changes" : "Add Expense"}
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
