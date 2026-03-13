"use client"

import { useState, useEffect, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useAuth } from "@/components/auth-provider"
import { storage } from "@/lib/storage"
import type { CashDrawer, Branch } from "@/lib/types"
import {
  Wallet, Lock, LockOpen, TrendingUp, TrendingDown, AlertCircle,
  CheckCircle2, Clock, MapPin, ChevronDown, ChevronUp, Plus
} from "lucide-react"

const GHS = (n: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n)

export default function CashDrawerPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const { user, effectiveUid, currentBranch, currentBranchId, userRole } = useAuth()
  const [drawers, setDrawers] = useState<CashDrawer[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string>("")
  const [openingFloat, setOpeningFloat] = useState("")
  const [closingFloat, setClosingFloat] = useState("")
  const [closeNotes, setCloseNotes] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [loading, setLoading] = useState(false)

  const uid = effectiveUid || user?.uid || ""
  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    if (!uid) return
    setBranches(storage.branches.getActive(uid))
    setDrawers(storage.cashDrawers.getAll(uid))
    setSelectedBranchId(currentBranchId)
  }, [uid, currentBranchId])

  const activeBranch = useMemo(
    () => branches.find(b => b.id === selectedBranchId) || currentBranch,
    [branches, selectedBranchId, currentBranch]
  )

  const openDrawer = useMemo(
    () => selectedBranchId ? storage.cashDrawers.getOpenDrawer(selectedBranchId, today, uid) : null,
    [drawers, selectedBranchId, today, uid]
  )

  const todaySales = useMemo(() => {
    if (!selectedBranchId) return 0
    return storage.sales.getAll(uid)
      .filter(s => s.date === today && s.branchId === selectedBranchId)
      .reduce((sum, s) => sum + s.total, 0)
  }, [uid, selectedBranchId, today])

  const branchHistory = useMemo(
    () => drawers
      .filter(d => d.branchId === selectedBranchId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30),
    [drawers, selectedBranchId]
  )

  const handleOpen = () => {
    const float = parseFloat(openingFloat)
    if (isNaN(float) || float < 0 || !selectedBranchId) return
    setLoading(true)
    const drawer: CashDrawer = {
      id: crypto.randomUUID(),
      branchId: selectedBranchId,
      branchName: activeBranch?.name || "",
      date: today,
      openingFloat: float,
      status: "open",
      openedBy: user?.displayName || user?.email || "Admin",
      createdAt: new Date().toISOString(),
    }
    storage.cashDrawers.add(drawer, uid)
    setDrawers(storage.cashDrawers.getAll(uid))
    setOpeningFloat("")
    setLoading(false)
  }

  const handleClose = () => {
    if (!openDrawer) return
    const float = parseFloat(closingFloat)
    if (isNaN(float) || float < 0) return
    setLoading(true)
    const variance = float - (openDrawer.openingFloat + todaySales)
    storage.cashDrawers.update(openDrawer.id, {
      closingFloat: float,
      totalSales: todaySales,
      variance,
      notes: closeNotes || undefined,
      status: "closed",
      closedBy: user?.displayName || user?.email || "Admin",
    }, uid)
    setDrawers(storage.cashDrawers.getAll(uid))
    setClosingFloat("")
    setCloseNotes("")
    setLoading(false)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage="/pos/cash-drawer" onSearchOpen={onSearchOpen} />

      <main className="flex-1 overflow-auto bg-muted/10">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="pt-4 pb-0">
            <TopBar title="Cash Drawer" />
          </div>

          <div className="pb-8 space-y-6">
            {/* Branch selector (admin only) */}
            {userRole === "admin" && branches.length > 1 && (
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Branch:</span>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Current drawer status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${openDrawer ? "bg-emerald-100 dark:bg-emerald-950/30" : "bg-muted"}`}>
                    {openDrawer
                      ? <LockOpen size={20} className="text-emerald-600 dark:text-emerald-400" />
                      : <Lock size={20} className="text-muted-foreground" />
                    }
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Drawer Status</p>
                    <p className={`font-bold text-lg ${openDrawer ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                      {openDrawer ? "Open" : "Closed"}
                    </p>
                  </div>
                </div>
                {openDrawer && (
                  <p className="text-xs text-muted-foreground">
                    Opened by {openDrawer.openedBy} · Float: {GHS(openDrawer.openingFloat)}
                  </p>
                )}
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Today's Sales</p>
                    <p className="font-bold text-lg text-foreground">{GHS(todaySales)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Wallet size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expected in Drawer</p>
                    <p className="font-bold text-lg text-foreground">
                      {openDrawer ? GHS(openDrawer.openingFloat + todaySales) : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Open / Close drawer action */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              {!openDrawer ? (
                <div>
                  <h2 className="font-semibold text-foreground mb-1">Open Drawer</h2>
                  <p className="text-sm text-muted-foreground mb-4">Enter the opening float (cash counted in the drawer before trading begins).</p>
                  <div className="flex gap-3">
                    <div className="relative flex-1 max-w-xs">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">GHS</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={openingFloat}
                        onChange={(e) => setOpeningFloat(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button
                      onClick={handleOpen}
                      disabled={!openingFloat || parseFloat(openingFloat) < 0 || loading || !selectedBranchId}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <LockOpen size={16} />
                      Open Drawer
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="font-semibold text-foreground mb-1">Close Drawer</h2>
                  <p className="text-sm text-muted-foreground mb-4">Count the physical cash and enter the closing amount. The system will calculate the variance.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Opening Float</label>
                      <p className="font-semibold text-foreground">{GHS(openDrawer.openingFloat)}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Sales Recorded</label>
                      <p className="font-semibold text-foreground">{GHS(todaySales)}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Closing Count (physical cash)</label>
                      <div className="relative max-w-xs">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">GHS</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={closingFloat}
                          onChange={(e) => setClosingFloat(e.target.value)}
                          className="w-full pl-12 pr-4 py-2.5 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    {closingFloat && !isNaN(parseFloat(closingFloat)) && (
                      <div className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg ${
                        parseFloat(closingFloat) - (openDrawer.openingFloat + todaySales) >= 0
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                      }`}>
                        {parseFloat(closingFloat) - (openDrawer.openingFloat + todaySales) >= 0
                          ? <TrendingUp size={14} />
                          : <TrendingDown size={14} />
                        }
                        Variance: {GHS(parseFloat(closingFloat) - (openDrawer.openingFloat + todaySales))}
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes (optional)</label>
                      <input
                        type="text"
                        placeholder="Any discrepancy notes..."
                        value={closeNotes}
                        onChange={(e) => setCloseNotes(e.target.value)}
                        className="w-full px-3 py-2.5 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary max-w-sm"
                      />
                    </div>
                    <button
                      onClick={handleClose}
                      disabled={!closingFloat || parseFloat(closingFloat) < 0 || loading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Lock size={16} />
                      Close Drawer
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* History */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setShowHistory(v => !v)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-muted-foreground" />
                  <span className="font-semibold text-foreground">Drawer History</span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{branchHistory.length}</span>
                </div>
                {showHistory ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </button>

              {showHistory && (
                <div className="border-t border-border">
                  {branchHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-8">No drawer records yet</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {branchHistory.map(d => {
                        const isOpen = d.status === "open"
                        const hasVariance = d.variance !== undefined && d.variance !== 0
                        return (
                          <div key={d.id} className="px-6 py-4 flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isOpen ? "bg-emerald-100 dark:bg-emerald-950/30" : "bg-muted"}`}>
                              {isOpen
                                ? <LockOpen size={14} className="text-emerald-600 dark:text-emerald-400" />
                                : <Lock size={14} className="text-muted-foreground" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm">{new Date(d.date).toLocaleDateString("en-GH", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</p>
                              <p className="text-xs text-muted-foreground">
                                Open: {GHS(d.openingFloat)}
                                {d.closingFloat !== undefined && ` · Close: ${GHS(d.closingFloat)}`}
                                {d.totalSales !== undefined && ` · Sales: ${GHS(d.totalSales)}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!isOpen && d.variance !== undefined && (
                                <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                  d.variance === 0
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                    : d.variance > 0
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                                }`}>
                                  {d.variance === 0 ? <CheckCircle2 size={11} /> : d.variance > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                  {d.variance >= 0 ? "+" : ""}{GHS(d.variance)}
                                </span>
                              )}
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                isOpen
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {isOpen ? "Open" : "Closed"}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
