import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ThemeToggle";

const Header = () => {
  return (
    <header className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">
              Welcome to AI Career Advisor
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-2 py-1 text-xs font-medium">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by AI
              </Badge>
            </div>
          </div>
        </div>
        
        <ThemeToggle />
      </div>
      
      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
        Discover your ideal career path, practice interviews, and build confidence with our AI-powered platform
      </p>
    </header>
  );
};

export default Header;