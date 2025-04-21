import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User, Provider } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const inactivityTimeout = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  // Check for inactivity
  useEffect(() => {
    if (!session) return;

    const checkInactivity = () => {
      const now = Date.now();
      if (now - lastActivity > inactivityTimeout) {
        signOut();
        toast.info('Your session has expired due to inactivity. Please log in again.');
      }
    };

    const interval = setInterval(checkInactivity, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [session, lastActivity]);

  useEffect(() => {
    let mounted = true;

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            if (mounted) {
              setSession(currentSession);
              setUser(currentSession?.user ?? null);
              
              // Handle specific auth events
              if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
              }
            }
          }
        );

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Error signing in');
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?tab=login`
        }
      });
      if (error) throw error;
      toast.success('Check your email for the confirmation link');
    } catch (error: any) {
      toast.error(error.message || 'Error signing up');
      throw error;
    }
  };

  const signInWithOAuth = async (provider: Provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || `Error signing in with ${provider}`);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/'; // Redirect to landing page
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signInWithOAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
