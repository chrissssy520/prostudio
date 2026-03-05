"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Search, Filter, Plus } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppData } from "@/hooks/useAppData"
import { addProject } from "@/lib/firebaseService"
import type { Project } from "@/lib/data"

const statusColors: Record<string, string> = {
  Planning: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Active: "bg-primary/15 text-primary border-primary/30",
  "For Approval": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
}

const allStatuses = ["All", "Planning", "Active", "For Approval", "Completed"]

export function ProjectsList() {
  const { projects, tasks, teamMembers } = useAppData()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    client: "",
    type: "",
    status: "Planning" as Project["status"],
    deadline: "",
  })

  async function handleAddProject() {
    if (!newProject.name.trim() || !newProject.client.trim() || !newProject.deadline) return
    await addProject({
      name: newProject.name,
      client: newProject.client,
      type: newProject.type || "General",
      status: newProject.status,
      deadline: newProject.deadline,
      progress: 0,
      teamMemberIds: [],
      costItems: [],
      taxRate: 12,
    })
    setNewProject({ name: "", client: "", type: "", status: "Planning", deadline: "" })
    setDialogOpen(false)
  }

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "All" || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {projects.length} total projects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-56 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 border-border text-foreground bg-secondary">
                <Filter className="h-4 w-4" />
                {statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border">
              {allStatuses.map((s) => (
                <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)} className="text-foreground">
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ✅ Add Project Button */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" /> Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground">
              <DialogHeader>
                <DialogTitle className="text-foreground">New Project</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Project Name</Label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
                    className="bg-secondary border-border text-foreground"
                    placeholder="e.g. PHILcon 2026 Booth"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Client</Label>
                    <Input
                      value={newProject.client}
                      onChange={(e) => setNewProject((p) => ({ ...p, client: e.target.value }))}
                      className="bg-secondary border-border text-foreground"
                      placeholder="e.g. CLEAMCO"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Type</Label>
                    <Input
                      value={newProject.type}
                      onChange={(e) => setNewProject((p) => ({ ...p, type: e.target.value }))}
                      className="bg-secondary border-border text-foreground"
                      placeholder="e.g. Booth Design"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Status</Label>
                    <Select
                      value={newProject.status}
                      onValueChange={(v) => setNewProject((p) => ({ ...p, status: v as Project["status"] }))}
                    >
                      <SelectTrigger className="bg-secondary border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="Planning" className="text-foreground">Planning</SelectItem>
                        <SelectItem value="Active" className="text-foreground">Active</SelectItem>
                        <SelectItem value="For Approval" className="text-foreground">For Approval</SelectItem>
                        <SelectItem value="Completed" className="text-foreground">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Deadline</Label>
                    <Input
                      type="date"
                      value={newProject.deadline}
                      onChange={(e) => setNewProject((p) => ({ ...p, deadline: e.target.value }))}
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddProject}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
                >
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id)
          const doneTasks = projectTasks.filter((t) => t.status === "done").length
          const progress = projectTasks.length > 0
            ? Math.round((doneTasks / projectTasks.length) * 100)
            : 0
          const team = (project.teamMemberIds ?? [])
            .map((id: string) => teamMembers.find((m) => m.id === id))
            .filter(Boolean)

          return (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="bg-card border-border hover:border-primary/40 transition-colors cursor-pointer h-full">
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Badge variant="outline" className={`${statusColors[project.status]} mb-2`}>
                        {project.status}
                      </Badge>
                      <h3 className="font-semibold text-foreground text-balance">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{project.client}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">{project.type}</p>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span className="text-xs font-bold text-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex -space-x-2">
                      {team.slice(0, 4).map((m: any) => (
                        <Avatar key={m.id} className="h-7 w-7 border-2 border-card">
                          <AvatarFallback className="bg-secondary text-foreground text-[10px] font-bold">
                            {m.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Due {format(new Date(project.deadline), "MMM d, yyyy")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}