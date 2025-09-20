import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, BookOpen, Loader2 } from "lucide-react";

const CareerSuggestions = () => {
  const [skills, setSkills] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!skills.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/.netlify/functions/career-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skills }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuggestions(data.suggestions);
      } else {
        console.error('API Error:', data.error);
        // Fallback to mock data
        setSuggestions([
          {
            title: "Software Engineer",
            match: "92%",
            description: "Build scalable applications and systems using your programming skills",
            skillsUsed: ["JavaScript", "React", "Problem Solving"],
            roadmap: ["Advanced React patterns", "Backend development", "System design"]
          },
          {
            title: "UX Designer",
            match: "85%",
            description: "Create intuitive user experiences combining technical and design skills",
            skillsUsed: ["Design Thinking", "User Research", "Frontend"],
            roadmap: ["Design systems", "User research methods", "Prototyping tools"]
          },
          {
            title: "Product Manager",
            match: "78%",
            description: "Lead product strategy leveraging technical understanding",
            skillsUsed: ["Communication", "Analysis", "Technical Knowledge"],
            roadmap: ["Product strategy", "Data analysis", "Stakeholder management"]
          }
        ]);
      }
    } catch (error) {
      console.error('Network Error:', error);
      // Fallback to mock data
      setSuggestions([
        {
          title: "Software Engineer",
          match: "92%",
          description: "Build scalable applications and systems using your programming skills",
          skillsUsed: ["JavaScript", "React", "Problem Solving"],
          roadmap: ["Advanced React patterns", "Backend development", "System design"]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Career Path Discovery
        </h2>
        <p className="text-muted-foreground text-lg">
          Share your skills and discover careers that match your potential
        </p>
      </div>

      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Your Skills & Experience
          </CardTitle>
          <CardDescription>
            List your skills, experiences, or paste your resume content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., JavaScript, React, problem-solving, teamwork, project management, data analysis..."
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="min-h-[120px] resize-none border-primary/20 focus:border-primary"
          />
          <Button 
            onClick={handleSubmit} 
            className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-feature"
            disabled={!skills.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Your Skills...
              </>
            ) : (
              "Discover Career Paths"
            )}
          </Button>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            Recommended Career Paths
          </h3>
          
          {suggestions.map((career, index) => (
            <Card key={index} className="shadow-card border-0 hover:shadow-feature transition-all duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{career.title}</CardTitle>
                    <CardDescription className="mt-1">{career.description}</CardDescription>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="bg-gradient-secondary text-white px-3 py-1"
                  >
                    {career.match} Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Skills You'll Use
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {career.skillsUsed.map((skill: string, i: number) => (
                      <Badge key={i} variant="outline" className="border-primary/30">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-secondary" />
                    Learning Roadmap
                  </h4>
                  <ul className="space-y-1">
                    {career.roadmap.map((step: string, i: number) => (
                      <li key={i} className="text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CareerSuggestions;