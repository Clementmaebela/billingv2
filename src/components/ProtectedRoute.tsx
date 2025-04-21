import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = () => {
  const { session, loading } = useAuth();
  const location = useLocation();
  
  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If not authenticated, redirect to the auth page with return URL
  if (!session) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }
  
  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
