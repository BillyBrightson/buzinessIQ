"use client"

import type { Employee } from "@/lib/types"
import { Edit2, Archive, Phone, Mail, CreditCard, TriangleAlert } from "lucide-react"

interface EmployeeCardProps {
    employee: Employee
    onEdit: (employee: Employee) => void
    onToggleStatus: (id: string, currentStatus: boolean) => void
}

export function EmployeeCard({ employee, onEdit, onToggleStatus }: EmployeeCardProps) {
    // Generate random avatar color based on name
    const colors = [
        "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500",
        "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500",
        "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500",
        "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500",
        "bg-rose-500"
    ]
    const colorIndex = employee.fullName.length % colors.length
    const avatarColor = colors[colorIndex]
    const initials = employee.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()

    return (
        <div className="group relative bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-all duration-300 animate-in fade-in zoom-in-50">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                    {initials}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(employee)}
                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-primary"
                        title="Edit Employee"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onToggleStatus(employee.id, employee.isActive)}
                        className={`p-2 hover:bg-muted rounded-full transition-colors ${employee.isActive ? 'text-muted-foreground hover:text-destructive' : 'text-muted-foreground hover:text-green-600'}`}
                        title={employee.isActive ? "Deactivate" : "Activate"}
                    >
                        <Archive size={16} />
                    </button>
                </div>
            </div>

            <h3 className="font-semibold text-lg text-foreground mb-1">{employee.fullName}</h3>
            <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${employee.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                    employee.role === 'manager' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                    {employee.role}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${employee.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <CreditCard size={14} />
                    {/^GHA-\d{9}-\d$/.test(employee.ghanaCardId) ? (
                        <span>{employee.ghanaCardId}</span>
                    ) : (
                        <span className="text-destructive font-medium flex items-center gap-1">
                            <TriangleAlert size={13} className="shrink-0" />
                            Add Ghana Card
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">GHS {employee.hourlyRate}/hr</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                <span>Joined {new Date(employee.joinDate).toLocaleDateString()}</span>
            </div>
        </div>
    )
}
