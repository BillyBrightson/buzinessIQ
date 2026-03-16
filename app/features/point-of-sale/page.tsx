import type { Metadata } from "next"
import Link from "next/link"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"
import { ArrowRight, ShoppingCart, Package, Printer, CheckCircle, BarChart2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Point of Sale (POS) — BuzinessIQ",
  description: "A fast, modern POS terminal for Ghanaian retail businesses. Manage products, process sales, print 80mm thermal receipts, and track inventory automatically.",
  keywords: ["POS software Ghana", "point of sale Ghana", "retail POS Ghana", "inventory management Ghana", "thermal receipt printer Ghana"],
  openGraph: {
    title: "Point of Sale (POS) — BuzinessIQ",
    description: "Fast POS terminal with product catalog, cart, receipt printing, and automatic inventory tracking.",
    type: "website",
  },
}

const benefits = [
  { icon: ShoppingCart, title: "Fast Checkout", description: "Browse products by category or search by name or barcode. Add to cart with one tap and complete the sale in seconds." },
  { icon: Package, title: "Inventory Tracking", description: "Stock levels update automatically with every sale. Low stock alerts tell you when it's time to reorder." },
  { icon: Printer, title: "80mm Thermal Receipts", description: "Print professional receipts on any 80mm thermal printer. Configure your company name, address, and footer message." },
  { icon: BarChart2, title: "Sales History", description: "Every transaction is stored with full details. Filter by date or branch and reprint any receipt anytime." },
]

const steps = [
  { number: "01", title: "Set up your products", description: "Go to POS → Products and add your items with names, categories, selling price, cost, stock quantity, and barcode." },
  { number: "02", title: "Serve your customer", description: "On the POS Terminal, browse or search for products. Tap to add to cart, adjust quantities, and apply discounts." },
  { number: "03", title: "Checkout", description: "Select the payment method — cash, MoMo, card, or bank transfer. For cash, enter the amount tendered to calculate change instantly." },
  { number: "04", title: "Print the receipt", description: "Hit Print Receipt and the 80mm thermal receipt prints automatically. Stock is deducted from the current branch inventory." },
]

export default function PointOfSalePage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <ShoppingCart className="h-4 w-4" />
              Point of Sale
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Sell smarter<br />
              <span className="text-primary">at every counter.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A modern POS terminal designed for Ghanaian retail — fast checkout, automatic inventory, thermal receipt printing, and full sales history.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/signup">
                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                  Start Free <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/login">
                <button className="px-6 py-3 border border-border text-foreground rounded-full font-semibold hover:bg-accent transition-all">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/20 border border-border">
            <img src="/3.POS.png" alt="BuzinessIQ POS terminal" className="w-full h-auto" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything at your counter</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">From product to receipt in under 30 seconds.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg">From product setup to printed receipt.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.number} className="p-6 rounded-2xl bg-background border border-border">
                <div className="text-5xl font-black text-primary/10 mb-4 leading-none">{s.number}</div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20 space-y-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Accept any payment method</h2>
            <p className="text-muted-foreground leading-relaxed">Ghanaian customers pay in many ways. BuzinessIQ supports cash, Mobile Money (MTN MoMo, Telecel, AirtelTigo), card payment, and bank transfer — with each transaction stored against the correct payment type.</p>
            <ul className="space-y-2">
              {["Cash with change calculator", "MTN MoMo, Telecel & AirtelTigo", "Card and bank transfer", "Discounts per transaction", "Optional VAT/tax rate"].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-border bg-card p-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Payment Methods</p>
            <div className="grid grid-cols-2 gap-3">
              {[["💵", "Cash"], ["📱", "MoMo"], ["💳", "Card"], ["🏦", "Bank Transfer"]].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden shadow-xl border border-border bg-zinc-950 p-6 font-mono order-2 lg:order-1">
            <p className="text-white/40 text-xs text-center mb-1">BuzinessIQ</p>
            <p className="text-white/40 text-xs text-center mb-4">Newsite Shop · 15/03/2026 10:42</p>
            <div className="border-t border-white/10 py-3 space-y-1">
              {[["Coca-Cola 50cl ×2", "GH₵8.00"], ["Indomie Chicken ×5", "GH₵12.50"], ["Blue Band 500g ×1", "GH₵22.00"]].map(([item, price]) => (
                <div key={item} className="flex justify-between text-xs text-white/70"><span>{item}</span><span>{price}</span></div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-3 space-y-1">
              <div className="flex justify-between text-xs text-white/50"><span>Subtotal</span><span>GH₵42.50</span></div>
              <div className="flex justify-between text-sm font-bold text-white"><span>TOTAL</span><span>GH₵42.50</span></div>
              <div className="flex justify-between text-xs text-white/50"><span>Cash Tendered</span><span>GH₵50.00</span></div>
              <div className="flex justify-between text-xs text-emerald-400"><span>Change</span><span>GH₵7.50</span></div>
            </div>
            <p className="text-white/30 text-xs text-center mt-4">Thank you for your patronage!</p>
          </div>
          <div className="space-y-4 order-1 lg:order-2">
            <h2 className="text-3xl font-bold text-foreground">80mm thermal receipts, ready to print</h2>
            <p className="text-muted-foreground leading-relaxed">BuzinessIQ generates formatted receipts for any 80mm thermal printer. Include your company name, address, phone number, and a custom footer message. Each receipt includes the branch name, cashier, date, and itemised list.</p>
            <ul className="space-y-2">
              {["Works with any 80mm thermal printer", "Company name, address & phone on receipt", "Custom footer message", "Branch name and cashier on every receipt", "Reprint any past receipt from Sales History"].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-emerald-500/10 to-primary/10 border border-primary/20 p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Your counter deserves a smarter POS</h2>
          <p className="text-muted-foreground text-lg mb-8">Set up your product catalog and start selling today — free.</p>
          <Link href="/signup">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30">
              Get Started Free <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
