"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import {
  Users, Calendar, DollarSign, LayoutGrid, Home, Menu, X,
  FileText, CreditCard, ChevronDown, ChevronRight, Calculator,
  ShoppingCart, Settings, MapPin, ArrowLeftRight, Wallet, Sparkles
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { storage } from "@/lib/storage"
import type { Branch } from "@/lib/types"

interface SidebarProps {
  currentPage: string
  onSearchOpen?: () => void
}

export function Sidebar({ currentPage, onSearchOpen }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, can, effectiveUid, currentBranch, currentBranchId, setCurrentBranchId } = useAuth()
  const [companyName, setCompanyName] = useState("BuzinessIQ")
  const [companyInitials, setCompanyInitials] = useState("BI")
  const [branches, setBranches] = useState<Branch[]>([])
  const [branchDropOpen, setBranchDropOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const branchDropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const uid = effectiveUid || user?.uid
    if (uid) {
      const company = storage.company.get(uid)
      if (company) {
        setCompanyName(company.name)
        const words = company.name.trim().split(/\s+/)
        setCompanyInitials(
          words.length >= 2
            ? (words[0][0] + words[1][0]).toUpperCase()
            : company.name.slice(0, 2).toUpperCase()
        )
      }
      setBranches(storage.branches.getActive(uid))
    }
  }, [user, effectiveUid])

  // Close branch dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (branchDropRef.current && !branchDropRef.current.contains(e.target as Node)) {
        setBranchDropOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    const activeMenu = allMenuItems.find(item =>
      item.subItems && (currentPage === item.href || item.subItems.some(sub => currentPage === sub.href))
    )
    if (activeMenu && !expandedMenus.includes(activeMenu.label)) {
      setExpandedMenus(prev => [...prev, activeMenu.label])
    }
  }, [currentPage])

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    )
  }

  const allMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/employees", label: "Employees", icon: Users },
    { href: "/attendance", label: "Attendance", icon: Calendar },
    { href: "/payroll", label: "Payroll", icon: DollarSign },
    { href: "/projects", label: "Projects", icon: LayoutGrid },
    {
      href: "/finance", label: "Finance", icon: CreditCard,
      subItems: [
        { href: "/finance/payments", label: "Payments" },
        { href: "/finance/invoices", label: "Invoices" },
      ]
    },
    {
      href: "/accounting", label: "Accounting", icon: Calculator,
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
      href: "/pos", label: "Point of Sale", icon: ShoppingCart,
      subItems: [
        { href: "/pos", label: "POS Terminal" },
        { href: "/pos/products", label: "Products" },
        { href: "/pos/sales", label: "Sales History" },
        { href: "/pos/stock-transfer", label: "Stock Transfer" },
        { href: "/pos/cash-drawer", label: "Cash Drawer" },
      ]
    },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  const menuItems = allMenuItems
    .map(item => {
      if (!can(item.href)) return null
      if ("subItems" in item && item.subItems) {
        const visibleSubs = item.subItems.filter(sub => can(sub.href))
        if (visibleSubs.length === 0) return null
        return { ...item, subItems: visibleSubs }
      }
      return item
    })
    .filter(Boolean) as typeof allMenuItems

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-primary text-primary-foreground"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} z-40 flex flex-col overflow-hidden`}
      >
        {/* ── Company + Branch Header ── */}
        <div className="px-4 pt-5 pb-3 border-b border-sidebar-border/30 flex-shrink-0">
          {/* Company row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0 shadow-md select-none">
              {companyInitials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-sidebar-foreground leading-tight truncate">{companyName}</h1>
              <p className="text-[11px] text-sidebar-foreground/45 mt-0.5 tracking-wide">Business Management</p>
            </div>
          </div>

          {/* Branch selector */}
          <div className="relative" ref={branchDropRef}>
            <button
              onClick={() => setBranchDropOpen(v => !v)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/10 border border-sidebar-border/40 hover:bg-sidebar-accent/20 transition-colors group"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 shadow-sm" />
              <span className="text-[12px] font-medium text-sidebar-foreground flex-1 text-left truncate">
                {currentBranch?.name || "Main Branch"}
              </span>
              {branches.length > 1 && (
                <ChevronDown
                  size={12}
                  className={`text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70 transition-all flex-shrink-0 ${branchDropOpen ? "rotate-180" : ""}`}
                />
              )}
            </button>

            {branchDropOpen && branches.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-border bg-popover shadow-xl z-50 py-1 overflow-hidden">
                {branches.map(branch => {
                  const isSelected = branch.id === currentBranchId
                  return (
                    <button
                      key={branch.id}
                      onClick={() => {
                        setCurrentBranchId(branch.id)
                        setBranchDropOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2.5 text-[12px] flex items-center gap-2.5 transition-colors ${isSelected
                        ? "bg-primary/8 text-primary font-semibold"
                        : "text-foreground hover:bg-muted"
                        }`}
                    >
                      <MapPin size={12} className={isSelected ? "text-primary" : "text-muted-foreground"} />
                      <span className="flex-1">{branch.name}</span>
                      {branch.isDefault && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">Main</span>
                      )}
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary ml-auto" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-3">
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm ${isActive || isSubActive
                      ? "text-sidebar-foreground bg-sidebar-accent/10"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                ) : (
                  <Link href={item.href}>
                    <button
                      onClick={() => setIsOpen(false)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                        }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </Link>
                )}

                {hasSubItems && isExpanded && (
                  <div className="ml-8 mt-1 space-y-0.5 border-l border-sidebar-border/30 pl-2">
                    {item.subItems?.map((subItem) => {
                      const isSubItemActive = currentPage === subItem.href
                      return (
                        <Link key={subItem.href} href={subItem.href}>
                          <button
                            onClick={() => setIsOpen(false)}
                            className={`w-full text-left px-3 py-2 rounded-md transition-all text-[13px] ${isSubItemActive
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

        {/* ── AI Search ── */}
        <div className="px-3 pb-4 flex-shrink-0">
          <button
            onClick={() => onSearchOpen?.()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Sparkles size={18} className="animate-pulse" />
            <span className="font-medium text-sm">AI Search</span>
            <kbd className="ml-auto px-1.5 py-0.5 text-[10px] rounded bg-white/20 border border-white/30">⌘K</kbd>
          </button>
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
