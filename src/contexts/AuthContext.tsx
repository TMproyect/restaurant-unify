
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
  createUser: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
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
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession) {
          const profile = await fetchUserProfile(currentSession.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession) {
        const profile = await fetchUserProfile(currentSession.user.id);
        setUser(profile);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        
        if (!profile) {
          throw new Error('No se pudo recuperar el perfil de usuario');
        }
        
        setUser(profile);
        toast.success('Inicio de sesión exitoso', {
          description: `Bienvenido, ${profile.name}`,
        });
      }
    } catch (error: any) {
      console.error('Error logging in:', error.message);
      toast.error(error.message || 'Error al iniciar sesión');
      // Importante: asegurarse de que isLoading se ponga en false cuando hay error
      setIsLoading(false);
      throw error;
    }
  };

  // Signup function - modificada para aceptar cualquier rol (waiter por defecto)
  const signup = async (email: string, password: string, name: string, role: UserRole = 'waiter') => {
    setIsLoading(true);
    try {
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

      if (error) throw error;

      toast.success('Cuenta creada con éxito. Por favor, verifica tu correo electrónico.');
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      toast.error(error.message || 'Error al crear la cuenta');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para crear usuarios por parte del administrador
  const createUser = async (email: string, password: string, name: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      // Crear usuario en Supabase Authentication
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role,
        },
      });

      if (error) throw error;

      // Crear manualmente el perfil ya que el trigger podría no activarse para creaciones admin
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

      if (profileError) throw profileError;

      toast.success(`Usuario ${name} creado correctamente con rol ${role}`);
    } catch (error: any) {
      console.error('Error creating user:', error.message);
      toast.error(error.message || 'Error al crear el usuario');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Nueva función para actualizar el rol de un usuario
  const updateUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Si el usuario cuyo rol se está actualizando es el usuario actual, actualizamos también el estado
      if (user && userId === user.id) {
        setUser(prev => prev ? { ...prev, role: newRole } : null);
        toast.success(`Tu rol ha sido actualizado a ${newRole}`);
      } else {
        toast.success(`Rol de usuario actualizado correctamente a ${newRole}`);
      }
    } catch (error: any) {
      console.error('Error updating user role:', error.message);
      toast.error(error.message || 'Error al actualizar el rol del usuario');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error: any) {
      console.error('Error logging out:', error.message);
      toast.error('Error al cerrar sesión');
    } finally {
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
