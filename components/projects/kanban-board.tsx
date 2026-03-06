"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Plus, GripVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { getProjectTasks, type Task } from "@/lib/data"
import { addTask, updateTask } from "@/lib/firebaseService"
import { useAppData } from "@/hooks/useAppData"

const columns: { key: Task["status"]; label: string; color: string }[] = [
  { key: "todo", label: "To Do", color: "bg-muted-foreground" },
  { key: "in-progress", label: "In Progress", color: "bg-blue-400" },
  { key: "review", label: "For Review", color: "bg-orange-400" },
  { key: "done", label: "Done", color: "bg-emerald-400" },
]

const statusOrder: Task["status"][] = ["todo", "in-progress", "review", "done"]

const priorities: Record<string, string> = {
  high: "bg-primary/15 text-primary border-primary/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
}

const categories = [
  "Concept", "3D Modeling", "Rendering", "Fabrication", "Client Approval", "Installation",
]

interface KanbanBoardProps {
  projectId: string
  initialTasks?: Task[]
  onTasksChange?: (tasks: Task[]) => void
}

export function KanbanBoard({ projectId, initialTasks, onTasksChange }: KanbanBoardProps) {
  const { teamMembers } = useAppData()

  const fallback = getProjectTasks(projectId)
  const [tasksList, setTasksList] = useState<Task[]>(initialTasks ?? fallback)
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    name: "",
    assigneeId: "",
    dueDate: "",
    priority: "medium" as Task["priority"],
    category: "",
  })

  function updateTasks(updated: Task[]) {
    setTasksList(updated)
    onTasksChange?.(updated)
  }

  function handleDragStart(taskId: string) {
    setDraggedTask(taskId)
  }

  function handleDrop(newStatus: Task["status"]) {
    if (!draggedTask) return
    const updated = tasksList.map((t) => (t.id === draggedTask ? { ...t, status: newStatus } : t))
    updateTasks(updated)
    updateTask(draggedTask, { status: newStatus })
    setDraggedTask(null)
  }

  async function handleSetStatus(taskId: string, status: Task["status"]) {
    updateTasks(tasksList.map((t) => (t.id === taskId ? { ...t, status } : t)))
    await updateTask(taskId, { status })
  }

  async function handleAddTask() {
    if (!newTask.name.trim()) return
    const task = {
      name: newTask.name,
      assigneeId: newTask.assigneeId || teamMembers[0]?.id || "",
      dueDate: newTask.dueDate || new Date().toISOString().split("T")[0],
      priority: newTask.priority,
      category: newTask.category || "Concept",
      status: "todo" as Task["status"],
      projectId,
    }
    await addTask(task)
    setNewTask({ name: "", assigneeId: "", dueDate: "", priority: "medium", category: "" })
    setDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{tasksList.length} tasks</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-foreground">New Task</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Task Name</Label>
                <Input
                  value={newTask.name}
                  onChange={(e) => setNewTask((p) => ({ ...p, name: e.target.value }))}
                  className="bg-secondary border-border text-foreground"
                  placeholder="Enter task name..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Assignee</Label>
                  <Select value={newTask.assigneeId} onValueChange={(v) => setNewTask((p) => ({ ...p, assigneeId: v }))}>
                    <SelectTrigger className="bg-secondary border-border text-foreground">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {teamMembers.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-foreground">
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Due Date</Label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask((p) => ({ ...p, dueDate: e.target.value }))}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(v) => setNewTask((p) => ({ ...p, priority: v as Task["priority"] }))}>
                    <SelectTrigger className="bg-secondary border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="high" className="text-foreground">High</SelectItem>
                      <SelectItem value="medium" className="text-foreground">Medium</SelectItem>
                      <SelectItem value="low" className="text-foreground">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Category</Label>
                  <Select value={newTask.category} onValueChange={(v) => setNewTask((p) => ({ ...p, category: v }))}>
                    <SelectTrigger className="bg-secondary border-border text-foreground">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {categories.map((c) => (
                        <SelectItem key={c} value={c} className="text-foreground">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddTask} className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 min-w-[900px]">
          {columns.map((col) => {
            const colTasks = tasksList.filter((t) => t.status === col.key)
            return (
              <div
                key={col.key}
                className="flex-1 min-w-[220px]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(col.key)}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`h-2 w-2 rounded-full ${col.color}`} />
                  <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                  <span className="text-xs text-muted-foreground ml-auto">{colTasks.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {colTasks.map((task) => {
                    const assignee = teamMembers.find((m) => m.id === task.assigneeId)
                    return (
                      <Card
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        className="bg-card border-border hover:border-primary/30 transition-colors cursor-grab active:cursor-grabbing"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-medium text-foreground leading-tight">{task.name}</p>
                            <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            <Badge variant="outline" className={`text-[10px] ${priorities[task.priority]}`}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] bg-secondary/50 text-muted-foreground border-border">
                              {task.category}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            {assignee && (
                              <div className="flex items-center gap-1.5">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="bg-secondary text-foreground text-[8px] font-bold">
                                    {assignee.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-[11px] text-muted-foreground">{assignee.name.split(" ")[0]}</span>
                              </div>
                            )}
                            <span className="text-[11px] text-muted-foreground">
                              {format(new Date(task.dueDate), "MMM d")}
                            </span>
                          </div>

                          {/* Status buttons */}
                          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border flex-wrap">
                            {statusOrder.map((s) => (
                              <button
                                key={s}
                                onClick={() => handleSetStatus(task.id, s)}
                                className={`text-[11px] px-2.5 py-1 rounded-md font-semibold transition-colors ${
                                  task.status === s
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                                }`}
                              >
                                {s === "todo" ? "Todo" : s === "in-progress" ? "In Progress" : s === "review" ? "Review" : "Done"}
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}