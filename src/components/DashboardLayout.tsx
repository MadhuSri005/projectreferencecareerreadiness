import { ReactNode, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, LayoutDashboard, BookOpen, CheckSquare,
  CreditCard, FileText, Brain, Users, LogOut, Menu, X,
} from "lucide-react";

const studentNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Programs", icon: BookOpen, path: "/dashboard/programs" },
  { label: "My Tasks", icon: CheckSquare, path: "/dashboard/tasks" },
  { label: "Payments", icon: CreditCard, path: "/dashboard/payments" },
  { label: "Resume Analyzer", icon: FileText, path: "/dashboard/resume" },
  { label: "Aptitude Test", icon: Brain, path: "/dashboard/aptitude" },
];

const adminNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Programs", icon: BookOpen, path: "/dashboard/programs" },
  { label: "Users", icon: Users, path: "/dashboard/users" },
  { label: "All Tasks", icon: CheckSquare, path: "/dashboard/tasks" },
  { label: "Payments", icon: CreditCard, path: "/dashboard/payments" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { signOut, profile, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = role === "admin" ? adminNav : studentNav;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col bg-sidebar border-r border-sidebar-border transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground">CareerReady</span>
          <button className="ml-auto lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/10 text-primary glow"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{profile?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground capitalize">{role || "student"}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-0">
        <header className="flex items-center gap-4 px-6 py-4 border-b border-border lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <span className="font-bold gradient-text">CareerReady</span>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
