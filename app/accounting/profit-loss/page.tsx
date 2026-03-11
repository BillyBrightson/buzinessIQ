"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useAuth } from "@/components/auth-provider"
import { storage } from "@/lib/storage"
import type { Sale, Payment, Expense, PayrollRecord } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Printer } from "lucide-react"

type PeriodKey = "this_month" | "this_quarter" | "this_year" | "custom"

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount)

const getQuarterRange = () => {
  const now = new Date()
  const q = Math.floor(now.getMonth() / 3)
  const start = new Date(now.getFullYear(), q * 3, 1).toISOString().split("T")[0]
  const end = new Date(now.getFullYear(), q * 3 + 3, 0).toISOString().split("T")[0]
  return { start, end }
}

const getRange = (period: PeriodKey, custom: { start: string; end: string }) => {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  if (period === "this_month") {
    return {
      start: new Date(y, m, 1).toISOString().split("T")[0],
      end: new Date(y, m + 1, 0).toISOString().split("T")[0],
    }
  }
  if (period === "this_quarter") return getQuarterRange()
  if (period === "this_year") return { start: `${y}-01-01`, end: `${y}-12-31` }
  return custom
}

export default function ProfitLossPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const { user } = useAuth()
  const [period, setPeriod] = useState<PeriodKey>("this_month")
  const [customRange, setCustomRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })

  const [sales, setSales] = useState<Sale[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [expenses, setExpensesData] = useState<Expense[]>([])
  const [payroll, setPayroll] = useState<PayrollRecord[]>([])

  useEffect(() => {
    if (!user) return
    setSales(storage.sales.getAll(user.uid))
    setPayments(storage.payments.getAll(user.uid))
    setExpensesData(storage.expenses.getAll(user.uid))
    setPayroll(storage.payroll.getAll(user.uid))
  }, [user])

  const { start, end } = getRange(period, customRange)

  const filteredSales = sales.filter((s) => s.date >= start && s.date <= end)
  const filteredPayments = payments.filter((p) => p.date >= start && p.date <= end)
  const filteredExpenses = expenses.filter((e) => e.date >= start && e.date <= end)

  // Filter payroll by period overlapping the date range (period is YYYY-Www)
  const startYear = parseInt(start.slice(0, 4))
  const endYear = parseInt(end.slice(0, 4))
  const filteredPayroll = payroll.filter((pr) => {
    const prYear = parseInt(pr.period.slice(0, 4))
    return prYear >= startYear && prYear <= endYear
  })

  const posSalesRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0)
  const invoiceRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalRevenue = posSalesRevenue + invoiceRevenue

  // Group expenses by category
  const expenseByCategory = filteredExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  const totalExpenses = Object.values(expenseByCategory).reduce((sum, v) => sum + v, 0)
  const salaryExpenses = filteredPayroll.reduce((sum, pr) => sum + pr.totalAmount, 0)
  const totalCosts = totalExpenses + salaryExpenses

  const grossProfit = totalRevenue - totalExpenses
  const netProfit = totalRevenue - totalCosts

  const periodLabel = () => {
    if (period === "this_month") return `${start} to ${end}`
    if (period === "this_quarter") return `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`
    if (period === "this_year") return String(new Date().getFullYear())
    return `${start} to ${end}`
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage="/accounting/profit-loss" onSearchOpen={onSearchOpen} />
      <main className="flex-1 overflow-auto md:ml-0 bg-muted/10">
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8" id="pl-print-area">
          <div className="flex items-center justify-between no-print">
            <TopBar title="Profit & Loss" />
          </div>
          <h1 className="hidden print:block text-2xl font-bold text-center">Profit & Loss Statement</h1>

          {/* Period Selector */}
          <div className="flex items-center gap-2 flex-wrap no-print">
            {(["this_month", "this_quarter", "this_year", "custom"] as PeriodKey[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  period === p
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted"
                }`}
              >
                {p === "this_month" ? "This Month" : p === "this_quarter" ? "This Quarter" : p === "this_year" ? "This Year" : "Custom"}
              </button>
            ))}
            {period === "custom" && (
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="date"
                  value={customRange.start}
                  onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                  className="px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="date"
                  value={customRange.end}
                  onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                  className="px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
            <Button variant="outline" onClick={() => window.print()} className="ml-auto flex items-center gap-2 no-print">
              <Printer size={16} />
              Export PDF
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">Period: {periodLabel()}</p>

          {/* Revenue Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <TrendingUp className="h-5 w-5" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">POS Sales Revenue</span>
                  <span className="font-medium">{formatCurrency(posSalesRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Invoice / Service Revenue</span>
                  <span className="font-medium">{formatCurrency(invoiceRevenue)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-semibold text-green-700 dark:text-green-400">Total Revenue</span>
                  <span className="text-xl font-bold text-green-600">{formatCurrency(totalRevenue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <TrendingDown className="h-5 w-5" />
                Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{category}</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                ))}
                {Object.keys(expenseByCategory).length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No operational expenses recorded for this period</p>
                )}
                <div className="flex justify-between items-center border-t border-dashed border-border pt-3">
                  <span className="text-sm text-muted-foreground">Salary Expenses (Payroll)</span>
                  <span className="font-medium">{formatCurrency(salaryExpenses)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-semibold text-red-700 dark:text-red-400">Total Expenses</span>
                  <span className="text-xl font-bold text-red-600">{formatCurrency(totalCosts)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Gross Profit</span>
                  <span className={`font-bold text-lg ${grossProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(grossProfit)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 border-t border-b border-border">
                  <span className="text-lg font-semibold">Net Profit / (Loss)</span>
                  <span className={`text-3xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(netProfit)}
                  </span>
                </div>
                {netProfit < 0 && (
                  <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                    Your expenses exceed revenue for this period. Review your cost structure.
                  </p>
                )}
                {netProfit >= 0 && totalRevenue > 0 && (
                  <p className="text-sm text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    Net margin: {((netProfit / totalRevenue) * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
