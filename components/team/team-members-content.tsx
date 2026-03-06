"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ChevronRight, X, Plus, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAppData } from "@/hooks/useAppData"
import { addTeamMember } from "@/lib/firebaseService"
import { deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { TeamMember } from "@/lib/data"

const priorityColors: Record<string, string> = {
  high: "bg-primary/15 text-primary border-primary/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
}

const statusLabels: Record<string, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  review: "For Review",
  done: "Done",
}

export function TeamMembersContent() {
  const { teamMembers, tasks, projects } = useAppData()
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newMember, setNewMember] = useState({ name: "", role: "", email: "" })

  async function handleAddMember() {
    if (!newMember.name.trim() || !newMember.role.trim() || !newMember.email.trim()) return
    const initials = newMember.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    await addTeamMember({
      name: newMember.name,
      role: newMember.role,
      email: newMember.email,
      initials,
      activeTasks: 0,
      workload: "free",
    })
    setNewMember({ name: "", role: "", email: "" })
    setDialogOpen(false)
  }

  async function handleDeleteMember(id: string) {
    await deleteDoc(doc(db, "teamMembers", id))
    if (selectedMember?.id === id) setSelectedMember(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {teamMembers.length} members across all projects
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-foreground">New Member</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Full Name <span className="text-primary">*</span></Label>
                <Input
                  value={newMember.name}
                  onChange={(e) => setNewMember((p) => ({ ...p, name: e.target.value }))}
                  className="bg-secondary border-border text-foreground"
                  placeholder="e.g. Juan dela Cruz"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Role <span className="text-primary">*</span></Label>
                <Input
                  value={newMember.role}
                  onChange={(e) => setNewMember((p) => ({ ...p, role: e.target.value }))}
                  className="bg-secondary border-border text-foreground"
                  placeholder="e.g. Designer"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Email <span className="text-primary">*</span></Label>
                <Input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember((p) => ({ ...p, email: e.target.value }))}
                  className="bg-secondary border-border text-foreground"
                  placeholder="e.g. juan@email.com"
                />
              </div>
              <Button
                onClick={handleAddMember}
                disabled={!newMember.name.trim() || !newMember.role.trim() || !newMember.email.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
              >
                Create Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className={selectedMember ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {teamMembers.map((member) => {
              const memberTasks = tasks.filter((t) => t.assigneeId === member.id && t.status !== "done")
              const isSelected = selectedMember?.id === member.id
              return (
                <Card
                  key={member.id}
                  className={`bg-card border-border cursor-pointer transition-colors group ${
                    isSelected ? "border-primary ring-1 ring-primary" : "hover:border-primary/30"
                  }`}
                  onClick={() => setSelectedMember(isSelected ? null : member)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        {member.email && (
                          <p className="text-xs text-muted-foreground/60 truncate">{member.email}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteMember(member.id) }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground">Active Tasks</p>
                      <p className="text-lg font-bold text-foreground">{memberTasks.length}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {selectedMember && (
          <div className="lg:col-span-1">
            <Card className="bg-card border-border sticky top-4">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {selectedMember.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{selectedMember.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedMember.role}</p>
                      {selectedMember.email && (
                        <p className="text-xs text-muted-foreground/60">{selectedMember.email}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedMember(null)}
                    className="h-7 w-7 text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Assigned Tasks
                </h4>

                <div className="flex flex-col gap-2">
                  {tasks.filter((t) => t.assigneeId === selectedMember.id).length === 0 && (
                    <p className="text-sm text-muted-foreground">No tasks assigned.</p>
                  )}
                  {tasks
                    .filter((t) => t.assigneeId === selectedMember.id)
                    .map((task) => {
                      const project = projects.find((p) => p.id === task.projectId)
                      return (
                        <div key={task.id} className="p-3 rounded-lg bg-secondary">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <p className="text-sm font-medium text-foreground leading-tight">{task.name}</p>
                            <Badge variant="outline" className={`text-[10px] shrink-0 ${priorityColors[task.priority]}`}>
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {project?.name} — {statusLabels[task.status]}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(task.dueDate), "MMM d")}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}