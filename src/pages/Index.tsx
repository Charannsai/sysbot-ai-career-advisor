import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import About from "@/components/About";
import Privacy from "@/components/Privacy";
import CareerSuggestions from "@/components/CareerSuggestions";
import ChatInterview from "@/components/ChatInterview";
import VoiceInterview from "@/components/VoiceInterview";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('about');
  
  useEffect(() => {
    const path = location.pathname.slice(1) || 'about';
    setActiveTab(path);
  }, [location]);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'about':
        return <About onNavigate={setActiveTab} />;
      case 'privacy':
        return <Privacy />;
      case 'career':
        return <CareerSuggestions onNavigate={setActiveTab} />;
      case 'chat':
        return <ChatInterview onNavigate={setActiveTab} />;
      case 'voice':
        return <VoiceInterview onNavigate={setActiveTab} />;
      default:
        return <About onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <div className="w-64 studio-sidebar fixed left-0 top-0 h-full z-10">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <h1 className="text-lg font-semibold text-foreground">SysBot - AI Career Studio</h1>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 p-4">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          
          {/* Bottom Section */}
          <div className="p-4 border-t border-sidebar-border">
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <main>
            {renderActiveComponent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
