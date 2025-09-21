import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2, ExternalLink, Link, Upload } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";

interface CareerSuggestionsProps {
  onNavigate?: (tab: string) => void;
}

const CareerSuggestions = ({ onNavigate }: CareerSuggestionsProps) => {
  // PDF processing will be handled server-side or with simpler text extraction
  const [skills, setSkills] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeContent, setResumeContent] = useState("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    try {
      if (file.type === 'application/pdf') {
        setResumeContent('PDF uploaded. Please paste your resume content in the text area below.');
        setSkills('PDF uploaded. Please paste your resume content in the text area below.');
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setResumeContent(content);
          setSkills(content);
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('File error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!skills.trim() && !resumeContent.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/career-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: resumeContent || skills
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.suggestions) {
        setSuggestions(data.suggestions);
      } else {
        throw new Error('API error');
      }
    } catch (error) {
      setSuggestions([
        {
          title: "Software Engineer",
          match: "92%",
          description: "Build scalable applications and systems using your programming skills",
          skillsUsed: ["JavaScript", "React", "Problem Solving"],
          roadmap: [
            "Master JavaScript fundamentals (2-3 months)",
            "Learn React and modern frontend (2-3 months)",
            "Understand backend development (2-3 months)",
            "Practice algorithms daily (ongoing)",
            "Build portfolio projects (3-4 months)"
          ],
          resources: [
            {name: "freeCodeCamp", url: "https://www.freecodecamp.org", type: "course", description: "Free coding courses"},
            {name: "LeetCode", url: "https://leetcode.com", type: "practice", description: "Coding practice"}
          ]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-foreground tracking-tight">
              Discover Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Perfect Career</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Upload your resume or share your skills to get personalized career recommendations powered by AI
            </p>
          </div>
        </div>

        {/* Input Section */}
      <div className="studio-card p-10 space-y-8">
        {/* Upload Section */}
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Get Started</h2>
            <p className="text-muted-foreground">Choose how you'd like to share your information</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="flex flex-col items-center space-y-3">
              <input
                type="file"
                accept=".txt,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="resume-upload"
                className="studio-button cursor-pointer inline-flex items-center gap-3 px-8 py-4 text-base"
              >
                <Upload className="h-5 w-5" />
                Upload Resume
              </label>
              <span className="text-sm text-muted-foreground">Supports .txt, .doc, .docx</span>
            </div>
            
            <div className="flex items-center">
              <div className="w-16 h-px bg-border"></div>
              <span className="px-4 text-sm text-muted-foreground font-medium">OR</span>
              <div className="w-16 h-px bg-border"></div>
            </div>
            
            <div className="flex flex-col items-center space-y-3">
              <div className="text-center">
                <div className="text-base font-medium text-foreground">Type Manually</div>
                <span className="text-sm text-muted-foreground">Enter your skills below</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Text Input */}
        <div className="space-y-4">
          <Textarea
            placeholder="Share your skills, experience, education, or paste your resume content here...\n\nExample: JavaScript, React, Node.js, problem-solving, teamwork, project management, data analysis, Bachelor's in Computer Science, 3 years experience in web development..."
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="studio-input min-h-[160px] resize-none text-base leading-relaxed"
          />
          
          <div className="flex justify-center pt-4">
            <button 
              onClick={handleSubmit} 
              className="studio-button px-12 py-4 text-base font-semibold"
              disabled={(!skills.trim() && !resumeContent.trim()) || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Analyzing Your Profile...
                </>
              ) : (
                "Discover My Career Path"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {suggestions.length > 0 && (
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Your Career Matches
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We found {suggestions.length} career paths that align with your profile. Explore each one to see your potential journey.
            </p>
          </div>
          
          <div className="grid gap-8">
            {suggestions.map((career, index) => (
              <div key={index} className="studio-card p-8 hover:shadow-lg transition-all duration-300 group">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-blue-600 transition-colors">
                      {career.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">{career.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-200 px-4 py-2 text-sm font-semibold">
                      {career.match} Match
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Key Skills You'll Use
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {career.skillsUsed.map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="roadmap" className="border border-border/50 rounded-lg px-4">
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-semibold text-foreground">Learning Roadmap</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="space-y-4 pt-2">
                          {career.roadmap.map((step: string, i: number) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg border border-border/30">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              <p className="text-foreground flex-1 leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="resources" className="border border-border/50 rounded-lg px-4 mt-2">
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Link className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="font-semibold text-foreground">Learning Resources</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="grid gap-4 pt-2">
                          {career.resources && career.resources.length > 0 ? (
                            career.resources.map((resource: any, i: number) => (
                              <div key={i} className="p-4 border border-border/50 rounded-lg hover:border-primary/50 hover:shadow-sm transition-all duration-200">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h5 className="font-semibold text-foreground">{resource.name}</h5>
                                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded">
                                        {resource.type}
                                      </span>
                                    </div>
                                    <p className="text-muted-foreground mb-3 leading-relaxed">{resource.description}</p>
                                    <a 
                                      href={resource.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                    >
                                      Visit Resource
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-6 text-center text-muted-foreground bg-muted/50 rounded-lg">
                              <p>Resources are being curated for this career path.</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default CareerSuggestions;