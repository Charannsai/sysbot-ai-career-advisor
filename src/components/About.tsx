import { Lightbulb, MessageCircle, Mic, ArrowRight, Target, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";

interface AboutProps {
  onNavigate: (tab: string) => void;
}

const About = ({ onNavigate }: AboutProps) => {
  const features = [
    {
      id: 'career',
      title: 'Career Discovery',
      description: 'Upload your resume or share your skills to get personalized career recommendations with detailed learning roadmaps.',
      icon: Lightbulb,
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'chat',
      title: 'Chat Interview',
      description: 'Practice interviews through interactive text conversations tailored to your target role and background.',
      icon: MessageCircle,
      color: 'from-green-500 to-blue-500'
    },
    {
      id: 'voice',
      title: 'Voice Interview',
      description: 'Experience realistic voice-based interviews with AI that listens to your responses and asks follow-up questions.',
      icon: Mic,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Hero Section */
      <div className="text-center space-y-6 pt-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-foreground tracking-tight">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SysBot</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your AI-powered career companion that helps you discover ideal career paths and master interview skills with personalized guidance.
          </p>
        </div>
      </div>

      {/* About Section */}
      <div className="studio-card p-10 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">About SysBot - AI Career Studio</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            SysBot is an intelligent career guidance platform that combines the power of artificial intelligence with personalized career coaching. 
            Whether you're a student exploring career options, a professional looking to switch paths, or someone preparing for interviews, 
            SysBot provides comprehensive support tailored to your unique profile and goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 pt-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              What We Do
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Analyze your skills and experience to suggest matching careers</li>
              <li>• Provide detailed learning roadmaps for career transitions</li>
              <li>• Offer realistic interview practice with AI feedback</li>
              <li>• Connect you with free learning resources and tools</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Why Choose SysBot
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Powered by advanced AI for personalized recommendations</li>
              <li>• Free to use with no hidden costs or subscriptions</li>
              <li>• Privacy-focused - your data stays secure</li>
              <li>• Available 24/7 whenever you need career guidance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Explore Our Features</h2>
          <p className="text-lg text-muted-foreground">
            Choose the tool that best fits your current career needs
          </p>
        </div>

        <div className="grid gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.id} className="studio-card p-8 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-gray-700 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-lg leading-relaxed mt-2">
                        {feature.description}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => onNavigate(feature.id)}
                      className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors group/btn"
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="studio-card p-10 text-center space-y-6">
        <h2 className="text-3xl font-bold text-foreground">Ready to Start Your Journey?</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Take the first step towards your dream career. Upload your resume or share your skills to get personalized recommendations.
        </p>
        <button
          onClick={() => onNavigate('career')}
          className="studio-button px-8 py-4 text-base font-semibold"
        >
          Discover My Career Path
        </button>
      </div>
      </div>
      <Footer currentPage="about" />
    </div>
  );
};

export default About;