import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User, Briefcase } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Footer from "@/components/Footer";

interface ChatInterviewProps {
  onNavigate?: (tab: string) => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const ChatInterview = ({ onNavigate }: ChatInterviewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeContent, setResumeContent] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setShowResumeUpload(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        // PDF processing removed for now
        setResumeContent('PDF uploaded. Please paste your resume content in the text area below.');
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
      console.error('File error:', error);
      setResumeContent('Error reading file. Please paste content manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeAndStartInterview = async () => {
    if (!resumeContent.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: resumeContent + '\n\nLinks: ' + portfolioLinks,
          role: selectedRole,
          conversationHistory: [],
          isFirstMessage: false,
          resumeContent: resumeContent
        })
      });
      
      const data = await response.json();
      const message = data.response;
      
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: message,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      setIsInterviewStarted(true);
      setShowResumeUpload(false);
    } catch (error) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `Hello! Welcome to the ${selectedRole.replace('-', ' ')} interview. Let's get started.`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setIsInterviewStarted(true);
      setShowResumeUpload(false);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const newMessages = [...messages, userMessage];
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-4).map(m => `${m.type}: ${m.content}`).join('\n');
      
      const prompt = `You are a ${selectedRole.replace('-', ' ')} interviewer. \n\nCandidate's background: ${resumeContent.substring(0, 400)}\n\nConversation so far:\n${conversationHistory}\n\nCandidate just said: "${currentMessage}"\n\nRespond conversationally by:\n1. Acknowledging their answer ("That's interesting...", "Great point...")\n2. Then ask ONE follow-up question\n\nKeep response under 60 words and sound natural.`;
      
      const response = await fetch('/api/chat-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          role: selectedRole,
          conversationHistory: messages,
          isFirstMessage: false,
          resumeContent: resumeContent
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('API error');
      }
    } catch (error) {
      console.error('Interview Error:', error);
      
      const conversationalFallbacks = [
        "That's really interesting! Can you tell me more about how you approached that challenge?",
        "Great point! What was the most difficult part of that experience for you?",
        "I see. How did that experience shape your approach to similar situations?",
        "That sounds challenging. What would you do differently if you faced that situation again?",
        "Excellent! Can you walk me through your thought process on that decision?"
      ];
      
      const fallbackResponse = conversationalFallbacks[messages.length % conversationalFallbacks.length];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: fallbackResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="text-center space-y-6 mb-12">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-foreground tracking-tight">
              Master Your <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Interview Skills</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Practice real interview scenarios with AI-powered conversations tailored to your role
            </p>
          </div>
        </div>

      {!isInterviewStarted && !showResumeUpload ? (
        <div className="studio-card p-10">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Choose Your Role</h2>
              <p className="text-muted-foreground">Select the position you want to practice interviewing for</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <Select onValueChange={handleRoleSelect}>
                <SelectTrigger className="studio-input h-12 text-base">
                  <SelectValue placeholder="Select interview role" />
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
          </div>
        </div>
      ) : showResumeUpload ? (
        <div className="studio-card p-10 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Share Your Background</h2>
            <p className="text-muted-foreground">Upload your resume or enter your information manually</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">Resume File</label>
              <input
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileUpload}
                className="studio-input w-full"
                disabled={isLoading}
              />
              {isLoading && <p className="text-sm text-blue-600">Processing file...</p>}
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">Portfolio/Project Links</label>
              <textarea
                placeholder="Share your portfolio, GitHub, LinkedIn, or project links..."
                value={portfolioLinks}
                onChange={(e) => setPortfolioLinks(e.target.value)}
                className="studio-input min-h-[80px] resize-none"
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">Resume Content</label>
              <textarea
                placeholder="Paste your resume content here or upload a file above..."
                value={resumeContent}
                onChange={(e) => setResumeContent(e.target.value)}
                className="studio-input min-h-[120px] resize-none"
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setShowResumeUpload(false)}
                className="flex-1 px-6 py-3 border border-border/50 text-muted-foreground rounded-xl font-medium hover:bg-muted/50 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={analyzeAndStartInterview}
                disabled={!resumeContent.trim() || isLoading}
                className="studio-button flex-1"
              >
                {isLoading ? 'Processing...' : 'Start Interview'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-secondary text-white px-3 py-1">
                {selectedRole.replace('-', ' ').toUpperCase()} INTERVIEW
              </Badge>
              <Badge variant="outline" className="text-xs">
                Stage {Math.floor(messages.length / 2) + 1}
              </Badge>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsInterviewStarted(false);
                setMessages([]);
                setSelectedRole("");
              }}
              className="border-border/50 hover:border-primary transition-colors"
            >
              End Interview
            </Button>
          </div>

          <Card className="glass-card border-0 h-[60vh] min-h-[400px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5 text-secondary" />
                Interview Chat
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border/60">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'ai' ? 'bg-primary text-white' : 'bg-secondary text-white'
                      }`}>
                        {message.type === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      
                      <div className={`p-3 rounded-lg ${
                        message.type === 'ai' 
                          ? 'bg-muted text-foreground' 
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <span className={`text-xs mt-2 block ${
                          message.type === 'ai' ? 'text-muted-foreground' : 'text-primary-foreground/70'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="flex gap-2 pt-3 border-t">
                <Input
                  placeholder="Type your answer here..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-background/50 border-border/50 focus:border-primary transition-colors"
                  disabled={isLoading}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default ChatInterview;