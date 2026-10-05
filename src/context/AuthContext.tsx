import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

interface UserData {
  userId: string;
  name: string;
  fullName?: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  userData: UserData | null;
  loading: boolean;
  loginWithGoogle: (isSignup?: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  loginAsAdmin: (email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Initial State Check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          // Fire and forget profile fetch so it doesn't block 'loading = false' 
          // if the users table has RLS issues or is slow
          fetchUserData(currentUser.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth: Initialization failed", err);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // 2. Continuous Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      const currentUser = session?.user ?? null;
      
      if (event === 'SIGNED_IN') {
        setUser(currentUser);
        if (currentUser) fetchUserData(currentUser.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserData(null);
        setLoading(false);
      } else if (event === 'INITIAL_SESSION' && !currentUser) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      // 1. Try fetching by 'id' first (Standard)
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!data && !error) {
        // Fallback for if column is 'userId' (CamelCase)
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('users')
          .select('*')
          .eq('userId', userId)
          .maybeSingle();
        data = fallbackData;
        error = fallbackError;
      }

      // 2. AUTO-CREATE PROFILE: If user is logged in but no profile exists in the table
      if (!data && !error && user) {
        console.log("Auth: Profile missing for user", userId, "Creating default profile...");
        
        // Define default role - if common admin email is used, assign admin role
        const isAdminEmail = user.email === 'admin@gmail.com' || user.email === 'zohaibuddin376@gmail.com' || user.email === 'adminhamza@gmail.com' || user.email === 'sonryan82@gmail.com';
        const defaultRole = isAdminEmail ? 'admin' : 'user';

        const googleName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name;
        const initialName = googleName || user.email?.split('@')[0] || 'New Client';

        const newProfile = {
          id: userId,
          userId: userId, 
          name: initialName,
          fullName: initialName,
          email: user.email,
          role: defaultRole,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          phone: '',
          address: ''
        };

        const { data: createdData, error: createError } = await supabase
          .from('users')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.error("Auth: Failed to auto-create profile", createError.message);
        } else {
          data = createdData;
          console.log("Auth: Successfully auto-created profile with role:", defaultRole);
        }
      }

      if (data) {
        const fullData = data as UserData;
        setUserData(fullData);
        return fullData;
      } else if (error) {
        console.warn("Auth: Profile fetch error", error.message);
      }
      return null;
    } catch (err) {
      console.error("Auth: Profile fetch exception", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Ensure user state is set BEFORE fetching profile
      setUser(data.user);
      const result = await fetchUserData(data.user.id);
      toast.success(`Welcome back, ${result?.name || data.user.email}`);
      return result;
    } catch (error: any) {
      console.error("Sign in failed", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });
      if (error) throw error;
      
      if (data.user) {
        const isAdminEmail = email === 'admin@gmail.com' || email === 'zohaibuddin376@gmail.com' || email === 'adminhamza@gmail.com' || email === 'sonryan82@gmail.com';
        const role = isAdminEmail ? 'admin' : 'user';

        // Create entry in users table
        const { error: dbError } = await supabase.from('users').insert({
          id: data.user.id,
          userId: data.user.id,
          name,
          fullName: name,
          email,
          role: role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          phone: '',
          address: ''
        });
        if (dbError) console.error("Error creating user profile:", dbError);
        
        if (data.session) {
          setUser(data.user);
          await fetchUserData(data.user.id);
          toast.success("Account created successfully!");
        } else {
          throw new Error('Signup successful! Please check your email to verify your account before logging in.');
        }
      }
    } catch (error: any) {
      console.error("Sign up failed", error);
      throw error;
    }
  };

  const loginWithGoogle = async (isSignup = false) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: isSignup ? {
            prompt: 'select_account',
            access_type: 'offline',
          } : {
            access_type: 'offline',
          }
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const loginAsAdmin = async (email = 'admin@gmail.com', password = 'admin123') => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // The fetchUserData call will handle checking the role and ensuring the profile exists
      setUser(data.user);
      const result = await fetchUserData(data.user.id);
      toast.success("Admin Session Activated");
      return result;
      
      // Final sanity check: Is this person actually an admin in the USERS table?
      // fetchUserData would have set userData by now.
    } catch (error: any) {
      console.error("Admin Login failed", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      
      // Clear local state
      setUser(null);
      setUserData(null);
      toast.success("Signed out successfully");
    } catch (err) {
      console.error("Logout error (Supabase):", err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserData>) => {
    if (!user) throw new Error("No authenticated user found for profile update.");

    try {
      // STRICT MAPPING: Sync both 'name' and 'fullName' columns
      const updatedName = updates.name || updates.fullName;
      const payload: any = {
        name: updatedName,
        fullName: updatedName,
        phone: updates.phone,
        address: updates.address,
        email: user.email,
        updatedAt: new Date().toISOString()
      };

      console.log("Auth: Synchronizing profile for user:", user.id, "Payload:", payload);

      // Using UPSERT: This will update if exists, or CREATE if missing.
      const { data, error } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          userId: user.id, 
          ...payload
        }, { onConflict: 'id' }) 
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("Synchronization returned no results.");
      }

      // Success: Update local state immediately for instant UI feedback
      setUserData(data[0] as UserData);
      console.log("Auth: Profile synchronized & state updated locally.");
    } catch (error: any) {
      console.error("CRITICAL: Profile synchronization failed:", error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, loginWithGoogle, signIn, signUp, loginAsAdmin, logout, updateProfile }}>
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
