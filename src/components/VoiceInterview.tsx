import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX, Play, Square, Briefcase } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Footer from "@/components/Footer";

interface VoiceInterviewProps {
  onNavigate?: (tab: string) => void;
}

const VoiceInterview = ({ onNavigate }: VoiceInterviewProps) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [recognition, setRecognition] = useState<any>(null);
  const [resumeContent, setResumeContent] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");
  const [showResumeInput, setShowResumeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        setIsListening(false);
        handleAnswerReceived(transcript);
      };

      recognitionInstance.onerror = () => setIsListening(false);
      recognitionInstance.onend = () => setIsListening(false);

      setRecognition(recognitionInstance);
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        let text = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          text += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }
        
        setResumeContent(text.trim());
      } else {
        const reader = new FileReader();
        reader.onload = (e) => setResumeContent(e.target?.result as string);
        reader.readAsText(file);
      }
    } catch (error) {
      setResumeContent('Error reading file. Please paste content manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (!isAudioEnabled) return;
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (isInterviewStarted && !currentQuestion.includes("Thank you for completing")) {
        setTimeout(() => startListening(), 1000);
      }
    };
    
    speechSynthesis.speak(utterance);
  };

  const startInterview = () => {
    if (!selectedRole) return;
    setShowResumeInput(true);
  };
  
  const beginInterview = async () => {
    if (!resumeContent.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/voice-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedRole,
          questionNumber: 0,
          resumeContent: resumeContent
        })
      });
      
      const data = await response.json();
      const message = data.question;
      
      setCurrentQuestion(message);
      setIsInterviewStarted(true);
      setShowResumeInput(false);
      
      setTimeout(() => speakText(message), 500);
      
    } catch (error) {
      const fallbackMessage = `Hello! Welcome to the ${selectedRole.replace('-', ' ')} interview. Let's get started with your background.`;
      setCurrentQuestion(fallbackMessage);
      setIsInterviewStarted(true);
      setShowResumeInput(false);
      setTimeout(() => speakText(fallbackMessage), 500);
    } finally {
      setIsLoading(false);
    }
  };

  const askNextQuestion = async (userAnswer?: string) => {
    try {
      if (questionCount >= 5) {
        const endMessage = "Thank you for completing the interview! You provided excellent insights. This concludes our session.";
        setCurrentQuestion(endMessage);
        setTimeout(() => speakText(endMessage), 500);
        setTimeout(() => {
          setIsInterviewStarted(false);
          setCurrentQuestion("");
          setQuestionCount(0);
        }, 5000);
        return;
      }
      
      let prompt = '';
      if (userAnswer) {
        prompt = `You are a ${selectedRole.replace('-', ' ')} interviewer.\n\nCandidate's background: ${resumeContent.substring(0, 400)}\n\nThey just said: "${userAnswer}"\n\nRespond conversationally by acknowledging their answer and asking ONE follow-up question. Keep under 40 words for voice.`;
      } else {
        prompt = `Generate a ${selectedRole.replace('-', ' ')} interview question based on: ${resumeContent.substring(0, 400)}\n\nAsk about their specific experience. Keep under 30 words for voice.`;
      }
      
      const response = await fetch('/api/voice-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedRole,
          questionNumber: questionCount,
          userAnswer: userAnswer,
          resumeContent: resumeContent
        })
      });
      
      const data = await response.json();
      const question = data.question || data.feedback;
      
      setCurrentQuestion(question);
      setTimeout(() => speakText(question), 500);
      
    } catch (error) {
      const fallbackQuestions = [
        "Tell me about a project you're proud of.",
        "What's your biggest professional achievement?",
        "How do you handle challenging situations?",
        "What motivates you in your work?"
      ];
      const fallback = fallbackQuestions[questionCount % fallbackQuestions.length];
      setCurrentQuestion(fallback);
      setTimeout(() => speakText(fallback), 500);
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      setTranscript("");
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleAnswerReceived = async (answer: string) => {
    setQuestionCount(prev => prev + 1);
    setTimeout(() => askNextQuestion(answer), 1500);
  };

  const endInterview = () => {
    setIsInterviewStarted(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentQuestion("");
    setQuestionCount(0);
    setTranscript("");
    setResumeContent("");
    setPortfolioLinks("");
    speechSynthesis.cancel();
    if (recognition) recognition.stop();
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const isWebSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="text-center space-y-6 mb-12">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-foreground tracking-tight">
              Practice with <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Voice AI</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Experience realistic voice-based interviews with AI that listens and responds naturally
            </p>
          </div>
        </div>

      {!isWebSpeechSupported && (
        <Alert>
          <AlertDescription>
            Voice recognition is not supported in your browser. Please use Chrome, Safari, or Edge for the best experience.
          </AlertDescription>
        </Alert>
      )}

      {!isInterviewStarted && !showResumeInput ? (
        <div className="studio-card p-10 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Setup Voice Interview</h2>
            <p className="text-muted-foreground">Configure your voice interview preferences</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">Interview Role</label>
              <Select onValueChange={setSelectedRole}>
                <SelectTrigger className="studio-input h-12 text-base">
                  <SelectValue placeholder="Choose your target role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="software-engineer">Software Engineer</SelectItem>
                  <SelectItem value="product-manager">Product Manager</SelectItem>
                  <SelectItem value="ux-designer">UX Designer</SelectItem>
                  <SelectItem value="data-scientist">Data Scientist</SelectItem>
                  <SelectItem value="marketing-manager">Marketing Manager</SelectItem>
                  <SelectItem value="sales-representative">Sales Representative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-6 bg-muted/50 rounded-xl border border-border/50">
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground">Audio Output</h4>
                <p className="text-sm text-muted-foreground">AI will speak questions aloud</p>
              </div>
              <button
                onClick={toggleAudio}
                className="p-3 rounded-lg border border-border/50 hover:bg-background/50 transition-colors"
              >
                {isAudioEnabled ? <Volume2 className="h-5 w-5 text-green-600" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
              </button>
            </div>
            
            <div className="pt-4">
              <button 
                onClick={startInterview}
                disabled={!selectedRole || !isWebSpeechSupported}
                className="studio-button w-full py-4 text-base"
              >
                Continue to Resume Upload
              </button>
            </div>
          </div>
        </div>
      ) : showResumeInput ? (
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Upload Resume & Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Resume File</label>
              <input
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileUpload}
                className="w-full p-2 border border-border/50 rounded-md bg-background/50"
                disabled={isLoading}
              />
              {isLoading && <p className="text-xs text-muted-foreground">Processing file...</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Portfolio/Project Links</label>
              <textarea
                placeholder="Paste your portfolio, GitHub, LinkedIn, or project links here..."
                value={portfolioLinks}
                onChange={(e) => setPortfolioLinks(e.target.value)}
                className="w-full min-h-[80px] p-3 border border-border/50 rounded-md resize-none bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Resume Content</label>
              <textarea
                placeholder="Upload a file above or paste your resume content here..."
                value={resumeContent}
                onChange={(e) => setResumeContent(e.target.value)}
                className="w-full min-h-[120px] p-3 border border-border/50 rounded-md resize-none bg-background/50"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowResumeInput(false)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={beginInterview}
                disabled={!resumeContent.trim() || isLoading}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              >
                {isLoading ? 'Processing...' : 'Analyze & Start'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className="bg-gradient-secondary text-white px-3 py-1">
              Question {questionCount + 1} • {selectedRole.replace('-', ' ').toUpperCase()}
            </Badge>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAudio}
                className="border-primary/30"
              >
                {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                onClick={endInterview}
                className="border-destructive/30 hover:border-destructive text-destructive"
              >
                <Square className="h-4 w-4 mr-2" />
                End Interview
              </Button>
            </div>
          </div>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {isSpeaking ? (
                  <>
                    <Volume2 className="h-5 w-5 text-primary animate-pulse" />
                    AI is asking...
                  </>
                ) : isListening ? (
                  <>
                    <Mic className="h-5 w-5 text-secondary animate-pulse" />
                    Listening for your answer...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 text-muted-foreground" />
                    Voice Interview
                  </>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {currentQuestion && (
                <div className="p-4 bg-gradient-subtle rounded-lg border border-primary/10">
                  <h3 className="font-medium mb-2 text-primary">Current Question:</h3>
                  <p className="text-foreground leading-relaxed">{currentQuestion}</p>
                </div>
              )}

              <div className="text-center">
                <div className={`w-24 h-24 mx-auto rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                  isListening 
                    ? 'border-secondary bg-secondary/10 animate-pulse' 
                    : isSpeaking
                    ? 'border-primary bg-primary/10 animate-pulse'
                    : 'border-muted bg-muted/50'
                }`}>
                  {isListening ? (
                    <Mic className="h-8 w-8 text-secondary" />
                  ) : isSpeaking ? (
                    <Volume2 className="h-8 w-8 text-primary" />
                  ) : (
                    <MicOff className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {isSpeaking ? "AI is speaking..." : 
                     isListening ? "Speak your answer now" :
                     "Waiting for next question"}
                  </p>
                  
                  {!isSpeaking && !isListening && (
                    <Button
                      onClick={startListening}
                      variant="outline"
                      className="border-secondary/30 hover:border-secondary"
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Start Speaking
                    </Button>
                  )}
                  
                  {isListening && (
                    <Button
                      onClick={stopListening}
                      variant="outline"
                      className="border-destructive/30 hover:border-destructive text-destructive"
                    >
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                </div>
              </div>

              {transcript && (
                <div className="p-4 bg-accent/50 rounded-lg border border-accent">
                  <h4 className="font-medium text-sm text-accent-foreground mb-2">Your Response:</h4>
                  <p className="text-sm text-accent-foreground">{transcript}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default VoiceInterview;