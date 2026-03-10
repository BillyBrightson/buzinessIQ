"use client"

import { Sidebar } from "@/components/sidebar"
import { useState, useEffect, use } from "react"
import { storage } from "@/lib/storage"
import type { Project, Employee } from "@/lib/types"
import { KanbanBoard } from "@/components/kanban-board"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { TopBar } from "@/components/top-bar"

export default function ProjectBoardPage({ params, onSearchOpen }: { params: Promise<{ id: string }>, onSearchOpen?: () => void }) {
    const router = useRouter()
    const { user } = useAuth()
    // Unwrap params using React.use()
    const { id } = use(params)
    const [project, setProject] = useState<Project | null>(null)
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id && user) {
            const foundProject = storage.projects.getById(id, user.uid)
            if (foundProject) {
                setProject(foundProject)
                setEmployees(storage.employees.getActive(user.uid))
            } else {
                router.push("/projects")
            }
            setLoading(false)
        }
    }, [id, router, user])

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    if (!project) return null

    return (
        <div className="flex h-screen bg-background">
            <Sidebar currentPage="/projects" onSearchOpen={onSearchOpen} />

            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 md:p-8 border-b border-border bg-card w-full">
                    <div className="max-w-7xl mx-auto w-full">
                        <TopBar title={project.name} />

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-4">
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <span className="text-sm">Client: {project.clientName} | Location: {project.location}</span>
                            </div>
                            <button
                                onClick={() => router.push("/projects")}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors self-start md:self-auto"
                            >
                                <ArrowLeft size={16} />
                                <span>Back to Projects</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
                    <KanbanBoard projectId={project.id} employees={employees} />
                </div>
            </main>
        </div>
    )
}
