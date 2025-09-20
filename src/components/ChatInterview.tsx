import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User, Briefcase } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const ChatInterview = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startInterview = () => {
    if (!selectedRole) return;
    
    setIsInterviewStarted(true);
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: `Hello! I'm your AI interviewer for the ${selectedRole} position. I'll ask you a series of questions to help you practice. Let's start with: Can you tell me about yourself and why you're interested in this role?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
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
    setCurrentMessage("");
    setIsLoading(true);

    // Simulate AI response - will be replaced with actual Gemini API
    setTimeout(() => {
      const aiResponses = [
        "That's a great answer! Can you describe a challenging project you've worked on and how you overcame obstacles?",
        "Interesting perspective! Tell me about a time when you had to work with a difficult team member. How did you handle it?",
        "Good insight! What are your greatest strengths and how would they benefit our team?",
        "Thank you for sharing that. Where do you see yourself in 5 years, and how does this role align with your career goals?",
        "Excellent response! Do you have any questions about the role or our company culture?"
      ];

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: randomResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Chat Interview Practice
        </h2>
        <p className="text-muted-foreground text-lg">
          Practice interviews through interactive chat conversations
        </p>
      </div>

      {!isInterviewStarted ? (
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Select Interview Role
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            
            <Button 
              onClick={startInterview}
              disabled={!selectedRole}
              className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-feature"
            >
              Start Interview Practice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className="bg-gradient-secondary text-white px-3 py-1">
              Practicing: {selectedRole.replace('-', ' ').toUpperCase()}
            </Badge>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsInterviewStarted(false);
                setMessages([]);
                setSelectedRole("");
              }}
              className="border-primary/30 hover:border-primary"
            >
              End Interview
            </Button>
          </div>

          <Card className="shadow-card border-0 h-[500px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5 text-secondary" />
                Interview Chat
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col space-y-4">
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
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
                          : 'bg-gradient-primary text-white'
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
                  className="flex-1 border-primary/20 focus:border-primary"
                  disabled={isLoading}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isLoading}
                  className="bg-gradient-secondary hover:opacity-90 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChatInterview;