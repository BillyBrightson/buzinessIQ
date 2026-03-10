"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import { Invoice, Payment } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, CreditCard, FileText, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react"

export default function FinanceDashboard({ onSearchOpen }: { onSearchOpen?: () => void }) {
    const { user } = useAuth()
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [payments, setPayments] = useState<Payment[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (user) {
            setInvoices(storage.invoices.getAll(user.uid))
            setPayments(storage.payments.getAll(user.uid))
            setIsLoading(false)
        }
    }, [user])

    // Calculate statistics
    const totalRevenue = payments
        .filter(p => p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0)

    const pendingPayments = payments
        .filter(p => p.status === "pending")
        .reduce((sum, p) => sum + p.amount, 0)

    const outstandingInvoices = invoices
        .filter(i => i.status === "sent" || i.status === "overdue")
        .reduce((sum, i) => sum + i.total, 0)

    const overdueInvoicesCount = invoices
        .filter(i => i.status === "overdue").length

    const recentTransactions = [
        ...payments.map(p => ({
            type: 'payment',
            id: p.id,
            date: p.date,
            amount: p.amount,
            description: `Payment for Project #${p.projectId}`,
            status: p.status
        })),
        ...invoices.map(i => ({
            type: 'invoice',
            id: i.id,
            date: i.date,
            amount: i.total,
            description: `Invoice #${i.invoiceNumber} - ${i.clientName}`,
            status: i.status
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GH', {
            style: 'currency',
            currency: 'GHS',
        }).format(amount)
    }

    const stats = [
        {
            title: "Total Revenue",
            value: formatCurrency(totalRevenue),
            description: "Total collected payments",
            icon: Wallet,
            className: "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-200 dark:border-emerald-800",
            iconColor: "text-emerald-600 dark:text-emerald-400"
        },
        {
            title: "Pending Payments",
            value: formatCurrency(pendingPayments),
            description: "Payments awaiting processing",
            icon: Clock,
            className: "bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-200 dark:border-amber-800",
            iconColor: "text-amber-600 dark:text-amber-400"
        },
        {
            title: "Outstanding Invoices",
            value: formatCurrency(outstandingInvoices),
            description: "Unpaid invoices",
            icon: FileText,
            className: "bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-200 dark:border-blue-800",
            iconColor: "text-blue-600 dark:text-blue-400"
        },
        {
            title: "Overdue Invoices",
            value: overdueInvoicesCount.toString(),
            description: "Invoices past due date",
            icon: CreditCard,
            className: "bg-gradient-to-br from-rose-500/10 to-rose-500/5 border-rose-200 dark:border-rose-800",
            iconColor: "text-rose-600 dark:text-rose-400"
        }
    ]

    return (
        <div className="flex h-screen bg-background">
            <Sidebar currentPage="/finance" onSearchOpen={onSearchOpen} />

            <main className="flex-1 overflow-auto md:ml-0 bg-muted/10">
                <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
                    <TopBar title="Finance Overview" />

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, index) => (
                            <Card
                                key={stat.title}
                                className={`${stat.className} border shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}
                                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Recent Transactions */}
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentTransactions.map((tx, i) => (
                                    <div key={`${tx.type}-${tx.id}`} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${tx.type === 'payment' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                {tx.type === 'payment' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-medium">{tx.description}</p>
                                                <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${tx.type === 'payment' ? 'text-green-600' : 'text-foreground'}`}>
                                                {tx.type === 'payment' ? '+' : ''}{formatCurrency(tx.amount)}
                                            </p>
                                            <p className="text-xs capitalize text-muted-foreground">{tx.status}</p>
                                        </div>
                                    </div>
                                ))}
                                {recentTransactions.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No recent transactions found
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
