import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  getDocs,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Project, Task, TeamMember, CalendarEvent, Notification, ActivityItem } from "./data"

// ─── PROJECTS ────────────────────────────────────────────────────────────────

export function subscribeToProjects(callback: (projects: Project[]) => void) {
  const q = query(collection(db, "projects"), orderBy("createdAt", "desc"))
  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Project[]
    callback(projects)
  })
}

export async function addProject(project: Omit<Project, "id">) {
  return await addDoc(collection(db, "projects"), {
    ...project,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateProject(id: string, data: Partial<Project>) {
  await updateDoc(doc(db, "projects", id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteProject(id: string) {
  await deleteDoc(doc(db, "projects", id))
}

// ─── TASKS ───────────────────────────────────────────────────────────────────

export function subscribeToTasks(callback: (tasks: Task[]) => void) {
  const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"))
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Task[]
    callback(tasks)
  })
}

export async function addTask(task: Omit<Task, "id">) {
  const ref = await addDoc(collection(db, "tasks"), {
    ...task,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // ✅ Create notification when task is added
  await addDoc(collection(db, "notifications"), {
    message: `New task added: "${task.name}"`,
    type: "assignment",
    timestamp: new Date().toLocaleString(),
    read: false,
    createdAt: serverTimestamp(),
  })

  await logActivity(`Added task: ${task.name}`, task.assigneeId)
  return ref
}

export async function updateTask(id: string, data: Partial<Task>) {
  await updateDoc(doc(db, "tasks", id), { ...data, updatedAt: serverTimestamp() })
  if (data.status === "done") {
    await logActivity(`Completed task`, data.assigneeId || "")
    // ✅ Create notification when task is marked done
    await addDoc(collection(db, "notifications"), {
      message: `Task marked as done`,
      type: "completed",
      timestamp: new Date().toLocaleString(),
      read: false,
      createdAt: serverTimestamp(),
    })
  }
}

export async function deleteTask(id: string) {
  await deleteDoc(doc(db, "tasks", id))
}

// ─── TEAM MEMBERS ─────────────────────────────────────────────────────────────

export function subscribeToTeamMembers(callback: (members: TeamMember[]) => void) {
  const q = query(collection(db, "teamMembers"), orderBy("name", "asc"))
  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as TeamMember[]
    callback(members)
  })
}

export async function addTeamMember(member: Omit<TeamMember, "id">) {
  return await addDoc(collection(db, "teamMembers"), {
    ...member,
    createdAt: serverTimestamp(),
  })
}

export async function updateTeamMember(id: string, data: Partial<TeamMember>) {
  await updateDoc(doc(db, "teamMembers", id), data)
}

// ─── CALENDAR EVENTS ──────────────────────────────────────────────────────────

export function subscribeToCalendarEvents(callback: (events: CalendarEvent[]) => void) {
  const q = query(collection(db, "calendarEvents"), orderBy("date", "asc"))
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as CalendarEvent[]
    callback(events)
  })
}

export async function addCalendarEvent(event: Omit<CalendarEvent, "id">) {
  return await addDoc(collection(db, "calendarEvents"), {
    ...event,
    createdAt: serverTimestamp(),
  })
}

export async function deleteCalendarEvent(id: string) {
  await deleteDoc(doc(db, "calendarEvents", id))
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export function subscribeToNotifications(callback: (notifications: Notification[]) => void) {
  const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"))
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Notification[]
    callback(notifications)
  })
}

export async function markNotificationRead(id: string) {
  await updateDoc(doc(db, "notifications", id), { read: true })
}

// ─── ACTIVITY FEED ────────────────────────────────────────────────────────────

export function subscribeToActivity(callback: (activity: ActivityItem[]) => void) {
  const q = query(collection(db, "activity"), orderBy("createdAt", "desc"))
  return onSnapshot(q, (snapshot) => {
    const activity = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ActivityItem[]
    callback(activity)
  })
}

export async function logActivity(action: string, userId: string, target?: string) {
  await addDoc(collection(db, "activity"), {
    user: userId,
    action,
    target: target || "",
    timestamp: new Date().toLocaleString(),
    createdAt: serverTimestamp(),
  })
}

// ─── SEED DATABASE ────────────────────────────────────────────────────────────

export async function seedDatabase(
  initialProjects: Project[],
  initialTasks: Task[],
  initialTeamMembers: TeamMember[],
  initialEvents: CalendarEvent[],
  initialNotifications: Notification[]
) {
  const check = await getDocs(collection(db, "teamMembers"))
  if (!check.empty) {
    console.log("Already seeded")
    return
  }

  console.log("Seeding team data...")

  for (const member of initialTeamMembers) {
    await setDoc(doc(db, "teamMembers", member.id), { ...member, createdAt: serverTimestamp() })
  }

  for (const event of initialEvents) {
    await setDoc(doc(db, "calendarEvents", event.id), { ...event, createdAt: serverTimestamp() })
  }

  for (const notif of initialNotifications) {
    await setDoc(doc(db, "notifications", notif.id), { ...notif })
  }

  console.log("Team data seeded!")
}