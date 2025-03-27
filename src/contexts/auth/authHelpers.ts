
import { supabase } from '@/integrations/supabase/client';
import { UserRole, AuthUser } from './types';
import { safetyCheck, filterValue } from '@/utils/supabaseHelpers';

// Define AuthError interface
interface AuthError {
  message: string;
  code?: string;
}

// Helper function to safely process profile data
const processProfileData = (data: any, email?: string): AuthUser | null => {
  if (!data || (typeof data === 'object' && 'error' in data)) {
    return null;
  }
  
  return {
    id: safetyCheck<AuthUser, 'id'>(data, 'id', ''),
    name: safetyCheck<AuthUser, 'name'>(data, 'name', ''),
    email: email || safetyCheck<AuthUser, 'email'>(data, 'email', ''),
    role: safetyCheck<AuthUser, 'role'>(data, 'role', 'admin' as UserRole),
    avatar: safetyCheck<AuthUser, 'avatar'>(data, 'avatar', null),
    created_at: safetyCheck<AuthUser, 'created_at'>(data, 'created_at', '')
  };
};

// Export all the functions that AuthContext.tsx expects
export const getProfile = async (userId: string): Promise<AuthUser | null> => {
  try {
    // First get the profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', filterValue(userId))
      .single();

    if (error) {
      throw error;
    }

    // Get the user's session to access email
    const { data: sessionData } = await supabase.auth.getSession();
    const userEmail = sessionData?.session?.user?.email || '';

    // Return profile with email from auth
    return processProfileData(data, userEmail);
  } catch (error) {
    const authError = error as AuthError;
    console.error('Error fetching profile:', authError);
    return null;
  }
};

export const login = async (email: string, password: string): Promise<{ user: any } | { error: any }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) {
      return { error };
    }
    return { user: data.user };
  } catch (err: any) {
    console.error('Login error:', err);
    return { error: err.message };
  }
};

export const signup = async (email: string, name: string, password: string): Promise<{ user: any } | { error: any }> => {
  try {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          name,
          role: 'admin'
        }
      }
    });

    if (error) {
      return { error };
    }

    interface SupabaseUser {
      id: string;
      [key: string]: any;
    }
    
    if (!data || !data.user) {
      console.error('No user data returned from signup');
      return { user: data?.user || null };
    }
    
    const user = data.user as SupabaseUser;
    
    if (user && user.id) {
      const userId = user.id;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          id: userId, 
          name, 
          role: 'admin' as UserRole,
          email: email // También guardar el correo en la tabla de perfiles para facilitar el acceso
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { error: profileError };
      }
    } else {
      console.warn('User object missing ID, profile not created');
    }

    return { user: data.user };
  } catch (err: any) {
    console.error('Signup error:', err);
    return { error: err.message };
  }
};

export const refreshProfile = async (user: any): Promise<AuthUser | null> => {
  if (!user || !user.id) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', filterValue(user.id))
      .single();

    if (error) {
      throw error;
    }

    // Get the user's email from session
    const { data: sessionData } = await supabase.auth.getSession();
    const userEmail = sessionData?.session?.user?.email || '';

    return processProfileData(data, userEmail);
  } catch (error) {
    console.error('Error refreshing profile:', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const createProfileIfNotExists = async (userId: string, userData: { name: string; role?: UserRole; email?: string }): Promise<AuthUser | null> => {
  try {
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', filterValue(userId))
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingProfile) {
      // Get the user's session to access email
      const { data: sessionData } = await supabase.auth.getSession();
      const userEmail = sessionData?.session?.user?.email || userData.email || '';
      
      return processProfileData(existingProfile, userEmail);
    }

    const now = new Date().toISOString();
    const newProfile = {
      id: userId,
      name: userData.name,
      email: userData.email || '',
      role: userData.role || 'admin',
      created_at: now
    };

    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return processProfileData(createdProfile, userData.email);
  } catch (error) {
    console.error('Error creating profile:', error);
    return null;
  }
};

export const getRoleFromProfile = async (userId: string): Promise<UserRole | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', filterValue(userId))
      .single();

    if (error) {
      throw error;
    }

    if (!data) return null;
    
    const roleValue = safetyCheck<{ role: UserRole }, 'role'>(data, 'role', 'admin' as UserRole);
    
    if (roleValue === 'admin' || roleValue === 'waiter' || roleValue === 'kitchen' || 
        roleValue === 'delivery' || roleValue === 'manager') {
      return roleValue;
    }
    
    return 'admin';
  } catch (error) {
    console.error('Error getting role:', error);
    return null;
  }
};

export const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', filterValue(userId));

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};

export const updateUserName = async (userId: string, newName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ name: newName })
      .eq('id', filterValue(userId));

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating user name:', error);
    return false;
  }
};

// Add a new function to fetch user auth details - usando métodos no administrativos
export const getUserAuthData = async (userId: string): Promise<{ email: string } | null> => {
  try {
    // Obtenemos la sesión actual
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Si el userId coincide con el usuario de la sesión, podemos obtener el email
    if (sessionData?.session?.user?.id === userId) {
      return { 
        email: sessionData.session.user.email || '' 
      };
    }
    
    // Si estamos buscando otro usuario, intentamos obtener su email desde la tabla profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', filterValue(userId))
      .single();
      
    if (error) {
      throw error;
    }
    
    return { 
      email: data?.email || '' 
    };
  } catch (error) {
    console.error('Error fetching user auth data:', error);
    return null;
  }
};

// Updated function to fetch all profiles with email data - sin usar funciones admin
export const fetchAllProfiles = async (): Promise<AuthUser[]> => {
  try {
    console.log('Fetching all profiles from Supabase...');
    
    // Primero obtenemos todos los perfiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      throw error;
    }

    if (!profiles || !Array.isArray(profiles)) {
      console.log('No profiles found or invalid response format');
      return [];
    }

    console.log(`Found ${profiles.length} profiles`);
    
    // Obtenemos la sesión actual para tener acceso al email del usuario actual
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id;
    const currentUserEmail = sessionData?.session?.user?.email || '';
    
    // Procesamos cada perfil
    const usersWithData = profiles.map(profile => {
      // Para el usuario actual, usamos el email de la sesión
      const email = (profile.id === currentUserId) ? 
        currentUserEmail : 
        (profile.email || ''); // Para otros usuarios, usamos el email almacenado en la tabla profiles
        
      return {
        id: profile?.id || '',
        name: profile?.name || '',
        email: email,
        role: (profile?.role as UserRole) || 'admin',
        avatar: profile?.avatar,
        created_at: profile?.created_at || ''
      };
    });

    console.log('Processed all profiles with email data');
    return usersWithData;
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    return [];
  }
};

// Add the missing functions that AuthContext.tsx is expecting
export const fetchUserProfile = getProfile;
export const signupUser = signup;
export const createUserProfile = createProfileIfNotExists;
export const createUserByAdmin = async (email: string, password: string, name: string, role: UserRole = 'admin') => {
  try {
    // Utilizamos el método estándar de registro en lugar del método admin
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });

    if (error) {
      return { error };
    }

    if (!data || !data.user) {
      return { error: new Error('No user data returned') };
    }

    // Create profile for the user
    await createProfileIfNotExists(data.user.id, { 
      name, 
      role, 
      email 
    });

    return { user: data.user };
  } catch (err: any) {
    console.error('Create user error:', err);
    return { error: err.message };
  }
};

export const updateUserRoleById = updateUserRole;
export const logoutUser = logout;

