import { Brain, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  return (
    <header className="py-8 text-center space-y-4 bg-gradient-subtle">
      <div className="flex items-center justify-center gap-3">
        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
          <Brain className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent tracking-tight">
            AI Career Advisor
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="secondary" className="bg-gradient-secondary text-white px-3 py-1 font-medium">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by AI
            </Badge>
          </div>
        </div>
      </div>
      
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
        Discover your ideal career path, practice interviews, and build confidence with our AI-powered platform
      </p>
    </header>
  );
};

export default Header;