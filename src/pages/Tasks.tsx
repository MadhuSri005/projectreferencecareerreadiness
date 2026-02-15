import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";

export default function Tasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newTask, setNewTask] = useState("");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const MAX_TASK_TITLE_LENGTH = 500;

  const addTask = useMutation({
    mutationFn: async () => {
      const trimmed = newTask.trim();
      if (!trimmed) return;
      if (trimmed.length > MAX_TASK_TITLE_LENGTH) {
        throw new Error(`Task title must be under ${MAX_TASK_TITLE_LENGTH} characters.`);
      }
      const { error } = await supabase.from("tasks").insert({
        user_id: user!.id,
        title: trimmed,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setNewTask("");
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const next = status === "completed" ? "pending" : status === "pending" ? "in_progress" : "completed";
      const { error } = await supabase.from("tasks").update({ status: next }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const statusIcon: Record<string, JSX.Element> = {
    pending: <Circle className="w-4 h-4 text-muted-foreground" />,
    in_progress: <Clock className="w-4 h-4 text-warning" />,
    completed: <CheckCircle2 className="w-4 h-4 text-success" />,
  };

  const statusBadge: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    in_progress: "bg-warning/10 text-warning border-warning/20",
    completed: "bg-success/10 text-success border-success/20",
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-muted-foreground mt-1">Track your project tasks and assignments</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask.mutate()}
          className="flex-1"
          maxLength={MAX_TASK_TITLE_LENGTH}
        />
        <Button onClick={() => addTask.mutate()} disabled={!newTask.trim() || addTask.isPending}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">All Tasks ({tasks?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks && tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => toggleTask.mutate({ id: task.id, status: task.status })}
                >
                  {statusIcon[task.status]}
                  <span className={`flex-1 text-sm ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </span>
                  <Badge variant="outline" className={statusBadge[task.status]}>
                    {task.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No tasks yet. Add one above!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
