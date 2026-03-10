"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import { ChartOfAccount, JournalEntry } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, TrendingUp, TrendingDown, DollarSign, FileText, Plus } from "lucide-react"
import Link from "next/link"

export default function AccountingPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
    const { user } = useAuth()
    const [accounts, setAccounts] = useState<ChartOfAccount[]>([])
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])

    useEffect(() => {
        if (user) {
            setAccounts(storage.chartOfAccounts.getAll(user.uid))
            setJournalEntries(storage.journalEntries.getAll(user.uid))
        }
    }, [user])

    // Calculate financial summary
    const totalAssets = accounts
        .filter(a => a.type === 'asset')
        .reduce((sum, a) => sum + a.balance, 0)

    const totalLiabilities = accounts
        .filter(a => a.type === 'liability')
        .reduce((sum, a) => sum + a.balance, 0)

    const totalEquity = accounts
        .filter(a => a.type === 'equity')
        .reduce((sum, a) => sum + a.balance, 0)

    const totalRevenue = journalEntries
        .filter(je => je.status === 'posted' && je.type === 'invoice')
        .reduce((sum, je) => {
            const revenueLines = je.lines.filter(l => l.accountCode.startsWith('4'))
            return sum + revenueLines.reduce((s, l) => s + l.credit, 0)
        }, 0)

    const totalExpenses = journalEntries
        .filter(je => je.status === 'posted')
        .reduce((sum, je) => {
            const expenseLines = je.lines.filter(l => l.accountCode.startsWith('5') || l.accountCode.startsWith('6'))
            return sum + expenseLines.reduce((s, l) => s + l.debit, 0)
        }, 0)

    const netIncome = totalRevenue - totalExpenses

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GH', {
            style: 'currency',
            currency: 'GHS',
        }).format(amount)
    }

    const recentEntries = journalEntries
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)

    return (
        <div className="flex h-screen bg-background">
            <Sidebar currentPage="/accounting" onSearchOpen={onSearchOpen} />

            <main className="flex-1 overflow-auto md:ml-0 bg-muted/10">
                <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
                    <TopBar title="Accounting" />

                    {/* Financial Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(totalAssets)}</div>
                                <p className="text-xs text-muted-foreground">Current + Fixed Assets</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(totalLiabilities)}</div>
                                <p className="text-xs text-muted-foreground">Current + Long-term</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Owner's Equity</CardTitle>
                                <DollarSign className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(totalEquity)}</div>
                                <p className="text-xs text-muted-foreground">Assets - Liabilities</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                                <Calculator className={`h-4 w-4 ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(netIncome)}
                                </div>
                                <p className="text-xs text-muted-foreground">Revenue - Expenses</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Link href="/accounting/chart-of-accounts">
                            <Card className="hover:bg-accent cursor-pointer transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Chart of Accounts
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Manage your account structure and balances
                                    </p>
                                    <p className="text-2xl font-bold mt-2">{accounts.filter(a => a.isActive).length} Accounts</p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/accounting/journal-entries">
                            <Card className="hover:bg-accent cursor-pointer transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calculator className="h-5 w-5" />
                                        Journal Entries
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Record and review accounting transactions
                                    </p>
                                    <p className="text-2xl font-bold mt-2">{journalEntries.length} Entries</p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/accounting/reports">
                            <Card className="hover:bg-accent cursor-pointer transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Financial Reports
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Generate balance sheets and income statements
                                    </p>
                                    <p className="text-2xl font-bold mt-2">View Reports</p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>

                    {/* Recent Journal Entries */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Journal Entries</CardTitle>
                            <Link href="/accounting/journal-entries">
                                <Button variant="outline" size="sm">
                                    View All
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {recentEntries.length > 0 ? (
                                <div className="space-y-4">
                                    {recentEntries.map((entry) => (
                                        <div key={entry.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                            <div className="space-y-1">
                                                <p className="font-medium">{entry.reference}</p>
                                                <p className="text-sm text-muted-foreground">{entry.description}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(entry.date).toLocaleDateString()} • {entry.type}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${entry.status === 'posted'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : entry.status === 'draft'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                    {entry.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No journal entries yet</p>
                                    <p className="text-sm">Start recording transactions to see them here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Account Balance Summary */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Assets & Liabilities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Current Assets</span>
                                        <span className="font-bold">
                                            {formatCurrency(accounts.filter(a => a.type === 'asset' && a.subType === 'current-asset').reduce((s, a) => s + a.balance, 0))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Fixed Assets</span>
                                        <span className="font-bold">
                                            {formatCurrency(accounts.filter(a => a.type === 'asset' && a.subType === 'fixed-asset').reduce((s, a) => s + a.balance, 0))}
                                        </span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between items-center">
                                        <span className="text-sm font-medium">Current Liabilities</span>
                                        <span className="font-bold text-red-600">
                                            {formatCurrency(accounts.filter(a => a.type === 'liability' && a.subType === 'current-liability').reduce((s, a) => s + a.balance, 0))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Long-term Liabilities</span>
                                        <span className="font-bold text-red-600">
                                            {formatCurrency(accounts.filter(a => a.type === 'liability' && a.subType === 'long-term-liability').reduce((s, a) => s + a.balance, 0))}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue & Expenses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Total Revenue</span>
                                        <span className="font-bold text-green-600">
                                            {formatCurrency(totalRevenue)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Cost of Goods Sold</span>
                                        <span className="font-bold text-red-600">
                                            {formatCurrency(journalEntries.filter(je => je.status === 'posted').reduce((sum, je) => {
                                                const expenseLines = je.lines.filter(l => l.accountCode.startsWith('5'))
                                                return sum + expenseLines.reduce((s, l) => s + l.debit, 0)
                                            }, 0))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Operating Expenses</span>
                                        <span className="font-bold text-red-600">
                                            {formatCurrency(journalEntries.filter(je => je.status === 'posted').reduce((sum, je) => {
                                                const expenseLines = je.lines.filter(l => l.accountCode.startsWith('6'))
                                                return sum + expenseLines.reduce((s, l) => s + l.debit, 0)
                                            }, 0))}
                                        </span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between items-center">
                                        <span className="text-sm font-medium">Net Income</span>
                                        <span className={`font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(netIncome)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
