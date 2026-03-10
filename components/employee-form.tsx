"use client"

import type React from "react"

import type { Employee } from "@/lib/types"
import { X, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

interface EmployeeFormProps {
  employee?: Employee | null
  onClose: () => void
  onSave: (employee: Employee) => void
}

export function EmployeeForm({ employee, onClose, onSave }: EmployeeFormProps) {
  const [formData, setFormData] = useState<Employee>(
    employee || {
      id: Date.now().toString(),
      fullName: "",
      ghanaCardId: "",
      healthInsurance: "",
      role: "worker",
      hourlyRate: 25,
      joinDate: new Date().toISOString().split("T")[0],
      isActive: true,
    },
  )

  const [error, setError] = useState<string>("")
  const [isVerifyingMoMo, setIsVerifyingMoMo] = useState(false)

  // Simulate Auto-load of MoMo Name
  useEffect(() => {
    if (formData.momoNetwork && formData.momoNumber && formData.momoNumber.length >= 10) {
      setIsVerifyingMoMo(true)
      const timer = setTimeout(() => {
        setFormData(prev => ({ ...prev, momoName: prev.fullName || "Kwame Asante" })) // Use existing name or fallback
        setIsVerifyingMoMo(false)
      }, 1500)
      return () => clearTimeout(timer)
    } else {
      setFormData(prev => ({ ...prev, momoName: "" }))
    }
  }, [formData.momoNetwork, formData.momoNumber, formData.fullName])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "hourlyRate" ? Number.parseFloat(value) : value,
    }))
    if (error) setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate Ghana Card format
    const ghanaCardRegex = /^GHA-\d{9}-\d$/
    if (!ghanaCardRegex.test(formData.ghanaCardId)) {
      setError("Ghana Card ID must follow the format: GHA-XXXXXXXXX-X")
      return
    }

    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">{employee ? "Edit Employee" : "Add Employee"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Kwame Asante"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Ghana Card ID *</label>
            <input
              type="text"
              name="ghanaCardId"
              value={formData.ghanaCardId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="GHA-123456789-0"
            />
            <p className="text-xs text-muted-foreground mt-1">Format: GHA-XXXXXXXXX-X</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Health Insurance (Optional)</label>
            <input
              type="text"
              name="healthInsurance"
              value={formData.healthInsurance || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Insurance provider"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">MoMo Network</label>
              <select
                name="momoNetwork"
                value={formData.momoNetwork || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Network</option>
                <option value="MTN">MTN</option>
                <option value="Telecel">Telecel</option>
                <option value="AirtelTigo">AirtelTigo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">MoMo Number</label>
              <input
                type="text"
                name="momoNumber"
                value={formData.momoNumber || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  if (val.length <= 10) handleChange(e)
                }}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="024xxxxxxx"
              />
            </div>
          </div>

          {formData.momoNetwork && formData.momoNumber && formData.momoNumber.length >= 10 && (
            <div className="bg-muted/50 p-3 rounded-lg border border-border">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Account Name</label>
              <div className="flex items-center gap-2">
                {isVerifyingMoMo ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Verifying details...</span>
                  </div>
                ) : (
                  <div className="font-medium text-foreground">
                    {formData.momoName || "Unknown"}
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="worker">Worker</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Hourly Rate (GHS) *</label>
            <input
              type="number"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              required
              step="0.01"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="25"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
            >
              {employee ? "Update" : "Add"} Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
