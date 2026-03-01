import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen, Brain, FileText, CheckSquare, ArrowRight, Sparkles } from "lucide-react";
import { useEffect } from "react";

const features = [
  { icon: BookOpen, title: "Program Enrollment", desc: "Browse and enroll in career-focused programs" },
  { icon: CheckSquare, title: "Task Tracking", desc: "Manage assignments and track your progress" },
  { icon: FileText, title: "Resume Analysis", desc: "Match your skills against job descriptions" },
  { icon: Brain, title: "Aptitude Tests", desc: "Assess your technical knowledge" },
];

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(168_76%_42%/0.08),transparent_60%)]" />
        <nav className="relative max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="font-bold text-lg">Career Navigator</span>
          <Button variant="secondary" size="sm" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </nav>

        <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6 animate-fade-in">
            <Sparkles className="w-3 h-3" /> Career Readiness Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight animate-slide-up">
            Accelerate Your <span className="gradient-text">Career Growth</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto animate-slide-up" style={{ animationDelay: "100ms" }}>
            Enroll in programs, track projects, analyze your resume, and prove your skills — all in one platform.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Button size="lg" onClick={() => navigate("/auth")}>
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <Card key={i} className="glass hover:border-primary/30 transition-all animate-slide-up" style={{ animationDelay: `${i * 100 + 300}ms` }}>
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © 2026 CareerReady. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
