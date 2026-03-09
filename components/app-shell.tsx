"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  Users,
  Bell,
  Menu,
  LogOut,
} from "lucide-react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAppData } from "@/hooks/useAppData"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/team", label: "Team", icon: Users },
  { href: "/notifications", label: "Notifications", icon: Bell },
]

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { notifications } = useAppData()
  const unreadCount = notifications.filter((n) => !n.read).length
  const router = useRouter()

  async function handleLogout() {
    await signOut(auth)
    router.push("/login")
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center px-5 py-4 border-b border-border">
        <Image
          src="/logo1.png"
          alt="BrainSells Integrated"
          width={160}
          height={48}
          className="object-contain"
          priority
        />
      </div>

      {/* Nav links */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            const isNotif = item.href === "/notifications"
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
                {isNotif && unreadCount > 0 && (
                  <Badge
                    className={cn(
                      "ml-auto h-5 min-w-5 rounded-full px-1.5 text-[10px] font-bold",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User + Footer */}
      <div className="border-t border-border px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
            CO
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">ADMIN</p>
            <p className="text-xs text-muted-foreground truncate"></p>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-red-400 transition-colors p-1 rounded-md hover:bg-red-400/10"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/40 text-center leading-tight">
          Designed & built by{" "}
          <span className="text-muted-foreground/60 font-medium">Christian Kho Aler</span>
          <br />BrainSells © 2026
        </p>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
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