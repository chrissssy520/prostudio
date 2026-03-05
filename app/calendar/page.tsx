"use client"

import { AppShell } from "@/components/app-shell"
import { TeamCalendar } from "@/components/calendar/team-calendar"

export default function CalendarPage() {
  return (
    <AppShell>
      <TeamCalendar />
    </AppShell>
  )
}
