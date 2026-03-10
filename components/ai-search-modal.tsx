"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { performSearch, SearchResult } from "@/lib/ai-search"
import { useAuth } from "@/components/auth-provider"
import {
    Search,
    Sparkles,
    Users,
    Calendar,
    FolderKanban,
    CheckSquare,
    FileText,
    CreditCard,
    Wallet,
    Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"

interface AISearchModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const categoryIcons = {
    employee: Users,
    attendance: Calendar,
    project: FolderKanban,
    task: CheckSquare,
    invoice: FileText,
    payment: CreditCard,
    payroll: Wallet,
}

const categoryColors = {
    employee: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    attendance: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    project: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
    task: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
    invoice: "text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400",
    payment: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
    payroll: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
}

const categoryLabels = {
    employee: "Employees",
    attendance: "Attendance",
    project: "Projects",
    task: "Tasks",
    invoice: "Invoices",
    payment: "Payments",
    payroll: "Payroll",
}

export function AISearchModal({ open, onOpenChange }: AISearchModalProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const { user } = useAuth()
    const router = useRouter()

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            setIsSearching(false)
            return
        }

        setIsSearching(true)
        const timer = setTimeout(() => {
            const searchResults = performSearch(query, user?.uid)
            setResults(searchResults)
            setIsSearching(false)
            setSelectedIndex(0)
        }, 300)

        return () => clearTimeout(timer)
    }, [query, user?.uid])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return

            if (e.key === "ArrowDown") {
                e.preventDefault()
                setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
            } else if (e.key === "ArrowUp") {
                e.preventDefault()
                setSelectedIndex(prev => Math.max(prev - 1, 0))
            } else if (e.key === "Enter" && results[selectedIndex]) {
                e.preventDefault()
                handleResultClick(results[selectedIndex])
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [open, results, selectedIndex])

    // Reset on close
    useEffect(() => {
        if (!open) {
            setQuery("")
            setResults([])
            setSelectedIndex(0)
        }
    }, [open])

    const handleResultClick = useCallback((result: SearchResult) => {
        // Navigate based on result type
        switch (result.type) {
            case "employee":
                router.push("/employees")
                break
            case "attendance":
                router.push("/attendance")
                break
            case "project":
                router.push(`/projects`)
                break
            case "task":
                router.push("/projects")
                break
            case "invoice":
                router.push("/finance/invoices")
                break
            case "payment":
                router.push("/finance/payments")
                break
            case "payroll":
                router.push("/payroll")
                break
        }
        onOpenChange(false)
    }, [router, onOpenChange])

    // Group results by category
    const groupedResults = results.reduce((acc, result) => {
        if (!acc[result.type]) acc[result.type] = []
        acc[result.type].push(result)
        return acc
    }, {} as Record<string, SearchResult[]>)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
                {/* Search Header */}
                <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
                    <div className="relative">
                        <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400 animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-violet-600 rounded-full animate-ping" />
                    </div>
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder='Ask anything... e.g., "which people reported to work yesterday"'
                            className="pl-10 border-none bg-white/50 dark:bg-black/20 backdrop-blur-sm focus-visible:ring-violet-500"
                            autoFocus
                        />
                    </div>
                    {isSearching && (
                        <Loader2 className="h-4 w-4 text-violet-600 animate-spin" />
                    )}
                </div>

                {/* Results */}
                <div className="max-h-[500px] overflow-y-auto">
                    {!query.trim() && (
                        <div className="p-8 text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30">
                                <Sparkles className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">AI-Powered Search</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Ask questions in natural language to find anything in your business
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-left max-w-md mx-auto">
                                <div className="p-2 rounded bg-muted/50">
                                    <span className="font-medium">💼</span> "which people reported to work yesterday"
                                </div>
                                <div className="p-2 rounded bg-muted/50">
                                    <span className="font-medium">📋</span> "show me overdue invoices"
                                </div>
                                <div className="p-2 rounded bg-muted/50">
                                    <span className="font-medium">🏗️</span> "projects in Accra"
                                </div>
                                <div className="p-2 rounded bg-muted/50">
                                    <span className="font-medium">💰</span> "payments received this week"
                                </div>
                            </div>
                        </div>
                    )}

                    {query.trim() && results.length === 0 && !isSearching && (
                        <div className="p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold mb-2">No results found</h3>
                            <p className="text-sm text-muted-foreground">
                                Try a different search query or check your spelling
                            </p>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="p-2 space-y-4">
                            {Object.entries(groupedResults).map(([type, categoryResults]) => {
                                const Icon = categoryIcons[type as keyof typeof categoryIcons]
                                const colorClass = categoryColors[type as keyof typeof categoryColors]
                                const label = categoryLabels[type as keyof typeof categoryLabels]

                                return (
                                    <div key={type}>
                                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            <Icon className="h-3 w-3" />
                                            {label}
                                            <span className="ml-auto bg-muted px-2 py-0.5 rounded-full">
                                                {categoryResults.length}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            {categoryResults.map((result, idx) => {
                                                const globalIndex = results.indexOf(result)
                                                const isSelected = globalIndex === selectedIndex

                                                return (
                                                    <button
                                                        key={result.id}
                                                        onClick={() => handleResultClick(result)}
                                                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${isSelected
                                                                ? "bg-violet-100 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700 border-2 scale-[1.02]"
                                                                : "bg-muted/30 hover:bg-muted/50 border-2 border-transparent"
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                                                                <Icon className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium text-sm truncate">
                                                                    {result.title}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground truncate">
                                                                    {result.subtitle}
                                                                </div>
                                                                {result.metadata && (
                                                                    <div className="text-xs text-muted-foreground/70 mt-1">
                                                                        {result.metadata}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-background border">↑</kbd>
                            <kbd className="px-1.5 py-0.5 rounded bg-background border">↓</kbd>
                            Navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-background border">Enter</kbd>
                            Select
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-background border">Esc</kbd>
                            Close
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        <span>AI Search</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
