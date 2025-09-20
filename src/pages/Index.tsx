import { useState } from "react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import CareerSuggestions from "@/components/CareerSuggestions";
import ChatInterview from "@/components/ChatInterview";
import VoiceInterview from "@/components/VoiceInterview";

const Index = () => {
  const [activeTab, setActiveTab] = useState('career');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'career':
        return <CareerSuggestions />;
      case 'chat':
        return <ChatInterview />;
      case 'voice':
        return <VoiceInterview />;
      default:
        return <CareerSuggestions />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <Header />
        
        <div className="space-y-8">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          <main className="pb-8">
            {renderActiveComponent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
