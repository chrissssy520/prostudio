"use client"

import { AppShell } from "@/components/app-shell"
import { ProjectsList } from "@/components/projects/projects-list"

export default function ProjectsPage() {
  return (
    <AppShell>
      <ProjectsList />
    </AppShell>
  )
}
