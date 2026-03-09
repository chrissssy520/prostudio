"use client"

import { useState, useMemo } from "react"
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, addMonths, subMonths,
  startOfWeek, endOfWeek, isToday, isBefore, startOfDay,
} from "date-fns"
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Target, Users, Plus, Trash2, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppData } from "@/hooks/useAppData"
import { addCalendarEvent, deleteCalendarEvent } from "@/lib/firebaseService"

const eventTypeConfig: Record<string, { color: string; icon: typeof CalendarDays; label: string; dot: string; bg: string; ring: string; badge: string }> = {
  deadline: {
    color: "text-primary",
    icon: Target,
    label: "Deadline",
    dot: "bg-primary",
    bg: "bg-primary/10",
    ring: "ring-primary/40",
    badge: "bg-primary text-white border-primary",
  },
  meeting: {
    color: "text-blue-600",
    icon: Users,
    label: "Meeting",
    dot: "bg-blue-500",
    bg: "bg-blue-500/10",
    ring: "ring-blue-400/40",
    badge: "bg-blue-500 text-white border-blue-500",
  },
  deliverable: {
    color: "text-emerald-600",
    icon: CalendarDays,
    label: "Deliverable",
    dot: "bg-emerald-500",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-400/40",
    badge: "bg-emerald-500 text-white border-emerald-500",
  },
  installation: {
    color: "text-orange-600",
    icon: MapPin,
    label: "Installation",
    dot: "bg-orange-500",
    bg: "bg-orange-500/10",
    ring: "ring-orange-400/40",
    badge: "bg-orange-500 text-white border-orange-500",
  },
  project: {
    color: "text-purple-600",
    icon: Target,
    label: "Project Deadline",
    dot: "bg-purple-500",
    bg: "bg-purple-500/10",
    ring: "ring-purple-400/40",
    badge: "bg-purple-500 text-white border-purple-500",
  },
}

const getDayStyle = (events: any[]): { bg: string; ring: string; badgeDot: string } => {
  if (events.length === 0) return { bg: "", ring: "", badgeDot: "bg-muted-foreground" }
  const priorityOrder = ["deadline", "meeting", "deliverable", "installation", "project"]
  const eventTypes = events.map((e) => e.type)
  for (const type of priorityOrder) {
    if (eventTypes.includes(type)) {
      const cfg = eventTypeConfig[type]
      return { bg: cfg.bg, ring: cfg.ring, badgeDot: cfg.dot }
    }
  }
  return { bg: "", ring: "", badgeDot: "bg-muted-foreground" }
}

export function TeamCalendar() {
  const { calendarEvents, projects, tasks } = useAppData()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const today = startOfDay(new Date())

  const [form, setForm] = useState({
    title: "",
    type: "meeting",
    date: "",
    time: "",
    projectId: "",
  })

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) })
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")

    const calendarEvts = calendarEvents.filter((e) => e.date === dateStr)

    const projectEvts = projects
      .filter((p) => p.status !== "Completed" && format(new Date(p.deadline), "yyyy-MM-dd") === dateStr)
      .map((p) => ({
        id: `project-${p.id}`,
        title: p.name,
        date: dateStr,
        type: "project" as const,
        projectId: p.id,
        time: "",
      }))

    const taskEvts = tasks
      .filter((t) => t.status !== "done" && format(new Date(t.dueDate), "yyyy-MM-dd") === dateStr)
      .map((t) => ({
        id: `task-${t.id}`,
        title: t.name,
        date: dateStr,
        type: "deadline" as const,
        projectId: t.projectId,
        time: "",
      }))

    return [...calendarEvts, ...projectEvts, ...taskEvts]
  }

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : []

  const upcomingEvents = useMemo(() => {
    const projectDeadlines = projects
      .filter((p) => p.status !== "Completed")
      .map((p) => ({
        id: `project-${p.id}`,
        title: p.name,
        date: p.deadline,
        type: "project" as const,
        projectId: p.id,
        time: "",
      }))

    const taskDeadlines = tasks
      .filter((t) => t.status !== "done")
      .map((t) => ({
        id: `task-${t.id}`,
        title: t.name,
        date: t.dueDate,
        type: "deadline" as const,
        projectId: t.projectId,
        time: "",
      }))

    return [...calendarEvents, ...projectDeadlines, ...taskDeadlines]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .filter((e) => new Date(e.date) >= today && new Date(e.date) <= monthEnd)
      .slice(0, 8)
  }, [calendarEvents, projects, tasks, currentMonth])

  const handleAddEvent = async () => {
    if (!form.title.trim() || !form.date) return
    setSaving(true)
    try {
      await addCalendarEvent({
        title: form.title,
        type: form.type as any,
        date: form.date,
        time: form.time || "",
        projectId: form.projectId || "",
      } as any)
      setForm({ title: "", type: "meeting", date: "", time: "", projectId: "" })
      setDialogOpen(false)
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (id.startsWith("project-") || id.startsWith("task-")) return
    setDeletingId(id)
    try {
      await deleteCalendarEvent(id)
    } catch (error) {
      console.error(error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Team Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Track deadlines, meetings, and installations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground text-lg font-bold">Add Calendar Event</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-foreground">Title <span className="text-primary">*</span></Label>
                <Input
                  placeholder="e.g. Client Meeting"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-foreground">Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="meeting" className="text-foreground">Meeting</SelectItem>
                      <SelectItem value="deadline" className="text-foreground">Deadline</SelectItem>
                      <SelectItem value="deliverable" className="text-foreground">Deliverable</SelectItem>
                      <SelectItem value="installation" className="text-foreground">Installation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-foreground">Date <span className="text-primary">*</span></Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-foreground">
                  Time <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-foreground">Project (optional)</Label>
                <Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-foreground">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setDialogOpen(false)} className="text-muted-foreground">Cancel</Button>
                <Button
                  onClick={handleAddEvent}
                  disabled={saving || !form.title.trim() || !form.date}
                  className="gap-2 min-w-[120px]"
                >
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Plus className="h-4 w-4" /> Add Event</>}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold text-foreground">{format(currentMonth, "MMMM yyyy")}</h2>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="text-muted-foreground hover:text-foreground">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {dayNames.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {days.map((day) => {
                  const events = getEventsForDay(day)
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                  const todayDay = isToday(day)
                  const isPast = isBefore(startOfDay(day), today)
                  const { bg, ring, badgeDot } = getDayStyle(events)

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`relative flex flex-col items-center p-1.5 sm:p-2 rounded-lg min-h-[60px] sm:min-h-[72px] transition-colors
                        ${isCurrentMonth ? isPast ? "text-muted-foreground/40" : "text-foreground" : "text-muted-foreground/20"}
                        ${isSelected
                          ? "bg-primary/10 ring-1 ring-primary"
                          : events.length > 0
                            ? `${bg} ring-1 ${ring}`
                            : "hover:bg-secondary"
                        }`}
                    >
                      <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                        ${todayDay ? "bg-primary text-primary-foreground" : ""}`}>
                        {format(day, "d")}
                      </span>
                      {events.length > 0 && (
                        <div className="mt-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-background/60 border border-border">
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${badgeDot}`} />
                          <span className="text-[10px] font-medium text-foreground leading-none">{events.length}</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
                {Object.entries(eventTypeConfig).map(([type, config]) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <div className={`h-2 w-2 rounded-full ${config.dot}`} />
                    <span className="text-xs text-muted-foreground">{config.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          {selectedDate && (
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">{format(selectedDate, "EEEE, MMMM d")}</h3>
                {selectedDayEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events on this day</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedDayEvents.map((event) => {
                      const config = eventTypeConfig[event.type]
                      const project = projects.find((p) => p.id === event.projectId)
                      const isAutoEvent = event.id.startsWith("project-") || event.id.startsWith("task-")
                      return (
                        <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg bg-secondary group">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-md ${config.bg} shrink-0 mt-0.5`}>
                            <config.icon className={`h-3.5 w-3.5 ${config.color}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">{event.title}</p>
                            {(event as any).time && (
                              <p className="text-xs text-primary font-medium">{(event as any).time}</p>
                            )}
                            {project && <p className="text-xs text-muted-foreground">{project.client}</p>}
                          </div>
                          {!isAutoEvent && (
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive p-1"
                            >
                              {deletingId === event.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Upcoming Events</h3>
              {upcomingEvents.length === 0 && <p className="text-sm text-muted-foreground">No upcoming events.</p>}
              <div className="flex flex-col gap-2">
                {upcomingEvents.map((event) => {
                  const config = eventTypeConfig[event.type]
                  const isAutoEvent = event.id.startsWith("project-") || event.id.startsWith("task-")
                  return (
                    <div key={event.id} className="flex items-center gap-3 py-1.5 group">
                      <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${config.dot}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.date), "MMM d")}
                          {(event as any).time && ` · ${(event as any).time}`}
                        </p>
                      </div>
                      <Badge className={`text-[10px] ${config.badge} shrink-0`}>{config.label}</Badge>
                      {!isAutoEvent && (
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive p-1"
                        >
                          {deletingId === event.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}