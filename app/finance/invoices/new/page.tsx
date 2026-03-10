"use client"

import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import { Invoice, InvoiceItem, Project } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewInvoicePage({ onSearchOpen }: { onSearchOpen?: () => void }) {
    const { user } = useAuth()
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])

    const [formData, setFormData] = useState<Partial<Invoice>>({
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "draft",
        taxRate: 0,
        items: [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }]
    })

    useEffect(() => {
        if (user) {
            setProjects(storage.projects.getAll(user.uid))
        }
    }, [user])

    const handleProjectChange = (projectId: string) => {
        const project = projects.find(p => p.id === projectId)
        setFormData(prev => ({
            ...prev,
            projectId,
            clientName: project?.clientName || '',
        }))
    }

    const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
        setFormData(prev => {
            const newItems = prev.items?.map(item => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value }
                    if (field === 'quantity' || field === 'rate') {
                        updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.rate)
                    }
                    return updatedItem
                }
                return item
            }) || []

            return calculateTotals({ ...prev, items: newItems })
        })
    }

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [
                ...(prev.items || []),
                { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0, amount: 0 }
            ]
        }))
    }

    const removeItem = (id: string) => {
        if ((formData.items?.length || 0) <= 1) return
        setFormData(prev => calculateTotals({
            ...prev,
            items: prev.items?.filter(item => item.id !== id)
        }))
    }

    const calculateTotals = (data: Partial<Invoice>) => {
        const subtotal = data.items?.reduce((sum, item) => sum + item.amount, 0) || 0
        const taxAmount = subtotal * ((data.taxRate || 0) / 100)
        const total = subtotal + taxAmount
        return { ...data, subtotal, taxAmount, total }
    }

    const handleSave = () => {
        if (!user || !formData.clientName || !formData.items?.length) return

        const invoice: Invoice = {
            id: crypto.randomUUID(),
            projectId: formData.projectId,
            clientId: undefined, // Not used for now
            clientName: formData.clientName,
            invoiceNumber: formData.invoiceNumber || 'DRAFT',
            date: formData.date || new Date().toISOString(),
            dueDate: formData.dueDate || new Date().toISOString(),
            items: formData.items,
            subtotal: formData.subtotal || 0,
            taxRate: formData.taxRate || 0,
            taxAmount: formData.taxAmount || 0,
            total: formData.total || 0,
            status: formData.status as any,
            notes: formData.notes
        }

        storage.invoices.add(invoice, user.uid)
        router.push('/finance/invoices')
    }

    return (
        <div className="flex h-screen bg-background">
            <Sidebar currentPage="/finance/invoices" onSearchOpen={onSearchOpen} />

            <main className="flex-1 overflow-auto md:ml-0 bg-muted/10">
                <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/finance/invoices">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <TopBar title="New Invoice" />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Header Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Project (Auto-fills Client)</Label>
                                        <Select onValueChange={handleProjectChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Project" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {projects.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Client Name</Label>
                                        <Input
                                            value={formData.clientName || ''}
                                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                            placeholder="Client Name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Invoice Number</Label>
                                        <Input
                                            value={formData.invoiceNumber}
                                            onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Invoice Date</Label>
                                            <Input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Due Date</Label>
                                            <Input
                                                type="date"
                                                value={formData.dueDate}
                                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="mt-8">
                                <h3 className="text-lg font-medium mb-4">Items Table</h3>
                                <div className="relative w-full overflow-auto border rounded-md">
                                    <table className="w-full caption-bottom text-sm text-left">
                                        <thead className="bg-muted/50 [&_tr]:border-b">
                                            <tr>
                                                <th className="h-10 px-4 align-middle font-medium text-muted-foreground w-[40%]">Description</th>
                                                <th className="h-10 px-4 align-middle font-medium text-muted-foreground w-[15%]">Qty</th>
                                                <th className="h-10 px-4 align-middle font-medium text-muted-foreground w-[20%]">Rate</th>
                                                <th className="h-10 px-4 align-middle font-medium text-muted-foreground w-[20%] text-right">Amount</th>
                                                <th className="h-10 px-4 align-middle font-medium text-muted-foreground w-[5%]"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr]:border-b">
                                            {formData.items?.map((item) => (
                                                <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                                                    <td className="p-2 align-middle">
                                                        <Input
                                                            value={item.description}
                                                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                                            placeholder="Item description"
                                                            className="border-none shadow-none focus-visible:ring-0"
                                                        />
                                                    </td>
                                                    <td className="p-2 align-middle">
                                                        <Input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                                                            className="border-none shadow-none focus-visible:ring-0"
                                                        />
                                                    </td>
                                                    <td className="p-2 align-middle">
                                                        <Input
                                                            type="number"
                                                            value={item.rate}
                                                            onChange={(e) => handleItemChange(item.id, 'rate', Number(e.target.value))}
                                                            className="border-none shadow-none focus-visible:ring-0"
                                                        />
                                                    </td>
                                                    <td className="p-4 align-middle text-right font-medium">
                                                        {item.amount.toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}
                                                    </td>
                                                    <td className="p-2 align-middle text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() => removeItem(item.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Button variant="outline" size="sm" className="mt-2" onClick={addItem}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Line Item
                                </Button>
                            </div>

                            {/* Totals & Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                        placeholder="Payment terms, bank details, etc."
                                        className="h-32"
                                        value={formData.notes || ''}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                                <div className="bg-muted/30 p-6 rounded-lg space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium">{formData.subtotal?.toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Tax Rate (%)</span>
                                        <Input
                                            type="number"
                                            className="w-20 text-right h-8"
                                            value={formData.taxRate}
                                            onChange={(e) => setFormData(prev => calculateTotals({ ...prev, taxRate: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax Amount</span>
                                        <span className="font-medium">{formData.taxAmount?.toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}</span>
                                    </div>
                                    <div className="border-t pt-3 mt-3 flex justify-between">
                                        <span className="font-bold text-lg">Total</span>
                                        <span className="font-bold text-lg text-primary">{formData.total?.toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-4 bg-muted/20 py-4">
                            <Link href="/finance/invoices">
                                <Button variant="outline">Cancel</Button>
                            </Link>
                            <Button onClick={handleSave} className="bg-primary">
                                <Save className="mr-2 h-4 w-4" /> Save Invoice
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    )
}
