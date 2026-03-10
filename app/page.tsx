"use client"

import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { ArrowRight, Building2, Users, TrendingUp, Shield, Zap, BarChart3 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const { user } = useAuth()

  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Streamline your workforce with comprehensive employee tracking and management"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Make data-driven decisions with powerful insights and reporting tools"
    },
    {
      icon: TrendingUp,
      title: "Project Tracking",
      description: "Monitor project progress, deadlines, and resource allocation effortlessly"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with local data storage for complete control"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance for seamless workflow and productivity"
    },
    {
      icon: Building2,
      title: "Built for Construction",
      description: "Tailored specifically for construction and project-based businesses"
    }
  ]

  const trustedCompanies = [
    "BuildCorp",
    "ConstructPro",
    "SteelWorks Inc",
    "Urban Developers",
    "Premier Builders",
    "Skyline Construction"
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
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  BuzinessIQ
                </h1>
                <p className="text-xs text-muted-foreground">Construction Management</p>
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
                  The enterprise platform
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary via-emerald-500 to-primary bg-clip-text text-transparent animate-gradient">
                  for construction
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Streamline operations, boost productivity, and drive growth with our comprehensive construction management solution
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
                      View Demo
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Badge */}
            <div className="pt-12 space-y-6">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Trusted by construction leaders
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
                {trustedCompanies.map((company, index) => (
                  <div
                    key={company}
                    className="text-lg font-semibold text-foreground/70 hover:text-foreground transition-colors"
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    {company}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-6 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
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
                Join hundreds of construction companies already using BuzinessIQ to streamline their operations
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
              © 2024 BuzinessIQ. All rights reserved.
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
