import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Loader2, CheckCircle } from "lucide-react";

export default function Payments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProgram, setSelectedProgram] = useState("");

  const { data: enrollments } = useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const { data } = await supabase.from("enrollments").select("*, programs(*)");
      return data || [];
    },
  });

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data } = await supabase.from("payments").select("*, programs(name)").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const simulatePayment = useMutation({
    mutationFn: async () => {
      const enrollment = enrollments?.find((e) => e.program_id === selectedProgram);
      if (!enrollment) throw new Error("Not enrolled in this program");
      const program = enrollment.programs as any;
      const { error } = await supabase.from("payments").insert({
        user_id: user!.id,
        program_id: selectedProgram,
        amount: program.price,
        status: "completed",
        method: "simulation",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setSelectedProgram("");
      toast({ title: "Payment simulated!", description: "Payment has been recorded successfully." });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const alreadyPaid = (programId: string) =>
    payments?.some((p) => p.program_id === programId && p.status === "completed");

  const statusColor: Record<string, string> = {
    completed: "bg-success/10 text-success border-success/20",
    pending: "bg-warning/10 text-warning border-warning/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-1">Simulate payments for enrolled programs</p>
      </div>

      {enrollments && enrollments.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Simulate Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollments.map((e) => {
                      const prog = e.programs as any;
                      return (
                        <SelectItem key={e.program_id} value={e.program_id} disabled={alreadyPaid(e.program_id)}>
                          {prog?.name} — ${prog?.price} {alreadyPaid(e.program_id) ? "(Paid)" : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => simulatePayment.mutate()} disabled={!selectedProgram || simulatePayment.isPending}>
                {simulatePayment.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      {payment.status === "completed" ? <CheckCircle className="w-4 h-4 text-success" /> : <CreditCard className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{(payment.programs as any)?.name || "Program"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(payment.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">${payment.amount}</span>
                    <Badge variant="outline" className={statusColor[payment.status]}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No payments yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
