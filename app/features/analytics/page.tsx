import type { Metadata } from "next"
import Link from "next/link"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"
import { ArrowRight, BarChart3, TrendingUp, DollarSign, CheckCircle, LayoutDashboard, GitBranch } from "lucide-react"

export const metadata: Metadata = {
  title: "Real-time Analytics — BuzinessIQ",
  description: "Track your business performance in real time. Dashboard metrics, today's sales, revenue, employees, invoices, and per-branch analytics — all in one view.",
  keywords: ["business analytics Ghana", "POS analytics", "sales dashboard", "business intelligence Ghana", "BuzinessIQ analytics"],
  openGraph: {
    title: "Real-time Analytics — BuzinessIQ",
    description: "Track your business performance in real time. Dashboard metrics, sales, revenue, and per-branch breakdowns.",
    type: "website",
  },
}

const benefits = [
  { icon: LayoutDashboard, title: "Live Dashboard", description: "See your most important numbers the moment you log in — employees, sales, revenue, invoices, projects, and expenses." },
  { icon: TrendingUp, title: "Today's Performance", description: "Today's sales count and revenue are always front and centre so you know exactly how your day is going." },
  { icon: GitBranch, title: "Per-Branch Breakdown", description: "If you run multiple branches, see each location's contribution to today's totals side by side." },
  { icon: DollarSign, title: "Financial Summary", description: "Revenue, paid invoices, outstanding payments — all the numbers you need for a quick financial health check." },
]

const steps = [
  { number: "01", title: "Open your dashboard", description: "Every time you log in, your dashboard is already populated with the latest data pulled from Firestore cloud storage." },
  { number: "02", title: "Check today's numbers", description: "Today's Sales and Today's Revenue cards update in real time as your cashiers make sales at the POS terminal." },
  { number: "03", title: "Review branch performance", description: "If you manage multiple locations, the branch breakdown grid shows each branch's sales for the day." },
  { number: "04", title: "Drill into reports", description: "Head to the Reports page to generate, filter, and print detailed breakdowns for any period." },
]

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <BarChart3 className="h-4 w-4" />
              Real-time Analytics
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Numbers that<br />
              <span className="text-primary">tell your story.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Stop guessing. BuzinessIQ gives you a live snapshot of your business every time you log in — across every department and every branch.
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
            <img src="/2.Financial Analysis.png" alt="BuzinessIQ analytics dashboard" className="w-full h-auto" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">All your key metrics, instantly</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Six dashboard cards. One login. Complete picture.</p>
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
            <p className="text-muted-foreground text-lg">Your analytics are always ready. No setup required.</p>
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
            <h2 className="text-3xl font-bold text-foreground">Six metrics that matter most</h2>
            <p className="text-muted-foreground leading-relaxed">The dashboard is built around the six numbers business owners check most: active employees, open projects, total expenses, paid invoices, today's sales count, and today's revenue. Everything else is one click away.</p>
            <ul className="space-y-2">
              {["Active employees at a glance", "Open & completed projects", "Total expenses this period", "Paid invoices count", "Today's sales transactions", "Today's revenue in GHS"].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-border bg-card p-6">
            <div className="grid grid-cols-2 gap-3">
              {[["Employees", "12", "text-foreground"], ["Projects", "5", "text-foreground"], ["Expenses", "GH₵4,200", "text-destructive"], ["Invoices Paid", "18", "text-foreground"], ["Today's Sales", "34", "text-primary"], ["Today's Revenue", "GH₵6,850", "text-primary"]].map(([label, value, color]) => (
                <div key={label} className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden shadow-xl border border-border bg-card p-6 order-2 lg:order-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Branch Performance — Today</p>
            <div className="space-y-3">
              {[["Newsite Shop", "GH₵4,200", "21 sales"], ["Dodowa Shop", "GH₵2,650", "13 sales"]].map(([branch, rev, sales]) => (
                <div key={branch} className="p-4 rounded-xl bg-muted/50 border border-border flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{branch}</span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{rev}</p>
                    <p className="text-xs text-muted-foreground">{sales}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 order-1 lg:order-2">
            <h2 className="text-3xl font-bold text-foreground">Per-branch performance, side by side</h2>
            <p className="text-muted-foreground leading-relaxed">When you run two or more branches, the dashboard shows a breakdown grid below your main stats — today's sales count and revenue per location, so you can see which branch is performing at a glance.</p>
            <ul className="space-y-2">
              {["Available for accounts with 2+ branches", "Shows today's sales and revenue per branch", "Admin-only view for full business oversight", "Updates as sales are recorded at each POS terminal"].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-emerald-500/10 to-primary/10 border border-primary/20 p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Always know how your business is doing</h2>
          <p className="text-muted-foreground text-lg mb-8">Sign up free and see your live dashboard in minutes.</p>
          <Link href="/signup">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30">
              Start Free Trial <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
