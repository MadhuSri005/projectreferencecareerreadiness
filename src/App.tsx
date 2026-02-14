import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Programs from "./pages/Programs";
import Tasks from "./pages/Tasks";
import Payments from "./pages/Payments";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import AptitudeTest from "./pages/AptitudeTest";
import AdminUsers from "./pages/AdminUsers";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { role, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/programs" element={<ProtectedRoute><Programs /></ProtectedRoute>} />
            <Route path="/dashboard/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/dashboard/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/dashboard/resume" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
            <Route path="/dashboard/aptitude" element={<ProtectedRoute><AptitudeTest /></ProtectedRoute>} />
            <Route path="/dashboard/users" element={<ProtectedRoute><AdminRoute><AdminUsers /></AdminRoute></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
