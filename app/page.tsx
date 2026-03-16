"use client"

import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { ArrowRight, Briefcase, Users, TrendingUp, Shield, Zap, BarChart3, ShoppingCart } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const { user } = useAuth()

  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Streamline your workforce with comprehensive employee tracking, attendance, and payroll management",
      image: "/1.Employee Management.png",
      slug: "/features/employee-management",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Make data-driven decisions with powerful insights and reporting tools across your entire business",
      image: "/2.Financial Analysis.png",
      slug: "/features/analytics",
    },
    {
      icon: TrendingUp,
      title: "Finance & Invoicing",
      description: "Track payments, manage invoices, and stay on top of your cash flow with ease",
      image: "/Invoicing.png",
      slug: "/features/finance-invoicing",
    },
    {
      icon: ShoppingCart,
      title: "Point of Sale",
      description: "Sell faster with a built-in POS terminal, real-time inventory, stock transfers between branches, and instant thermal receipts",
      image: "/3.POS.png",
      slug: "/features/point-of-sale",
    },
    {
      icon: Zap,
      title: "Multi-Branch Ready",
      description: "Manage multiple shop locations, transfer stock between branches, and track performance per branch",
      image: "/4.Project Tracking.png",
      slug: "/features/multi-branch",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with cloud sync and local data storage for complete control",
      image: "/5.Secre and Reliable.png",
      slug: "/features/security",
    },
  ]

  const businessCategories = [
    "Retail Shops",
    "Pharmacies",
    "Restaurants",
    "Wholesale Stores",
    "Fashion & Boutiques",
    "Logistics & Distribution",
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/40 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  BuzinessIQ
                </h1>
                <p className="text-xs text-muted-foreground">Business Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {user ? (
                <Link href="/dashboard">
                  <button className="px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25">
                    Go to Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <button className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button className="px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25">
                      Get Started
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Hero Title */}
            <div className="space-y-6">
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                  The all-in-one platform
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-emerald-500 to-primary bg-clip-text text-transparent animate-gradient">
                  for Ghanaian businesses
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Manage your team, track sales, handle invoices, and run multiple branches — all from one intelligent platform built for Ghanaian businesses.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {user ? (
                <Link href="/dashboard">
                  <button className="group px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-2xl shadow-primary/30 flex items-center gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <button className="group px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-2xl shadow-primary/30 flex items-center gap-2">
                      Start Free Trial
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <Link href="/login">
                    <button className="px-8 py-4 bg-card border border-border text-foreground rounded-full font-semibold text-lg hover:bg-accent transition-all hover:scale-105 shadow-xl">
                      Sign In
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Badge */}
            <div className="pt-12 space-y-6">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Trusted across industries in Ghana
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
                {businessCategories.map((category, index) => (
                  <div
                    key={category}
                    className="text-lg font-semibold text-foreground/70 hover:text-foreground transition-colors"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-6 pb-32">
          <div className="rounded-3xl bg-zinc-900 dark:bg-zinc-950 p-8 md:p-12">

            {/* Section header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-primary mb-3">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                  Our Features
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  Everything your business<br className="hidden sm:block" /> needs in one place
                </h2>
              </div>
              <Link href="/signup">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-sm font-medium transition-all whitespace-nowrap">
                  Get started <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                const isFeatured = index === 3 // Point of Sale highlighted

                return (
                  <div
                    key={feature.title}
                    className={`group relative overflow-hidden rounded-2xl flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                      isFeatured
                        ? "bg-primary shadow-xl shadow-primary/30"
                        : "bg-zinc-800/70 hover:bg-zinc-800"
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Image — top portion of card */}
                    <div className="h-44 overflow-hidden flex-shrink-0">
                      {feature.image ? (
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isFeatured ? "bg-primary/80" : "bg-zinc-700/50"}`}>
                          <Icon className="h-12 w-12 text-white/20" />
                        </div>
                      )}
                    </div>

                    {/* Text content */}
                    <div className="p-6 flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isFeatured ? "bg-white/20" : "bg-primary/15"}`}>
                          <Icon className={`h-4 w-4 ${isFeatured ? "text-white" : "text-primary"}`} />
                        </div>
                      </div>
                      <h3 className={`text-lg font-bold mt-1 ${isFeatured ? "text-white" : "text-white"}`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm leading-relaxed ${isFeatured ? "text-white/75" : "text-white/50"}`}>
                        {feature.description}
                      </p>
                      <div className="mt-auto pt-3">
                        <Link href={feature.slug} className={`inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all ${isFeatured ? "text-white" : "text-primary"}`}>
                          Learn more <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-6 pb-32">
          <div className="relative rounded-3xl bg-gradient-to-r from-primary/10 via-emerald-500/10 to-primary/10 border border-primary/20 p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
            <div className="relative z-10 space-y-6">
              <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Ready to transform your business?
              </h3>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join growing businesses across Ghana using BuzinessIQ to manage smarter and grow faster.
              </p>
              <div className="pt-4">
                <Link href="/signup">
                  <button className="group px-10 py-5 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-2xl shadow-primary/30 flex items-center gap-2 mx-auto">
                    Get Started Today
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 BuzinessIQ. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
