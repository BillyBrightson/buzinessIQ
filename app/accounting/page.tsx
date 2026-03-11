"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import type { Sale, Payment, Expense, PayrollRecord } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  ArrowLeftRight,
  FileText,
  Receipt,
} from "lucide-react"
import Link from "next/link"

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount)

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

export default function AccountingPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const { user } = useAuth()

  const [sales, setSales] = useState<Sale[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [payroll, setPayroll] = useState<PayrollRecord[]>([])

  useEffect(() => {
    if (!user) return
    setSales(storage.sales.getAll(user.uid))
    setPayments(storage.payments.getAll(user.uid))
    setExpenses(storage.expenses.getAll(user.uid))
    setPayroll(storage.payroll.getAll(user.uid))
  }, [user])

  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  const monthlySales = sales.filter((s) => s.date.startsWith(monthKey))
  const monthlyPayments = payments.filter((p) => p.date.startsWith(monthKey))
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(monthKey))

  const totalIncome =
    monthlySales.reduce((sum, s) => sum + s.total, 0) +
    monthlyPayments.reduce((sum, p) => sum + p.amount, 0)

  const totalExpensesAmt = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0)
  const netProfit = totalIncome - totalExpensesAmt
  const vatCollected = monthlySales.reduce((sum, s) => sum + (s.taxAmount || 0), 0)

  const recentExpenses = [...expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  const navCards = [
    {
      href: "/accounting/expenses",
      label: "Expenses",
      description: "Track operational costs and vendor payments",
      icon: Receipt,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-950/20",
      border: "border-red-100 dark:border-red-900/30",
    },
    {
      href: "/accounting/income",
      label: "Income",
      description: "View POS and invoice revenue breakdown",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/20",
      border: "border-green-100 dark:border-green-900/30",
    },
    {
      href: "/accounting/profit-loss",
      label: "Profit & Loss",
      description: "Revenue vs expenses statement",
      icon: BarChart2,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-100 dark:border-blue-900/30",
    },
    {
      href: "/accounting/cash-flow",
      label: "Cash Flow",
      description: "Monthly money in and money out",
      icon: ArrowLeftRight,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/20",
      border: "border-purple-100 dark:border-purple-900/30",
    },
    {
      href: "/accounting/tax",
      label: "Tax Summary",
      description: "VAT collected and PAYE estimates",
      icon: FileText,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/20",
      border: "border-orange-100 dark:border-orange-900/30",
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage="/accounting" onSearchOpen={onSearchOpen} />
      <main className="flex-1 overflow-auto md:ml-0 bg-muted/10">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
          <TopBar title="Accounting" />

          {/* This Month Summary Cards */}
          <div>
            <p className="text-sm text-muted-foreground mb-3 font-medium uppercase tracking-wider">
              This Month — {now.toLocaleDateString("en-GH", { month: "long", year: "numeric" })}
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
                  <p className="text-xs text-muted-foreground">POS + invoices</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpensesAmt)}</div>
                  <p className="text-xs text-muted-foreground">{monthlyExpenses.length} entries</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                  <BarChart2 className={`h-4 w-4 ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(netProfit)}
                  </div>
                  <p className="text-xs text-muted-foreground">Income minus expenses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">VAT Collected</CardTitle>
                  <FileText className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{formatCurrency(vatCollected)}</div>
                  <p className="text-xs text-muted-foreground">From POS sales</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation Cards */}
          <div>
            <p className="text-sm text-muted-foreground mb-3 font-medium uppercase tracking-wider">Reports & Tools</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {navCards.map((card) => {
                const Icon = card.icon
                return (
                  <Link key={card.href} href={card.href}>
                    <Card className={`hover:shadow-md cursor-pointer transition-all border ${card.border} hover:scale-[1.02]`}>
                      <CardHeader className="pb-2">
                        <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
                          <Icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                        <CardTitle className="text-base">{card.label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">{card.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recent Expenses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-red-500" />
                Recent Expenses
              </CardTitle>
              <Link href="/accounting/expenses">
                <button className="text-sm text-primary hover:underline">View all</button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentExpenses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No expenses recorded yet.</p>
                  <Link href="/accounting/expenses">
                    <button className="mt-2 text-sm text-primary hover:underline">Add your first expense</button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-left">
                        <th className="pb-3 pr-4 font-medium">Date</th>
                        <th className="pb-3 pr-4 font-medium">Category</th>
                        <th className="pb-3 pr-4 font-medium">Description</th>
                        <th className="pb-3 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentExpenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                            {new Date(expense.date).toLocaleDateString("en-GH", { day: "numeric", month: "short" })}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS["Miscellaneous"]}`}>
                              {expense.category}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-foreground">{expense.description}</td>
                          <td className="py-3 text-right font-semibold">{formatCurrency(expense.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
