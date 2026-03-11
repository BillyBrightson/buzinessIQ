"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Users, Calendar, DollarSign, LayoutGrid, Home, Menu, X, FileText, CreditCard, ChevronDown, ChevronRight, Calculator, Sparkles, ShoppingCart, Package, BarChart2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth-provider"
import { storage } from "@/lib/storage"
import { cn } from "@/lib/utils"

interface SidebarProps {
  currentPage: string
  onSearchOpen?: () => void
}

export function Sidebar({ currentPage, onSearchOpen }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const [companyName, setCompanyName] = useState("BuzinessIQ")
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      const company = storage.company.get(user.uid)
      if (company) {
        setCompanyName(company.name)
      }
    }
  }, [user])

  useEffect(() => {
    // Auto-expand menu if current page is within a submenu
    const activeMenu = menuItems.find(item =>
      item.subItems && (currentPage === item.href || item.subItems.some(sub => currentPage === sub.href))
    )
    if (activeMenu && !expandedMenus.includes(activeMenu.label)) {
      setExpandedMenus(prev => [...prev, activeMenu.label])
    }
  }, [currentPage])

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/employees", label: "Employees", icon: Users },
    { href: "/attendance", label: "Attendance", icon: Calendar },
    { href: "/payroll", label: "Payroll", icon: DollarSign },
    { href: "/projects", label: "Projects", icon: LayoutGrid },
    {
      href: "/finance",
      label: "Finance",
      icon: CreditCard,
      subItems: [
        { href: "/finance/payments", label: "Payments" },
        { href: "/finance/invoices", label: "Invoices" },
      ]
    },
    {
      href: "/accounting",
      label: "Accounting",
      icon: Calculator,
      subItems: [
        { href: "/accounting/expenses", label: "Expenses" },
        { href: "/accounting/income", label: "Income" },
        { href: "/accounting/profit-loss", label: "Profit & Loss" },
        { href: "/accounting/cash-flow", label: "Cash Flow" },
        { href: "/accounting/tax", label: "Tax Summary" },
      ]
    },
    { href: "/reports", label: "Reports", icon: FileText },
    {
      href: "/pos",
      label: "Point of Sale",
      icon: ShoppingCart,
      subItems: [
        { href: "/pos", label: "POS Terminal" },
        { href: "/pos/products", label: "Products" },
        { href: "/pos/sales", label: "Sales History" },
      ]
    },
  ]

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-primary text-primary-foreground"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } z-40 overflow-y-auto`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-sidebar-foreground">{companyName}</h1>
          <p className="text-sm text-sidebar-foreground/60 mt-1">Business Management</p>
        </div>

        <nav className="space-y-1 px-4 mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.href
            const hasSubItems = item.subItems && item.subItems.length > 0
            const isExpanded = expandedMenus.includes(item.label)
            const isSubActive = hasSubItems && item.subItems?.some(sub => currentPage === sub.href)

            return (
              <div key={item.label}>
                {hasSubItems ? (
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${isActive || isSubActive
                      ? "text-sidebar-foreground bg-sidebar-accent/10"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                ) : (
                  <Link href={item.href}>
                    <button
                      onClick={() => setIsOpen(false)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                        }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </Link>
                )}

                {hasSubItems && isExpanded && (
                  <div className="ml-9 mt-1 space-y-1 border-l border-sidebar-border/30 pl-2">
                    {item.subItems?.map((subItem) => {
                      const isSubItemActive = currentPage === subItem.href
                      return (
                        <Link key={subItem.href} href={subItem.href}>
                          <button
                            onClick={() => setIsOpen(false)}
                            className={`w-full text-left px-4 py-2 rounded-md transition-all text-sm ${isSubItemActive
                              ? "bg-sidebar-accent/20 text-sidebar-foreground font-medium"
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/10"
                              }`}
                          >
                            {subItem.label}
                          </button>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4 space-y-4">
          {/* AI Search Button */}
          <button
            onClick={() => onSearchOpen?.()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles size={20} className="animate-pulse" />
            <span className="font-medium">AI Search</span>
            <kbd className="ml-auto px-2 py-1 text-xs rounded bg-white/20 border border-white/30">
              ⌘K
            </kbd>
          </button>

          <div className="p-4 bg-sidebar-accent/10 rounded-lg border border-sidebar-accent/20">
            <p className="text-sm text-sidebar-foreground/70">
              <strong>Tip:</strong> All data is saved locally in your browser.
            </p>
          </div>
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
