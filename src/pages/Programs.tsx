import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Clock, BarChart3, DollarSign, Loader2 } from "lucide-react";

export default function Programs() {
  const { role, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: programs, isLoading } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const { data } = await supabase.from("programs").select("*").order("created_at");
      return data || [];
    },
  });

  const { data: enrollments } = useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const { data } = await supabase.from("enrollments").select("*");
      return data || [];
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async (programId: string) => {
      const { error } = await supabase.from("enrollments").insert({
        user_id: user!.id,
        program_id: programId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast({ title: "Enrolled!", description: "You've been enrolled in the program." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const isEnrolled = (programId: string) =>
    enrollments?.some((e) => e.program_id === programId);

  const levelColor: Record<string, string> = {
    Beginner: "bg-success/10 text-success border-success/20",
    Intermediate: "bg-warning/10 text-warning border-warning/20",
    Advanced: "bg-destructive/10 text-destructive border-destructive/20",
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Programs</h1>
        <p className="text-muted-foreground mt-1">Browse and enroll in career readiness programs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs?.map((program, i) => (
          <Card key={program.id} className="glass hover:border-primary/30 transition-all animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="outline" className={levelColor[program.level || "Beginner"]}>
                  {program.level}
                </Badge>
              </div>
              <CardTitle className="text-lg">{program.name}</CardTitle>
              <CardDescription>{program.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {program.duration}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> ${program.price}</span>
              </div>
              {role !== "admin" && (
                <Button
                  className="w-full"
                  variant={isEnrolled(program.id) ? "secondary" : "default"}
                  disabled={isEnrolled(program.id) || enrollMutation.isPending}
                  onClick={() => enrollMutation.mutate(program.id)}
                >
                  {enrollMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isEnrolled(program.id) ? "Enrolled" : "Enroll Now"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
