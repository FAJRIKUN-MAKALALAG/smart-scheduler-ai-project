
import { NavLink, useLocation } from "react-router-dom";
import { Calendar, Mic, Home, Settings as Cog } from "lucide-react";
import { cn } from "@/lib/utils";

const navs = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Home,
  },
  {
    name: "Kalender",
    path: "/calendar",
    icon: Calendar,
  },
  {
    name: "Pengaturan",
    path: "/settings",
    icon: Cog,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="bg-sidebar px-4 py-8 h-screen w-56 border-r flex flex-col gap-8 shadow-lg z-10">
      <div className="mb-6 flex flex-col items-center">
        <div className="text-2xl font-black tracking-tight">SCHEDULER AI</div>
        <div className="mt-1 text-xs text-muted-foreground opacity-70">by Fajrikun</div>
      </div>
      <nav className="flex flex-col gap-4">
        {navs.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium hover:bg-muted/70",
                isActive ? "bg-muted text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="flex-1" />
      <div className="border-t pt-3 text-xs text-muted-foreground text-center">
        <span className="opacity-60">Smart Scheduler AI Beta</span>
      </div>
    </aside>
  );
}
