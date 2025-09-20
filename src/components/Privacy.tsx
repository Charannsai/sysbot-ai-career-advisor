import { Shield, Lock, Eye, Database } from "lucide-react";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-6 pt-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-foreground tracking-tight">
            Privacy <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your privacy and data security are our top priorities. Learn how we protect your information.
          </p>
        </div>
      </div>

      {/* Privacy Content */}
      <div className="studio-card p-10 space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Your Data is Safe</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We are committed to protecting your privacy and ensuring your personal information remains secure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 pt-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Data Security</h3>
                <p className="text-muted-foreground">
                  All data you share with SysBot is processed securely and is not stored permanently on our servers. 
                  Your resume content and personal information are used only for generating career recommendations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Tracking</h3>
                <p className="text-muted-foreground">
                  We do not track your browsing behavior, sell your data to third parties, or use your information 
                  for advertising purposes. Your privacy is respected at all times.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Data Usage</h3>
                <p className="text-muted-foreground">
                  The information you provide is used solely to generate personalized career recommendations 
                  and interview practice sessions. No data is shared with external parties.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Your Control</h3>
                <p className="text-muted-foreground">
                  You have full control over your data. Since we don't store personal information permanently, 
                  your data is automatically cleared after each session.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="studio-card p-10 text-center space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Questions About Privacy?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          If you have any questions about our privacy practices or how we handle your data, 
          please don't hesitate to reach out to us.
        </p>
        <div className="flex justify-center gap-6">
          <a
            href="mailto:pathurisai31@gmail.com"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Contact via Email
          </a>
          <a
            href="https://www.linkedin.com/charannsai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Connect on LinkedIn
          </a>
        </div>
      </div>

      <Footer currentPage="privacy" />
    </div>
  );
};

export default Privacy;