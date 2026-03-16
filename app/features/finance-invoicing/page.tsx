import type { Metadata } from "next"
import Link from "next/link"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"
import { ArrowRight, TrendingUp, FileText, CreditCard, PieChart, CheckCircle, Receipt } from "lucide-react"

export const metadata: Metadata = {
  title: "Finance & Invoicing — BuzinessIQ",
  description: "Create professional invoices, track payments, manage expenses, and get a clear picture of your cash flow. Finance tools built for Ghanaian businesses.",
  keywords: ["invoicing software Ghana", "business finance Ghana", "invoice tracker", "payment tracking Ghana", "BuzinessIQ finance"],
  openGraph: {
    title: "Finance & Invoicing — BuzinessIQ",
    description: "Create professional invoices, track payments, and manage your cash flow with ease.",
    type: "website",
  },
}

const benefits = [
  { icon: FileText, title: "Professional Invoices", description: "Create clean, professional invoices with your company branding, line items, and payment terms in seconds." },
  { icon: CreditCard, title: "Payment Tracking", description: "Record full payments or part-payments against each invoice. Always know what's been paid and what's outstanding." },
  { icon: PieChart, title: "Cash Flow Overview", description: "The finance dashboard shows your total revenue, outstanding amounts, and paid invoices at a glance." },
  { icon: Receipt, title: "Expense Management", description: "Log business expenses and track where your money is going across categories." },
]

const steps = [
  { number: "01", title: "Create an invoice", description: "Go to Finance → Invoices → New Invoice. Add your client, line items, amounts, and due date. Mark it as draft or send it." },
  { number: "02", title: "Send to your client", description: "Mark the invoice as sent and share it with your client. The status updates automatically." },
  { number: "03", title: "Record payment", description: "When payment comes in, log it against the invoice — full payment or part-payment. BuzinessIQ updates the balance automatically." },
  { number: "04", title: "Review your finances", description: "The Finance overview shows your total revenue, paid invoices, and outstanding amounts so you always know your cash position." },
]

export default function FinanceInvoicingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Finance & Invoicing
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Get paid faster.<br />
              <span className="text-primary">Stay in control.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Create professional invoices, track every payment, and see your cash flow clearly — all built for how Ghanaian businesses actually operate.
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
            <img src="/Invoicing.png" alt="BuzinessIQ finance and invoicing" className="w-full h-auto" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Complete financial visibility</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Everything from invoices to expenses, all connected.</p>
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
            <p className="text-muted-foreground text-lg">From invoice to payment in four steps.</p>
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
            <h2 className="text-3xl font-bold text-foreground">Invoices that reflect your brand</h2>
            <p className="text-muted-foreground leading-relaxed">Every invoice includes your company name, address, and contact details. Add line items with descriptions and amounts, set payment due dates, and track the invoice status from draft to paid.</p>
            <ul className="space-y-2">
              {["Draft, sent, paid, and overdue statuses", "Multiple line items per invoice", "Company branding on every invoice", "Record part-payments and full payments"].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-border bg-card p-6">
            <div className="space-y-3">
              {[["INV-0042", "Accra Retail Ltd", "GH₵3,200", "Paid", "text-emerald-600"], ["INV-0043", "Bright Stores", "GH₵1,750", "Overdue", "text-destructive"], ["INV-0044", "Kofi's Pharmacy", "GH₵900", "Sent", "text-amber-600"]].map(([id, client, amount, status, color]) => (
                <div key={id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{id}</p>
                    <p className="text-xs text-muted-foreground">{client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{amount}</p>
                    <p className={`text-xs font-medium ${color}`}>{status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-emerald-500/10 to-primary/10 border border-primary/20 p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Take control of your cash flow</h2>
          <p className="text-muted-foreground text-lg mb-8">Start creating professional invoices today — free.</p>
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
