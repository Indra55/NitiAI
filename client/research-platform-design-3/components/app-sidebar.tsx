"use client"
import {
  BookOpen,
  Search,
  LayoutDashboard,
  History,
  Users,
  LineChart,
  BrainCircuit,
  Bookmark,
  Upload,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const getNavItems = (role: "admin" | "student" | null) => {
  if (role === "admin") {
    return [
      {
        title: "Administration",
        items: [
          {
            title: "Insights",
            url: "/",
            icon: LayoutDashboard,
          },
          {
            title: "Upload Repository",
            url: "/upload",
            icon: Upload,
          },
          {
            title: "Ecosystem Analytics",
            url: "/analytics",
            icon: LineChart,
          },
        ],
      },
      {
        title: "Management",
        items: [
          {
            title: "All Publications",
            url: "/publications",
            icon: BookOpen,
          },
          {
            title: "Researchers",
            url: "/collaborators",
            icon: Users,
          },
        ],
      },
    ]
  }

  // Student view
  return [
    {
      title: "Exploration",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: LayoutDashboard,
        },
        {
          title: "Semantic Discovery",
          url: "/search",
          icon: Search,
        },
      ],
    },
    {
      title: "Research",
      items: [
        {
          title: "Publications",
          url: "/publications",
          icon: BookOpen,
        },
        {
          title: "Bookmarks",
          url: "/bookmarks",
          icon: Bookmark,
        },
        {
          title: "Lifecycle",
          url: "/lifecycle",
          icon: History,
        },
      ],
    },
    {
      title: "Network & Impact",
      items: [
        {
          title: "Active Collaborators",
          url: "/collaborators",
          icon: Users,
        },
        {
          title: "Intelligence Analytics",
          url: "/analytics",
          icon: LineChart,
        },
      ],
    },
  ]
}

export function AppSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const navMain = getNavItems(user?.role || null)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="h-16 border-b border-sidebar-border flex items-center px-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BrainCircuit className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-serif font-bold text-lg tracking-tight">Eidos</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              Research Intel
            </span>
          </div>
        </div>
        <div className="group-data-[collapsible=icon]:hidden">
          <ThemeToggle />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="font-serif italic text-xs tracking-wider opacity-60">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.url}
                      className="transition-all duration-200 hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/20 data-[active=true]:text-primary"
                    >
                      <a href={item.url}>
                        <item.icon />
                        <span className="font-medium">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="px-0 data-[state=open]:bg-sidebar-accent">
                  <Avatar className="h-8 w-8 rounded-lg border border-primary/20">
                    <AvatarImage src={user?.avatar || "/abstract-profile.png"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-serif">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                    <span className="font-medium text-sm">{user?.name || "Guest User"}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {user?.role || "Not logged in"}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" side="top">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
