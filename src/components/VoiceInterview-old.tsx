import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX, Play, Square, Briefcase } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const VoiceInterview = () => {
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
  const [showResumeInput, setShowResumeInput] = useState(false);

  useEffect(() => {
    // Initialize Speech Recognition
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

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const questions = {
    "software-engineer": [],
    "product-manager": [],
    "ux-designer": []
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
        setTimeout(() => {
          startListening();
        }, 1000);
      }
    };
    
    speechSynthesis.speak(utterance);
  };

  const startInterview = () => {
    if (!selectedRole) return;
    setShowResumeInput(true);
  };
  
  const beginInterview = () => {
    setIsInterviewStarted(true);
    setShowResumeInput(false);
    setQuestionCount(0);
    askNextQuestion();
  };

  const askNextQuestion = async () => {
    try {
      const response = await fetch('/.netlify/functions/voice-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedRole,
          questionNumber: questionCount,
          resumeContent: resumeContent
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCurrentQuestion(data.question);
        setTimeout(() => speakText(data.question), 500);
        
        if (!data.hasMoreQuestions && data.question.includes("Thank you")) {
          setTimeout(() => {
            setIsInterviewStarted(false);
            setCurrentQuestion("");
            setQuestionCount(0);
          }, 5000);
        }
      } else {
        // Fallback question
        const fallbackQuestion = "Can you tell me about a project you're particularly proud of?";
        setCurrentQuestion(fallbackQuestion);
        setTimeout(() => speakText(fallbackQuestion), 500);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      const fallbackQuestion = "What interests you most about this role?";
      setCurrentQuestion(fallbackQuestion);
      setTimeout(() => speakText(fallbackQuestion), 500);
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
    try {
      // Optional: Send answer for feedback
      await fetch('/.netlify/functions/voice-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedRole,
          questionNumber: questionCount,
          userAnswer: answer
        }),
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
    
    setQuestionCount(prev => prev + 1);
    setTimeout(() => {
      askNextQuestion();
    }, 2000);
  };

  const endInterview = () => {
    setIsInterviewStarted(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentQuestion("");
    setQuestionCount(0);
    setTranscript("");
    speechSynthesis.cancel();
    if (recognition) {
      recognition.stop();
    }
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
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Voice Interview Assistant
        </h2>
        <p className="text-muted-foreground text-lg">
          Practice interviews with AI-powered voice conversations
        </p>
      </div>

      {!isWebSpeechSupported && (
        <Alert>
          <AlertDescription>
            Voice recognition is not supported in your browser. Please use Chrome, Safari, or Edge for the best experience.
          </AlertDescription>
        </Alert>
      )}

      {!isInterviewStarted && !showResumeInput ? (
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Voice Interview Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Interview Role</label>
              <Select onValueChange={setSelectedRole}>
                <SelectTrigger className="border-primary/20 focus:border-primary">
                  <SelectValue placeholder="Choose a role to practice for" />
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

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <h4 className="font-medium">Audio Output</h4>
                <p className="text-sm text-muted-foreground">AI questions will be spoken aloud</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAudio}
                className="border-primary/30"
              >
                {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
            
            <Button 
              onClick={startInterview}
              disabled={!selectedRole || !isWebSpeechSupported}
              className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-feature"
            >
              Continue to Resume Upload
            </Button>
          </CardContent>
        </Card>
      ) : showResumeInput ? (
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Share Your Background
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Please share your resume content, portfolio links, or any relevant information for the {selectedRole.replace('-', ' ')} interview:
            </p>
            <textarea
              placeholder="Paste your resume content, portfolio links, project links, or any relevant information here..."
              value={resumeContent}
              onChange={(e) => setResumeContent(e.target.value)}
              className="w-full min-h-[200px] p-3 border border-primary/20 rounded-md focus:border-primary resize-none"
            />
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
                disabled={!resumeContent.trim()}
                className="flex-1 bg-gradient-primary hover:opacity-90 text-white"
              >
                Start Voice Interview
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

          <Card className="shadow-card border-0">
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
  );
};

export default VoiceInterview;