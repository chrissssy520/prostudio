export type TeamMember = {
  id: string
  name: string
  role: string
  initials: string
  activeTasks: number
  workload: "overloaded" | "balanced" | "free"
}

export type Task = {
  id: string
  name: string
  assigneeId: string
  dueDate: string
  priority: "high" | "medium" | "low"
  category: string
  status: "todo" | "in-progress" | "review" | "done"
  projectId: string
}

export type CostItem = {
  id: string
  description: string
  category: string
  budgeted: number
  actual: number
}

export type Project = {
  id: string
  name: string
  client: string
  type: string
  status: "Planning" | "Active" | "For Approval" | "Completed"
  deadline: string
  progress: number
  teamMemberIds: string[]
  costItems: CostItem[]
  taxRate: number
}

export type CalendarEvent = {
  id: string
  title: string
  date: string
  type: "deadline" | "meeting" | "deliverable" | "installation"
  projectId: string
}

export type Notification = {
  id: string
  message: string
  type: "due-soon" | "completed" | "assignment"
  timestamp: string
  read: boolean
}

export type ActivityItem = {
  id: string
  user: string
  action: string
  target: string
  timestamp: string
}

export const teamMembers: TeamMember[] = [
  { id: "tm1", name: "Mika Santos", role: "Project Manager", initials: "MS", activeTasks: 5, workload: "balanced" },
  { id: "tm2", name: "Raf Dela Cruz", role: "3D Artist", initials: "RD", activeTasks: 7, workload: "overloaded" },
  { id: "tm3", name: "Joy Reyes", role: "Designer", initials: "JR", activeTasks: 4, workload: "balanced" },
  { id: "tm4", name: "Carlo Tan", role: "Fabricator", initials: "CT", activeTasks: 2, workload: "free" },
  { id: "tm5", name: "Anna Cruz", role: "Account Manager", initials: "AC", activeTasks: 3, workload: "balanced" },
]

export const projects: Project[] = [
  {
    id: "p1",
    name: "PHILcon 2025 Booth",
    client: "CLEAMCO",
    type: "Booth Design & Fabrication",
    status: "Active",
    deadline: "2025-09-15",
    progress: 45,
    teamMemberIds: ["tm1", "tm2", "tm3", "tm4"],
    costItems: [
      { id: "c1", description: "Structural Materials (Steel, Aluminum)", category: "Materials", budgeted: 280000, actual: 265000 },
      { id: "c2", description: "3D Rendering & Visualization", category: "3D Rendering", budgeted: 85000, actual: 85000 },
      { id: "c3", description: "Printing (Vinyl, Tarpaulin, Acrylic)", category: "Printing", budgeted: 120000, actual: 95000 },
      { id: "c4", description: "Labor (Fabrication Team)", category: "Labor", budgeted: 200000, actual: 180000 },
      { id: "c5", description: "Logistics & Transport", category: "Logistics", budgeted: 45000, actual: 38000 },
      { id: "c6", description: "On-site Installation", category: "Installation", budgeted: 75000, actual: 0 },
    ],
    taxRate: 12,
  },
  {
    id: "p2",
    name: "Holiday Window Display",
    client: "SM Retail",
    type: "Window Display Installation",
    status: "Planning",
    deadline: "2025-11-20",
    progress: 15,
    teamMemberIds: ["tm1", "tm3", "tm5"],
    costItems: [
      { id: "c7", description: "Display Materials", category: "Materials", budgeted: 150000, actual: 20000 },
      { id: "c8", description: "Design & Concept", category: "3D Rendering", budgeted: 60000, actual: 45000 },
      { id: "c9", description: "LED & Lighting", category: "Materials", budgeted: 80000, actual: 0 },
      { id: "c10", description: "Installation Labor", category: "Labor", budgeted: 100000, actual: 0 },
    ],
    taxRate: 12,
  },
  {
    id: "p3",
    name: "Product Launch Stage",
    client: "TechVibe Corp",
    type: "Stage Design & Build",
    status: "For Approval",
    deadline: "2025-07-30",
    progress: 80,
    teamMemberIds: ["tm2", "tm4", "tm5"],
    costItems: [
      { id: "c11", description: "Stage Platform & Trussing", category: "Materials", budgeted: 350000, actual: 340000 },
      { id: "c12", description: "Audio/Visual Equipment Rental", category: "Materials", budgeted: 200000, actual: 195000 },
      { id: "c13", description: "3D Stage Visualization", category: "3D Rendering", budgeted: 70000, actual: 70000 },
      { id: "c14", description: "Fabrication & Assembly", category: "Labor", budgeted: 180000, actual: 175000 },
      { id: "c15", description: "Transport & Setup", category: "Logistics", budgeted: 60000, actual: 55000 },
    ],
    taxRate: 12,
  },
]

export const tasks: Task[] = [
  // PHILcon 2025 Booth tasks
  { id: "t1", name: "Finalize booth layout (1800x900x438cm)", assigneeId: "tm1", dueDate: "2025-06-20", priority: "high", category: "Concept", status: "done", projectId: "p1" },
  { id: "t2", name: "3D model - main structure", assigneeId: "tm2", dueDate: "2025-07-01", priority: "high", category: "3D Modeling", status: "in-progress", projectId: "p1" },
  { id: "t3", name: "Render client walkthrough video", assigneeId: "tm2", dueDate: "2025-07-10", priority: "medium", category: "Rendering", status: "todo", projectId: "p1" },
  { id: "t4", name: "Design signage & brand panels", assigneeId: "tm3", dueDate: "2025-07-05", priority: "medium", category: "Concept", status: "in-progress", projectId: "p1" },
  { id: "t5", name: "Client approval - final design", assigneeId: "tm5", dueDate: "2025-07-15", priority: "high", category: "Client Approval", status: "todo", projectId: "p1" },
  { id: "t6", name: "Fabricate steel framework", assigneeId: "tm4", dueDate: "2025-08-01", priority: "medium", category: "Fabrication", status: "todo", projectId: "p1" },
  { id: "t7", name: "On-site installation", assigneeId: "tm4", dueDate: "2025-09-10", priority: "high", category: "Installation", status: "todo", projectId: "p1" },
  // Holiday Window Display tasks
  { id: "t8", name: "Mood board & concept sketches", assigneeId: "tm3", dueDate: "2025-08-15", priority: "medium", category: "Concept", status: "in-progress", projectId: "p2" },
  { id: "t9", name: "3D scene modeling", assigneeId: "tm2", dueDate: "2025-09-01", priority: "low", category: "3D Modeling", status: "todo", projectId: "p2" },
  { id: "t10", name: "Client presentation", assigneeId: "tm5", dueDate: "2025-09-15", priority: "medium", category: "Client Approval", status: "todo", projectId: "p2" },
  // Product Launch Stage tasks
  { id: "t11", name: "Stage design concept", assigneeId: "tm2", dueDate: "2025-06-15", priority: "high", category: "Concept", status: "done", projectId: "p3" },
  { id: "t12", name: "3D stage render", assigneeId: "tm2", dueDate: "2025-06-25", priority: "high", category: "Rendering", status: "done", projectId: "p3" },
  { id: "t13", name: "Client sign-off on design", assigneeId: "tm5", dueDate: "2025-07-05", priority: "high", category: "Client Approval", status: "review", projectId: "p3" },
  { id: "t14", name: "Fabricate stage platform", assigneeId: "tm4", dueDate: "2025-07-20", priority: "medium", category: "Fabrication", status: "in-progress", projectId: "p3" },
  { id: "t15", name: "Setup & installation", assigneeId: "tm4", dueDate: "2025-07-28", priority: "high", category: "Installation", status: "todo", projectId: "p3" },
]

export const calendarEvents: CalendarEvent[] = [
  { id: "e1", title: "PHILcon Booth - Design Review", date: "2025-07-01", type: "meeting", projectId: "p1" },
  { id: "e2", title: "PHILcon Booth - Client Walkthrough", date: "2025-07-10", type: "deliverable", projectId: "p1" },
  { id: "e3", title: "PHILcon Booth - Client Approval Deadline", date: "2025-07-15", type: "deadline", projectId: "p1" },
  { id: "e4", title: "PHILcon Booth - Fabrication Start", date: "2025-08-01", type: "deadline", projectId: "p1" },
  { id: "e5", title: "PHILcon Booth - Installation", date: "2025-09-10", type: "installation", projectId: "p1" },
  { id: "e6", title: "Holiday Display - Concept Review", date: "2025-08-15", type: "meeting", projectId: "p2" },
  { id: "e7", title: "Holiday Display - Client Presentation", date: "2025-09-15", type: "deliverable", projectId: "p2" },
  { id: "e8", title: "Holiday Display - Installation", date: "2025-11-15", type: "installation", projectId: "p2" },
  { id: "e9", title: "TechVibe Stage - Client Sign-off", date: "2025-07-05", type: "deadline", projectId: "p3" },
  { id: "e10", title: "TechVibe Stage - Setup", date: "2025-07-28", type: "installation", projectId: "p3" },
  { id: "e11", title: "TechVibe Stage - Event Day", date: "2025-07-30", type: "deadline", projectId: "p3" },
  { id: "e12", title: "Team Standup", date: "2025-07-07", type: "meeting", projectId: "p1" },
  { id: "e13", title: "Team Standup", date: "2025-07-14", type: "meeting", projectId: "p1" },
]

export const notifications: Notification[] = [
  { id: "n1", message: "Client Approval Deadline for PHILcon Booth is in 3 days", type: "due-soon", timestamp: "2025-07-12T09:00:00", read: false },
  { id: "n2", message: "Raf completed 3D model - main structure", type: "completed", timestamp: "2025-07-01T16:30:00", read: false },
  { id: "n3", message: "You have been assigned to 'Render client walkthrough video'", type: "assignment", timestamp: "2025-06-30T10:00:00", read: true },
  { id: "n4", message: "Fabrication deadline for stage platform is approaching", type: "due-soon", timestamp: "2025-07-18T08:00:00", read: false },
  { id: "n5", message: "Joy completed mood board & concept sketches", type: "completed", timestamp: "2025-06-28T14:00:00", read: true },
]

export const activityFeed: ActivityItem[] = [
  { id: "a1", user: "Raf Dela Cruz", action: "completed", target: "3D model - main structure", timestamp: "2 hours ago" },
  { id: "a2", user: "Joy Reyes", action: "moved to In Progress", target: "Design signage & brand panels", timestamp: "3 hours ago" },
  { id: "a3", user: "Mika Santos", action: "created task", target: "On-site installation", timestamp: "5 hours ago" },
  { id: "a4", user: "Carlo Tan", action: "started working on", target: "Fabricate stage platform", timestamp: "Yesterday" },
  { id: "a5", user: "Anna Cruz", action: "added comment on", target: "Client sign-off on design", timestamp: "Yesterday" },
  { id: "a6", user: "Raf Dela Cruz", action: "completed", target: "3D stage render", timestamp: "2 days ago" },
]

export function getTeamMember(id: string): TeamMember | undefined {
  return teamMembers.find((m) => m.id === id)
}

export function getProjectTasks(projectId: string): Task[] {
  return tasks.filter((t) => t.projectId === projectId)
}

export function getProjectTeam(project: Project): TeamMember[] {
  return project.teamMemberIds.map((id) => getTeamMember(id)).filter(Boolean) as TeamMember[]
}

export function getMemberTasks(memberId: string): Task[] {
  return tasks.filter((t) => t.assigneeId === memberId)
}

export function getEventsForDate(dateStr: string): CalendarEvent[] {
  return calendarEvents.filter((e) => e.date === dateStr)
}
