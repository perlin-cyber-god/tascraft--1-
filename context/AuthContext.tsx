import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to generate a fake email from username
const getEmailFromUsername = (username: string) => `${username.toLowerCase().replace(/\s/g, '')}@tascraft.game`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const formatUser = (sessionUser: any): User | null => {
    if (!sessionUser) return null;
    return {
        id: sessionUser.id,
        email: sessionUser.email,
        // Fallback to email prefix if metadata is missing
        username: sessionUser.user_metadata?.username || sessionUser.email?.split('@')[0] || 'Steve' 
    };
  };

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Check active sessions and sets the user
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(formatUser(session?.user));
        setLoading(false);
      });

      // Listen for changes on auth state
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(formatUser(session?.user));
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Mock Auth for Demo Mode
      const storedUser = localStorage.getItem('nebula_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }
  }, []);

  const signIn = async (username: string, password: string) => { // Removed email param
    if (isSupabaseConfigured && supabase) {
      const email = getEmailFromUsername(username);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password, 
      });
      if (error) {
        // Customize error message for better UX since user doesn't know about the email trick
        if (error.message.includes('Invalid login credentials')) {
            throw new Error('Incorrect username or password');
        }
        throw error;
      }
    } else {
      // Mock Sign In
      if (password !== 'password') {
          // console.log("Demo mode: use 'password'"); // Optional hint
      }
      const mockUser = { id: 'demo-user-123', username, email: 'demo@demo.com' };
      localStorage.setItem('nebula_user', JSON.stringify(mockUser));
      setUser(mockUser);
    }
  };
  
  const signUp = async (username: string, password: string) => {
     if (isSupabaseConfigured && supabase) {
        const email = getEmailFromUsername(username);
        
        const { error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    username: username // Store pure username in metadata
                }
            }
        });
        if (error) throw error;
     } else {
         await signIn(username, password);
     }
  }

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('nebula_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
