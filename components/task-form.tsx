"use client"

import type React from "react"

import type { Task, Employee } from "@/lib/types"
import { X } from "lucide-react"
import { useState } from "react"

interface TaskFormProps {
  projectId: string
  employees: Employee[]
  onClose: () => void
  onSave: (task: Task) => void
}

export function TaskForm({ projectId, employees, onClose, onSave }: TaskFormProps) {
  const [formData, setFormData] = useState<Task>({
    id: Date.now().toString(),
    projectId,
    title: "",
    description: "",
    status: "todo",
    assignedEmployees: [],
    createdDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    tag: "",
  })

  // Predefined tags
  const predefinedTags = ["Plumbing", "Mason", "Concrete", "Electrical", "Carpentry", "Painting"]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Validate one word for custom tag
    if (name === "tag") {
      if (value.includes(" ")) {
        return // Prevent spaces
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAssigneeChange = (employeeId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedEmployees: prev.assignedEmployees.includes(employeeId)
        ? prev.assignedEmployees.filter((id) => id !== employeeId)
        : [...prev.assignedEmployees, employeeId],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">New Task</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Task Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Foundation Excavation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Tag (One word)</label>
            <input
              list="tags"
              type="text"
              name="tag"
              value={formData.tag || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Select or type tag..."
            />
            <datalist id="tags">
              {predefinedTags.map((tag) => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              placeholder="Task details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Assign Employees</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {employees.map((employee) => (
                <label key={employee.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-muted rounded">
                  <input
                    type="checkbox"
                    checked={formData.assignedEmployees.includes(employee.id)}
                    onChange={() => handleAssigneeChange(employee.id)}
                    className="rounded border-input"
                  />
                  <span className="text-sm text-foreground">{employee.fullName}</span>
                </label>
              ))}
            </div>
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
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
