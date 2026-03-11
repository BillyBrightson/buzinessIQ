"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useAuth } from "@/components/auth-provider"
import { storage } from "@/lib/storage"
import type { Sale, Payment, Expense, PayrollRecord } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertCircle } from "lucide-react"

type PeriodKey = "this_quarter" | "this_year"

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount)

const getCurrentQuarter = () => Math.floor(new Date().getMonth() / 3) + 1
const getCurrentYear = () => new Date().getFullYear()

const getQuarterRange = (q: number, year: number) => {
  const start = new Date(year, (q - 1) * 3, 1).toISOString().split("T")[0]
  const end = new Date(year, q * 3, 0).toISOString().split("T")[0]
  return { start, end }
}

export default function TaxPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const { user } = useAuth()
  const [period, setPeriod] = useState<PeriodKey>("this_quarter")

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

  const year = getCurrentYear()
  const currentQ = getCurrentQuarter()

  const { start, end } =
    period === "this_quarter"
      ? getQuarterRange(currentQ, year)
      : { start: `${year}-01-01`, end: `${year}-12-31` }

  const filteredSales = allSales.filter((s) => s.date >= start && s.date <= end)
  const filteredPayments = allPayments.filter((p) => p.date >= start && p.date <= end)
  const filteredExpenses = allExpenses.filter((e) => e.date >= start && e.date <= end)
  const filteredPayroll = allPayroll.filter((pr) => pr.period.startsWith(String(year)))

  const vatCollected = filteredSales.reduce((sum, s) => sum + (s.taxAmount || 0), 0)
  const totalRevenue =
    filteredSales.reduce((sum, s) => sum + s.total, 0) +
    filteredPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalPayroll = filteredPayroll.reduce((sum, pr) => sum + pr.totalAmount, 0)
  const totalCosts = totalExpenses + totalPayroll
  const netProfit = totalRevenue - totalCosts
  const estimatedIncomeTax = netProfit > 0 ? netProfit * 0.25 : 0

  // Quarterly VAT breakdown for the full year
  const quarterlyVAT = [1, 2, 3, 4].map((q) => {
    const { start: qs, end: qe } = getQuarterRange(q, year)
    const qSales = allSales.filter((s) => s.date >= qs && s.date <= qe)
    const vat = qSales.reduce((sum, s) => sum + (s.taxAmount || 0), 0)
    const revenue = qSales.reduce((sum, s) => sum + s.total, 0)
    return { quarter: `Q${q} ${year}`, vat, revenue, txCount: qSales.length }
  })

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage="/accounting/tax" onSearchOpen={onSearchOpen} />
      <main className="flex-1 overflow-auto md:ml-0 bg-muted/10">
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
          <TopBar title="Tax Summary" />

          {/* Disclaimer */}
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Disclaimer:</strong> These figures are estimates based on recorded data. Consult a qualified tax professional for GRA filing. Income tax estimate uses a simplified 25% flat rate.
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2">
            {(["this_quarter", "this_year"] as PeriodKey[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  period === p
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted"
                }`}
              >
                {p === "this_quarter" ? `This Quarter (Q${currentQ})` : "This Year"}
              </button>
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">VAT Collected</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(vatCollected)}</div>
                <p className="text-xs text-muted-foreground">From {filteredSales.length} POS sales</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Payroll Processed</CardTitle>
                <FileText className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalPayroll)}</div>
                <p className="text-xs text-muted-foreground">Estimated PAYE basis</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Estimated Income Tax</CardTitle>
                <FileText className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{formatCurrency(estimatedIncomeTax)}</div>
                <p className="text-xs text-muted-foreground">25% of net profit (estimate)</p>
              </CardContent>
            </Card>
          </div>

          {/* VAT Detail */}
          <Card>
            <CardHeader>
              <CardTitle>VAT Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">POS Sales (incl. tax)</span>
                  <span className="font-medium">{formatCurrency(filteredSales.reduce((s, sale) => s + sale.total, 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Tax Amount</span>
                  <span className="font-medium text-blue-600">{formatCurrency(vatCollected)}</span>
                </div>
                {vatCollected === 0 && (
                  <p className="text-xs text-muted-foreground italic">VAT rate appears to be 0%. Configure TAX_RATE in POS settings to collect VAT.</p>
                )}
              </div>

              <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Quarterly VAT Breakdown — {year}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-left">
                      <th className="pb-3 pr-4 font-medium">Quarter</th>
                      <th className="pb-3 pr-4 font-medium text-right">Sales Revenue</th>
                      <th className="pb-3 pr-4 font-medium text-right">Transactions</th>
                      <th className="pb-3 font-medium text-right">VAT Collected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {quarterlyVAT.map((row) => (
                      <tr key={row.quarter} className={row.quarter.startsWith(`Q${currentQ}`) ? "bg-blue-50/30 dark:bg-blue-950/10" : ""}>
                        <td className="py-3 pr-4 font-medium">{row.quarter}</td>
                        <td className="py-3 pr-4 text-right">{formatCurrency(row.revenue)}</td>
                        <td className="py-3 pr-4 text-right text-muted-foreground">{row.txCount}</td>
                        <td className="py-3 text-right font-semibold text-blue-600">{formatCurrency(row.vat)}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-border font-bold">
                      <td className="pt-3 pr-4">Annual Total</td>
                      <td className="pt-3 pr-4 text-right">
                        {formatCurrency(allSales.filter((s) => s.date.startsWith(String(year))).reduce((sum, s) => sum + s.total, 0))}
                      </td>
                      <td className="pt-3 pr-4 text-right text-muted-foreground">
                        {allSales.filter((s) => s.date.startsWith(String(year))).length}
                      </td>
                      <td className="pt-3 text-right text-blue-600">
                        {formatCurrency(quarterlyVAT.reduce((sum, r) => sum + r.vat, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Salary Withholding */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Withholding (PAYE Estimate)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Payroll Processed ({period === "this_quarter" ? `Q${currentQ}` : year})</span>
                  <span className="font-semibold">{formatCurrency(totalPayroll)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated PAYE (approx. 15%)</span>
                  <span className="font-semibold text-purple-600">{formatCurrency(totalPayroll * 0.15)}</span>
                </div>
                <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  PAYE is calculated on individual employee income brackets per GRA guidelines. The 15% shown is a rough estimate only. Please use actual tax tables for filing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
