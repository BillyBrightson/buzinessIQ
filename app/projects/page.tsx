"use client"

import { Sidebar } from "@/components/sidebar"
import { useState, useEffect } from "react"
import { storage } from "@/lib/storage"
import type { Project, Employee } from "@/lib/types"
import { Plus, MapPin, User, Calendar, ArrowRight } from "lucide-react"
import { ProjectForm } from "@/components/project-form"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { TopBar } from "@/components/top-bar"

export default function ProjectsPage({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const router = useRouter()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = () => {
    if (user) {
      setProjects(storage.projects.getAll(user.uid))
    }
  }

  const handleAddProject = (project: Project) => {
    if (!user) return
    if (editingProject) {
      storage.projects.update(editingProject.id, project, user.uid)
      setEditingProject(null)
    } else {
      storage.projects.add(project, user.uid)
    }
    loadData()
    setShowProjectForm(false)
  }

  const handleEdit = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation() // Prevent navigation when clicking edit
    setEditingProject(project)
    setShowProjectForm(true)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage="/projects" onSearchOpen={onSearchOpen} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 md:p-8 border-b border-border bg-card w-full">
          <div className="max-w-7xl mx-auto w-full">
            <TopBar title="Projects" />

            <div className="flex items-center justify-between mb-4 mt-6">
              <p className="text-muted-foreground">Manage construction projects</p>
              <button
                onClick={() => {
                  setEditingProject(null)
                  setShowProjectForm(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
              >
                <Plus size={20} />
                <span>New Project</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {projects.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">No projects found</p>
                <button
                  onClick={() => setShowProjectForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition mx-auto"
                >
                  <Plus size={20} />
                  <span>Create First Project</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="group relative bg-card hover:bg-accent/5 transition-all duration-200 rounded-xl border border-border p-6 cursor-pointer hover:shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <button
                        onClick={(e) => handleEdit(e, project)}
                        className="text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition"
                      >
                        Edit
                      </button>
                    </div>

                    <p className="text-muted-foreground line-clamp-2 mb-6 h-12">
                      {project.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin size={16} />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User size={16} />
                        <span>{project.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={16} />
                        <span>
                          {new Date(project.startDate).toLocaleDateString()} - {new Date(project.estimatedEndDate || '').toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                      <span className="text-primary group-hover:translate-x-1 transition-transform">
                        <ArrowRight size={20} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showProjectForm && (
          <ProjectForm
            project={editingProject}
            onClose={() => {
              setShowProjectForm(false)
              setEditingProject(null)
            }}
            onSave={handleAddProject}
          />
        )}
      </main>
    </div>
  )
}
