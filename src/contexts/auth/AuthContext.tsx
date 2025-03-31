import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthUser, UserRole, AuthContextType } from './types';
import { 
  fetchUserProfile, 
  signupUser, 
  createUserProfile, 
  createUserByAdmin, 
  updateUserRoleById, 
  logoutUser,
  fetchAllProfiles,
  createUserWithEdgeFunction
} from './authHelpers';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const logAuthState = (prefix: string) => {
    console.log(`${prefix} - Auth State:`, {
      isLoading,
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email
        },
        expiresAt: session.expires_at,
        refreshToken: session.refresh_token ? "presente" : "ausente"
      } : null,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role
      } : null,
      isAuthenticated: !!user
    });
  };

  useEffect(() => {
    let isMounted = true;
    
    console.log("AuthProvider initialized, setting up auth state listener");
    logAuthState("Initial state");
    
    // Verificar configuración del cliente Supabase
    const authOptions = (supabase as any).auth?.persistSession !== undefined 
      ? {
          persistSession: (supabase as any).auth.persistSession,
          autoRefreshToken: (supabase as any).auth.autoRefreshToken,
          storageKey: (supabase as any).auth.storageKey,
        }
      : 'No se puede determinar la configuración';
    
    console.log("Configuración del cliente Supabase:", authOptions);
    
    // Verificar si el localStorage está funcionando
    try {
      localStorage.setItem('auth_test', 'test');
      const testValue = localStorage.getItem('auth_test');
      console.log("LocalStorage test:", testValue === 'test' ? "funcionando" : "valor incorrecto");
      localStorage.removeItem('auth_test');
    } catch (e) {
      console.error("LocalStorage no está funcionando:", e);
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        logAuthState("Before auth state update");
        
        if (!isMounted) {
          console.log("Componente desmontado, ignorando cambio de estado de autenticación");
          return;
        }
        
        if (currentSession) {
          console.log("Sesión activa detectada en cambio de estado:", {
            userId: currentSession.user.id,
            email: currentSession.user.email,
            expiresAt: currentSession.expires_at
          });
          
          setSession(currentSession);
          
          setTimeout(async () => {
            if (!isMounted) {
              console.log("Componente desmontado, cancelando actualización de perfil");
              return;
            }
            
            try {
              console.log("Fetching user profile after auth state change for user:", currentSession.user.id);
              const profile = await fetchUserProfile(currentSession.user.id);
              
              if (profile && isMounted) {
                console.log("User profile fetched successfully:", profile);
                setUser(profile);
                logAuthState("After setting user profile");
              } else if (isMounted) {
                console.error('No profile found for user:', currentSession.user.id);
                
                const basicUser: AuthUser = {
                  id: currentSession.user.id,
                  name: currentSession.user.user_metadata?.name || 'Usuario',
                  email: currentSession.user.email || '',
                  role: (currentSession.user.user_metadata?.role as UserRole) || 'admin',
                };
                
                console.log("Using basic user data as fallback:", basicUser);
                setUser(basicUser);
                logAuthState("After setting fallback user");
              }
            } catch (error) {
              console.error('Error fetching profile after auth state change:', error);
              
              if (isMounted) {
                const basicUser: AuthUser = {
                  id: currentSession.user.id,
                  name: currentSession.user.user_metadata?.name || 'Usuario',
                  email: currentSession.user.email || '',
                  role: (currentSession.user.user_metadata?.role as UserRole) || 'admin',
                };
                
                console.log("Using basic user data as fallback due to error:", basicUser);
                setUser(basicUser);
                logAuthState("After setting fallback user due to error");
              }
            }
            if (isMounted) {
              setIsLoading(false);
              logAuthState("After setting isLoading to false");
            }
          }, 0);
        } else {
          console.log("No session in auth state change, clearing user data");
          setSession(null);
          setUser(null);
          if (isMounted) {
            setIsLoading(false);
            logAuthState("After clearing user and session (no session)");
          }
        }
      }
    );

    // Establecer un timeout para asegurarse de que no se queda en estado de carga
    const sessionCheckTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Session check timeout reached, forcing loading state to false");
        setIsLoading(false);
        logAuthState("After timeout forcing isLoading to false");
      }
    }, 3000);

    // Verificar sesión inicial
    supabase.auth.getSession().then(async ({ data: { session: currentSession }, error }) => {
      console.log('Initial session check:', currentSession?.user?.id);
      console.log('Initial session error:', error);
      
      if (!isMounted) {
        console.log("Componente desmontado, ignorando verificación inicial de sesión");
        return;
      }
      
      if (currentSession) {
        console.log("Sesión activa encontrada en verificación inicial:", {
          userId: currentSession.user.id,
          email: currentSession.user.email,
          expiresAt: currentSession.expires_at
        });
        
        setSession(currentSession);
        try {
          console.log("Fetching profile in initial session check for user:", currentSession.user.id);
          const profile = await fetchUserProfile(currentSession.user.id);
          
          if (profile && isMounted) {
            console.log("Initial user profile fetched successfully:", profile);
            setUser(profile);
            logAuthState("After setting initial user profile");
          } else if (isMounted) {
            console.error('No profile found for user in initial check:', currentSession.user.id);
            
            const basicUser: AuthUser = {
              id: currentSession.user.id,
              name: currentSession.user.user_metadata?.name || 'Usuario',
              email: currentSession.user.email || '',
              role: (currentSession.user.user_metadata?.role as UserRole) || 'admin',
            };
            
            console.log("Using basic user data as fallback in initial check:", basicUser);
            setUser(basicUser);
            logAuthState("After setting fallback user in initial check");
          }
        } catch (error) {
          console.error('Error fetching initial profile:', error);
          
          if (isMounted) {
            const basicUser: AuthUser = {
              id: currentSession.user.id,
              name: currentSession.user.user_metadata?.name || 'Usuario',
              email: currentSession.user.email || '',
              role: (currentSession.user.user_metadata?.role as UserRole) || 'admin',
            };
            
            console.log("Using basic user data as fallback due to initial error:", basicUser);
            setUser(basicUser);
            logAuthState("After setting fallback user due to initial error");
          }
        }
      } else {
        console.log("No initial session found");
      }
      
      if (isMounted) {
        setIsLoading(false);
        logAuthState("After initial session check completion");
      }
    }).catch(error => {
      console.error('Error in getSession:', error);
      if (isMounted) {
        setIsLoading(false);
        logAuthState("After getSession error");
      }
    });

    return () => {
      console.log("AuthProvider cleanup, unsubscribing from auth state changes");
      isMounted = false;
      clearTimeout(sessionCheckTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      console.error("Email and password are required");
      throw new Error("Email and password are required");
    }
    
    console.log("Login started for email:", email);
    logAuthState("Before login attempt");
    
    try {
      // Verificar el estado actual de autenticación antes del inicio de sesión
      console.log("login: Verificando sesión actual antes del login");
      const currentSession = await supabase.auth.getSession();
      console.log("login: Estado actual de la sesión:", {
        hasSession: !!currentSession.data.session,
        userId: currentSession.data.session?.user?.id,
        error: currentSession.error
      });
      
      // Si hay una sesión activa, intentar cerrarla primero para evitar conflictos
      if (currentSession.data.session) {
        console.log("login: Sesión existente detectada, cerrando sesión primero");
        await supabase.auth.signOut();
        console.log("login: Sesión cerrada con éxito");
      }
      
      console.log('login: Calling supabase.auth.signInWithPassword with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        console.error('Login error details:', {
          code: error.code,
          status: error.status,
          name: error.name
        });
        throw error;
      }

      if (!data.user) {
        console.error("No user data returned from auth");
        throw new Error("No user data returned from auth");
      }
      
      console.log("Auth successful, user ID:", data.user.id);
      console.log("Auth response data:", {
        userId: data.user.id,
        email: data.user.email,
        sessionExpiresAt: data.session?.expires_at
      });
      
      setSession(data.session);
      
      try {
        console.log("Fetching user profile after login for user:", data.user.id);
        const profile = await fetchUserProfile(data.user.id);
        
        if (profile) {
          console.log("Profile fetched successfully after login:", profile);
          setUser(profile);
          logAuthState("After setting user from profile");
        } else {
          console.warn("No profile found after login, using basic user data");
          const basicUser: AuthUser = {
            id: data.user.id,
            name: data.user.user_metadata?.name || 'Usuario',
            email: data.user.email || '',
            role: (data.user.user_metadata?.role as UserRole) || 'admin',
          };
          console.log("Setting basic user as fallback:", basicUser);
          setUser(basicUser);
          logAuthState("After setting basic user fallback");
        }
      } catch (profileError) {
        console.error("Error fetching profile after login:", profileError);
        const basicUser: AuthUser = {
          id: data.user.id,
          name: data.user.user_metadata?.name || 'Usuario',
          email: data.user.email || '',
          role: (data.user.user_metadata?.role as UserRole) || 'admin',
        };
        console.log("Setting basic user due to profile fetch error:", basicUser);
        setUser(basicUser);
        logAuthState("After setting basic user due to error");
      }
      
      toast.success('Inicio de sesión exitoso');
      return data;
      
    } catch (error: any) {
      console.error('Error logging in:', error.message);
      console.error('Login error stack:', error.stack);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole = 'admin') => {
    try {
      setIsLoading(true);
      console.log("Signup started with role:", role);
      
      // Verificar si ya existe una sesión activa
      const currentSession = await supabase.auth.getSession();
      if (currentSession.data.session) {
        console.log("signup: Sesión existente detectada, cerrando sesión primero");
        await supabase.auth.signOut();
      }
      
      console.log("signup: Llamando a supabase.auth.signUp con:", { email, name, role });
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
        console.error('Signup error details:', {
          code: error.code,
          status: error.status,
          name: error.name
        });
        toast.error('Error al crear la cuenta: ' + error.message);
        throw error;
      }

      console.log("Auth signup successful, creating profile...");
      console.log("Signup response data:", {
        userId: data.user?.id,
        email: data.user?.email,
        sessionPresent: !!data.session
      });
      
      if (data.user) {
        try {
          console.log("signup: Creando perfil para usuario:", data.user.id);
          const profileResult = await createUserProfile(data.user.id, { name, role, email });
          console.log("Profile created successfully for user:", data.user.id, profileResult);
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
          toast.error('La cuenta se creó pero hubo un problema con tu perfil');
        }
      } else {
        console.log("No user data returned from signup, possibly email confirmation required");
      }
      
      console.log("Signup complete with role:", role);
      return data;
      
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      console.error('Signup error stack:', error.stack);
      throw error;
    } finally {
      console.log("Signup process completed, resetting loading state");
      setIsLoading(false);
    }
  };

  const createUser = async (email: string, password: string, name: string, role: UserRole = 'admin'): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("Create user started with role:", role);
      
      let safeRole: UserRole = role;
      if (!['admin', 'gerente', 'mesero', 'cocina', 'repartidor', 'propietario'].includes(role)) {
        console.warn(`Invalid role provided: ${role}, defaulting to 'mesero'`);
        safeRole = 'mesero';
      }
      
      console.log("Llamando a createUserWithEdgeFunction con params:", {
        email, 
        passwordLength: password ? password.length : 0, 
        name, 
        role: safeRole
      });
      
      const result = await createUserWithEdgeFunction(email, password, name, safeRole);

      console.log("Resultado de createUserWithEdgeFunction:", {
        success: !!result?.user,
        error: result?.error ? (typeof result.error === 'string' ? result.error : JSON.stringify(result.error)) : null,
        userId: result?.user?.id
      });
      
      if (result && 'error' in result && result.error) {
        console.error("Error recibido de createUserWithEdgeFunction:", result.error);
        throw result.error;
      }

      toast.success(`Usuario ${name} creado correctamente con rol ${safeRole}`, {
        description: 'El usuario ya puede iniciar sesión con las credenciales proporcionadas'
      });
      console.log("Create user successful with role:", safeRole);
    } catch (error: any) {
      console.error('Error creating user:', error.message || error);
      console.error('Create user error stack:', error.stack || 'No stack trace available');
      toast.error(error.message || 'Error al crear el usuario');
      throw error;
    } finally {
      console.log("Create user process completed, resetting loading state");
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("Update user role started for user:", userId, "to role:", newRole);
      
      const success = await updateUserRoleById(userId, newRole);
      
      if (!success) {
        throw new Error('Error updating user role');
      }

      if (user && userId === user.id) {
        setUser(prev => prev ? { ...prev, role: newRole } : null);
        toast.success(`Tu rol ha sido actualizado a ${newRole}`);
      } else {
        toast.success(`Rol de usuario actualizado correctamente a ${newRole}`);
      }
      console.log("Update role successful");
    } catch (error: any) {
      console.error('Error updating user role:', error.message || error);
      console.error('Update role error stack:', error.stack || 'No stack trace available');
      toast.error(error.message || 'Error al actualizar el rol del usuario');
      throw error;
    } finally {
      console.log("Update role process completed, resetting loading state");
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      console.log("Logout started...");
      
      // Verificar sesión actual
      const currentSession = await supabase.auth.getSession();
      console.log("logout: Estado de sesión antes de logout:", {
        hasSession: !!currentSession.data.session,
        userId: currentSession.data.session?.user?.id
      });
      
      // Cerrar sesión
      console.log("logout: Llamando a logoutUser (supabase.auth.signOut)");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('logout: Error during signOut:', error);
        throw error;
      }
      
      // Verificar que la sesión se cerró correctamente
      const afterLogoutSession = await supabase.auth.getSession();
      console.log("logout: Estado de sesión después de logout:", {
        hasSession: !!afterLogoutSession.data.session,
        userId: afterLogoutSession.data.session?.user?.id
      });
      
      // Limpiar estado local
      setUser(null);
      setSession(null);
      console.log("logout: Estado local limpiado");
      
      console.log("Logout successful");
    } catch (error: any) {
      console.error('Error logging out:', error.message);
      console.error('Logout error stack:', error.stack);
      toast.error('Error al cerrar sesión');
    } finally {
      console.log("Logout process completed, resetting loading state");
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async (): Promise<AuthUser[]> => {
    try {
      console.log("Fetching all users from context...");
      
      // Verificar si el usuario es administrador
      if (user?.role !== 'admin' && user?.role !== 'gerente') {
        console.warn("fetchAllUsers: Usuario no es admin/gerente, puede no tener acceso:", user?.role);
      }
      
      const profiles = await fetchAllProfiles();
      console.log("Fetched profiles in fetchAllUsers:", profiles.length);
      return profiles;
    } catch (error) {
      console.error("Error fetching all users from context:", error);
      return [];
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
    fetchAllUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
