import { Shield, Lock, Eye, Database, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Your privacy and data security are our top priorities. Learn how we protect your information.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-foreground">Your Data is Safe</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We are committed to protecting your privacy and ensuring your personal information remains secure.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Lock className="h-4 w-4 text-gray-600 mt-1" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">Data Security</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All data you share with SysBot is processed securely and is not stored permanently on our servers. 
                    Your resume content and personal information are used only for generating career recommendations.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Eye className="h-4 w-4 text-gray-600 mt-1" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">No Tracking</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We do not track your browsing behavior, sell your data to third parties, or use your information 
                    for advertising purposes. Your privacy is respected at all times.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Database className="h-4 w-4 text-gray-600 mt-1" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">Data Usage</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The information you provide is used solely to generate personalized career recommendations 
                    and interview practice sessions. No data is shared with external parties.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-gray-600 mt-1" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">Your Control</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You have full control over your data. Since we don't store personal information permanently, 
                    your data is automatically cleared after each session.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-medium text-foreground mb-3">Questions About Privacy?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any questions about our privacy practices, please contact us:
            </p>
            <div className="space-y-2">
              <a
                href="mailto:pathurisai31@gmail.com"
                className="block text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                Email: pathurisai31@gmail.com
              </a>
              <a
                href="https://www.linkedin.com/in/charannsai"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                LinkedIn: linkedin.com/in/charannsai
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;