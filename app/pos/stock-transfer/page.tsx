"use client"

import { useState, useEffect, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useAuth } from "@/components/auth-provider"
import { storage } from "@/lib/storage"
import type { StockTransfer, Branch, Product } from "@/lib/types"
import {
  ArrowLeftRight, Plus, X, PackageCheck, Clock, CheckCircle2,
  XCircle, Trash2, ChevronDown, Package, AlertCircle
} from "lucide-react"

export default function StockTransferPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const { user, effectiveUid, currentBranchId } = useAuth()
  const [transfers, setTransfers] = useState<StockTransfer[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [fromBranchId, setFromBranchId] = useState("")
  const [toBranchId, setToBranchId] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<{ productId: string; productName: string; quantity: number }[]>([])
  const [addProductId, setAddProductId] = useState("")
  const [addQty, setAddQty] = useState("1")

  const uid = effectiveUid || user?.uid || ""

  useEffect(() => {
    if (!uid) return
    const activeBranches = storage.branches.getActive(uid)
    setBranches(activeBranches)
    setProducts(storage.products.getActive(uid))
    setTransfers(storage.stockTransfers.getAll(uid))
    setFromBranchId(currentBranchId || activeBranches[0]?.id || "")
  }, [uid, currentBranchId])

  const toBranches = useMemo(
    () => branches.filter(b => b.id !== fromBranchId),
    [branches, fromBranchId]
  )

  useEffect(() => {
    if (toBranches.length > 0 && !toBranches.find(b => b.id === toBranchId)) {
      setToBranchId(toBranches[0]?.id || "")
    }
  }, [toBranches])

  const addItem = () => {
    const product = products.find(p => p.id === addProductId)
    if (!product) return
    const qty = parseInt(addQty)
    if (isNaN(qty) || qty <= 0) return
    if (items.find(i => i.productId === addProductId)) {
      setItems(prev => prev.map(i => i.productId === addProductId ? { ...i, quantity: i.quantity + qty } : i))
    } else {
      setItems(prev => [...prev, { productId: product.id, productName: product.name, quantity: qty }])
    }
    setAddProductId("")
    setAddQty("1")
  }

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  const getProductStock = (productId: string) => products.find(p => p.id === productId)?.stock ?? 0

  const canSubmit = fromBranchId && toBranchId && fromBranchId !== toBranchId && items.length > 0
    && items.every(i => i.quantity <= getProductStock(i.productId))

  const handleSubmit = () => {
    if (!canSubmit) return
    const fromBranch = branches.find(b => b.id === fromBranchId)
    const toBranch = branches.find(b => b.id === toBranchId)
    const transfer: StockTransfer = {
      id: crypto.randomUUID(),
      fromBranchId,
      fromBranchName: fromBranch?.name || "",
      toBranchId,
      toBranchName: toBranch?.name || "",
      items,
      status: "completed",
      notes: notes || undefined,
      transferredBy: user?.displayName || user?.email || "Admin",
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    }
    // Deduct stock from source (add to destination — products shared for now, just log the transfer)
    items.forEach(item => {
      storage.products.adjustStock(item.productId, -item.quantity, uid)
    })
    storage.stockTransfers.add(transfer, uid)
    setTransfers(storage.stockTransfers.getAll(uid))
    setProducts(storage.products.getActive(uid))
    setItems([])
    setNotes("")
    setShowForm(false)
  }

  const STATUS_STYLES: Record<StockTransfer["status"], string> = {
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  }

  const STATUS_ICONS = {
    completed: CheckCircle2,
    pending: Clock,
    cancelled: XCircle,
  }

  const sortedTransfers = useMemo(
    () => [...transfers].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [transfers]
  )

  if (branches.length < 2) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar currentPage="/pos/stock-transfer" onSearchOpen={onSearchOpen} />
        <main className="flex-1 overflow-auto bg-muted/10 flex items-center justify-center">
          <div className="text-center max-w-sm px-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <ArrowLeftRight size={28} className="text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">No Branches to Transfer Between</h2>
            <p className="text-sm text-muted-foreground">You need at least 2 active branches to perform stock transfers. Go to Settings → Branches to create more.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage="/pos/stock-transfer" onSearchOpen={onSearchOpen} />

      <main className="flex-1 overflow-auto bg-muted/10">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="pt-4 pb-0">
            <TopBar title="Stock Transfer" />
          </div>

          <div className="pb-8 space-y-5">
            {/* Header action */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{sortedTransfers.length} transfer{sortedTransfers.length !== 1 ? "s" : ""} recorded</p>
              <button
                onClick={() => setShowForm(v => !v)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {showForm ? <X size={16} /> : <Plus size={16} />}
                {showForm ? "Cancel" : "New Transfer"}
              </button>
            </div>

            {/* Transfer form */}
            {showForm && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
                <h2 className="font-semibold text-foreground">New Stock Transfer</h2>

                {/* Branch selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">From Branch</label>
                    <select
                      value={fromBranchId}
                      onChange={(e) => setFromBranchId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">To Branch</label>
                    <select
                      value={toBranchId}
                      onChange={(e) => setToBranchId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {toBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Add products */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Add Products</label>
                  <div className="flex gap-2">
                    <select
                      value={addProductId}
                      onChange={(e) => setAddProductId(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (stock: {p.stock} {p.unit})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={addQty}
                      onChange={(e) => setAddQty(e.target.value)}
                      className="w-20 px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={addItem}
                      disabled={!addProductId}
                      className="px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Item list */}
                {items.length > 0 && (
                  <div className="border border-border rounded-xl overflow-hidden">
                    <div className="divide-y divide-border">
                      {items.map(item => {
                        const stock = getProductStock(item.productId)
                        const overStock = item.quantity > stock
                        return (
                          <div key={item.productId} className={`flex items-center gap-3 px-4 py-3 ${overStock ? "bg-red-50 dark:bg-red-950/10" : ""}`}>
                            <Package size={14} className="text-muted-foreground flex-shrink-0" />
                            <span className="flex-1 text-sm font-medium text-foreground">{item.productName}</span>
                            <span className="text-sm text-muted-foreground">× {item.quantity}</span>
                            {overStock && (
                              <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                <AlertCircle size={12} />
                                Only {stock} in stock
                              </span>
                            )}
                            <button onClick={() => removeItem(item.productId)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                              <Trash2 size={14} className="text-muted-foreground" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes (optional)</label>
                  <input
                    type="text"
                    placeholder="Transfer reason or notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeftRight size={16} />
                  Complete Transfer
                </button>
              </div>
            )}

            {/* Transfer history */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Transfer History</h2>
              </div>
              {sortedTransfers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                  <ArrowLeftRight size={40} className="opacity-20" />
                  <p className="font-medium">No transfers yet</p>
                  <p className="text-sm">Create a new transfer to move stock between branches</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {sortedTransfers.map(t => {
                    const Icon = STATUS_ICONS[t.status]
                    return (
                      <div key={t.id} className="px-6 py-4">
                        <div className="flex items-start gap-4">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <ArrowLeftRight size={16} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-foreground text-sm">
                                {t.fromBranchName} → {t.toBranchName}
                              </p>
                              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[t.status]}`}>
                                <Icon size={10} />
                                {t.status}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {t.items.length} product{t.items.length !== 1 ? "s" : ""} · {new Date(t.createdAt).toLocaleDateString("en-GH", { dateStyle: "medium" })}
                              {t.transferredBy && ` · by ${t.transferredBy}`}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {t.items.map(item => (
                                <span key={item.productId} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                  {item.productName} ×{item.quantity}
                                </span>
                              ))}
                            </div>
                            {t.notes && <p className="text-xs text-muted-foreground mt-1 italic">{t.notes}</p>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
