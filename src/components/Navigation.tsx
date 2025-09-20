import { Lightbulb, MessageCircle, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    {
      id: 'career',
      label: 'Career Suggestions',
      icon: Lightbulb,
      description: 'Discover career paths based on your skills'
    },
    {
      id: 'chat',
      label: 'Chat Interview',
      icon: MessageCircle,
      description: 'Practice interviews via text conversation'
    },
    {
      id: 'voice',
      label: 'Voice Interview',
      icon: Mic,
      description: 'Voice-powered interview practice'
    }
  ];

  return (
    <Card className="p-2 shadow-card border-0 bg-gradient-subtle">
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 h-auto p-4 flex flex-col gap-2 transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-gradient-primary text-white shadow-feature' 
                  : 'hover:bg-accent hover:shadow-card'
              }`}
            >
              <Icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-primary'}`} />
              <div className="text-center">
                <div className={`font-medium ${activeTab === tab.id ? 'text-white' : 'text-foreground'}`}>
                  {tab.label}
                </div>
                <div className={`text-xs mt-1 ${
                  activeTab === tab.id ? 'text-white/80' : 'text-muted-foreground'
                }`}>
                  {tab.description}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default Navigation;