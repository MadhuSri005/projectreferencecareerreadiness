import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";

const questions = [
  {
    q: "What does API stand for?",
    options: ["Application Programming Interface", "Applied Program Integration", "Application Process Interface", "Applied Programming Integration"],
    answer: 0,
  },
  {
    q: "Which data structure uses FIFO?",
    options: ["Stack", "Queue", "Tree", "Graph"],
    answer: 1,
  },
  {
    q: "What is the time complexity of binary search?",
    options: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
    answer: 2,
  },
  {
    q: "Which protocol is used for secure web browsing?",
    options: ["HTTP", "FTP", "HTTPS", "SMTP"],
    answer: 2,
  },
  {
    q: "What does SQL stand for?",
    options: ["Simple Query Language", "Structured Query Language", "Standard Query Logic", "Sequential Query Language"],
    answer: 1,
  },
  {
    q: "Which CSS property controls element spacing outside the border?",
    options: ["padding", "margin", "border-spacing", "gap"],
    answer: 1,
  },
  {
    q: "What is a closure in JavaScript?",
    options: [
      "A way to close browser tabs",
      "A function with access to its outer scope",
      "A method to end loops",
      "A type of error handling",
    ],
    answer: 1,
  },
  {
    q: "Which HTTP method is idempotent?",
    options: ["POST", "PATCH", "GET", "None of the above"],
    answer: 2,
  },
];

export default function AptitudeTest() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent(current + 1);
    }
  };

  const reset = () => {
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setFinished(false);
  };

  const score = answers.filter((a, i) => a === questions[i].answer).length;
  const percentage = Math.round((score / questions.length) * 100);

  if (finished) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Aptitude Test</h1>
          <p className="text-muted-foreground mt-1">Assessment complete!</p>
        </div>

        <Card className="glass max-w-lg mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 glow">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Your Score</CardTitle>
            <CardDescription>
              You got {score} out of {questions.length} correct
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <span className="text-5xl font-bold gradient-text">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-4" />

            <div className="space-y-2">
              {questions.map((q, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {answers[i] === q.answer ? (
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive shrink-0" />
                  )}
                  <span className="truncate">{q.q}</span>
                </div>
              ))}
            </div>

            <Button onClick={reset} variant="secondary" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" /> Retake Test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Aptitude Test</h1>
        <p className="text-muted-foreground mt-1">Test your technical knowledge</p>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Question {current + 1} of {questions.length}</span>
        <Progress value={((current + 1) / questions.length) * 100} className="flex-1 h-2" />
      </div>

      <Card className="glass max-w-lg mx-auto">
        <CardHeader>
          <Badge variant="outline" className="w-fit mb-2">Question {current + 1}</Badge>
          <CardTitle className="text-lg">{q.q}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                selected === i
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          ))}
          <Button onClick={handleNext} disabled={selected === null} className="w-full mt-4">
            {current + 1 >= questions.length ? "Finish" : "Next"} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
