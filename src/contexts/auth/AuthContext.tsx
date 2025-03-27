
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
  fetchAllProfiles
} from './authHelpers';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Debugging helper
  const logAuthState = (prefix: string) => {
    console.log(`${prefix} - Auth State:`, {
      isLoading,
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email
        }
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
    
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        logAuthState("Before auth state update");
        
        if (!isMounted) return;
        
        if (currentSession) {
          setSession(currentSession);
          
          // Important: use setTimeout to prevent deadlocks with Supabase auth
          setTimeout(async () => {
            if (!isMounted) return;
            try {
              console.log("Fetching user profile after auth state change for user:", currentSession.user.id);
              const profile = await fetchUserProfile(currentSession.user.id);
              
              if (profile && isMounted) {
                console.log("User profile fetched successfully:", profile);
                setUser(profile);
                logAuthState("After setting user profile");
              } else if (isMounted) {
                console.error('No profile found for user:', currentSession.user.id);
                
                // Create a basic user object from auth data as fallback
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
                // Create a basic user object from auth data as fallback on error
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

    // Set a reasonable timeout for initial auth check
    const sessionCheckTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Session check timeout reached, forcing loading state to false");
        setIsLoading(false);
        logAuthState("After timeout forcing isLoading to false");
      }
    }, 3000);

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession?.user?.id);
      if (!isMounted) return;
      
      if (currentSession) {
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
            
            // Create a basic user object from auth data as fallback
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
            // Create a basic user object from auth data as fallback on error
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        throw error;
      }

      if (!data.user) {
        console.error("No user data returned from auth");
        throw new Error("No user data returned from auth");
      }
      
      console.log("Auth successful, user ID:", data.user.id);
      
      // Set session before fetching profile to ensure auth state is updated
      setSession(data.session);
      
      // Important: Fetch profile to get the user's role and other data
      try {
        console.log("Fetching user profile after login for user:", data.user.id);
        const profile = await fetchUserProfile(data.user.id);
        
        if (profile) {
          console.log("Profile fetched successfully after login:", profile);
          setUser(profile);
          logAuthState("After setting user from profile");
        } else {
          console.warn("No profile found after login, using basic user data");
          // Create a minimal user object from auth data if profile fetch fails
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
        // Still consider login successful even if profile fetch fails,
        // but log the error and create a minimal user object
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
      throw error;
    }
  };

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
        toast.error('Error al crear la cuenta: ' + error.message);
        throw error;
      }

      console.log("Auth signup successful, creating profile...");
      
      if (data.user) {
        try {
          // Pass only userId and name to createUserProfile
          await createUserProfile(data.user.id, { name, role, email });
          console.log("Profile created successfully for user:", data.user.id);
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
      
      // First, ensure we have the correct role format
      let safeRole: UserRole = role;
      if (!['admin', 'waiter', 'kitchen', 'delivery', 'manager'].includes(role)) {
        console.warn(`Invalid role provided: ${role}, defaulting to 'waiter'`);
        safeRole = 'waiter';
      }
      
      // Use the Edge Function to create user with admin privileges
      const result = await createUserByAdmin(email, password, name, safeRole);

      // Handle the user creation result safely
      if (result && 'error' in result && result.error) {
        throw result.error;
      }

      toast.success(`Usuario ${name} creado correctamente con rol ${safeRole}`, {
        description: 'El usuario ya puede iniciar sesión con las credenciales proporcionadas'
      });
      console.log("Create user successful with role:", safeRole);
    } catch (error: any) {
      console.error('Error creating user:', error.message);
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
      console.log("Update user role started...");
      
      await updateUserRoleById(userId, newRole);

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

  const fetchAllUsers = async (): Promise<AuthUser[]> => {
    try {
      console.log("Fetching all users from context...");
      // Get all users with their profiles and email information
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
