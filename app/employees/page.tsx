"use client"

import { Sidebar } from "@/components/sidebar"
import { useState, useEffect } from "react"
import { storage } from "@/lib/storage"
import type { Employee } from "@/lib/types"
import { Plus, Search, Filter, LayoutGrid, List as ListIcon } from "lucide-react"
import { EmployeeForm } from "@/components/employee-form"
import { EmployeeStats } from "@/components/employees/employee-stats"
import { EmployeeCard } from "@/components/employees/employee-card"
import { useAuth } from "@/components/auth-provider"
import { TopBar } from "@/components/top-bar"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

export default function EmployeesPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const { user } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  // Confirmation Modal State
  const [pendingToggle, setPendingToggle] = useState<{ id: string, activate: boolean } | null>(null)

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "manager" | "worker">("all")
  const [statusFilter, setStatusFilter] = useState<"active" | "all" | "inactive">("active")

  useEffect(() => {
    loadEmployees()
  }, [user])

  const loadEmployees = () => {
    if (user) {
      setEmployees(storage.employees.getAll(user.uid))
    }
  }

  const handleAddEmployee = (employee: Employee) => {
    if (!user) return
    if (editingEmployee) {
      storage.employees.update(editingEmployee.id, employee, user.uid)
      setEditingEmployee(null)
    } else {
      storage.employees.add(employee, user.uid)
    }
    loadEmployees()
    setShowForm(false)
  }

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    // Open modal instead of native confirm
    setPendingToggle({ id, activate: !currentStatus })
  }

  const confirmToggleStatus = () => {
    if (!user || !pendingToggle) return

    if (pendingToggle.activate) {
      storage.employees.update(pendingToggle.id, { isActive: true }, user.uid)
    } else {
      storage.employees.delete(pendingToggle.id, user.uid) // Sets active to false
    }
    loadEmployees()
    setPendingToggle(null)
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setShowForm(true)
  }

  // Derived State
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.ghanaCardId.includes(searchQuery)
    const matchesRole = roleFilter === "all" || emp.role === roleFilter
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && emp.isActive) ||
      (statusFilter === "inactive" && !emp.isActive)

    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.isActive).length,
    inactive: employees.filter(e => !e.isActive).length
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage="/employees" onSearchOpen={onSearchOpen} />

      <main className="flex-1 overflow-auto bg-muted/10">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
          <TopBar title="Employees" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <p className="text-muted-foreground">Manage your workforce</p>
            <button
              onClick={() => {
                setEditingEmployee(null)
                setShowForm(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition shadow-lg shadow-primary/25"
            >
              <Plus size={20} />
              <span>Add Employee</span>
            </button>
          </div>

          {/* Stats */}
          <EmployeeStats stats={stats} />

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Roles</option>
                <option value="worker">Workers</option>
                <option value="manager">Managers</option>
                <option value="admin">Admins</option>
              </select>

              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${statusFilter === "active" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter("inactive")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${statusFilter === "inactive" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Inactive
                </button>
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${statusFilter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  All
                </button>
              </div>
            </div>
          </div>

          {/* Grid */}
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground animate-in fade-in">
              No employees found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              {filteredEmployees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          )}

          {showForm && (
            <EmployeeForm
              employee={editingEmployee}
              onClose={() => {
                setShowForm(false)
                setEditingEmployee(null)
              }}
              onSave={handleAddEmployee}
            />
          )}

          {/* Confirmation Modal */}
          <ConfirmationModal
            isOpen={!!pendingToggle}
            title={pendingToggle?.activate ? "Activate Employee" : "Deactivate Employee"}
            message={`Are you sure you want to ${pendingToggle?.activate ? 'activate' : 'deactivate'} this employee? This action prevents them from tracking attendance.`}
            confirmText={pendingToggle?.activate ? "Activate" : "Deactivate"}
            confirmButtonClass={pendingToggle?.activate ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
            onConfirm={confirmToggleStatus}
            onCancel={() => setPendingToggle(null)}
          />

        </div>
      </main>
    </div>
  )
}
