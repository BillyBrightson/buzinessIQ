"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, CheckCircle, Clock, ShoppingCart, Wallet } from "lucide-react"

const GHS = (n: number) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n)

interface StatsCardsProps {
    stats: {
        activeEmployees: number
        activeProjects: number
        tasksInProgress: number
        completedTasks: number
        todaySalesCount: number
        todayRevenue: number
    }
}

export function StatsCards({ stats }: StatsCardsProps) {
    const cards = [
        {
            title: "Active Projects",
            value: stats.activeProjects,
            description: "Currently ongoing",
            icon: Briefcase,
            className: "bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-200 dark:border-blue-800",
            iconColor: "text-blue-600 dark:text-blue-400",
        },
        {
            title: "Active Employees",
            value: stats.activeEmployees,
            description: "On payroll",
            icon: Users,
            className: "bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-200 dark:border-purple-800",
            iconColor: "text-purple-600 dark:text-purple-400",
        },
        {
            title: "Tasks In Progress",
            value: stats.tasksInProgress,
            description: "Needing attention",
            icon: Clock,
            className: "bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-200 dark:border-amber-800",
            iconColor: "text-amber-600 dark:text-amber-400",
        },
        {
            title: "Completed Tasks",
            value: stats.completedTasks,
            description: "All time",
            icon: CheckCircle,
            className: "bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-200 dark:border-green-800",
            iconColor: "text-green-600 dark:text-green-400",
        },
        {
            title: "Today's Sales",
            value: stats.todaySalesCount,
            description: "Transactions today",
            icon: ShoppingCart,
            className: "bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-200 dark:border-cyan-800",
            iconColor: "text-cyan-600 dark:text-cyan-400",
        },
        {
            title: "Today's Revenue",
            value: GHS(stats.todayRevenue),
            description: "POS sales today",
            icon: Wallet,
            className: "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-200 dark:border-emerald-800",
            iconColor: "text-emerald-600 dark:text-emerald-400",
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {cards.map((card, index) => (
                <Card
                    key={card.title}
                    className={`${card.className} border shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.title}
                        </CardTitle>
                        <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {card.value}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {card.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
