"use client"

import type { Employee } from "@/lib/types"
import { Check, X, Clock } from "lucide-react"

interface AttendanceListProps {
    employees: Employee[]
    attendanceMap: Record<string, "present" | "absent" | "leave" | null>
    onStatusChange: (employeeId: string, status: "present" | "absent" | "leave") => void
}

export function AttendanceList({ employees, attendanceMap, onStatusChange }: AttendanceListProps) {
    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Employee</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Role</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Status Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {employees.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                                    No active employees found.
                                </td>
                            </tr>
                        ) : (
                            employees.map((employee) => {
                                const status = attendanceMap[employee.id]
                                return (
                                    <tr key={employee.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-foreground">{employee.fullName}</p>
                                                <p className="text-xs text-muted-foreground">{employee.ghanaCardId}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${employee.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' :
                                                    employee.role === 'manager' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                                                        'bg-gray-100 text-gray-700 dark:bg-gray-800'
                                                }`}>
                                                {employee.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => onStatusChange(employee.id, "present")}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-sm font-medium ${status === "present"
                                                            ? "bg-green-500 text-white border-green-600 shadow-sm"
                                                            : "bg-background text-muted-foreground border-border hover:bg-green-50 hover:text-green-600 hover:border-green-200 dark:hover:bg-green-900/20"
                                                        }`}
                                                >
                                                    <Check size={14} />
                                                    Present
                                                </button>

                                                <button
                                                    onClick={() => onStatusChange(employee.id, "absent")}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-sm font-medium ${status === "absent"
                                                            ? "bg-red-500 text-white border-red-600 shadow-sm"
                                                            : "bg-background text-muted-foreground border-border hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20"
                                                        }`}
                                                >
                                                    <X size={14} />
                                                    Absent
                                                </button>

                                                <button
                                                    onClick={() => onStatusChange(employee.id, "leave")}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-sm font-medium ${status === "leave"
                                                            ? "bg-yellow-500 text-white border-yellow-600 shadow-sm"
                                                            : "bg-background text-muted-foreground border-border hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200 dark:hover:bg-yellow-900/20"
                                                        }`}
                                                >
                                                    <Clock size={14} />
                                                    Leave
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
