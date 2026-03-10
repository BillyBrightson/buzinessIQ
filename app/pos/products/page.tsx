"use client"

import { useState, useEffect, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useAuth } from "@/components/auth-provider"
import { storage } from "@/lib/storage"
import type { Product } from "@/lib/types"
import {
  Plus, Search, X, Edit2, Trash2, Package,
  AlertTriangle, TrendingUp, ChevronDown
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const GHS = (n: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n)

const UNITS = ["pcs", "kg", "g", "litre", "ml", "box", "bag", "carton", "dozen", "pair", "roll", "set"]

interface ProductFormData {
  name: string
  category: string
  price: string
  cost: string
  stock: string
  lowStockThreshold: string
  unit: string
  barcode: string
}

const emptyForm = (): ProductFormData => ({
  name: "", category: "", price: "", cost: "",
  stock: "", lowStockThreshold: "5", unit: "pcs", barcode: "",
})

export default function ProductsPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormData>(emptyForm())
  const [formError, setFormError] = useState("")
  const [showStockModal, setShowStockModal] = useState<Product | null>(null)
  const [stockAdjust, setStockAdjust] = useState("")

  const load = () => {
    if (user) setProducts(storage.products.getAll(user.uid))
  }

  useEffect(() => { load() }, [user])

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.filter(p => p.isActive).map((p) => p.category))).sort()
    return cats
  }, [products])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive) return false
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search))
      const matchCat = categoryFilter === "all" || p.category === categoryFilter
      return matchSearch && matchCat
    })
  }, [products, search, categoryFilter])

  const stats = useMemo(() => {
    const active = products.filter(p => p.isActive)
    return {
      total: active.length,
      lowStock: active.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length,
      outOfStock: active.filter(p => p.stock <= 0).length,
      totalValue: active.reduce((s, p) => s + p.stock * p.cost, 0),
    }
  }, [products])

  const openAdd = () => {
    setEditingProduct(null)
    setForm(emptyForm())
    setFormError("")
    setShowForm(true)
  }

  const openEdit = (p: Product) => {
    setEditingProduct(p)
    setForm({
      name: p.name,
      category: p.category,
      price: p.price.toString(),
      cost: p.cost.toString(),
      stock: p.stock.toString(),
      lowStockThreshold: p.lowStockThreshold.toString(),
      unit: p.unit,
      barcode: p.barcode || "",
    })
    setFormError("")
    setShowForm(true)
  }

  const handleSave = () => {
    if (!user) return
    if (!form.name.trim()) { setFormError("Product name is required"); return }
    if (!form.category.trim()) { setFormError("Category is required"); return }
    if (!form.price || parseFloat(form.price) <= 0) { setFormError("Selling price must be greater than 0"); return }

    const product: Product = {
      id: editingProduct?.id || crypto.randomUUID(),
      name: form.name.trim(),
      category: form.category.trim(),
      price: parseFloat(form.price),
      cost: parseFloat(form.cost) || 0,
      stock: parseInt(form.stock) || 0,
      lowStockThreshold: parseInt(form.lowStockThreshold) || 5,
      unit: form.unit,
      barcode: form.barcode.trim() || undefined,
      isActive: true,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
    }

    if (editingProduct) {
      storage.products.update(editingProduct.id, product, user.uid)
    } else {
      storage.products.add(product, user.uid)
    }
    load()
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    if (!user) return
    storage.products.delete(id, user.uid)
    load()
  }

  const handleStockAdjust = (delta: number) => {
    if (!user || !showStockModal) return
    const adjusted = (parseInt(stockAdjust) || 0) * delta
    storage.products.adjustStock(showStockModal.id, adjusted, user.uid)
    load()
    setShowStockModal(null)
    setStockAdjust("")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage="/pos/products" onSearchOpen={onSearchOpen} />

      <main className="flex-1 overflow-auto bg-muted/10">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
          <TopBar title="Products & Inventory" />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Products", value: stats.total, color: "text-foreground", bg: "bg-card" },
              { label: "Low Stock", value: stats.lowStock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800" },
              { label: "Out of Stock", value: stats.outOfStock, color: "text-destructive", bg: "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800" },
              { label: "Inventory Value", value: GHS(stats.totalValue), color: "text-primary", bg: "bg-card" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl border border-border p-4 shadow-sm`}>
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition shadow-lg shadow-primary/25 whitespace-nowrap"
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>

          {/* Table */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cost</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Margin</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-muted-foreground">
                        <Package size={36} className="mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No products found</p>
                        <p className="text-sm mt-1">Add your first product to get started</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((product) => {
                      const margin = product.cost > 0
                        ? (((product.price - product.cost) / product.price) * 100).toFixed(1)
                        : "—"
                      const stockStatus = product.stock <= 0
                        ? "out"
                        : product.stock <= product.lowStockThreshold
                          ? "low"
                          : "ok"
                      return (
                        <tr key={product.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-foreground">{product.name}</p>
                            {product.barcode && <p className="text-xs text-muted-foreground font-mono">{product.barcode}</p>}
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right text-sm text-muted-foreground">{GHS(product.cost)}</td>
                          <td className="px-5 py-4 text-right font-semibold text-foreground">{GHS(product.price)}</td>
                          <td className="px-5 py-4 text-right">
                            {product.cost > 0 ? (
                              <span className={`text-sm font-medium ${parseFloat(margin) >= 30 ? "text-emerald-600" : parseFloat(margin) >= 10 ? "text-amber-600" : "text-destructive"}`}>
                                {margin}%
                              </span>
                            ) : <span className="text-muted-foreground text-sm">—</span>}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => { setShowStockModal(product); setStockAdjust("") }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 ${stockStatus === "out"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                                : stockStatus === "low"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                }`}
                            >
                              {stockStatus === "low" && <AlertTriangle size={10} />}
                              {product.stock} {product.unit}
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEdit(product)}
                                className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ── Product Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-muted rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">{formError}</div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Coca-Cola 50cl"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Category *</label>
                  <input
                    type="text"
                    list="cat-suggestions"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Beverages"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <datalist id="cat-suggestions">
                    {categories.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Unit</label>
                  <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Cost Price (GHS)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Selling Price (GHS) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Low Stock Alert</label>
                  <input
                    type="number"
                    min="0"
                    value={form.lowStockThreshold}
                    onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                    placeholder="5"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Barcode (Optional)</label>
                  <input
                    type="text"
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    placeholder="Scan or type barcode"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Margin preview */}
              {form.price && form.cost && parseFloat(form.price) > 0 && parseFloat(form.cost) > 0 && (
                <div className="bg-muted/40 rounded-lg p-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" />
                  <span className="text-sm text-muted-foreground">Gross margin:</span>
                  <span className="text-sm font-bold text-primary">
                    {(((parseFloat(form.price) - parseFloat(form.cost)) / parseFloat(form.price)) * 100).toFixed(1)}%
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    ({GHS(parseFloat(form.price) - parseFloat(form.cost))} per {form.unit})
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-border rounded-xl text-foreground hover:bg-muted transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition shadow-lg shadow-primary/25"
              >
                {editingProduct ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stock Adjustment Modal ── */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Adjust Stock</h2>
              <button onClick={() => setShowStockModal(null)} className="p-2 hover:bg-muted rounded-lg transition">
                <X size={18} />
              </button>
            </div>
            <p className="text-muted-foreground text-sm mb-1">{showStockModal.name}</p>
            <p className="text-3xl font-bold text-foreground mb-4">
              {showStockModal.stock} <span className="text-lg text-muted-foreground font-normal">{showStockModal.unit}</span>
            </p>
            <input
              type="number"
              min="1"
              value={stockAdjust}
              onChange={(e) => setStockAdjust(e.target.value)}
              placeholder="Enter quantity"
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleStockAdjust(-1)}
                disabled={!stockAdjust || parseInt(stockAdjust) <= 0}
                className="py-2.5 bg-destructive/10 text-destructive rounded-xl font-semibold hover:bg-destructive/20 transition disabled:opacity-40"
              >
                − Remove
              </button>
              <button
                onClick={() => handleStockAdjust(1)}
                disabled={!stockAdjust || parseInt(stockAdjust) <= 0}
                className="py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-40"
              >
                + Receive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
