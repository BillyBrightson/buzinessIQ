"use client"
import Link from "next/link"
import { Briefcase } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"

export function MarketingNav() {
  const { user } = useAuth()
  return (
    <nav className="relative z-10 border-b border-border/40 backdrop-blur-xl bg-background/80 sticky top-0">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Briefcase className="h-7 w-7 text-primary" />
            <div>
              <p className="text-xl font-bold text-foreground">BuzinessIQ</p>
              <p className="text-xs text-muted-foreground">Business Management</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard">
                <button className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                  Go to Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Sign In</Link>
                <Link href="/signup">
                  <button className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
