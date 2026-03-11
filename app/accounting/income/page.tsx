"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useAuth } from "@/components/auth-provider"
import { storage } from "@/lib/storage"
import type { Sale, Payment } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, ShoppingCart, FileText, DollarSign } from "lucide-react"
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

type PeriodKey = "this_month" | "last_month" | "this_year" | "all_time"

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount)

const getDateRange = (period: PeriodKey): { start: string; end: string } => {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()

  if (period === "this_month") {
    const start = new Date(y, m, 1).toISOString().split("T")[0]
    const end = new Date(y, m + 1, 0).toISOString().split("T")[0]
    return { start, end }
  }
  if (period === "last_month") {
    const start = new Date(y, m - 1, 1).toISOString().split("T")[0]
    const end = new Date(y, m, 0).toISOString().split("T")[0]
    return { start, end }
  }
  if (period === "this_year") {
    return { start: `${y}-01-01`, end: `${y}-12-31` }
  }
  return { start: "2000-01-01", end: "2099-12-31" }
}

export default function IncomePage({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const { user } = useAuth()
  const [period, setPeriod] = useState<PeriodKey>("this_month")
  const [allSales, setAllSales] = useState<Sale[]>([])
  const [allPayments, setAllPayments] = useState<Payment[]>([])

  useEffect(() => {
    if (!user) return
    setAllSales(storage.sales.getAll(user.uid))
    setAllPayments(storage.payments.getAll(user.uid))
  }, [user])

  const { start, end } = getDateRange(period)

  const filteredSales = allSales.filter((s) => s.date >= start && s.date <= end)
  const filteredPayments = allPayments.filter((p) => p.date >= start && p.date <= end)

  const posSalesTotal = filteredSales.reduce((sum, s) => sum + s.total, 0)
  const invoicePaymentsTotal = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalRevenue = posSalesTotal + invoicePaymentsTotal

  // Build monthly chart data for last 12 months
  const buildMonthlyData = () => {
    const months: { month: string; label: string; pos: number; invoices: number }[] = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const label = d.toLocaleDateString("en-GH", { month: "short", year: "2-digit" })
      const pos = allSales.filter((s) => s.date.startsWith(key)).reduce((sum, s) => sum + s.total, 0)
      const inv = allPayments.filter((p) => p.date.startsWith(key)).reduce((sum, p) => sum + p.amount, 0)
      months.push({ month: key, label, pos, invoices: inv })
    }
    return months
  }

  const chartData = buildMonthlyData()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage="/accounting/income" onSearchOpen={onSearchOpen} />
      <main className="flex-1 overflow-auto md:ml-0 bg-muted/10">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
          <TopBar title="Income" />

          {/* Period filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["this_month", "last_month", "this_year", "all_time"] as PeriodKey[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  period === p
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted"
                }`}
              >
                {p === "this_month" ? "This Month" : p === "last_month" ? "Last Month" : p === "this_year" ? "This Year" : "All Time"}
              </button>
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">POS + Invoice combined</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">POS Sales</CardTitle>
                <ShoppingCart className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(posSalesTotal)}</div>
                <p className="text-xs text-muted-foreground">{filteredSales.length} transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Invoice Payments</CardTitle>
                <FileText className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(invoicePaymentsTotal)}</div>
                <p className="text-xs text-muted-foreground">{filteredPayments.length} payments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Other Income</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(0)}</div>
                <p className="text-xs text-muted-foreground">No other income recorded</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Income (Last 12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `GHS ${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="pos" name="POS Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="invoices" name="Invoice Payments" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* POS Sales Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                  POS Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredSales.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No POS sales in this period</p>
                ) : (
                  <div className="space-y-0 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-left">
                          <th className="pb-2 pr-4 font-medium">Date</th>
                          <th className="pb-2 pr-4 font-medium">Receipt</th>
                          <th className="pb-2 pr-4 font-medium">Method</th>
                          <th className="pb-2 font-medium text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredSales.slice(0, 20).map((sale) => (
                          <tr key={sale.id}>
                            <td className="py-2 pr-4 text-muted-foreground">
                              {new Date(sale.date).toLocaleDateString("en-GH", { day: "numeric", month: "short" })}
                            </td>
                            <td className="py-2 pr-4 font-mono text-xs">{sale.receiptNumber}</td>
                            <td className="py-2 pr-4 text-muted-foreground capitalize">
                              {sale.paymentMethod.replace("_", " ")}
                            </td>
                            <td className="py-2 text-right font-medium">{formatCurrency(sale.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredSales.length > 20 && (
                      <p className="text-xs text-muted-foreground pt-2 text-center">
                        Showing 20 of {filteredSales.length} sales
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice Payments Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  Invoice Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredPayments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No invoice payments in this period</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-left">
                          <th className="pb-2 pr-4 font-medium">Date</th>
                          <th className="pb-2 pr-4 font-medium">Reference</th>
                          <th className="pb-2 pr-4 font-medium">Method</th>
                          <th className="pb-2 font-medium text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="py-2 pr-4 text-muted-foreground">
                              {new Date(payment.date).toLocaleDateString("en-GH", { day: "numeric", month: "short" })}
                            </td>
                            <td className="py-2 pr-4 font-mono text-xs">{payment.reference || "—"}</td>
                            <td className="py-2 pr-4 text-muted-foreground capitalize">
                              {payment.method.replace("_", " ")}
                            </td>
                            <td className="py-2 text-right font-medium">{formatCurrency(payment.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
