"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import { Invoice, Project } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, FileText, Filter, MoreVertical, Download, Mail, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function InvoicesPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
    const { user } = useAuth()
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [statusFilter, setStatusFilter] = useState("all")
    const [projectFilter, setProjectFilter] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")

    // View Details State
    const [viewInvoiceOpen, setViewInvoiceOpen] = useState(false)
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

    useEffect(() => {
        if (user) {
            setInvoices(storage.invoices.getAll(user.uid))
            setProjects(storage.projects.getAll(user.uid))
        }
    }, [user])

    const filteredInvoices = invoices.filter(invoice => {
        const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
        const matchesProject = projectFilter === "all" || invoice.projectId === projectFilter
        const matchesSearch = searchQuery === "" ||
            invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesProject && matchesSearch
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GH', {
            style: 'currency',
            currency: 'GHS',
        }).format(amount)
    }

    // Actions Handlers
    const handleViewDetails = (invoice: Invoice) => {
        setSelectedInvoice(invoice)
        setViewInvoiceOpen(true)
    }

    const handleDownloadPDF = (invoice: Invoice) => {
        const doc = new jsPDF()

        // Header
        doc.setFontSize(22)
        doc.text("INVOICE", 105, 20, { align: "center" })

        doc.setFontSize(12)
        doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 40)
        doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 20, 50)
        doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 60)

        doc.text(`Client: ${invoice.clientName}`, 120, 40)

        // Items Table
        const tableColumn = ["Description", "Quantity", "Rate", "Amount"]
        const tableRows: any[] = []

        invoice.items.forEach(item => {
            const invoiceData = [
                item.description,
                item.quantity.toString(),
                formatCurrency(item.rate),
                formatCurrency(item.amount)
            ]
            tableRows.push(invoiceData)
        })

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 70,
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66] }
        })

        // Totals
        // @ts-ignore - lastAutoTable is added by the plugin
        const finalY = (doc as any).lastAutoTable.finalY + 10

        doc.text(`Subtotal: ${formatCurrency(invoice.subtotal)}`, 140, finalY)
        doc.text(`Tax: ${formatCurrency(invoice.taxAmount)}`, 140, finalY + 10)
        doc.setFontSize(14)
        doc.text(`Total: ${formatCurrency(invoice.total)}`, 140, finalY + 20)

        // Notes
        if (invoice.notes) {
            doc.setFontSize(10)
            doc.text("Notes:", 20, finalY + 30)
            doc.text(invoice.notes, 20, finalY + 35)
        }

        doc.save(`${invoice.invoiceNumber}.pdf`)
    }

    const handleSendToClient = (invoice: Invoice) => {
        // Simulate sending email
        const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from BuildTrack`)
        const body = encodeURIComponent(`Dear ${invoice.clientName},\n\nPlease find attached the invoice ${invoice.invoiceNumber} for GHS ${invoice.total}.\n\nThank you for your business.`)
        window.location.href = `mailto:?subject=${subject}&body=${body}`

        // In a real app, this would call an API to send the email
        alert(`Simulated: Email client opened for ${invoice.clientName}`)
    }

    return (
        <div className="flex h-screen bg-background">
            <Sidebar currentPage="/finance/invoices" onSearchOpen={onSearchOpen} />

            <main className="flex-1 overflow-auto md:ml-0 bg-muted/10">
                <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
                    <TopBar title="Invoices" />

                    {/* Controls */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg shadow-sm border">
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
                            <div className="relative flex-1 md:max-w-xs">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search invoices..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={projectFilter} onValueChange={setProjectFilter}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Link href="/finance/invoices/new">
                            <Button className="bg-primary text-white hover:bg-primary/90 w-full md:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Create Invoice
                            </Button>
                        </Link>
                    </div>

                    {/* Invoices List */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle>Invoice History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredInvoices.length > 0 ? (
                                    <div className="relative w-full overflow-auto">
                                        <table className="w-full caption-bottom text-sm text-left">
                                            <thead className="[&_tr]:border-b">
                                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Invoice #</th>
                                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Client</th>
                                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Due Date</th>
                                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Amount</th>
                                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredInvoices.map((invoice) => (
                                                    <tr key={invoice.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                        <td className="p-4 align-middle font-medium">{invoice.invoiceNumber}</td>
                                                        <td className="p-4 align-middle">{invoice.clientName}</td>
                                                        <td className="p-4 align-middle">{new Date(invoice.date).toLocaleDateString()}</td>
                                                        <td className="p-4 align-middle">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                                                        <td className="p-4 align-middle font-bold">{formatCurrency(invoice.total)}</td>
                                                        <td className="p-4 align-middle">
                                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getStatusColor(invoice.status)}`}>
                                                                {invoice.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 align-middle text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                                        <span className="sr-only">Open menu</span>
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleViewDetails(invoice)}>
                                                                        <FileText className="mr-2 h-4 w-4" /> View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                                                                        <Download className="mr-2 h-4 w-4" /> Download PDF
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleSendToClient(invoice)}>
                                                                        <Mail className="mr-2 h-4 w-4" /> Send to Client
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                        <FileText className="h-12 w-12 mb-4 opacity-50" />
                                        <p className="text-lg font-medium">No invoices found</p>
                                        <p className="text-sm">Create a new invoice to get started.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* View Details Dialog */}
                    <Dialog open={viewInvoiceOpen} onOpenChange={setViewInvoiceOpen}>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Invoice Details</DialogTitle>
                            </DialogHeader>
                            {selectedInvoice && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start border-b pb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold">{selectedInvoice.invoiceNumber}</h3>
                                            <p className="text-muted-foreground">Client: {selectedInvoice.clientName}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedInvoice.status)}`}>
                                                {selectedInvoice.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="font-semibold text-muted-foreground mb-1">Date</h4>
                                            <p>{new Date(selectedInvoice.date).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-muted-foreground mb-1">Due Date</h4>
                                            <p>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-3">Line Items</h4>
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="p-2 text-left">Description</th>
                                                    <th className="p-2 text-center">Qty</th>
                                                    <th className="p-2 text-right">Rate</th>
                                                    <th className="p-2 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedInvoice.items.map((item, i) => (
                                                    <tr key={i} className="border-b">
                                                        <td className="p-2">{item.description}</td>
                                                        <td className="p-2 text-center">{item.quantity}</td>
                                                        <td className="p-2 text-right">{formatCurrency(item.rate)}</td>
                                                        <td className="p-2 text-right">{formatCurrency(item.amount)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex justify-end">
                                        <div className="w-1/2 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Subtotal:</span>
                                                <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Tax ({selectedInvoice.taxRate}%):</span>
                                                <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                                                <span>Total:</span>
                                                <span>{formatCurrency(selectedInvoice.total)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedInvoice.notes && (
                                        <div className="bg-muted/30 p-4 rounded-md">
                                            <h4 className="font-semibold text-sm mb-1">Notes:</h4>
                                            <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                        <Button variant="outline" onClick={() => handleDownloadPDF(selectedInvoice)}>
                                            <Download className="mr-2 h-4 w-4" /> Download PDF
                                        </Button>
                                        <Button onClick={() => setViewInvoiceOpen(false)}>Close</Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </main>
        </div>
    )
}
