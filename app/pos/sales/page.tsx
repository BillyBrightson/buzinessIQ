"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useAuth } from "@/components/auth-provider"
import { storage } from "@/lib/storage"
import type { Sale, Company, PrintSettings, Branch } from "@/lib/types"
import { ReceiptPrint } from "@/components/pos/receipt-print"
import {
  Search, Receipt, X, Banknote, Smartphone, CreditCard,
  Building2, TrendingUp, ShoppingCart, Wallet, ChevronRight, MapPin
} from "lucide-react"

const GHS = (n: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n)

const PAYMENT_ICONS: Record<Sale["paymentMethod"], React.ElementType> = {
  cash: Banknote,
  momo: Smartphone,
  card: CreditCard,
  bank_transfer: Building2,
}

const PAYMENT_COLORS: Record<Sale["paymentMethod"], string> = {
  cash: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  momo: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
  card: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  bank_transfer: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
}

export default function SalesHistoryPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const { user, effectiveUid, currentBranchId, userRole } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])
  const [printSale, setPrintSale] = useState<Sale | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [printSettings, setPrintSettingsState] = useState<PrintSettings>({ showCompanyName: true, showCompanyAddress: true, showTax: true, footerMessage: "Thank you for your patronage!" })
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchFilter, setBranchFilter] = useState<string>("current")
  const printTriggered = useRef(false)

  useEffect(() => {
    const uid = effectiveUid || user?.uid
    if (uid) {
      setCompany(storage.company.get(uid))
      setBranches(storage.branches.getActive(uid))
    }
    setPrintSettingsState(storage.printSettings.get())
  }, [user, effectiveUid])

  useEffect(() => {
    if (printSale && !printTriggered.current) {
      printTriggered.current = true
      setTimeout(() => {
        window.print()
        const afterPrint = () => {
          setPrintSale(null)
          printTriggered.current = false
          window.removeEventListener("afterprint", afterPrint)
        }
        window.addEventListener("afterprint", afterPrint)
      }, 100)
    }
  }, [printSale])
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0])
  const [filterMode, setFilterMode] = useState<"day" | "all">("day")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  useEffect(() => {
    const uid = effectiveUid || user?.uid
    if (uid) setSales(storage.sales.getAll(uid))
  }, [user, effectiveUid])

  const filtered = useMemo(() => {
    let result = [...sales].sort((a, b) => b.date.localeCompare(a.date))
    if (filterMode === "day") {
      result = result.filter((s) => s.date.startsWith(dateFilter))
    }
    if (branchFilter === "current" && currentBranchId) {
      result = result.filter((s) => !s.branchId || s.branchId === currentBranchId)
    } else if (branchFilter !== "all") {
      result = result.filter((s) => s.branchId === branchFilter)
    }
    if (search.trim()) {
      result = result.filter(
        (s) =>
          s.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
          s.items.some((i) => i.productName.toLowerCase().includes(search.toLowerCase()))
      )
    }
    return result
  }, [sales, search, dateFilter, filterMode, branchFilter, currentBranchId])

  const stats = useMemo(() => {
    let src = filterMode === "day"
      ? sales.filter((s) => s.date.startsWith(dateFilter))
      : sales
    if (branchFilter === "current" && currentBranchId) {
      src = src.filter((s) => !s.branchId || s.branchId === currentBranchId)
    } else if (branchFilter !== "all") {
      src = src.filter((s) => s.branchId === branchFilter)
    }
    return {
      totalSales: src.length,
      totalRevenue: src.reduce((s, sale) => s + sale.total, 0),
      totalItems: src.reduce((s, sale) => s + sale.items.reduce((a, i) => a + i.quantity, 0), 0),
      avgSale: src.length > 0 ? src.reduce((s, sale) => s + sale.total, 0) / src.length : 0,
    }
  }, [sales, dateFilter, filterMode])

  return (
    <>
    {printSale && (
      <ReceiptPrint
        sale={printSale}
        companyName={printSettings.showCompanyName ? (company?.name ?? "BuzinessIQ") : undefined}
        companyAddress={printSettings.showCompanyAddress ? company?.address : undefined}
        companyPhone={printSettings.showCompanyAddress ? company?.phone : undefined}
        footerMessage={printSettings.footerMessage}
        showTax={printSettings.showTax}
      />
    )}

    <div className="flex h-screen bg-background no-print">
      <Sidebar currentPage="/pos/sales" onSearchOpen={onSearchOpen} />

      <main className="flex-1 overflow-auto bg-muted/10">
        <div className="flex flex-col h-full max-w-7xl mx-auto px-4 md:px-8">
        <div className="pt-4 pb-0 shrink-0">
          <TopBar title="Sales History" />
        </div>

        <div className="flex-1 flex overflow-hidden pb-4 md:pb-6 gap-4 min-h-0">
          {/* ── LEFT: Sales List ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 shrink-0">
              {[
                { label: "Sales", value: stats.totalSales, icon: ShoppingCart, color: "text-foreground" },
                { label: "Revenue", value: GHS(stats.totalRevenue), icon: Wallet, color: "text-primary" },
                { label: "Items Sold", value: stats.totalItems, icon: TrendingUp, color: "text-foreground" },
                { label: "Avg. Sale", value: GHS(stats.avgSale), icon: Receipt, color: "text-foreground" },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl border border-border p-3 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <s.icon size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                    <p className={`font-bold truncate ${s.color}`}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Search receipt or product..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {userRole === "admin" && branches.length > 1 && (
                <div className="relative shrink-0">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="pl-9 pr-3 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                  >
                    <option value="current">Current Branch</option>
                    <option value="all">All Branches</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}
              <div className="flex bg-muted rounded-xl p-1 shrink-0">
                <button
                  onClick={() => setFilterMode("day")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filterMode === "day" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  By Day
                </button>
                <button
                  onClick={() => setFilterMode("all")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filterMode === "all" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  All Time
                </button>
              </div>
              {filterMode === "day" && (
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>

            {/* Sales list */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
                  <Receipt size={48} className="opacity-20" />
                  <p className="font-medium">No sales found</p>
                  <p className="text-sm">
                    {filterMode === "day" ? `No sales recorded on ${dateFilter}` : "No sales recorded yet"}
                  </p>
                </div>
              ) : (
                filtered.map((sale) => {
                  const Icon = PAYMENT_ICONS[sale.paymentMethod]
                  return (
                    <button
                      key={sale.id}
                      onClick={() => setSelectedSale(sale)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all hover:shadow-md ${selectedSale?.id === sale.id
                        ? "bg-primary/10 border-primary"
                        : "bg-card border-border hover:border-primary/30"
                        }`}
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <Receipt size={18} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{sale.receiptNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.date).toLocaleString()} · {sale.items.length} item{sale.items.length !== 1 ? "s" : ""}
                          {branchFilter === "all" && sale.branchName && (
                            <span className="ml-1 text-primary/70">· {sale.branchName}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${PAYMENT_COLORS[sale.paymentMethod]}`}>
                          <Icon size={12} />
                          {sale.paymentMethod.replace("_", " ")}
                        </span>
                        <p className="font-bold text-foreground min-w-[80px] text-right">{GHS(sale.total)}</p>
                        <ChevronRight size={16} className="text-muted-foreground" />
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* ── RIGHT: Receipt Detail ── */}
          <div className={`w-80 xl:w-96 shrink-0 flex flex-col border border-border bg-card rounded-2xl shadow-sm transition-all overflow-hidden ${selectedSale ? "" : "opacity-50"}`}>
            {selectedSale ? (
              <>
                <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
                  <div>
                    <p className="font-bold text-foreground">{selectedSale.receiptNumber}</p>
                    <p className="text-xs text-muted-foreground">{new Date(selectedSale.date).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setSelectedSale(null)} className="p-2 hover:bg-muted rounded-lg transition">
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Items</p>
                    <div className="space-y-2">
                      {selectedSale.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-foreground">
                            {item.productName}
                            <span className="text-muted-foreground ml-1">× {item.quantity}</span>
                          </span>
                          <span className="font-medium">{GHS(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{GHS(selectedSale.subtotal)}</span>
                    </div>
                    {selectedSale.discount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>Discount</span>
                        <span>- {GHS(selectedSale.discount)}</span>
                      </div>
                    )}
                    {selectedSale.taxAmount > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tax ({(selectedSale.taxRate * 100).toFixed(0)}%)</span>
                        <span>{GHS(selectedSale.taxAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
                      <span>Total</span>
                      <span className="text-primary">{GHS(selectedSale.total)}</span>
                    </div>
                  </div>

                  {/* Payment info */}
                  <div className="border-t border-border pt-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Payment</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Method</span>
                      <span className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-xs ${PAYMENT_COLORS[selectedSale.paymentMethod]}`}>
                        {(() => { const Icon = PAYMENT_ICONS[selectedSale.paymentMethod]; return <Icon size={11} /> })()}
                        {selectedSale.paymentMethod.replace("_", " ")}
                      </span>
                    </div>
                    {selectedSale.paymentMethod === "cash" && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tendered</span>
                          <span className="font-medium">{GHS(selectedSale.amountTendered)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold text-emerald-600">
                          <span>Change</span>
                          <span>{GHS(selectedSale.change)}</span>
                        </div>
                      </>
                    )}
                    {selectedSale.cashierName && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cashier</span>
                        <span className="font-medium">{selectedSale.cashierName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-border shrink-0">
                  <button
                    onClick={() => setPrintSale(selectedSale)}
                    className="w-full py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
                  >
                    <Receipt size={16} />
                    Print Receipt
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 px-8 text-center">
                <Receipt size={40} className="opacity-20" />
                <p className="font-medium">Select a sale</p>
                <p className="text-sm">Click any sale to view its receipt details</p>
              </div>
            )}
          </div>
        </div>
        </div>
      </main>
    </div>
    </>
  )
}
