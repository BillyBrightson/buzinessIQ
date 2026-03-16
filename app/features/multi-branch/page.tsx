import type { Metadata } from "next"
import Link from "next/link"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"
import { ArrowRight, GitBranch, ArrowLeftRight, Vault, Users, CheckCircle, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "Multi-Branch Management — BuzinessIQ",
  description: "Manage multiple shop locations from one account. Transfer stock between branches, track per-branch sales, manage cash drawers, and assign staff to specific locations.",
  keywords: ["multi-branch POS Ghana", "branch management software", "stock transfer Ghana", "multi-location business Ghana", "BuzinessIQ branches"],
  openGraph: {
    title: "Multi-Branch Management — BuzinessIQ",
    description: "Run multiple shop locations from one account. Stock transfers, per-branch analytics, and role-based access.",
    type: "website",
  },
}

const benefits = [
  { icon: MapPin, title: "Up to 3 Branches", description: "Create up to three branch locations under one account. Each branch operates independently with its own stock and sales records." },
  { icon: ArrowLeftRight, title: "Stock Transfers", description: "Move inventory between branches with a full transfer record. Source branch stock decreases, destination branch stock increases." },
  { icon: Vault, title: "Cash Drawer Management", description: "Open and close the cash drawer for each branch shift. Record opening float, closing cash, and calculate any variance." },
  { icon: Users, title: "Staff Assignment", description: "Assign store keepers to specific branches. They only see and manage the stock and sales for their assigned location." },
]

const steps = [
  { number: "01", title: "Create your branches", description: "Go to Settings → Branches and add each location with a name. The first branch (Main Branch) is created automatically." },
  { number: "02", title: "Assign staff", description: "In Roles & Access, create sub-accounts for your store keepers and assign them to their branch. They log in and see only their branch." },
  { number: "03", title: "Transfer stock", description: "When a branch needs more stock, go to POS → Stock Transfer. Select source, destination, products, and quantities. Confirm to complete." },
  { number: "04", title: "Monitor performance", description: "Admins see all branches in the dashboard and can filter sales history by branch to compare performance." },
]

export default function MultiBranchPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <GitBranch className="h-4 w-4" />
              Multi-Branch Ready
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              One business.<br />
              <span className="text-primary">Multiple locations.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Run your Accra shop and your Tema shop from the same account. Separate stock, separate cashiers, unified oversight — all from BuzinessIQ.
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
            <img src="/4.Project Tracking.png" alt="BuzinessIQ multi-branch management" className="w-full h-auto" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Built for multi-location businesses</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Every tool you need to manage multiple shops as one unified business.</p>
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
            <h2 className="text-3xl font-bold text-foreground">Stock transfers that actually work</h2>
            <p className="text-muted-foreground leading-relaxed">When one branch runs low, transfer stock from another. BuzinessIQ deducts the quantity from the source branch and adds it to the destination — in real time. Every transfer is logged with a timestamp and the products moved.</p>
            <ul className="space-y-2">
              {["Select source and destination branch", "Add multiple products per transfer", "Automatic stock deduction and addition", "Full transfer history with timestamps", "Optional transfer notes"].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-border bg-card p-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Stock Transfer</p>
            <div className="flex items-center justify-between mb-4">
              <div className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm font-medium text-primary">Newsite Shop</div>
              <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
              <div className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm font-medium text-primary">Dodowa Shop</div>
            </div>
            <div className="space-y-2">
              {[["Coca-Cola 50cl", "×24"], ["Indomie Chicken", "×48"], ["Blue Band 500g", "×12"]].map(([item, qty]) => (
                <div key={item} className="flex justify-between items-center p-3 rounded-xl bg-muted/50 text-sm">
                  <span className="text-foreground">{item}</span>
                  <span className="font-semibold text-primary">{qty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-emerald-500/10 to-primary/10 border border-primary/20 p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to connect your locations?</h2>
          <p className="text-muted-foreground text-lg mb-8">Create your account and add your first branch in minutes.</p>
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
