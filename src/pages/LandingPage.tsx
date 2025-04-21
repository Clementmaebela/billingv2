
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, FolderOpen, Shield, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const LandingPage = () => {
  const { session } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-[#1a365d]" />
              <span className="ml-2 text-xl font-bold text-[#1a365d]">Legal Billing</span>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="md:mr-2">
                <Link to="/auth?tab=login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="md:size-md">
                <Link to="/auth?tab=signup">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-10 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                Legal Billing <span className="text-[#1a365d]">Made Simple</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl text-gray-600">
                Streamline your legal practice with our comprehensive billing solution designed for legal professionals.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 md:gap-4">
                <Button asChild size="default" className="bg-[#1a365d] hover:bg-[#2d4a70] w-full sm:w-auto">
                  <Link to="/auth?tab=signup">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="default" variant="outline" className="w-full sm:w-auto">
                  <Link to="/auth?tab=login">Sign In</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center mt-8 md:mt-0">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 w-full max-w-md">
                <div className="bg-[#1a365d] p-4 text-white">
                  <h3 className="text-lg font-medium">Legal Billing Dashboard</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="bg-gray-100 h-8 rounded animate-pulse"></div>
                    <div className="bg-gray-100 h-20 rounded animate-pulse"></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-100 h-16 rounded animate-pulse"></div>
                      <div className="bg-gray-100 h-16 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900">Key Features</h2>
          <div className="mt-8 md:mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-100">
              <Users className="h-8 w-8 md:h-10 md:w-10 text-[#1a365d]" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Client Management</h3>
              <p className="mt-2 text-gray-600">
                Organize and manage your client information in one centralized location.
              </p>
            </div>
            <div className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-100">
              <FolderOpen className="h-8 w-8 md:h-10 md:w-10 text-[#1a365d]" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Case Tracking</h3>
              <p className="mt-2 text-gray-600">
                Track all your legal cases, including status, documents, and important details.
              </p>
            </div>
            <div className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-100">
              <FileText className="h-8 w-8 md:h-10 md:w-10 text-[#1a365d]" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Invoice Generation</h3>
              <p className="mt-2 text-gray-600">
                Create professional invoices based on legal tariffs with just a few clicks.
              </p>
            </div>
            <div className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-100">
              <Shield className="h-8 w-8 md:h-10 md:w-10 text-[#1a365d]" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Secure & Compliant</h3>
              <p className="mt-2 text-gray-600">
                Keep your client and case data secure with our robust security measures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-[#1a365d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Ready to streamline your legal billing?</h2>
          <p className="mt-4 text-md md:text-xl text-gray-300">
            Join thousands of legal professionals who trust our platform.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="bg-white text-[#1a365d] hover:bg-gray-100 w-full sm:w-auto">
              <Link to="/auth?tab=signup">
                Create your account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-medium text-white">Legal Billing</h3>
              <p className="mt-2 text-sm">
                A comprehensive solution for legal professionals to manage clients, cases, and invoices.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Links</h3>
              <ul className="mt-2 space-y-2 text-sm">
                <li><Link to="/auth" className="hover:text-white">Login</Link></li>
                <li><Link to="/auth?tab=signup" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Contact</h3>
              <p className="mt-2 text-sm">
                support@legalbilling.app<br />
                123 Legal Street, Suite 101<br />
                Cape Town, South Africa
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 md:pt-8 border-t border-gray-700 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} Legal Billing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
