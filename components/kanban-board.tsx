"use client"

import type { Task, Employee } from "@/lib/types"
import { storage } from "@/lib/storage"
import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { TaskCard } from "./task-card"
import { TaskForm } from "./task-form"
import { TaskModal } from "./task-modal"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  useDroppable,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableTask } from "./sortable-task"
import { useAuth } from "@/components/auth-provider"

interface KanbanBoardProps {
  projectId: string
  employees: Employee[]
}

export function KanbanBoard({ projectId, employees }: KanbanBoardProps) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  useEffect(() => {
    loadTasks()
  }, [projectId, user])

  const loadTasks = () => {
    if (user) {
      setTasks(storage.tasks.getByProject(projectId, user.uid))
    }
  }

  const handleAddTask = (task: Task) => {
    if (!user) return
    storage.tasks.add(task, user.uid)
    loadTasks()
    setShowTaskForm(false)
  }

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    if (!user) return
    storage.tasks.update(taskId, updates, user.uid)
    loadTasks()
  }

  const handleDeleteTask = (taskId: string) => {
    if (!user) return
    storage.tasks.delete(taskId, user.uid)
    loadTasks()
    setSelectedTask(null)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the tasks
    const activeTask = tasks.find((t) => t.id === activeId)
    const overTask = tasks.find((t) => t.id === overId)

    if (!activeTask) return

    // If dropping over a column container (which we'll ID as the status)
    if (columns.includes(overId as any)) {
      const newStatus = overId as "todo" | "in-progress" | "done"
      if (activeTask.status !== newStatus) {
        // We don't update state here to avoid flickering, we do it in dragEnd
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) {
      setActiveId(null)
      return
    }

    let newStatus = activeTask.status

    // If dropped over a column
    if (columns.includes(overId as any)) {
      newStatus = overId as "todo" | "in-progress" | "done"
    }
    // If dropped over another task
    else {
      const overTask = tasks.find((t) => t.id === overId)
      if (overTask) {
        newStatus = overTask.status
      }
    }

    if (activeTask.status !== newStatus) {
      handleUpdateTask(activeId, { status: newStatus })
    }

    setActiveId(null)
  }

  const columns = ["todo", "in-progress", "done"] as const

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div>
        {showTaskForm && (
          <TaskForm
            projectId={projectId}
            employees={employees}
            onClose={() => setShowTaskForm(false)}
            onSave={handleAddTask}
          />
        )}

        {selectedTask && (
          <TaskModal
            task={selectedTask}
            employees={employees}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col)
            const colTitle = col === "in-progress" ? "In Progress" : col.charAt(0).toUpperCase() + col.slice(1)

            return (
              <div key={col} className="bg-muted/30 rounded-lg p-4 border border-border flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">{colTitle}</h3>
                  <span className="text-sm font-medium px-2 py-1 bg-muted text-muted-foreground rounded">
                    {columnTasks.length}
                  </span>
                </div>

                <SortableContext
                  id={col}
                  items={columnTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 mb-4 min-h-[100px]" data-id={col}>
                    <DroppableColumn id={col}>
                      {columnTasks.map((task) => (
                        <SortableTask
                          key={task.id}
                          task={task}
                          employees={employees}
                          onAssigneeClick={() => setSelectedTask(task)}
                          onStatusChange={(newStatus) => handleUpdateTask(task.id, { status: newStatus as any })}
                        />
                      ))}
                    </DroppableColumn>
                  </div>
                </SortableContext>

                {col === "todo" && (
                  <button
                    onClick={() => setShowTaskForm(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-primary hover:bg-primary/10 rounded-lg transition font-medium mt-auto"
                  >
                    <Plus size={18} />
                    Add Task
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <DragOverlay>
          {activeId ? (
            <TaskCard
              task={tasks.find(t => t.id === activeId)!}
              employees={employees}
              onAssigneeClick={() => { }}
              onStatusChange={() => { }}
            />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}

function DroppableColumn({ id, children }: { id: string, children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: id,
  })

  return (
    <div ref={setNodeRef} className="min-h-[150px]">
      {children}
    </div>
  )
}
