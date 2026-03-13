"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Sparkles, X, Send, Loader2, ChevronDown } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { storage } from "@/lib/storage"
import { FEATURE_PERMISSIONS } from "@/lib/rbac"
import Link from "next/link"

interface Message {
  role: "user" | "assistant"
  content: string
  streaming?: boolean
}

// ─── Build RBAC-filtered context snapshot ──────────────────────────────────

function buildContext(effectiveUid: string, role: string) {
  const canAccess = (path: string) => {
    if (role === "admin") return true
    return FEATURE_PERMISSIONS.some(
      (f) => (path === f.path || path.startsWith(f.path + "/")) && f.roles.includes(role as never)
    )
  }

  const accessiblePages = FEATURE_PERMISSIONS
    .filter((f) => canAccess(f.path))
    .map((f) => `${f.label} (${f.path})`)

  const stats: Record<string, unknown> = {}

  if (canAccess("/employees")) {
    const employees = storage.employees.getAll(effectiveUid)
    stats.employees = {
      total: employees.length,
      active: employees.filter((e) => e.isActive).length,
      inactive: employees.filter((e) => !e.isActive).length,
    }
  }

  if (canAccess("/attendance")) {
    const today = new Date().toISOString().split("T")[0]
    const todayAttendance = storage.attendance.getByDate(today, effectiveUid)
    stats.attendance_today = {
      present: todayAttendance.filter((a) => a.status === "present").length,
      absent: todayAttendance.filter((a) => a.status === "absent").length,
      on_leave: todayAttendance.filter((a) => a.status === "leave").length,
    }
  }

  if (canAccess("/projects")) {
    const projects = storage.projects.getAll(effectiveUid)
    const tasks = storage.tasks.getAll(effectiveUid)
    stats.projects = {
      total: projects.length,
      active: projects.filter((p) => p.status === "active").length,
      completed: projects.filter((p) => p.status === "completed").length,
    }
    stats.tasks = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      in_progress: tasks.filter((t) => t.status === "in-progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    }
  }

  if (canAccess("/finance")) {
    const invoices = storage.invoices.getAll(effectiveUid)
    const payments = storage.payments.getAll(effectiveUid)
    stats.invoices = {
      total: invoices.length,
      draft: invoices.filter((i) => i.status === "draft").length,
      sent: invoices.filter((i) => i.status === "sent").length,
      paid: invoices.filter((i) => i.status === "paid").length,
      overdue: invoices.filter((i) => i.status === "overdue").length,
      total_value_GHS: invoices.reduce((s, i) => s + i.total, 0).toFixed(2),
    }
    stats.payments = {
      total: payments.length,
      total_received_GHS: payments.reduce((s, p) => s + p.amount, 0).toFixed(2),
    }
  }

  if (canAccess("/accounting")) {
    const now = new Date()
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const expenses = storage.expenses.getAll(effectiveUid)
    const thisMonthExpenses = expenses.filter((e) => e.date.startsWith(monthKey))
    stats.expenses = {
      total_records: expenses.length,
      this_month_GHS: thisMonthExpenses.reduce((s, e) => s + e.amount, 0).toFixed(2),
      this_month_count: thisMonthExpenses.length,
    }
  }

  if (canAccess("/payroll")) {
    const payroll = storage.payroll.getAll(effectiveUid)
    stats.payroll = {
      total_records: payroll.length,
      pending: payroll.filter((p) => p.status === "pending").length,
      paid: payroll.filter((p) => p.status === "paid").length,
    }
  }

  if (canAccess("/pos")) {
    const products = storage.products.getAll(effectiveUid)
    const sales = storage.sales.getAll(effectiveUid)
    const today = new Date().toISOString().split("T")[0]
    const todaySales = sales.filter((s) => s.date === today)
    stats.inventory = {
      total_products: products.filter((p) => p.isActive).length,
      low_stock: products.filter((p) => p.isActive && p.stock <= p.lowStockThreshold).length,
      out_of_stock: products.filter((p) => p.isActive && p.stock === 0).length,
    }
    stats.sales = {
      today_count: todaySales.length,
      today_revenue_GHS: todaySales.reduce((s, sale) => s + sale.total, 0).toFixed(2),
      total_all_time: sales.length,
    }
  }

  return {
    role,
    accessiblePages,
    stats,
    today: new Date().toLocaleDateString("en-GH", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
  }
}

// ─── Parse AI response and make [text](/path) links clickable ──────────────

function renderWithLinks(text: string) {
  const parts = text.split(/(\[([^\]]+)\]\(([^)]+)\))/g)
  const result: React.ReactNode[] = []
  let i = 0

  while (i < parts.length) {
    const chunk = parts[i]
    // Full match like [Label](/path)
    if (chunk.startsWith("[") && parts[i + 1] && parts[i + 2]) {
      const label = parts[i + 1]
      const href = parts[i + 2]
      if (href.startsWith("/")) {
        result.push(
          <Link
            key={i}
            href={href}
            className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 underline underline-offset-2 font-medium"
          >
            {label}
          </Link>
        )
        i += 3
        continue
      }
    }
    if (chunk) result.push(chunk)
    i++
  }

  return result
}

// ─── Dynamic Island ─────────────────────────────────────────────────────────

export function AISearchIsland() {
  const { user, effectiveUid, userRole } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // ⌘K / Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen((v) => !v)
      }
      if (e.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading || !user) return

    const userMsg = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMsg }])
    setIsLoading(true)

    // Add empty assistant message for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }])

    abortRef.current = new AbortController()

    try {
      const context = buildContext(effectiveUid || user.uid, userRole)

      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg, context }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error("Search failed")

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last?.role === "assistant") {
              updated[updated.length - 1] = { ...last, content: accumulated, streaming: true }
            }
            return updated
          })
        }
      }

      // Mark streaming complete
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.role === "assistant") {
          updated[updated.length - 1] = { ...last, streaming: false }
        }
        return updated
      })
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.role === "assistant") {
            updated[updated.length - 1] = {
              ...last,
              content: "Sorry, I couldn't process that. Please try again.",
              streaming: false,
            }
          }
          return updated
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, user, effectiveUid, userRole])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Suggestions for empty state
  const suggestions = [
    "How many employees are active?",
    "Show me this month's expenses",
    "Which invoices are overdue?",
    "How many sales today?",
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      {/* Chat panel — appears above the island when open */}
      <div
        className={`transition-all duration-300 ease-in-out w-[420px] max-w-[calc(100vw-2rem)] mb-3 ${
          isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span className="text-sm font-medium text-white/80">BuzinessIQ AI</span>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto px-4 py-3 space-y-4 scroll-smooth">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center">
                <p className="text-white/30 text-xs text-center mb-4">Ask anything about your business</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setInput(s)
                        inputRef.current?.focus()
                      }}
                      className="text-left text-xs px-3 py-2 rounded-xl bg-white/5 hover:bg-violet-500/20 border border-white/5 hover:border-violet-500/30 text-white/50 hover:text-white/80 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "user" ? (
                      <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-br-md bg-violet-600 text-white text-sm">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="max-w-[90%] text-sm text-white/80 leading-relaxed">
                        {msg.content ? (
                          <>
                            {renderWithLinks(msg.content)}
                            {msg.streaming && (
                              <span className="inline-block w-1 h-4 ml-0.5 bg-violet-400 animate-pulse rounded-sm align-middle" />
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-white/30">
                            <Loader2 size={12} className="animate-spin" />
                            <span className="text-xs">Thinking...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-violet-500/50 focus-within:bg-white/8 transition-all">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Send size={13} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* The Island pill */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`
          flex items-center gap-2.5 px-5 py-3 rounded-full transition-all duration-300
          border shadow-2xl
          ${isOpen
            ? "bg-zinc-900 border-violet-500/40 text-white shadow-violet-500/20 pr-4"
            : "bg-zinc-950/90 border-white/10 hover:border-violet-500/40 text-white/70 hover:text-white backdrop-blur-xl hover:shadow-violet-500/20"
          }
        `}
      >
        <div className={`relative flex-shrink-0 ${isOpen ? "" : "animate-pulse"}`}>
          <Sparkles size={16} className={isOpen ? "text-violet-400" : "text-violet-500"} />
        </div>
        <span className="text-sm font-medium whitespace-nowrap">
          {isOpen ? "BuzinessIQ AI" : "Ask BuzinessIQ"}
        </span>
        {!isOpen && (
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono border border-white/10 text-white/30 bg-white/5">
            ⌘K
          </kbd>
        )}
        {isOpen && (
          <ChevronDown size={14} className="text-white/40 ml-1" />
        )}
      </button>
    </div>
  )
}
