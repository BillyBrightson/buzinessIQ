import type { Metadata } from "next"
import Link from "next/link"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"
import { ArrowRight, Shield, Lock, Cloud, Users, CheckCircle, Key } from "lucide-react"

export const metadata: Metadata = {
  title: "Security & Reliability — BuzinessIQ",
  description: "Enterprise-grade security for your business data. Firebase authentication, Firestore cloud sync, role-based access control, and local-first storage for complete reliability.",
  keywords: ["business data security Ghana", "RBAC software", "Firebase business app", "secure POS Ghana", "BuzinessIQ security"],
  openGraph: {
    title: "Security & Reliability — BuzinessIQ",
    description: "Firebase authentication, Firestore cloud sync, and role-based access control keep your business data safe.",
    type: "website",
  },
}

const benefits = [
  { icon: Lock, title: "Firebase Authentication", description: "Every account is protected by Google Firebase Auth — industry-standard email/password authentication with secure session management." },
  { icon: Cloud, title: "Cloud Sync", description: "Your data syncs to Firestore automatically. Log in on any device and your latest data is always there." },
  { icon: Users, title: "Role-Based Access", description: "Create sub-accounts for your team with specific roles. Each role only sees what they need — nothing more." },
  { icon: Key, title: "Local-First Storage", description: "Data is cached locally so the app works even with poor internet. Changes sync to the cloud when connectivity returns." },
]

const roles = [
  { role: "Admin", color: "text-primary", bg: "bg-primary/10", access: ["Full access to all features", "Manage branches and staff", "View all financial data", "Configure system settings"] },
  { role: "Store Keeper", color: "text-amber-600", bg: "bg-amber-500/10", access: ["POS terminal access", "Manage inventory", "Stock transfers", "Cash drawer management"] },
  { role: "Accountant", color: "text-emerald-600", bg: "bg-emerald-500/10", access: ["Finance & invoicing", "Accounting overview", "Project tracking", "Reports and analytics"] },
]

const steps = [
  { number: "01", title: "Create your admin account", description: "Sign up with your email and password. Your account is the master admin with full access to everything." },
  { number: "02", title: "Add team members", description: "Go to Settings → Roles & Access and add sub-accounts for your cashiers, store keepers, and accountants with individual logins." },
  { number: "03", title: "Assign roles and branches", description: "Give each sub-account a role (Store Keeper or Accountant) and optionally lock them to a specific branch." },
  { number: "04", title: "Data stays in sync", description: "Every change is written to Firestore in the background. Your team always works with the same live data." },
]

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Shield className="h-4 w-4" />
              Secure & Reliable
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Built to last.<br />
              <span className="text-primary">Built to trust.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your business data is valuable. BuzinessIQ protects it with Firebase authentication, Firestore cloud sync, and role-based access control — so only the right people see the right information.
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
            <img src="/5.Secre and Reliable.png" alt="BuzinessIQ security and reliability" className="w-full h-auto" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Enterprise security, small business simplicity</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">The same infrastructure trusted by millions of businesses worldwide.</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Role-based access control</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Three roles. Each sees exactly what they need to do their job.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r) => (
              <div key={r.role} className="p-6 rounded-2xl bg-background border border-border">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${r.bg} ${r.color} mb-4`}>{r.role}</div>
                <ul className="space-y-2">
                  {r.access.map(a => (
                    <li key={a} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />{a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20 border-t border-border/40">
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

      <section className="max-w-7xl mx-auto px-6 pb-24 pt-16">
        <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-emerald-500/10 to-primary/10 border border-primary/20 p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Your data. Your control.</h2>
          <p className="text-muted-foreground text-lg mb-8">Sign up free and set up your team with the right access in minutes.</p>
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
