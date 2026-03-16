import type { Metadata } from "next"
import Link from "next/link"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"
import { ArrowRight, Users, FileText, CheckCircle, UserPlus, CalendarCheck, Banknote } from "lucide-react"

export const metadata: Metadata = {
  title: "Employee Management — BuzinessIQ",
  description: "Manage your entire workforce from one place. Track employees, mark daily attendance, calculate payroll automatically, and export reports — built for Ghanaian businesses.",
  keywords: ["employee management Ghana", "payroll software Ghana", "attendance tracking", "HR software Ghana", "BuzinessIQ"],
  openGraph: {
    title: "Employee Management — BuzinessIQ",
    description: "Manage your entire workforce from one place. Track employees, mark daily attendance, calculate payroll automatically.",
    type: "website",
  },
}

const benefits = [
  { icon: UserPlus, title: "Easy Onboarding", description: "Add employees in seconds with their contact details, role, pay rate, and MoMo wallet information." },
  { icon: CalendarCheck, title: "Daily Attendance", description: "Mark each employee present, absent, or late with one tap. Full attendance history is always available." },
  { icon: Banknote, title: "Automatic Payroll", description: "Payroll is calculated from attendance records and hourly rates. No spreadsheets needed." },
  { icon: FileText, title: "Printable Reports", description: "Generate and print employee reports for records, audits, or management reviews." },
]

const steps = [
  { number: "01", title: "Add your employees", description: "Enter each employee's name, role, hourly rate, and MoMo network details. Everything is saved securely to your account." },
  { number: "02", title: "Mark attendance daily", description: "Every day, go to the Attendance page and mark each employee. The system records timestamps for every entry." },
  { number: "03", title: "Run payroll", description: "At the end of the week, open Payroll, select the period, and BuzinessIQ calculates each employee's wages based on days worked and their rate." },
  { number: "04", title: "Export & share", description: "Print detailed employee reports for management reviews, audits, or your own records." },
]

export default function EmployeeManagementPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Users className="h-4 w-4" />
              Employee Management
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Know your team.<br />
              <span className="text-primary">Grow your business.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              From onboarding to payroll, BuzinessIQ gives you complete control over your workforce. Designed for Ghanaian businesses with MoMo payroll support built in.
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
            <img src="/1.Employee Management.png" alt="Employee Management dashboard in BuzinessIQ" className="w-full h-auto" />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything you need to manage your team</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">All your HR essentials in one place — no technical knowledge required.</p>
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

      {/* How it works */}
      <section className="bg-muted/30 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg">Four simple steps from setup to payday.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.number} className="relative p-6 rounded-2xl bg-background border border-border">
                <div className="text-5xl font-black text-primary/10 mb-4 leading-none">{s.number}</div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="max-w-7xl mx-auto px-6 py-20 space-y-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Employee profiles with MoMo support</h2>
            <p className="text-muted-foreground leading-relaxed">Each employee gets a full profile — name, role, daily/hourly rate, phone number, and their MoMo wallet details (MTN, Telecel, or AirtelTigo). When it's time to pay, you have everything in one place.</p>
            <ul className="space-y-2">
              {["Add unlimited employees", "Store MoMo network and wallet number", "Track join dates and roles", "Mark employees as active or inactive"].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-border bg-card p-6">
            <div className="space-y-3">
              {["Kwame Asante · Store Manager · MTN MoMo", "Abena Mensah · Cashier · Telecel", "Kofi Boateng · Accountant · AirtelTigo"].map(e => (
                <div key={e} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">{e[0]}</div>
                  <span className="text-sm text-foreground">{e}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden shadow-xl border border-border bg-card p-6 order-2 lg:order-1">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Today&apos;s Attendance — Mon, 15 Mar</p>
              {[["Kwame Asante", "Present", "text-emerald-600"], ["Abena Mensah", "Present", "text-emerald-600"], ["Kofi Boateng", "Late", "text-amber-600"], ["Ama Darko", "Absent", "text-destructive"]].map(([name, status, color]) => (
                <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-foreground">{name}</span>
                  <span className={`text-xs font-semibold ${color}`}>{status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 order-1 lg:order-2">
            <h2 className="text-3xl font-bold text-foreground">Attendance in seconds</h2>
            <p className="text-muted-foreground leading-relaxed">Each morning, open the Attendance page and tap each employee's status — Present, Absent, or Late. BuzinessIQ keeps a full history so you can review any day in the past.</p>
            <ul className="space-y-2">
              {["Mark present, absent, or late", "Full attendance history", "Filter by date range", "Feeds directly into payroll calculation"].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-emerald-500/10 to-primary/10 border border-primary/20 p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to simplify your HR?</h2>
          <p className="text-muted-foreground text-lg mb-8">Get started free and have your first employee added in under 5 minutes.</p>
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
