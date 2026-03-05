"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { AppShell } from "@/components/app-shell"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login") // Pag walang user, punta sa login
      } else {
        setLoading(false) // Pag meron, ipakita ang dashboard
      }
    })
    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <p className="animate-pulse font-mono">Verifying Admin Access...</p>
      </div>
    )
  }

  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  )
}