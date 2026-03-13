"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useAuth } from "@/components/auth-provider"
import { storage } from "@/lib/storage"
import type { Product, SaleItem, Sale, Company, PrintSettings } from "@/lib/types"
import { ReceiptPrint } from "@/components/pos/receipt-print"
import {
  Search, ShoppingCart, Plus, Minus, Trash2, X,
  CreditCard, Banknote, Smartphone, Building2,
  CheckCircle2, Receipt, Tag, AlertTriangle
} from "lucide-react"

const GHS = (n: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n)

const TAX_RATE = 0 // Set to e.g. 0.15 for 15% VAT

export default function POSPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const { user, currentBranch, currentBranchId } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<SaleItem[]>([])
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<Sale["paymentMethod"]>("cash")
  const [amountTendered, setAmountTendered] = useState("")
  const [discount, setDiscount] = useState("0")
  const [successSale, setSuccessSale] = useState<Sale | null>(null)
  const [printSale, setPrintSale] = useState<Sale | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [printSettings, setPrintSettings] = useState<PrintSettings>({ showCompanyName: true, showCompanyAddress: true, showTax: true, footerMessage: "Thank you for your patronage!" })
  const printTriggered = useRef(false)

  useEffect(() => {
    if (user) {
      setProducts(storage.products.getActive(user.uid))
      setCompany(storage.company.get(user.uid))
    }
    setPrintSettings(storage.printSettings.get())
  }, [user])

  // Trigger print once the receipt DOM is rendered
  useEffect(() => {
    if (printSale && !printTriggered.current) {
      printTriggered.current = true
      setTimeout(() => {
        window.print()
        // Clear after printing
        const afterPrint = () => {
          setPrintSale(null)
          printTriggered.current = false
          window.removeEventListener("afterprint", afterPrint)
        }
        window.addEventListener("afterprint", afterPrint)
      }, 100)
    }
  }, [printSale])

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category))).sort()
    return ["All", ...cats]
  }, [products])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCategory === "All" || p.category === activeCategory
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search))
      return matchCat && matchSearch
    })
  }, [products, activeCategory, search])

  // ── Cart helpers ──────────────────────────────────────────────────────────
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice }
            : i
        )
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        subtotal: product.price,
      }]
    })
  }

  const updateQty = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId)
    setCart((prev) =>
      prev.flatMap((i) => {
        if (i.productId !== productId) return [i]
        const newQty = i.quantity + delta
        if (newQty <= 0) return []
        if (product && newQty > product.stock) return [i]
        return [{ ...i, quantity: newQty, subtotal: newQty * i.unitPrice }]
      })
    )
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId))
  }

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((s, i) => s + i.subtotal, 0)
  const discountAmt = Math.min(parseFloat(discount) || 0, subtotal)
  const taxableAmount = subtotal - discountAmt
  const taxAmount = taxableAmount * TAX_RATE
  const total = taxableAmount + taxAmount
  const tendered = parseFloat(amountTendered) || 0
  const change = Math.max(0, tendered - total)

  // ── Checkout ──────────────────────────────────────────────────────────────
  const completeSale = () => {
    if (!user || cart.length === 0) return
    if (paymentMethod === "cash" && tendered < total) return

    const now = new Date().toISOString()
    const sale: Sale = {
      id: crypto.randomUUID(),
      receiptNumber: `RCP-${Date.now().toString().slice(-6)}`,
      items: cart,
      subtotal,
      taxRate: TAX_RATE,
      taxAmount,
      tax: taxAmount,
      discount: discountAmt,
      total,
      amountPaid: paymentMethod === "cash" ? tendered : total,
      amountTendered: paymentMethod === "cash" ? tendered : total,
      change: paymentMethod === "cash" ? change : 0,
      paymentMethod,
      date: now.split("T")[0],
      createdAt: now,
      cashierId: user.uid,
      cashierName: user.displayName || user.email || "Cashier",
      branchId: currentBranchId || undefined,
      branchName: currentBranch?.name || undefined,
    }

    storage.sales.add(sale, user.uid)
    setSuccessSale(sale)
    setProducts(storage.products.getActive(user.uid)) // refresh stock
    setCart([])
    setAmountTendered("")
    setDiscount("0")
    setShowCheckout(false)
  }

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  return (
    <>
    {/* Receipt — hidden in UI, visible only when printing */}
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
      <Sidebar currentPage="/pos" onSearchOpen={onSearchOpen} />

      <main className="flex-1 overflow-auto bg-muted/10">
        <div className="flex flex-col h-full max-w-7xl mx-auto px-4 md:px-8">
        {/* Top bar */}
        <div className="pt-4 pb-0 shrink-0">
          <TopBar title="Point of Sale" />
        </div>

        <div className="flex-1 flex overflow-hidden pb-4 md:pb-6 gap-4 min-h-0">
          {/* ── LEFT: Product Catalog ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search + Categories */}
            <div className="flex flex-col gap-3 mb-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Search products or scan barcode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                  <Tag size={48} className="opacity-20" />
                  <p className="font-medium">No products found</p>
                  <p className="text-sm">Add products in the Products tab</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {filtered.map((product) => {
                    const inCart = cart.find((i) => i.productId === product.id)
                    const outOfStock = product.stock <= 0
                    const lowStock = !outOfStock && product.stock <= product.lowStockThreshold
                    return (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        disabled={outOfStock}
                        className={`relative group p-4 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-between gap-1 ${outOfStock
                          ? "opacity-50 cursor-not-allowed bg-muted/30 border-border"
                          : inCart
                            ? "bg-primary/10 border-primary shadow-md shadow-primary/15 scale-[1.02]"
                            : "bg-card border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 active:scale-95"
                          }`}
                      >
                        <p className="font-semibold text-foreground leading-tight line-clamp-2 text-sm w-full">
                          {product.name}
                        </p>

                        <p className="text-primary font-bold text-lg">{GHS(product.price)}</p>

                        <div className="flex items-center justify-center gap-2 w-full">
                          <span className={`text-xs font-medium ${outOfStock ? "text-destructive" : lowStock ? "text-amber-500" : "text-muted-foreground"}`}>
                            {outOfStock ? "Out of stock" : lowStock ? `Low: ${product.stock}` : `Stock: ${product.stock}`}
                          </span>
                          {inCart && (
                            <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-bold shrink-0">
                              {inCart.quantity}
                            </span>
                          )}
                        </div>

                        {lowStock && !outOfStock && (
                          <AlertTriangle size={12} className="absolute top-2 right-2 text-amber-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Cart Panel ── */}
          <div className="w-[480px] xl:w-[520px] shrink-0 flex flex-col border border-border bg-card rounded-2xl shadow-sm overflow-hidden">
            {/* Cart Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-primary" />
                <span className="font-semibold text-foreground">Order</span>
                {cartCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-destructive hover:text-destructive/80 font-medium flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={12} />
                  Clear
                </button>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 py-12">
                  <ShoppingCart size={36} className="opacity-20" />
                  <p className="text-sm font-medium">Cart is empty</p>
                  <p className="text-xs text-center">Click a product to add it</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 bg-background rounded-xl p-3 border border-border/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{GHS(item.unitPrice)} each</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateQty(item.productId, -1)}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.productId, 1)}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/50 transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-foreground w-24 text-right shrink-0">{GHS(item.subtotal)}</p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1 rounded-lg hover:bg-destructive/10"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Discount */}
            {cart.length > 0 && (
              <div className="px-4 py-2 border-t border-border/50 shrink-0">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-muted-foreground shrink-0" />
                  <input
                    type="number"
                    min="0"
                    placeholder="Discount (GHS)"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="px-5 py-4 border-t border-border space-y-2 shrink-0">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{GHS(subtotal)}</span>
              </div>
              {discountAmt > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span>- {GHS(discountAmt)}</span>
                </div>
              )}
              {TAX_RATE > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>VAT ({(TAX_RATE * 100).toFixed(0)}%)</span>
                  <span>{GHS(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-foreground border-t border-border pt-2">
                <span>Total</span>
                <span className="text-primary">{GHS(total)}</span>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                disabled={cart.length === 0}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/25 mt-2 flex items-center justify-center gap-2"
              >
                <CreditCard size={18} />
                Charge {GHS(total)}
              </button>
            </div>
          </div>
        </div>
        </div>
      </main>

      {/* ── Checkout Modal ── */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Checkout</h2>
              <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-muted rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            {/* Order summary */}
            <div className="bg-muted/30 rounded-xl p-4 mb-5 space-y-1.5 max-h-40 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.productName} × {item.quantity}</span>
                  <span className="font-medium">{GHS(item.subtotal)}</span>
                </div>
              ))}
              {discountAmt > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 border-t border-border/50 pt-1.5 mt-1">
                  <span>Discount</span>
                  <span>- {GHS(discountAmt)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between text-2xl font-bold text-foreground mb-5">
              <span>Total</span>
              <span className="text-primary">{GHS(total)}</span>
            </div>

            {/* Payment method */}
            <p className="text-sm font-medium text-muted-foreground mb-2">Payment Method</p>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {([
                { value: "cash", label: "Cash", icon: Banknote },
                { value: "momo", label: "MoMo", icon: Smartphone },
                { value: "card", label: "Card", icon: CreditCard },
                { value: "bank_transfer", label: "Bank", icon: Building2 },
              ] as const).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setPaymentMethod(value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-xs font-semibold ${paymentMethod === value
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                >
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </div>

            {/* Cash tendered */}
            {paymentMethod === "cash" && (
              <div className="mb-5 space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Amount Tendered (GHS)</label>
                <input
                  type="number"
                  min={total}
                  step="0.01"
                  placeholder={total.toFixed(2)}
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                {/* Quick cash buttons */}
                <div className="flex gap-2 flex-wrap">
                  {[Math.ceil(total / 5) * 5, Math.ceil(total / 10) * 10, Math.ceil(total / 20) * 20, Math.ceil(total / 50) * 50]
                    .filter((v, i, arr) => arr.indexOf(v) === i && v >= total)
                    .slice(0, 4)
                    .map((v) => (
                      <button
                        key={v}
                        onClick={() => setAmountTendered(v.toString())}
                        className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-primary/10 hover:border-primary/40 transition-all"
                      >
                        {GHS(v)}
                      </button>
                    ))}
                </div>
                {tendered >= total && (
                  <div className="flex justify-between text-base font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3">
                    <span>Change</span>
                    <span>{GHS(change)}</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={completeSale}
              disabled={paymentMethod === "cash" && tendered < total}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-primary/25 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={22} />
              Complete Sale
            </button>
          </div>
        </div>
      )}

      {/* ── Receipt Success Modal ── */}
      {successSale && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">Sale Complete!</h2>
            <p className="text-muted-foreground text-sm mb-4">{successSale.receiptNumber}</p>

            <div className="bg-muted/30 rounded-xl p-4 text-left space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-primary">{GHS(successSale.total)}</span>
              </div>
              {successSale.paymentMethod === "cash" && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tendered</span>
                    <span className="font-medium">{GHS(successSale.amountTendered)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-600 font-bold">
                    <span>Change</span>
                    <span>{GHS(successSale.change)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment</span>
                <span className="capitalize font-medium">{successSale.paymentMethod.replace("_", " ")}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const sale = successSale
                  setSuccessSale(null)
                  setPrintSale(sale)
                }}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                <Receipt size={16} />
                Print
              </button>
              <button
                onClick={() => setSuccessSale(null)}
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
