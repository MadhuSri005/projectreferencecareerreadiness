import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckSquare, CreditCard, TrendingUp, Users, FileText } from "lucide-react";

export default function Dashboard() {
  const { role, user, profile } = useAuth();

  const { data: enrollments } = useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const { data } = await supabase.from("enrollments").select("*");
      return data || [];
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*");
      return data || [];
    },
  });

  const { data: payments } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data } = await supabase.from("payments").select("*");
      return data || [];
    },
  });

  const completedTasks = tasks?.filter((t) => t.status === "completed").length || 0;
  const totalPaid = payments?.filter((p) => p.status === "completed").reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  const stats = role === "admin"
    ? [
        { label: "Total Enrollments", value: enrollments?.length || 0, icon: Users, color: "text-primary" },
        { label: "Active Tasks", value: tasks?.filter((t) => t.status !== "completed").length || 0, icon: CheckSquare, color: "text-warning" },
        { label: "Completed Tasks", value: completedTasks, icon: TrendingUp, color: "text-success" },
        { label: "Revenue", value: `$${totalPaid}`, icon: CreditCard, color: "text-info" },
      ]
    : [
        { label: "My Programs", value: enrollments?.length || 0, icon: BookOpen, color: "text-primary" },
        { label: "Pending Tasks", value: tasks?.filter((t) => t.status === "pending").length || 0, icon: CheckSquare, color: "text-warning" },
        { label: "Completed", value: completedTasks, icon: TrendingUp, color: "text-success" },
        { label: "Payments", value: `$${totalPaid}`, icon: CreditCard, color: "text-info" },
      ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, <span className="gradient-text">{profile?.full_name || "User"}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          {role === "admin" ? "System overview and monitoring" : "Track your career readiness progress"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="glass animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks && tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${task.status === "completed" ? "bg-success" : task.status === "in_progress" ? "bg-warning" : "bg-muted-foreground"}`} />
                    <span className="text-sm">{task.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{task.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No tasks yet. Enroll in a program to get started!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
