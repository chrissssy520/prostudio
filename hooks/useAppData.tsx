"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import {
  subscribeToProjects,
  subscribeToTasks,
  subscribeToTeamMembers,
  subscribeToCalendarEvents,
  subscribeToNotifications,
  subscribeToActivity,
  seedDatabase,
} from "@/lib/firebaseService"
import {
  teamMembers as initialTeamMembers,
  calendarEvents as initialEvents,
  notifications as initialNotifications,
  type Project,
  type Task,
  type TeamMember,
  type CalendarEvent,
  type Notification,
  type ActivityItem,
} from "@/lib/data"

interface AppDataContextType {
  projects: Project[]
  tasks: Task[]
  teamMembers: TeamMember[]
  calendarEvents: CalendarEvent[]
  notifications: Notification[]
  activity: ActivityItem[]
  loading: boolean
}

const AppDataContext = createContext<AppDataContextType>({
  projects: [],
  tasks: [],
  teamMembers: [],
  calendarEvents: [],
  notifications: [],
  activity: [],
  loading: true,
})

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Seed ONLY teamMembers, calendar, notifications — NOT projects/tasks
    seedDatabase([], [], initialTeamMembers, initialEvents, initialNotifications)
      .catch(console.error)

    const unsubProjects = subscribeToProjects(setProjects)
    const unsubTasks = subscribeToTasks(setTasks)
    const unsubMembers = subscribeToTeamMembers(setTeamMembers)
    const unsubEvents = subscribeToCalendarEvents(setCalendarEvents)
    const unsubNotifs = subscribeToNotifications(setNotifications)
    const unsubActivity = subscribeToActivity(setActivity)

    setLoading(false)

    return () => {
      unsubProjects()
      unsubTasks()
      unsubMembers()
      unsubEvents()
      unsubNotifs()
      unsubActivity()
    }
  }, [])

  return (
    <AppDataContext.Provider value={{ projects, tasks, teamMembers, calendarEvents, notifications, activity, loading }}>
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  return useContext(AppDataContext)
}