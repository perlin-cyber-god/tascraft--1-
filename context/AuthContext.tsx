import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Just check localStorage - no Supabase auth calls
    const storedUser = localStorage.getItem('tascraft_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string) => {
    // Check if profile exists in database
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (error || !profile) {
          throw new Error('Username not found. Create a profile first.');
        }

        // User found - log them in
        const user: User = {
          id: profile.id,
          username: profile.username,
          email: `${username}@tascraft.local`
        };
        
        localStorage.setItem('tascraft_user', JSON.stringify(user));
        setUser(user);
        return;
      } catch (err: any) {
        console.warn('Supabase login failed, trying localStorage fallback:', err);
      }
    }
    
    // Fallback: check localStorage for profiles
    const profiles = JSON.parse(localStorage.getItem('tascraft_profiles') || '[]');
    const profile = profiles.find((p: any) => p.username === username);
    
    if (!profile) {
      throw new Error('Username not found. Create a profile first.');
    }

    const user: User = {
      id: profile.id,
      username: profile.username,
      email: `${username}@tascraft.local`
    };
    
    localStorage.setItem('tascraft_user', JSON.stringify(user));
    setUser(user);
  };
  
  const signUp = async (username: string) => {
    // Check if username already exists
    const profiles = JSON.parse(localStorage.getItem('tascraft_profiles') || '[]');
    if (profiles.some((p: any) => p.username === username)) {
      throw new Error('Username already taken!');
    }

    // Create new profile locally
    const newProfile = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: username,
      created_at: new Date().toISOString()
    };

    profiles.push(newProfile);
    localStorage.setItem('tascraft_profiles', JSON.stringify(profiles));

    // Try to also sync to Supabase if available
    if (isSupabaseConfigured && supabase) {
      try {
        // Just create the profile in the database, don't use auth
        await supabase.from('profiles').insert([{
          id: newProfile.id,
          username: newProfile.username,
          created_at: newProfile.created_at
        }]);
      } catch (err) {
        console.warn('Could not sync profile to Supabase, continuing with localStorage:', err);
      }
    }

    // Log them in
    const user: User = {
      id: newProfile.id,
      username: newProfile.username,
      email: `${username}@tascraft.local`
    };
    
    localStorage.setItem('tascraft_user', JSON.stringify(user));
    setUser(user);
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut failed:', err);
      }
    }
    localStorage.removeItem('tascraft_user');
    setUser(null);
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
