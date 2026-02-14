import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users } from "lucide-react";

export default function AdminUsers() {
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: roles } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("*");
      return data || [];
    },
  });

  const getRole = (userId: string) => roles?.find((r) => r.user_id === userId)?.role || "student";

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">View and manage all registered users</p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> All Users ({profiles?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profiles && profiles.length > 0 ? (
            <div className="space-y-2">
              {profiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                      {p.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.full_name || "Unnamed"}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getRole(p.id) === "admin" ? "bg-primary/10 text-primary border-primary/20" : ""}>
                      {getRole(p.id)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No users yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
