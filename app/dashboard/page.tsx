"use client"

import { Sidebar } from "@/components/sidebar"
import { useEffect, useState, useMemo } from "react"
import { storage } from "@/lib/storage"
import type { Employee, Project, Task, AttendanceRecord, Branch, Sale } from "@/lib/types"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentProjects } from "@/components/dashboard/recent-projects"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { useAuth } from "@/components/auth-provider"
import { TopBar } from "@/components/top-bar"
import { MapPin, TrendingUp, ShoppingCart } from "lucide-react"

const GHS = (n: number) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n)

export default function Dashboard({ onSearchOpen }: { onSearchOpen?: () => void }) {
    const { user, effectiveUid, userRole } = useAuth()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
    const [branches, setBranches] = useState<Branch[]>([])
    const [todaySales, setTodaySales] = useState<Sale[]>([])

    const uid = effectiveUid || user?.uid || ""
    const today = new Date().toISOString().split("T")[0]

    useEffect(() => {
        if (!uid) return
        setEmployees(storage.employees.getActive(uid))
        setProjects(storage.projects.getAll(uid))
        setTasks(storage.tasks.getAll(uid))
        setAttendance(storage.attendance.getAll(uid))
        setBranches(storage.branches.getActive(uid))
        setTodaySales(storage.sales.getByDate(today, uid))
    }, [uid])

    const completedTasks = tasks.filter((t) => t.status === "done").length

    const stats = {
        activeEmployees: employees.length,
        activeProjects: projects.filter((p) => p.status === "active").length,
        tasksInProgress: tasks.filter((t) => t.status === "in-progress").length,
        completedTasks,
        todaySalesCount: todaySales.length,
        todayRevenue: todaySales.reduce((s, sale) => s + sale.total, 0),
    }

    const branchStats = useMemo(() => {
        return branches.map(branch => {
            const branchSales = todaySales.filter(s => s.branchId === branch.id || (!s.branchId && branch.isDefault))
            return {
                branch,
                salesCount: branchSales.length,
                revenue: branchSales.reduce((s, sale) => s + sale.total, 0),
            }
        })
    }, [branches, todaySales])

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
                            <p className="text-muted-foreground">Welcome back to BuzinessIQ</p>
                        </div>
                        <div className="text-sm font-medium text-muted-foreground bg-card px-4 py-2 rounded-full border shadow-sm">
                            {currentDate}
                        </div>
                    </div>

                    <StatsCards stats={stats} />

                    {/* Cross-branch sales breakdown (admin with 2+ branches) */}
                    {userRole === "admin" && branches.length > 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin size={15} className="text-muted-foreground" />
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Today's Performance by Branch</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {branchStats.map(({ branch, salesCount, revenue }) => (
                                    <div key={branch.id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <MapPin size={13} className="text-primary" />
                                            </div>
                                            <span className="font-semibold text-foreground text-sm truncate">{branch.name}</span>
                                            {branch.isDefault && (
                                                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full ml-auto flex-shrink-0">Main</span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-muted/50 rounded-lg p-2.5">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <ShoppingCart size={11} className="text-muted-foreground" />
                                                    <span className="text-[11px] text-muted-foreground">Sales</span>
                                                </div>
                                                <p className="font-bold text-foreground">{salesCount}</p>
                                            </div>
                                            <div className="bg-primary/5 rounded-lg p-2.5">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <TrendingUp size={11} className="text-primary/70" />
                                                    <span className="text-[11px] text-muted-foreground">Revenue</span>
                                                </div>
                                                <p className="font-bold text-primary text-sm">{GHS(revenue)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <RecentProjects projects={projects} />
                        <OverviewChart tasks={tasks} />
                    </div>
                </div>
            </main>
        </div>
    )
}
