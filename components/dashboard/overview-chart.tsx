"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Legend } from "recharts"

interface OverviewChartProps {
    tasks: {
        status: "todo" | "in-progress" | "done"
    }[]
}

export function OverviewChart({ tasks }: OverviewChartProps) {
    const data = [
        {
            name: "To Do",
            count: tasks.filter((t) => t.status === "todo").length,
            color: "#3b82f6", // blue-500
        },
        {
            name: "In Progress",
            count: tasks.filter((t) => t.status === "in-progress").length,
            color: "#a855f7", // purple-500
        },
        {
            name: "Done",
            count: tasks.filter((t) => t.status === "done").length,
            color: "#22c55e", // green-500
        },
    ]

    return (
        <Card className="col-span-1 animate-in fade-in zoom-in-50 duration-500 hover:shadow-lg transition-all">
            <CardHeader>
                <CardTitle>Task Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
