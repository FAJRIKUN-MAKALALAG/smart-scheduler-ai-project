
import { NavLink, useLocation } from "react-router-dom";
import { Calendar, Home, Settings as Cog, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

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
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

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
      {/* USER PROFILE & LOGOUT */}
      {user && (
        <div className="flex flex-col gap-3 items-center border-t pt-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 rounded-full p-2">
              <User className="w-6 h-6 text-primary" />
            </span>
            <span className="text-md font-medium">{user.email ?? "User"}</span>
          </div>
          <button
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </aside>
  );
}
