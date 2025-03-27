
import { supabase } from '@/integrations/supabase/client';
import { UserRole, AuthUser } from './types';
import { safetyCheck, filterValue } from '@/utils/supabaseHelpers';

// Define AuthError interface
interface AuthError {
  message: string;
  code?: string;
}

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

    if (!data) {
      return null;
    }

    return {
      id: safetyCheck<AuthUser, 'id'>(data, 'id', ''),
      name: safetyCheck<AuthUser, 'name'>(data, 'name', ''),
      email: '', // Add a default empty email since profiles don't store this
      // For enum types, provide a default value from the enum
      role: safetyCheck<AuthUser, 'role'>(data, 'role', 'admin' as UserRole),
      avatar: safetyCheck<AuthUser, 'avatar'>(data, 'avatar', null),
      created_at: safetyCheck<AuthUser, 'created_at'>(data, 'created_at', '')
    };
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

    // Create a user profile after successful signup
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id, name, email }] as any);

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

    if (!data) {
      return null;
    }

    const profile: AuthUser = {
      id: safetyCheck<AuthUser, 'id'>(data, 'id', ''),
      name: safetyCheck<AuthUser, 'name'>(data, 'name', ''),
      email: '', // Add a default email since profiles table doesn't store it
      role: safetyCheck<AuthUser, 'role'>(data, 'role', 'admin' as UserRole),
      avatar: safetyCheck<AuthUser, 'avatar'>(data, 'avatar', null),
      created_at: safetyCheck<AuthUser, 'created_at'>(data, 'created_at', '')
    };

    return profile;
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
      return {
        id: safetyCheck<AuthUser, 'id'>(existingProfile, 'id', ''),
        name: safetyCheck<AuthUser, 'name'>(existingProfile, 'name', ''),
        email: '', // Add a default email
        role: safetyCheck<AuthUser, 'role'>(existingProfile, 'role', 'admin' as UserRole),
        avatar: safetyCheck<AuthUser, 'avatar'>(existingProfile, 'avatar', null),
        created_at: safetyCheck<AuthUser, 'created_at'>(existingProfile, 'created_at', '')
      };
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
      .insert([newProfile as any])
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Return the newly created profile
    return {
      id: safetyCheck<AuthUser, 'id'>(createdProfile, 'id', ''),
      name: safetyCheck<AuthUser, 'name'>(createdProfile, 'name', ''),
      email: '', // Add a default email
      role: safetyCheck<AuthUser, 'role'>(createdProfile, 'role', 'admin' as UserRole),
      avatar: safetyCheck<AuthUser, 'avatar'>(createdProfile, 'avatar', null),
      created_at: safetyCheck<AuthUser, 'created_at'>(createdProfile, 'created_at', '')
    };
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
      .update({ role: newRole } as any)
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
      .update({ name: newName } as any)
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

    return (data || []).map(profile => ({
      id: profile.id || '',
      name: profile.name || '',
      email: '', // Add default email
      role: profile.role as UserRole || 'admin',
      avatar: profile.avatar,
      created_at: profile.created_at || ''
    }));
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    return [];
  }
};
