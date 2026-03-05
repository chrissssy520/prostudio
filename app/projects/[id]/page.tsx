"use client"

import { use } from "react"
import { AppShell } from "@/components/app-shell"
import { ProjectDetail } from "@/components/projects/project-detail"

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <AppShell>
      <ProjectDetail projectId={id} />
    </AppShell>
  )
}
