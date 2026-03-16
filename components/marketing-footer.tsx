import Link from "next/link"
import { Briefcase } from "lucide-react"

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">BuzinessIQ</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">The all-in-one business management platform for Ghanaian businesses.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div>
              <p className="font-semibold text-foreground mb-3">Features</p>
              <div className="space-y-2 text-muted-foreground">
                <Link href="/features/employee-management" className="block hover:text-foreground transition-colors">Employee Management</Link>
                <Link href="/features/analytics" className="block hover:text-foreground transition-colors">Analytics</Link>
                <Link href="/features/finance-invoicing" className="block hover:text-foreground transition-colors">Finance & Invoicing</Link>
                <Link href="/features/point-of-sale" className="block hover:text-foreground transition-colors">Point of Sale</Link>
                <Link href="/features/multi-branch" className="block hover:text-foreground transition-colors">Multi-Branch</Link>
                <Link href="/features/security" className="block hover:text-foreground transition-colors">Security</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-3">Company</p>
              <div className="space-y-2 text-muted-foreground">
                <Link href="/" className="block hover:text-foreground transition-colors">Home</Link>
                <Link href="/login" className="block hover:text-foreground transition-colors">Sign In</Link>
                <Link href="/signup" className="block hover:text-foreground transition-colors">Get Started</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-3">Legal</p>
              <div className="space-y-2 text-muted-foreground">
                <Link href="#" className="block hover:text-foreground transition-colors">Privacy</Link>
                <Link href="#" className="block hover:text-foreground transition-colors">Terms</Link>
                <Link href="#" className="block hover:text-foreground transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border/40 mt-8 pt-6 text-sm text-muted-foreground">
          © 2026 BuzinessIQ. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
