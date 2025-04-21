import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationsProvider, useNotifications } from "@/contexts/NotificationsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Cases from "./pages/Cases";
import NewCase from "./pages/NewCase";
import ClientDetail from "./pages/ClientDetail";
import CaseDetail from "./pages/CaseDetail";
import CaseDocuments from "./pages/CaseDocuments";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Invoices from "./pages/Invoices";

// Create a client
const queryClient = new QueryClient();

// Temporary component to clear notifications
const ClearNotifications = () => {
  const { clearAllNotifications } = useNotifications();
  React.useEffect(() => {
    clearAllNotifications();
  }, [clearAllNotifications]);
  return null;
};

// AnimatedRoutes component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<Dashboard />} />
          </Route>
          <Route path="/" element={<Layout />}>
            <Route path="invoice-generator" element={<Index />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="cases" element={<Cases />} />
            <Route path="cases/new" element={<NewCase />} />
            <Route path="cases/:id" element={<CaseDetail />} />
            <Route path="cases/:id/documents" element={<CaseDocuments />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Route>
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <NotificationsProvider>
              <ClearNotifications />
              <TooltipProvider>
                <Toaster />
                <BrowserRouter>
                  <AnimatedRoutes />
                </BrowserRouter>
              </TooltipProvider>
            </NotificationsProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
