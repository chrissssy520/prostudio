"use client"

import { useState } from "react"
import { Plus, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { addTask } from "@/lib/firebaseService"
import { useAppData } from "@/hooks/useAppData"

export function AddTaskDialog() {
  const { projects, teamMembers } = useAppData()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: "",
    description: "",
    projectId: "",
    assigneeId: "",
    priority: "medium",
    status: "todo",
    dueDate: "",
  })

  const handleSubmit = async () => {
if (!form.name.trim() || !form.projectId) return

    setLoading(true)
    try {
   await addTask({
  name: form.name,
  projectId: form.projectId || "",
  assigneeId: form.assigneeId || "",
  priority: form.priority as "low" | "medium" | "high",
  status: form.status as "todo" | "in-progress" | "done",
  dueDate: form.dueDate || "",
} as any)

      setForm({
        name: "",
        description: "",
        projectId: "",
        assigneeId: "",
        priority: "medium",
        status: "todo",
        dueDate: "",
      })
      setOpen(false)
    } catch (error) {
      console.error("Error adding task:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg font-bold">Add New Task</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Task Name <span className="text-primary">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Design landing page mockup"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Optional details about the task..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-foreground">Project</Label>
              <Select
                value={form.projectId}
                onValueChange={(val) => setForm({ ...form, projectId: val })}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-foreground">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-foreground">Assign To</Label>
              <Select
                value={form.assigneeId}
                onValueChange={(val) => setForm({ ...form, assigneeId: val })}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select member" />
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-foreground">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(val) => setForm({ ...form, priority: val })}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="low" className="text-foreground">🟢 Low</SelectItem>
                  <SelectItem value="medium" className="text-foreground">🟡 Medium</SelectItem>
                  <SelectItem value="high" className="text-foreground">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-foreground">Status</Label>
              <Select
                value={form.status}
                onValueChange={(val) => setForm({ ...form, status: val })}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="todo" className="text-foreground">To Do</SelectItem>
                  <SelectItem value="in-progress" className="text-foreground">In Progress</SelectItem>
                  <SelectItem value="done" className="text-foreground">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dueDate" className="text-sm font-medium text-foreground">
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !form.name.trim()}
              className="gap-2 shadow-lg shadow-primary/20 min-w-[120px]"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Plus className="h-4 w-4" /> Add Task</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}