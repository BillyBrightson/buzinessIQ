"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TaskCard } from "./task-card"
import type { Task, Employee } from "@/lib/types"

interface SortableTaskProps {
    task: Task
    employees: Employee[]
    onAssigneeClick: () => void
    onStatusChange: (status: string) => void
}

export function SortableTask({ task, employees, onAssigneeClick, onStatusChange }: SortableTaskProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard
                task={task}
                employees={employees}
                onAssigneeClick={onAssigneeClick}
                onStatusChange={onStatusChange}
            />
        </div>
    )
}
