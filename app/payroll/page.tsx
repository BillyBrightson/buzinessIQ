"use client"

import { Sidebar } from "@/components/sidebar"
import { useState, useEffect } from "react"
import { storage } from "@/lib/storage"
import type { Employee, PayrollRecord } from "@/lib/types"
import { DollarSign, FileText } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { TopBar } from "@/components/top-bar"

export default function PayrollPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const { user } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentWeek())

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = () => {
    if (user) {
      setEmployees(storage.employees.getActive(user.uid))
      setPayrollRecords(storage.payroll.getAll(user.uid))
    }
  }

  function getCurrentWeek() {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const monday = new Date(now.setDate(diff))
    const year = monday.getFullYear()
    const week = Math.ceil((monday.getDate() - monday.getDay() + 1) / 7)
    return `${year}-W${String(week).padStart(2, "0")}`
  }

  const calculatePayroll = () => {
    if (!user) return
    // Calculate payroll for the selected period
    const [year, week] = selectedPeriod.split("-W")
    const weekNum = Number.parseInt(week)

    employees.forEach((employee) => {
      const attendance = storage.attendance.getByEmployee(employee.id, user.uid).filter((a) => {
        const recordDate = new Date(a.date)
        const recordYear = recordDate.getFullYear()
        const recordWeek = Math.ceil((recordDate.getDate() - recordDate.getDay() + 1) / 7)
        return recordYear === Number.parseInt(year) && recordWeek === weekNum
      })

      const totalHours = attendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0)
      const totalAmount = totalHours * employee.hourlyRate

      // Check if payroll record already exists
      const existing = payrollRecords.find((p) => p.employeeId === employee.id && p.period === selectedPeriod)

      if (totalHours > 0) {
        if (existing) {
          storage.payroll.update(existing.id, {
            totalHours,
            totalAmount,
            status: "pending",
          }, user.uid)
        } else {
          storage.payroll.add({
            id: Date.now().toString() + Math.random(),
            employeeId: employee.id,
            period: selectedPeriod,
            totalHours,
            ratePerHour: employee.hourlyRate,
            totalAmount,
            status: "pending",
          }, user.uid)
        }
      }
    })

    loadData()
  }

  const processPayroll = () => {
    if (!user) return
    const recordsToProcess = payrollRecords.filter((p) => p.period === selectedPeriod && p.status === "pending")
    recordsToProcess.forEach((record) => {
      storage.payroll.update(record.id, {
        status: "processed",
        processedDate: new Date().toISOString().split("T")[0],
      }, user.uid)
    })
    loadData()
  }

  const periodRecords = payrollRecords.filter((p) => p.period === selectedPeriod)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage="/payroll" onSearchOpen={onSearchOpen} />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <TopBar title="Payroll Management" />

          <div className="mb-6">
            <p className="text-muted-foreground">Automated bi-weekly payroll calculations</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">Pay Period</label>
              <input
                type="text"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="YYYY-W##"
              />
            </div>
            <div className="flex gap-2 items-end">
              <button
                onClick={calculatePayroll}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition font-medium"
              >
                <FileText size={18} />
                Calculate
              </button>
              <button
                onClick={processPayroll}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
              >
                <DollarSign size={18} />
                Process
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <p className="text-sm text-muted-foreground mb-1">Total Payroll</p>
              <p className="text-3xl font-bold text-foreground">
                GHS {periodRecords.reduce((sum, p) => sum + p.totalAmount, 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-6">
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {periodRecords.filter((p) => p.status === "pending").length}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-6">
              <p className="text-sm text-muted-foreground mb-1">Processed</p>
              <p className="text-3xl font-bold text-green-600">
                {periodRecords.filter((p) => p.status === "processed").length}
              </p>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Employee</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Hours</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Rate</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {periodRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No payroll records for this period
                      </td>
                    </tr>
                  ) : (
                    periodRecords.map((record) => {
                      const employee = employees.find((e) => e.id === record.employeeId)
                      return (
                        <tr key={record.id} className="border-b border-border hover:bg-muted/30 transition">
                          <td className="px-6 py-4 font-medium text-foreground">{employee?.fullName}</td>
                          <td className="px-6 py-4 text-foreground">{record.totalHours}h</td>
                          <td className="px-6 py-4 text-foreground">GHS {record.ratePerHour}/hr</td>
                          <td className="px-6 py-4 font-semibold text-foreground">
                            GHS {record.totalAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${record.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : record.status === "processed"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                                }`}
                            >
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
