import { Home, Lightbulb, MessageCircle, Mic } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    {
      id: 'about',
      label: 'About',
      icon: Home
    },
    {
      id: 'career',
      label: 'Career Discovery',
      icon: Lightbulb
    },
    {
      id: 'chat',
      label: 'Chat Interview',
      icon: MessageCircle
    },
    {
      id: 'voice',
      label: 'Voice Interview',
      icon: Mic
    }
  ];

  return (
    <nav className="space-y-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`studio-nav-item w-full ${
              isActive ? 'studio-nav-active' : ''
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;