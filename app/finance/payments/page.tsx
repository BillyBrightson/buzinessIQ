"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import { Payment, Project, Invoice } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter, MoreVertical, CreditCard } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function PaymentsPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
    const { user } = useAuth()
    const [payments, setPayments] = useState<Payment[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [selectedProject, setSelectedProject] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)
    const [newPayment, setNewPayment] = useState<Partial<Payment>>({
        method: "bank_transfer",
        date: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        if (user) {
            setPayments(storage.payments.getAll(user.uid))
            setProjects(storage.projects.getAll(user.uid))
            setInvoices(storage.invoices.getAll(user.uid))
        }
    }, [user])

    const filteredPayments = payments.filter(payment => {
        const matchesProject = selectedProject === "all" || payment.projectId === selectedProject
        const matchesSearch = searchQuery === "" ||
            payment.amount?.toString().includes(searchQuery) ||
            payment.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.method?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesProject && matchesSearch
    })

    const handleAddPayment = () => {
        if (!user || !newPayment.invoiceId || !newPayment.amount) return

        const selectedInvoice = invoices.find(inv => inv.id === newPayment.invoiceId)
        if (!selectedInvoice) return

        // Calculate status based on invoice total
        const status = newPayment.amount >= selectedInvoice.total ? 'full-payment' : 'part-payment'

        const payment: Payment = {
            id: crypto.randomUUID(),
            projectId: selectedInvoice.projectId || '',
            invoiceId: newPayment.invoiceId,
            amount: Number(newPayment.amount),
            date: newPayment.date || new Date().toISOString().split('T')[0],
            method: newPayment.method as any,
            status: status,
            reference: newPayment.reference,
            notes: newPayment.notes,
        }

        storage.payments.add(payment, user.uid)

        // Update Invoice status if paid fully
        if (status === 'full-payment') {
            const updatedInvoice = { ...selectedInvoice, status: 'paid' as const }
            storage.invoices.update(updatedInvoice.id, updatedInvoice, user.uid)
            setInvoices(invoices.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv))
        }

        setPayments([...payments, payment])
        setIsAddPaymentOpen(false)
        setNewPayment({
            method: "bank_transfer",
            date: new Date().toISOString().split('T')[0]
        })
    }

    const getInvoiceDetails = (invoiceId?: string) => {
        if (!invoiceId) return "Unknown"
        const invoice = invoices.find(inv => inv.id === invoiceId)
        return invoice ? `${invoice.invoiceNumber} - ${invoice.clientName}` : "Unknown Invoice"
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GH', {
            style: 'currency',
            currency: 'GHS',
        }).format(amount)
    }

    return (
        <div className="flex h-screen bg-background">
            <Sidebar currentPage="/finance/payments" onSearchOpen={onSearchOpen} />

            <main className="flex-1 overflow-auto md:ml-0 bg-muted/10">
                <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
                    <TopBar title="Client Payments" />

                    {/* Controls */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg shadow-sm border">
                        <div className="flex flex-1 gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:max-w-xs">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search payments..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={selectedProject} onValueChange={setSelectedProject}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filter by Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary text-white hover:bg-primary/90">
                                    <Plus className="mr-2 h-4 w-4" /> Record Payment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Record New Payment</DialogTitle>
                                    <DialogDescription>
                                        Select an invoice to record a payment against.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="invoice">Invoice</Label>
                                        <Select
                                            value={newPayment.invoiceId}
                                            onValueChange={(val) => {
                                                const inv = invoices.find(i => i.id === val);
                                                setNewPayment({
                                                    ...newPayment,
                                                    invoiceId: val,
                                                    projectId: inv?.projectId // Auto-fill project
                                                })
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Invoice" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {invoices.filter(i => i.status !== 'paid').map(inv => (
                                                    <SelectItem key={inv.id} value={inv.id}>
                                                        {inv.invoiceNumber} - {inv.clientName} ({formatCurrency(inv.total)})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {newPayment.invoiceId && (
                                            <p className="text-xs text-muted-foreground">
                                                Invoice Total: {formatCurrency(invoices.find(i => i.id === newPayment.invoiceId)?.total || 0)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="amount">Amount (GHS)</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                placeholder="0.00"
                                                value={newPayment.amount || ''}
                                                onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="date">Date</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={newPayment.date}
                                                onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="method">Payment Method</Label>
                                        <Select
                                            value={newPayment.method}
                                            onValueChange={(val: any) => setNewPayment({ ...newPayment, method: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="check">Check</SelectItem>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="momo">Mobile Money</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="reference">Reference / Transaction ID</Label>
                                        <Input
                                            id="reference"
                                            placeholder="e.g. Check Number, Momo Transaction ID"
                                            value={newPayment.reference || ''}
                                            onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Additional details..."
                                            value={newPayment.notes || ''}
                                            onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddPaymentOpen(false)}>Cancel</Button>
                                    <Button onClick={handleAddPayment}>Save Payment</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Payments List */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle>Transaction History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredPayments.length > 0 ? (
                                    <div className="relative w-full overflow-auto">
                                        <table className="w-full caption-bottom text-sm text-left">
                                            <thead className="[&_tr]:border-b">
                                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Invoice</th>
                                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Method</th>
                                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Reference</th>
                                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredPayments.map((payment) => (
                                                    <tr key={payment.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                        <td className="p-4 align-middle">{new Date(payment.date).toLocaleDateString()}</td>
                                                        <td className="p-4 align-middle font-medium">
                                                            {getInvoiceDetails(payment.invoiceId)}
                                                        </td>
                                                        <td className="p-4 align-middle capitalize">{payment.method.replace('_', ' ')}</td>
                                                        <td className="p-4 align-middle text-muted-foreground">{payment.reference || '-'}</td>
                                                        <td className="p-4 align-middle">
                                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${payment.status === 'full-payment'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                                }`}>
                                                                {payment.status.replace('-', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 align-middle text-right font-bold">{formatCurrency(payment.amount)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                        <CreditCard className="h-12 w-12 mb-4 opacity-50" />
                                        <p className="text-lg font-medium">No payments found</p>
                                        <p className="text-sm">Record a payment to get started.</p>
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
