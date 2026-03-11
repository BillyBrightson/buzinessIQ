"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useAuth } from "@/components/auth-provider"
import { storage } from "@/lib/storage"
import type { Sale, Payment, Expense, PayrollRecord } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeftRight, TrendingUp, TrendingDown, Minus } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts"

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount)

type MonthData = {
  label: string
  key: string
  moneyIn: number
  moneyOut: number
  net: number
}

export default function CashFlowPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const { user } = useAuth()
  const [months, setMonths] = useState(6)

  const [allSales, setAllSales] = useState<Sale[]>([])
  const [allPayments, setAllPayments] = useState<Payment[]>([])
  const [allExpenses, setAllExpenses] = useState<Expense[]>([])
  const [allPayroll, setAllPayroll] = useState<PayrollRecord[]>([])

  useEffect(() => {
    if (!user) return
    setAllSales(storage.sales.getAll(user.uid))
    setAllPayments(storage.payments.getAll(user.uid))
    setAllExpenses(storage.expenses.getAll(user.uid))
    setAllPayroll(storage.payroll.getAll(user.uid))
  }, [user])

  const buildMonthlyData = (): MonthData[] => {
    const result: MonthData[] = []
    const now = new Date()
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const label = d.toLocaleDateString("en-GH", { month: "short", year: "2-digit" })

      const posSales = allSales.filter((s) => s.date.startsWith(key)).reduce((sum, s) => sum + s.total, 0)
      const invPayments = allPayments.filter((p) => p.date.startsWith(key)).reduce((sum, p) => sum + p.amount, 0)
      const moneyIn = posSales + invPayments

      const expenses = allExpenses.filter((e) => e.date.startsWith(key)).reduce((sum, e) => sum + e.amount, 0)
      const payrollYear = d.getFullYear()
      const payrollMonth = d.getMonth() + 1
      const payrollMonthExpenses = allPayroll
        .filter((pr) => {
          const prYear = parseInt(pr.period.slice(0, 4))
          const weekNum = parseInt(pr.period.split("W")[1] || "0")
          // Approximate: week 1-13 = Q1, 14-26 = Q2, 27-39 = Q3, 40-52 = Q4
          // More precise: map ISO week to approximate month
          const approxMonth = Math.ceil(weekNum / 4.33)
          return prYear === payrollYear && approxMonth === payrollMonth
        })
        .reduce((sum, pr) => sum + pr.totalAmount, 0)
      const moneyOut = expenses + payrollMonthExpenses

      result.push({ label, key, moneyIn, moneyOut, net: moneyIn - moneyOut })
    }
    return result
  }

  const monthData = buildMonthlyData()

  const totalIn = monthData.reduce((sum, m) => sum + m.moneyIn, 0)
  const totalOut = monthData.reduce((sum, m) => sum + m.moneyOut, 0)
  const netPosition = totalIn - totalOut

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage="/accounting/cash-flow" onSearchOpen={onSearchOpen} />
      <main className="flex-1 overflow-auto md:ml-0 bg-muted/10">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
          <TopBar title="Cash Flow" />

          {/* Period control */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-muted-foreground">Show last:</label>
            {[3, 6, 12].map((n) => (
              <button
                key={n}
                onClick={() => setMonths(n)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  months === n
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted"
                }`}
              >
                {n} months
              </button>
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total In</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIn)}</div>
                <p className="text-xs text-muted-foreground">POS + invoice payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Out</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOut)}</div>
                <p className="text-xs text-muted-foreground">Expenses + payroll</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Net Position</CardTitle>
                <ArrowLeftRight className={`h-4 w-4 ${netPosition >= 0 ? "text-green-600" : "text-red-500"}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netPosition >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(netPosition)}
                </div>
                <p className="text-xs text-muted-foreground">{netPosition >= 0 ? "Positive cash flow" : "Negative cash flow"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Cash Flow Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="moneyIn" name="Money In" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="moneyOut" name="Money Out" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Table */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-left">
                      <th className="pb-3 pr-4 font-medium">Month</th>
                      <th className="pb-3 pr-4 font-medium text-right">Money In</th>
                      <th className="pb-3 pr-4 font-medium text-right">Money Out</th>
                      <th className="pb-3 font-medium text-right">Net Flow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {monthData.map((row) => (
                      <tr
                        key={row.key}
                        className={`${row.net >= 0 ? "bg-green-50/30 dark:bg-green-950/10" : "bg-red-50/30 dark:bg-red-950/10"}`}
                      >
                        <td className="py-3 pr-4 font-medium">{row.label}</td>
                        <td className="py-3 pr-4 text-right text-green-700 dark:text-green-400 font-medium">
                          {formatCurrency(row.moneyIn)}
                        </td>
                        <td className="py-3 pr-4 text-right text-red-600 font-medium">
                          {formatCurrency(row.moneyOut)}
                        </td>
                        <td className={`py-3 text-right font-bold ${row.net >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {row.net >= 0 ? "+" : ""}{formatCurrency(row.net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border font-bold">
                      <td className="pt-3 pr-4">Total</td>
                      <td className="pt-3 pr-4 text-right text-green-600">{formatCurrency(totalIn)}</td>
                      <td className="pt-3 pr-4 text-right text-red-600">{formatCurrency(totalOut)}</td>
                      <td className={`pt-3 text-right ${netPosition >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {netPosition >= 0 ? "+" : ""}{formatCurrency(netPosition)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
