"use client"

import { format } from "date-fns"
import {
  ClipboardList,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAppData } from "@/hooks/useAppData"
import Link from "next/link"

const statusColors: Record<string, string> = {
  Planning: "bg-yellow-500 text-white border-yellow-500",
  Active: "bg-primary text-white border-primary",
  "For Approval": "bg-orange-500 text-white border-orange-500",
  Completed: "bg-emerald-500 text-white border-emerald-500",
}

export function DashboardContent() {
  const { projects, tasks, activity, teamMembers } = useAppData()
  const today = format(new Date(), "EEEE, MMMM d, yyyy")
  const activeProjects = projects.filter((p) => p.status !== "Completed")

  const stats = [
    {
      label: "Total Tasks",
      value: tasks.filter((t) => t.status !== "done").length,
      icon: ClipboardList,
      color: "text-foreground",
      bg: "bg-secondary",
    },
    {
      label: "In Progress",
      value: tasks.filter((t) => t.status === "in-progress").length,
      icon: Loader2,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Completed",
      value: tasks.filter((t) => t.status === "done").length,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Overdue",
      value: tasks.filter((t) => t.status !== "done" && new Date(t.dueDate) < new Date()).length,
      icon: AlertTriangle,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome</h1>
        <p className="text-sm text-muted-foreground mt-1">{today}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Active Projects</h2>
            <Link href="/projects" className="flex items-center gap-1 text-sm text-primary hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {activeProjects.map((project) => {
              const projectTasks = tasks.filter((t) => t.projectId === project.id)
              const doneTasks = projectTasks.filter((t) => t.status === "done").length
              const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0
              const team = project.teamMemberIds
                ?.map((id: string) => teamMembers.find((m) => m.id === id))
                .filter(Boolean) ?? []

              return (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="bg-card border-border hover:border-primary/40 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
                          <p className="text-sm text-muted-foreground">{project.client}</p>
                        </div>
                        <Badge variant="outline" className={statusColors[project.status]}>
                          {project.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-muted-foreground">Progress</span>
                            <span className="text-xs font-medium text-foreground">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                        {team.length > 0 && (
                          <div className="flex -space-x-2">
                            {team.slice(0, 3).map((m: any) => (
                              <Avatar key={m.id} className="h-7 w-7 border-2 border-card">
                                <AvatarFallback className="bg-secondary text-foreground text-[10px] font-bold">
                                  {m.initials}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {team.length > 3 && (
                              <Avatar className="h-7 w-7 border-2 border-card">
                                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                                  +{team.length - 3}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Due {format(new Date(project.deadline), "MMM d, yyyy")}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {activity.length === 0 && (
                  <p className="text-sm text-muted-foreground p-4">No recent activity.</p>
                )}
                {activity.map((item) => (
                  <div key={item.id} className="flex gap-3 p-4">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-secondary text-foreground text-[10px] font-bold">
                        {item.user.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{item.user}</span>{" "}
                        <span className="text-muted-foreground">{item.action}</span>{" "}
                        <span className="font-medium">{item.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}