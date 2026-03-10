"use client"

import { Sidebar } from "@/components/sidebar"
import { useState, useEffect } from "react"
import { storage } from "@/lib/storage"
import type { Employee, AttendanceRecord, PayrollRecord } from "@/lib/types"
import { Printer, Download, FileText, Calendar, Filter } from "lucide-react"
import { ReportView } from "@/components/reports/report-view"
import { useAuth } from "@/components/auth-provider"
import { TopBar } from "@/components/top-bar"

export default function ReportsPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
    const { user } = useAuth()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
    const [reportType, setReportType] = useState<"profile" | "attendance" | "payroll">("profile")
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
        end: new Date().toISOString().split('T')[0]
    })

    // Data for Report
    const [reportData, setReportData] = useState<{
        employee: Employee | null
        attendance: AttendanceRecord[]
        payroll: PayrollRecord[]
    }>({
        employee: null,
        attendance: [],
        payroll: []
    })

    useEffect(() => {
        if (user) {
            setEmployees(storage.employees.getAll(user.uid))
        }
    }, [user])

    useEffect(() => {
        if (employees.length > 0 && !selectedEmployeeId) {
            setSelectedEmployeeId(employees[0].id)
        }
    }, [employees])

    useEffect(() => {
        if (selectedEmployeeId) {
            generateReport()
        }
    }, [selectedEmployeeId, reportType, dateRange, user])

    const generateReport = () => {
        if (!user) return
        const emp = employees.find(e => e.id === selectedEmployeeId) || null
        if (!emp) return

        let attendance: AttendanceRecord[] = []
        let payroll: PayrollRecord[] = []

        if (reportType === "attendance") {
            const all = storage.attendance.getByEmployee(emp.id, user.uid)
            attendance = all.filter(r => r.date >= dateRange.start && r.date <= dateRange.end).sort((a, b) => a.date.localeCompare(b.date))
        } else if (reportType === "payroll") {
            payroll = storage.payroll.getByEmployee(emp.id, user.uid)
        }

        setReportData({
            employee: emp,
            attendance,
            payroll
        })
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="flex h-screen bg-background">
            <div className="print:hidden">
                <Sidebar currentPage="/reports" onSearchOpen={onSearchOpen} />
            </div>

            <main className="flex-1 overflow-auto bg-muted/10 print:bg-white print:overflow-visible">
                <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 print:p-0 print:max-w-none">
                    <div className="print:hidden">
                        <TopBar title="Reports & Analytics" />
                        <p className="text-muted-foreground mt-2 mb-6">Generate and print employee reports</p>
                    </div>

                    {/* Controls - Hidden on Print */}
                    <div className="print:hidden space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition shadow-lg shadow-primary/25"
                            >
                                <Printer size={20} />
                                <span>Print Report</span>
                            </button>
                        </div>

                        <div className="bg-card p-4 rounded-xl border border-border grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Employee</label>
                                <select
                                    value={selectedEmployeeId}
                                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                                >
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Report Type</label>
                                <div className="flex bg-muted rounded-lg p-1">
                                    {(["profile", "attendance", "payroll"] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setReportType(type)}
                                            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${reportType === type ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {reportType === "attendance" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={dateRange.start}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={dateRange.end}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Report View */}
                    {reportData.employee ? (
                        <ReportView
                            type={reportType}
                            employee={reportData.employee}
                            attendanceData={reportData.attendance}
                            payrollData={reportData.payroll}
                            dateRange={dateRange}
                        />
                    ) : (
                        <div className="text-center py-20 text-muted-foreground print:hidden">
                            Loading report data...
                        </div>
                    )}

                </div>
            </main>
        </div>
    )
}
