import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2, Sparkles, Target, TrendingUp } from "lucide-react";

function extractSkills(text: string): string[] {
  const skillKeywords = [
    "javascript", "typescript", "react", "angular", "vue", "node", "python", "java", "c++", "c#",
    "sql", "nosql", "mongodb", "postgresql", "mysql", "aws", "azure", "gcp", "docker", "kubernetes",
    "git", "ci/cd", "agile", "scrum", "rest", "graphql", "html", "css", "sass", "tailwind",
    "figma", "photoshop", "illustrator", "sketch", "xd", "machine learning", "deep learning",
    "data analysis", "data science", "tensorflow", "pytorch", "pandas", "numpy", "excel",
    "power bi", "tableau", "communication", "leadership", "teamwork", "problem solving",
    "project management", "devops", "linux", "networking", "security", "blockchain",
    "api", "microservices", "serverless", "nextjs", "express", "django", "flask", "spring",
    "redux", "webpack", "vite", "testing", "jest", "cypress", "selenium",
  ];
  const lower = text.toLowerCase();
  return skillKeywords.filter((skill) => lower.includes(skill));
}

function matchSkills(resumeSkills: string[], jobSkills: string[]): { matched: string[]; missing: string[]; score: number } {
  const matched = jobSkills.filter((s) => resumeSkills.includes(s));
  const missing = jobSkills.filter((s) => !resumeSkills.includes(s));
  const score = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 0;
  return { matched, missing, score };
}

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<{ matched: string[]; missing: string[]; score: number; resumeSkills: string[] } | null>(null);

  const { data: analyses } = useQuery({
    queryKey: ["resume_analyses"],
    queryFn: async () => {
      const { data } = await supabase.from("resume_analyses").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const resumeSkills = extractSkills(resumeText);
      const jobSkills = extractSkills(jobDescription);
      const { matched, missing, score } = matchSkills(resumeSkills, jobSkills);

      const { error } = await supabase.from("resume_analyses").insert({
        user_id: user!.id,
        resume_text: resumeText,
        job_description: jobDescription,
        extracted_skills: resumeSkills as any,
        matched_skills: matched as any,
        match_score: score,
      });
      if (error) throw error;

      setResult({ matched, missing, score, resumeSkills });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume_analyses"] });
      toast({ title: "Analysis complete!", description: "Your resume has been analyzed." });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Resume Analyzer</h1>
        <p className="text-muted-foreground mt-1">Compare your resume against job descriptions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Resume Text
            </CardTitle>
            <CardDescription>Paste your resume content below</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Job Description
            </CardTitle>
            <CardDescription>Paste the target job description</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={() => analyzeMutation.mutate()}
        disabled={!resumeText.trim() || !jobDescription.trim() || analyzeMutation.isPending}
        className="w-full sm:w-auto"
      >
        {analyzeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
        Analyze Match
      </Button>

      {result && (
        <Card className="glass animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Match Score</span>
                <span className="text-2xl font-bold gradient-text">{result.score}%</span>
              </div>
              <Progress value={result.score} className="h-3" />
            </div>

            <div>
              <Label className="text-sm font-medium">Your Skills ({result.resumeSkills.length})</Label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {result.resumeSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-success">Matched Skills ({result.matched.length})</Label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {result.matched.map((skill) => (
                  <Badge key={skill} className="text-xs bg-success/10 text-success border-success/20">{skill}</Badge>
                ))}
              </div>
            </div>

            {result.missing.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-destructive">Missing Skills ({result.missing.length})</Label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {result.missing.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs text-destructive border-destructive/30">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {analyses && analyses.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Previous Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analyses.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{a.match_score}% match</span>
                    <Progress value={Number(a.match_score)} className="w-20 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
