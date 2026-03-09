"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppData } from "@/hooks/useAppData"
import { type Task } from "@/lib/data"
import { KanbanBoard } from "@/components/projects/kanban-board"
import { CostingTab } from "@/components/projects/costing-tab"
import { updateProject } from "@/lib/firebaseService"

const statusColors: Record<string, string> = {
  Planning: "bg-yellow-500 text-white border-yellow-500",
  Active: "bg-primary text-white border-primary",
  "For Approval": "bg-orange-500 text-white border-orange-500",
  Completed: "bg-emerald-500 text-white border-emerald-500",
}

function deriveProjectStatus(tasks: Task[]): string {
  if (tasks.length === 0) return "Planning"
  const statuses = tasks.map((t) => t.status)
  if (statuses.every((s) => s === "done")) return "Completed"
  if (statuses.some((s) => s === "review")) return "For Approval"
  if (statuses.some((s) => s === "in-progress")) return "Active"
  return "Planning"
}

export function ProjectDetail({ projectId }: { projectId: string }) {
  const { projects, tasks, loading } = useAppData()

  const project = projects.find((p) => p.id === projectId)
  const projectTasks = tasks.filter((t) => t.projectId === projectId)

  const [liveTasks, setLiveTasks] = useState<Task[] | null>(null)
  const displayTasks = liveTasks ?? projectTasks

  const completedCount = displayTasks.filter((t) => t.status === "done").length
  const totalCount = displayTasks.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const overdueCount = displayTasks.filter(
    (t) => t.status !== "done" && new Date(t.dueDate) < new Date()
  ).length

  useEffect(() => {
    if (!project || displayTasks.length === 0) return
    const derived = deriveProjectStatus(displayTasks)
    if (derived !== project.status) {
      updateProject(project.id, { status: derived as any })
    }
  }, [displayTasks, project?.id, project?.status])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">Loading project...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">Project not found</p>
        <Link href="/projects">
          <Button variant="ghost" className="mt-4 text-primary">Back to projects</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="mt-0.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{project.name}</h1>
            <Badge variant="outline" className={statusColors[project.status]}>
              {project.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>Client: <span className="text-foreground font-medium">{project.client}</span></span>
            <span>Type: {project.type}</span>
            <span>Deadline: {format(new Date(project.deadline), "MMM d, yyyy")}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Progress</p>
          <p className="text-xl font-bold text-foreground mb-2">{progress}%</p>
          <Progress value={progress} className="h-1.5" />
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Tasks</p>
          <p className="text-xl font-bold text-foreground">{totalCount}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Completed</p>
          <p className="text-xl font-bold text-emerald-400">{completedCount}</p>
        </div>
        <div className={`rounded-lg border p-4 ${overdueCount > 0 ? "bg-red-500/10 border-red-500/30" : "bg-card border-border"}`}>
          <p className="text-xs text-muted-foreground mb-1">Overdue</p>
          <p className={`text-xl font-bold ${overdueCount > 0 ? "text-red-400" : "text-foreground"}`}>
            {overdueCount}
          </p>
        </div>
      </div>

      <Tabs defaultValue="board" className="flex flex-col gap-4">
        <TabsList className="bg-secondary border border-border w-fit">
          <TabsTrigger value="board" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Task Board
          </TabsTrigger>
          <TabsTrigger value="costing" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Costing
          </TabsTrigger>
        </TabsList>
        <TabsContent value="board">
          <KanbanBoard projectId={project.id} initialTasks={projectTasks} onTasksChange={setLiveTasks} />
        </TabsContent>
        <TabsContent value="costing">
          <CostingTab project={project} />
        </TabsContent>
      </Tabs>
    </div>
  )
}