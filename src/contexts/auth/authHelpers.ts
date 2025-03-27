import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole, AuthError } from './types';
import { safetyCheck, filterValue } from '@/utils/supabaseHelpers';

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
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
      id: safetyCheck<UserProfile, 'id'>(data, 'id', ''),
      name: safetyCheck<UserProfile, 'name'>(data, 'name', ''),
      // For enum types, provide a default value from the enum
      role: safetyCheck<UserProfile, 'role'>(data, 'role', 'user' as UserRole),
      avatar: safetyCheck<UserProfile, 'avatar'>(data, 'avatar', null),
      created_at: safetyCheck<UserProfile, 'created_at'>(data, 'created_at', '')
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
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: data.user?.id, name, email }]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return { error: profileError };
    }

    return { user: data.user };
  } catch (err: any) {
    console.error('Signup error:', err);
    return { error: err.message };
  }
};

export const refreshProfile = async (user: any): Promise<UserProfile | null> => {
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

    const profile: UserProfile = {
      id: safetyCheck<UserProfile, 'id'>(data, 'id', ''),
      name: safetyCheck<UserProfile, 'name'>(data, 'name', ''),
      role: safetyCheck<UserProfile, 'role'>(data, 'role', 'user' as UserRole),
      avatar: safetyCheck<UserProfile, 'avatar'>(data, 'avatar', null),
      created_at: safetyCheck<UserProfile, 'created_at'>(data, 'created_at', '')
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

export const createProfileIfNotExists = async (userId: string, userData: { name: string; role?: UserRole }): Promise<UserProfile | null> => {
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
        id: safetyCheck<UserProfile, 'id'>(existingProfile, 'id', ''),
        name: safetyCheck<UserProfile, 'name'>(existingProfile, 'name', ''),
        role: safetyCheck<UserProfile, 'role'>(existingProfile, 'role', 'user' as UserRole),
        avatar: safetyCheck<UserProfile, 'avatar'>(existingProfile, 'avatar', null),
        created_at: safetyCheck<UserProfile, 'created_at'>(existingProfile, 'created_at', '')
      };
    }

    // Profile doesn't exist, create it
    const now = new Date().toISOString();
    const newProfile = {
      id: userId,
      name: userData.name,
      role: userData.role || 'user',
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
      id: safetyCheck<UserProfile, 'id'>(createdProfile, 'id', ''),
      name: safetyCheck<UserProfile, 'name'>(createdProfile, 'name', ''),
      role: safetyCheck<UserProfile, 'role'>(createdProfile, 'role', 'user' as UserRole),
      avatar: safetyCheck<UserProfile, 'avatar'>(createdProfile, 'avatar', null),
      created_at: safetyCheck<UserProfile, 'created_at'>(createdProfile, 'created_at', '')
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

    const role = safetyCheck<{ role: UserRole }, 'role'>(data, 'role', 'user' as UserRole);
    return role === 'admin' ? 'admin' : role === 'staff' ? 'staff' : 'user';
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
