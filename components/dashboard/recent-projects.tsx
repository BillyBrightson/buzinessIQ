"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Project } from "@/lib/types"
import { ArrowRight, MapPin, Calendar, Clock } from "lucide-react"

interface RecentProjectsProps {
    projects: Project[]
}

export function RecentProjects({ projects }: RecentProjectsProps) {
    return (
        <Card className="col-span-1 animate-in fade-in zoom-in-50 duration-500 delay-150 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <button className="text-sm text-primary hover:underline flex items-center gap-1">
                    View All <ArrowRight size={14} />
                </button>
            </CardHeader>
            <CardContent>
                {projects.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No active projects</p>
                ) : (
                    <div className="space-y-6">
                        {projects.slice(0, 5).map((project, index) => (
                            <div
                                key={project.id}
                                className="flex items-start justify-between group cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                                        {project.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{project.clientName}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={10} /> {project.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} /> {new Date(project.startDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${project.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        project.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                    {project.status}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
