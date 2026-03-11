"use client"

import type { Task, Employee } from "@/lib/types"
import { X, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"

interface TaskModalProps {
  task: Task
  employees: Employee[]
  onClose: () => void
  onUpdate: (taskId: string, updates: Partial<Task>) => void
  onDelete: (taskId: string) => void
}

export function TaskModal({ task, employees, onClose, onUpdate, onDelete }: TaskModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState<Partial<Task>>({})

  useEffect(() => {
    setEditedTask(task)
  }, [task])

  const handleSave = () => {
    onUpdate(task.id, editedTask)
    setIsEditing(false)
  }

  const handleAssigneeToggle = (employeeId: string) => {
    const currentAssignees = editedTask.assignedEmployees || task.assignedEmployees
    const newAssignees = currentAssignees.includes(employeeId)
      ? currentAssignees.filter((id) => id !== employeeId)
      : [...currentAssignees, employeeId]

    if (isEditing) {
      setEditedTask({ ...editedTask, assignedEmployees: newAssignees })
    } else {
      onUpdate(task.id, { assignedEmployees: newAssignees })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 mr-4">
            {isEditing ? (
              <input
                type="text"
                value={editedTask.title || ""}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="text-3xl font-bold text-foreground mb-2 w-full bg-transparent border-b border-border focus:outline-none focus:border-primary"
                placeholder="Task Title"
              />
            ) : (
              <h2 className="text-3xl font-bold text-foreground mb-2">{task.title}</h2>
            )}

            {isEditing ? (
              <textarea
                value={editedTask.description || ""}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="text-muted-foreground w-full bg-transparent border border-border rounded p-2 focus:outline-none focus:border-primary min-h-[100px]"
                placeholder="Description"
              />
            ) : (
              <p className="text-muted-foreground">{task.description || "No description provided."}</p>
            )}

            <div className="mt-4">
              {isEditing ? (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Tag (One word)</label>
                  <input
                    type="text"
                    list="modal-tags"
                    value={editedTask.tag || ""}
                    onChange={(e) => {
                      if (!e.target.value.includes(" ")) {
                        setEditedTask({ ...editedTask, tag: e.target.value })
                      }
                    }}
                    className="bg-transparent border border-border rounded px-2 py-1 w-full max-w-[200px] text-sm focus:border-primary focus:outline-none"
                    placeholder="Add tag"
                  />
                  <datalist id="modal-tags">
                    <option value="Plumbing" />
                    <option value="Mason" />
                    <option value="Concrete" />
                    <option value="Electrical" />
                    <option value="Carpentry" />
                    <option value="Painting" />
                  </datalist>
                </div>
              ) : task.tag && (
                <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-bold px-2 py-1 rounded uppercase">
                  {task.tag}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <select
              value={isEditing ? editedTask.status : task.status}
              onChange={(e) => {
                const newStatus = e.target.value as "todo" | "in-progress" | "done"
                if (isEditing) {
                  setEditedTask({ ...editedTask, status: newStatus })
                } else {
                  onUpdate(task.id, { status: newStatus })
                }
              }}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Priority</p>
            <select
              value={isEditing ? (editedTask.priority || "low") : (task.priority || "low")}
              onChange={(e) => {
                const newPriority = e.target.value as "low" | "medium" | "high"
                if (isEditing) {
                  setEditedTask({ ...editedTask, priority: newPriority })
                } else {
                  onUpdate(task.id, { priority: newPriority })
                }
              }}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary capitalize"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Due Date</p>
            {isEditing ? (
              <input
                type="date"
                value={editedTask.dueDate ? new Date(editedTask.dueDate).toISOString().split('T')[0] : ""}
                onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <p className="text-lg font-medium text-foreground">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Task Cost (GHS)</p>
            {isEditing ? (
              <input
                type="number"
                min="0"
                step="0.01"
                value={editedTask.cost ?? ""}
                onChange={(e) => setEditedTask({ ...editedTask, cost: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
              />
            ) : (
              <p className="text-lg font-medium text-foreground">
                {task.cost != null ? `GHS ${task.cost.toFixed(2)}` : "Not set"}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">
            Assigned Employees ({(isEditing ? editedTask.assignedEmployees : task.assignedEmployees)?.length || 0})
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-2">
            {employees.map((employee) => (
              <label
                key={employee.id}
                className="flex items-center gap-3 cursor-pointer p-2 hover:bg-muted rounded"
              >
                <input
                  type="checkbox"
                  checked={(isEditing ? editedTask.assignedEmployees : task.assignedEmployees)?.includes(employee.id)}
                  onChange={() => handleAssigneeToggle(employee.id)}
                  className="rounded border-input"
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{employee.fullName}</p>
                  <p className="text-xs text-muted-foreground">{employee.role}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditedTask(task)
                }}
                className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition font-medium"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
              >
                Edit Task
              </button>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this task?")) {
                    onDelete(task.id)
                    onClose()
                  }
                }}
                className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition font-medium flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
