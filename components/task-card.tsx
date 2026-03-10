"use client"

import type { Task, Employee } from "@/lib/types"
import { Users } from "lucide-react"

interface TaskCardProps {
  task: Task
  employees: Employee[]
  onAssigneeClick: () => void
  onStatusChange: (newStatus: string) => void
}

export function TaskCard({ task, employees, onAssigneeClick, onStatusChange }: TaskCardProps) {
  const assignedEmployees = employees.filter((e) => task.assignedEmployees.includes(e.id))

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-500/10"
      case "medium":
        return "text-yellow-500 bg-yellow-500/10"
      case "low":
        return "text-blue-500 bg-blue-500/10"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  return (
    <div
      className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition cursor-pointer group"
      onClick={onAssigneeClick}
    >
      <div className="flex justify-between items-start mb-2">
        <p className="font-medium text-foreground line-clamp-2">{task.title}</p>
        {task.priority && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        )}
      </div>

      {task.tag && (
        <div className="mb-2">
          <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-[10px] font-bold px-2 py-1 rounded uppercase">
            {task.tag}
          </span>
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description || "No description"}</p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex -space-x-2 overflow-hidden">
          {assignedEmployees.slice(0, 3).map((emp) => (
            <div
              key={emp.id}
              className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] border-2 border-background"
              title={emp.fullName}
            >
              {emp.fullName.charAt(0)}
            </div>
          ))}
          {assignedEmployees.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] border-2 border-background">
              +{assignedEmployees.length - 3}
            </div>
          )}
        </div>

        {task.dueDate && (
          <span className="text-xs text-muted-foreground">
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  )
}
