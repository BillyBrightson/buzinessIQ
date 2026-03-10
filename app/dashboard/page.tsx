"use client"

import { Sidebar } from "@/components/sidebar"
import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import type { Employee, Project, Task, AttendanceRecord } from "@/lib/types"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentProjects } from "@/components/dashboard/recent-projects"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { useAuth } from "@/components/auth-provider"
import { TopBar } from "@/components/top-bar"

export default function Dashboard({ onSearchOpen }: { onSearchOpen?: () => void }) {
    const { user } = useAuth()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([])

    useEffect(() => {
        if (user) {
            setEmployees(storage.employees.getActive(user.uid))
            setProjects(storage.projects.getAll(user.uid))
            setTasks(storage.tasks.getAll(user.uid))
            setAttendance(storage.attendance.getAll(user.uid))
        }
    }, [user])

    const activeTasks = tasks.filter((t) => t.status !== "done").length
    const completedTasks = tasks.filter((t) => t.status === "done").length
    const todayAttendance = attendance.filter((a) => a.date === new Date().toISOString().split("T")[0]).length

    const stats = {
        activeEmployees: employees.length,
        activeProjects: projects.filter((p) => p.status === "active").length,
        tasksInProgress: tasks.filter((t) => t.status === "in-progress").length,
        completedTasks: completedTasks,
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className="flex h-screen bg-background">
            <Sidebar currentPage="/dashboard" onSearchOpen={onSearchOpen} />

            <main className="flex-1 overflow-auto md:ml-0 bg-muted/10">
                <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
                    <TopBar title="Dashboard" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div>
                            <p className="text-muted-foreground">Welcome back to BuildTrack</p>
                        </div>
                        <div className="text-sm font-medium text-muted-foreground bg-card px-4 py-2 rounded-full border shadow-sm">
                            {currentDate}
                        </div>
                    </div>

                    <StatsCards stats={stats} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <RecentProjects projects={projects} />
                        <OverviewChart tasks={tasks} />
                    </div>
                </div>
            </main>
        </div>
    )
}
