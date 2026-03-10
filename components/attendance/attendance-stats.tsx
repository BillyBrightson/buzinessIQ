"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react"

interface AttendanceStatsProps {
    stats: {
        present: number
        absent: number
        leave: number
        total: number
    }
}

export function AttendanceStats({ stats }: AttendanceStatsProps) {
    const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0

    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-200 dark:border-green-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.present}</div>
                    <p className="text-xs text-muted-foreground">On site today</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.absent}</div>
                    <p className="text-xs text-muted-foreground">Not recorded</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-200 dark:border-yellow-800 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">On Leave</CardTitle>
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.leave}</div>
                    <p className="text-xs text-muted-foreground">Approved leave</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-200 dark:border-blue-800 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{attendanceRate}%</div>
                    <p className="text-xs text-muted-foreground">Workforce presence</p>
                </CardContent>
            </Card>
        </div>
    )
}
