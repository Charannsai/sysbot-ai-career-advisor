import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Info } from "lucide-react";
import Navigation from "@/components/Navigation";
import About from "@/components/About";
import Privacy from "@/components/Privacy";
import CareerSuggestions from "@/components/CareerSuggestions";
import ChatInterview from "@/components/ChatInterview";
import VoiceInterview from "@/components/VoiceInterview";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('career');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  useEffect(() => {
    const path = location.pathname.slice(1) || 'career';
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
        return <CareerSuggestions onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <div className={`w-64 studio-sidebar fixed left-0 top-0 h-full z-10 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
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
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <ThemeToggle />
            <button
              onClick={() => {
                setActiveTab('about');
                navigate('/about');
              }}
              className={`studio-nav-item w-full ${
                activeTab === 'about' ? 'studio-nav-active' : ''
              }`}
            >
              <Info className="h-4 w-4" />
              <span className="text-sm">About</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-20 p-2 bg-background border border-border rounded-lg shadow-sm hover:bg-muted transition-colors"
          style={{ left: sidebarOpen ? '272px' : '16px' }}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        
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
