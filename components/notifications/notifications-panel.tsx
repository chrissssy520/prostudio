"use client"

import { Clock, CheckCircle2, UserPlus, Bell, Check, Trash2, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAppData } from "@/hooks/useAppData"
import { markNotificationRead } from "@/lib/firebaseService"
import { deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string; label: string }> = {
  "due-soon": { icon: Clock, color: "text-primary", bg: "bg-primary/10", label: "Due Soon" },
  completed: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Completed" },
  assignment: { icon: UserPlus, color: "text-blue-400", bg: "bg-blue-400/10", label: "New Assignment" },
}

export function NotificationsPanel() {
  const { notifications } = useAppData()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id)
  }

  const handleMarkAllRead = async () => {
    for (const n of notifications.filter(n => !n.read)) {
      await markNotificationRead(n.id)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteDoc(doc(db, "notifications", id))
    } catch (error) {
      console.error("Error deleting notification:", error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2 border-border text-foreground bg-secondary">
            <Check className="h-3.5 w-3.5" /> Mark all read
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2 max-w-2xl">
        {notifications.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">No notifications.</p>
        )}
        {notifications.map((notif) => {
          const config = typeConfig[notif.type] || typeConfig["due-soon"]
          return (
            <Card key={notif.id} className={`bg-card border-border transition-colors group ${!notif.read ? "border-l-2 border-l-primary" : ""}`}>
              <CardContent className="flex items-start gap-4 p-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${config.bg}`}>
                  <config.icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!notif.read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {notif.message}
                    </p>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${config.color} border-current/30`}>
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(notif.timestamp), "MMM d, h:mm a")}
                    </span>
                    {!notif.read && (
                      <button onClick={() => handleMarkRead(notif.id)} className="text-xs text-primary hover:underline">
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
                {/* DELETE BUTTON */}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 p-1"
                >
                  {deletingId === notif.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}