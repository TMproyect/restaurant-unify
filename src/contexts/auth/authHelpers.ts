import { supabase } from '@/integrations/supabase/client';
import { UserRole, AuthUser } from './types';
import { safetyCheck, filterValue } from '@/utils/supabaseHelpers';

// Define AuthError interface
interface AuthError {
  message: string;
  code?: string;
}

// Helper function to safely process profile data
const processProfileData = (data: any): AuthUser | null => {
  if (!data || (typeof data === 'object' && 'error' in data)) {
    return null;
  }
  
  return {
    id: safetyCheck<AuthUser, 'id'>(data, 'id', ''),
    name: safetyCheck<AuthUser, 'name'>(data, 'name', ''),
    email: '', // Add a default empty email since profiles don't store this
    role: safetyCheck<AuthUser, 'role'>(data, 'role', 'admin' as UserRole),
    avatar: safetyCheck<AuthUser, 'avatar'>(data, 'avatar', null),
    created_at: safetyCheck<AuthUser, 'created_at'>(data, 'created_at', '')
  };
};

// Export all the functions that AuthContext.tsx expects
export const getProfile = async (userId: string): Promise<AuthUser | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', filterValue(userId))
      .single();

    if (error) {
      throw error;
    }

    return processProfileData(data);
  } catch (error) {
    const authError = error as AuthError;
    console.error('Error fetching profile:', authError);
    return null;
  }
};

export const login = async (email: string): Promise<{ user: any } | { error: any }> => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      return { error };
    }
    return { user: data.user };
  } catch (err: any) {
    console.error('Login error:', err);
    return { error: err.message };
  }
};

export const signup = async (email: string, name: string): Promise<{ user: any } | { error: any }> => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      return { error };
    }

    // Fix: Properly check and type the data.user to avoid "never" type issues
    if (data && data.user && data.user.id) {
      const userId = data.user.id;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          id: userId, 
          name, 
          role: 'admin' as UserRole 
        }]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { error: profileError };
      }
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

    return processProfileData(data);
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

export const createProfileIfNotExists = async (userId: string, userData: { name: string; role?: UserRole }): Promise<AuthUser | null> => {
  try {
    // First, check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', filterValue(userId))
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // Not found error code
      throw fetchError;
    }

    if (existingProfile) {
      // Profile exists, return it
      return processProfileData(existingProfile);
    }

    // Profile doesn't exist, create it
    const now = new Date().toISOString();
    const newProfile = {
      id: userId,
      name: userData.name,
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

    // Return the newly created profile
    return processProfileData(createdProfile);
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
    
    // Safely convert to UserRole
    const roleValue = safetyCheck<{ role: UserRole }, 'role'>(data, 'role', 'admin' as UserRole);
    
    // Ensure role is one of the valid values
    if (roleValue === 'admin' || roleValue === 'waiter' || roleValue === 'kitchen' || 
        roleValue === 'delivery' || roleValue === 'manager') {
      return roleValue;
    }
    
    // Default to admin for unknown roles
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

// Add the missing functions that AuthContext.tsx is expecting
export const fetchUserProfile = getProfile;
export const signupUser = signup;
export const createUserProfile = createProfileIfNotExists;
export const createUserByAdmin = async (email: string, password: string, name: string, role: UserRole = 'admin') => {
  // For now, just return a standard signup response
  return signup(email, name);
};
export const updateUserRoleById = updateUserRole;
export const logoutUser = logout;
export const fetchAllProfiles = async (): Promise<AuthUser[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      return [];
    }

    // Map the data to the expected format with type checking
    return data.map(profile => ({
      id: profile?.id || '',
      name: profile?.name || '',
      email: '', // Add default email
      role: (profile?.role as UserRole) || 'admin',
      avatar: profile?.avatar,
      created_at: profile?.created_at || ''
    }));
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    return [];
  }
};
