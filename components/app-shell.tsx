"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "../hooks/useAuth"
import { useAppData } from "../hooks/useAppData"
import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  Users,
  Bell,
  Menu,
  Hexagon,
  LogOut,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const baseNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/team", label: "Team", icon: Users },
  { href: "/notifications", label: "Notifications", icon: Bell },
]

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const router = useRouter()
  const { user } = useAuth()
  const { notifications } = useAppData()

  // ✅ Unread count only
  const unreadCount = notifications.filter((n) => !n.read).length

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const isAdmin = user?.email === "admin@example.com"
  const items = [...baseNavItems]
  if (isAdmin) {
    items.push({ href: "/admin", label: "Admin", icon: Settings })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <Hexagon className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">ProStudio</h1>
          <p className="text-[11px] text-muted-foreground font-medium tracking-wider uppercase">Project Planner</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            // ✅ Only show badge for notifications, only when there are unread
            const badgeCount = item.href === "/notifications" ? unreadCount : 0
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
                {badgeCount > 0 && (
                  <Badge
                    className={cn(
                      "ml-auto h-5 min-w-5 rounded-full px-1.5 text-[10px] font-bold",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {badgeCount}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Profile + Logout */}
      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {user?.displayName
                ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase()
                : user?.email
                ? user.email[0].toUpperCase()
                : "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.displayName || user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-tighter">
                {isAdmin ? "Admin" : "Project Manager"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 md:hidden text-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0 bg-sidebar border-border">
          <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 pt-16 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}