
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define user roles
export type UserRole = 'admin' | 'waiter' | 'kitchen' | 'delivery' | 'manager';

// Define user type
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Define auth context type
interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  createUser: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Fetch user profile data
  const fetchUserProfile = async (userId: string): Promise<AuthUser | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        email: session?.user?.email || '',
        role: data.role as UserRole,
        avatar: data.avatar,
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Initialize the auth state
  useEffect(() => {
    let isMounted = true;
    
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        if (!isMounted) return;
        
        if (currentSession) {
          const profile = await fetchUserProfile(currentSession.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
        
        setSession(currentSession);
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession?.user?.id);
      if (!isMounted) return;
      
      setSession(currentSession);
      
      if (currentSession) {
        const profile = await fetchUserProfile(currentSession.user.id);
        setUser(profile);
      }
      
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Login started...");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        toast.error('Error al iniciar sesión: ' + error.message);
        throw error;
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        
        if (!profile) {
          toast.error('No se pudo recuperar el perfil de usuario');
          throw new Error('No se pudo recuperar el perfil de usuario');
        }
        
        setUser(profile);
        toast.success('Inicio de sesión exitoso', {
          description: `Bienvenido, ${profile.name}`,
        });
        console.log("Login successful:", profile);
      }
    } catch (error: any) {
      console.error('Error logging in:', error.message);
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      console.log("Login process completed, resetting loading state");
      setIsLoading(false);
    }
  };

  // Signup function - Setting 'admin' as the default role
  const signup = async (email: string, password: string, name: string, role: UserRole = 'admin') => {
    try {
      setIsLoading(true);
      console.log("Signup started with role:", role);
      
      // First, sign up the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) {
        console.error('Signup error:', error.message);
        toast.error('Error al crear la cuenta: ' + error.message);
        throw error;
      }

      console.log("Auth signup successful, creating profile...");
      
      // Then manually insert into profiles table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              name,
              role,
            }
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          toast.error('Error al crear el perfil de usuario: ' + profileError.message);
          throw profileError;
        }
        
        console.log("Profile created successfully for user:", data.user.id);
        
        // For instant login after signup, set the user and session
        const profile: AuthUser = {
          id: data.user.id,
          name,
          email: data.user.email || '',
          role,
        };
        
        setUser(profile);
        setSession(data.session);
        
        toast.success('Cuenta creada con éxito', {
          description: 'Bienvenido a RestaurantOS'
        });
      }
      
      console.log("Signup complete with role:", role);
      
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      toast.error(error.message || 'Error al crear la cuenta');
      throw error;
    } finally {
      console.log("Signup process completed, resetting loading state");
      setIsLoading(false);
    }
  };

  // Function to create users by admin - Updated default role to admin
  const createUser = async (email: string, password: string, name: string, role: UserRole = 'admin'): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("Create user started with role:", role);
      
      // Create user in Supabase Authentication
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role,
        },
      });

      if (error) {
        console.error('Create user error:', error.message);
        toast.error('Error al crear el usuario: ' + error.message);
        throw error;
      }

      // Manually create the profile since the trigger might not activate for admin creations
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            name,
            role,
            avatar: null,
          },
        ]);

      if (profileError) {
        console.error('Create profile error:', profileError.message);
        toast.error('Error al crear el perfil: ' + profileError.message);
        throw profileError;
      }

      toast.success(`Usuario ${name} creado correctamente con rol ${role}`);
      console.log("Create user successful with role:", role);
    } catch (error: any) {
      console.error('Error creating user:', error.message);
      toast.error(error.message || 'Error al crear el usuario');
      throw error;
    } finally {
      console.log("Create user process completed, resetting loading state");
      setIsLoading(false);
    }
  };

  // Function to update user role
  const updateUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("Update user role started...");
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Update role error:', error.message);
        toast.error('Error al actualizar el rol: ' + error.message);
        throw error;
      }

      // If the user being updated is the current user, update the state
      if (user && userId === user.id) {
        setUser(prev => prev ? { ...prev, role: newRole } : null);
        toast.success(`Tu rol ha sido actualizado a ${newRole}`);
      } else {
        toast.success(`Rol de usuario actualizado correctamente a ${newRole}`);
      }
      console.log("Update role successful");
    } catch (error: any) {
      console.error('Error updating user role:', error.message);
      toast.error(error.message || 'Error al actualizar el rol del usuario');
      throw error;
    } finally {
      console.log("Update role process completed, resetting loading state");
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      console.log("Logout started...");
      
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      console.log("Logout successful");
    } catch (error: any) {
      console.error('Error logging out:', error.message);
      toast.error('Error al cerrar sesión');
    } finally {
      console.log("Logout process completed, resetting loading state");
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isLoading,
    createUser,
    updateUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
