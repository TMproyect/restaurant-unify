
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthUser, UserRole, AuthContextType } from './types';
import { 
  fetchUserProfile, 
  loginUser, 
  signupUser, 
  createUserProfile, 
  createUserByAdmin, 
  updateUserRoleById, 
  logoutUser 
} from './authHelpers';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Initialize the auth state
  useEffect(() => {
    let isMounted = true;
    
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        if (!isMounted) return;
        
        setSession(currentSession);
        
        if (currentSession) {
          try {
            const profile = await fetchUserProfile(currentSession.user.id);
            if (profile) {
              setUser(profile);
            } else {
              console.error('No profile found for user:', currentSession.user.id);
              setUser(null);
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession?.user?.id);
      if (!isMounted) return;
      
      setSession(currentSession);
      
      if (currentSession) {
        try {
          const profile = await fetchUserProfile(currentSession.user.id);
          if (profile) {
            setUser(profile);
          } else {
            console.error('No profile found for user:', currentSession.user.id);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
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
        if (error.message.includes('Email not confirmed')) {
          toast.error('Error al iniciar sesión: El correo electrónico no ha sido confirmado');
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Error al iniciar sesión: Credenciales inválidas');
        } else {
          toast.error('Error al iniciar sesión: ' + error.message);
        }
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
      throw error;
    } finally {
      console.log("Login process completed, resetting loading state");
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name: string, role: UserRole = 'admin') => {
    try {
      setIsLoading(true);
      console.log("Signup started with role:", role);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('Signup error:', error.message);
        if (error.message.includes('rate limit')) {
          toast.error('Por motivos de seguridad, debe esperar 32 segundos antes de intentar nuevamente');
        } else {
          toast.error('Error al crear la cuenta: ' + error.message);
        }
        throw error;
      }

      console.log("Auth signup successful, creating profile...");
      
      // Then manually insert into profiles table
      if (data.user) {
        await createUserProfile(data.user.id, name, role);
        
        console.log("Profile created successfully for user:", data.user.id);
        
        toast.success('Cuenta creada con éxito', {
          description: 'Por favor, verifica tu correo electrónico para confirmar tu cuenta'
        });
      }
      
      console.log("Signup complete with role:", role);
      
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      throw error;
    } finally {
      console.log("Signup process completed, resetting loading state");
      setIsLoading(false);
    }
  };

  // Function to create users by admin
  const createUser = async (email: string, password: string, name: string, role: UserRole = 'admin'): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("Create user started with role:", role);
      
      // Create user in Supabase Authentication
      const userData = await createUserByAdmin(email, password, name, role);

      // Manually create the profile since the trigger might not activate for admin creations
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userData.user.id,
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
      
      await updateUserRoleById(userId, newRole);

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
      
      await logoutUser();
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
