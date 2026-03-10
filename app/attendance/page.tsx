"use client"

import { Sidebar } from "@/components/sidebar"
import { useState, useEffect } from "react"
import { storage } from "@/lib/storage"
import type { Employee, AttendanceRecord } from "@/lib/types"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { AttendanceStats } from "@/components/attendance/attendance-stats"
import { AttendanceList } from "@/components/attendance/attendance-list"
import { useAuth } from "@/components/auth-provider"
import { TopBar } from "@/components/top-bar"

export default function AttendancePage({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const { user } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    loadData()
  }, [currentDate, user]) // Reload data when date changes or user loads

  const loadData = () => {
    if (user) {
      setEmployees(storage.employees.getActive(user.uid))
      // Load all attendance records for the current month/year to optimize
      // For simplicity, loading all for now, but in a real app, filter by month/year
      setAttendance(storage.attendance.getAll(user.uid))
    }
  }

  const handleAttendanceChange = (employeeId: string, status: "present" | "absent" | "leave") => {
    if (!user) return
    const dateStr = currentDate.toISOString().split("T")[0]
    const existing = attendance.find((a) => a.employeeId === employeeId && a.date === dateStr)

    if (existing) {
      // Optimistic Update
      const updated = attendance.map(a => a.id === existing.id ? { ...a, status } : a)
      setAttendance(updated)

      storage.attendance.update(existing.id, { status }, user.uid)
    } else {
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        employeeId,
        date: dateStr,
        status,
        hoursWorked: status === "present" ? 8 : 0,
      }
      // Optimistic Update
      setAttendance([...attendance, newRecord])

      storage.attendance.add(newRecord, user.uid)
    }
  }

  // Derived Data
  const dateStr = currentDate.toISOString().split("T")[0]

  const dailyAttendanceMap: Record<string, "present" | "absent" | "leave" | null> = {}
  employees.forEach(emp => {
    const record = attendance.find(a => a.employeeId === emp.id && a.date === dateStr)
    dailyAttendanceMap[emp.id] = record?.status || null
  })

  const stats = {
    present: Object.values(dailyAttendanceMap).filter(s => s === "present").length,
    absent: Object.values(dailyAttendanceMap).filter(s => s === "absent").length,
    leave: Object.values(dailyAttendanceMap).filter(s => s === "leave").length,
    total: employees.length
  }

  const previousDay = () => setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))
  const nextDay = () => setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage="/attendance" onSearchOpen={onSearchOpen} />

      <main className="flex-1 overflow-auto bg-muted/10">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
          <TopBar title="Attendance Tracking" />

          <div className="mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <p className="text-muted-foreground">Mark daily attendance for your team</p>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center justify-between bg-card p-6 rounded-2xl border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <button
              onClick={previousDay}
              className="p-3 hover:bg-muted rounded-full transition-all hover:scale-110 active:scale-95 group"
              aria-label="Previous day"
            >
              <ChevronLeft size={28} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </button>

            <div className="flex flex-col items-center animate-in zoom-in-50 duration-300 key={dateStr}"> {/* Add key to trigger animation on change */}
              <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-1">
                {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                {currentDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </h2>
            </div>

            <button
              onClick={nextDay}
              className="p-3 hover:bg-muted rounded-full transition-all hover:scale-110 active:scale-95 group"
              aria-label="Next day"
            >
              <ChevronRight size={28} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </div>

          {/* Stats */}
          <AttendanceStats stats={stats} />

          {/* List */}
          <AttendanceList
            employees={employees}
            attendanceMap={dailyAttendanceMap}
            onStatusChange={handleAttendanceChange}
          />

        </div>
      </main>
    </div>
  )
}
