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
    console.log("processProfileData: Invalid data received:", data);
    return null;
  }
  
  const processedData = {
    id: safetyCheck<AuthUser, 'id'>(data, 'id', ''),
    name: safetyCheck<AuthUser, 'name'>(data, 'name', ''),
    email: email || safetyCheck<AuthUser, 'email'>(data, 'email', ''),
    role: safetyCheck<AuthUser, 'role'>(data, 'role', 'admin' as UserRole),
    avatar: safetyCheck<AuthUser, 'avatar'>(data, 'avatar', null),
    created_at: safetyCheck<AuthUser, 'created_at'>(data, 'created_at', '')
  };
  
  console.log("processProfileData: Processed user data:", processedData);
  return processedData;
};

// Export fetchUserProfile to get complete user profile
export const fetchUserProfile = async (userId: string): Promise<AuthUser | null> => {
  try {
    console.log('Fetching profile for user ID:', userId);
    
    // First get the profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', filterValue(userId))
      .single();

    if (error) {
      console.error('Error in fetchUserProfile:', error.message, error);
      throw error;
    }

    if (!data) {
      console.error('No profile data found in fetchUserProfile');
      return null;
    }

    console.log('Profile data retrieved:', data);

    // Get the user's session to access email
    const { data: sessionData } = await supabase.auth.getSession();
    const userEmail = sessionData?.session?.user?.email || '';
    console.log('User email from session:', userEmail);

    // Return profile with email from auth
    return processProfileData(data, userEmail);
  } catch (error: any) {
    console.error('Error in fetchUserProfile:', error.message, error);
    return null;
  }
};

export const getProfile = async (userId: string): Promise<AuthUser | null> => {
  try {
    console.log('getProfile: Fetching profile for user ID:', userId);
    // First get the profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', filterValue(userId))
      .single();

    if (error) {
      console.error('getProfile: Error fetching profile:', error);
      throw error;
    }

    // Get the user's session to access email
    const { data: sessionData } = await supabase.auth.getSession();
    const userEmail = sessionData?.session?.user?.email || '';
    console.log('getProfile: User email from session:', userEmail);

    // Return profile with email from auth
    const profile = processProfileData(data, userEmail);
    console.log('getProfile: Processed profile:', profile);
    return profile;
  } catch (error) {
    const authError = error as AuthError;
    console.error('Error fetching profile:', authError);
    return null;
  }
};

export const login = async (email: string, password: string): Promise<{ user: any } | { error: any }> => {
  try {
    console.log(`login: Starting login process for email: ${email}`);
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) {
      console.error('login: Error during signInWithPassword:', error);
      return { error };
    }
    
    console.log('login: Authentication successful, user:', data.user);
    return { user: data.user };
  } catch (err: any) {
    console.error('Login error:', err);
    return { error: err.message };
  }
};

export const signup = async (email: string, password: string, name: string, role: UserRole = 'admin'): Promise<{ user: any } | { error: any }> => {
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
          role: 'admin' as UserRole
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
    console.log(`Updating user ${userId} role to ${newRole}`);
    
    // Use direct update with Supabase query
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', filterValue(userId));

    if (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
    
    console.log(`Successfully updated user ${userId} role to ${newRole}`);
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

export const getUserAuthData = async (userId: string): Promise<{ email: string } | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData?.session?.user?.id === userId) {
      return { 
        email: sessionData.session.user.email || '' 
      };
    }
    
    return { email: '' };
  } catch (error) {
    console.error('Error fetching user auth data:', error);
    return null;
  }
};

export const fetchAllProfiles = async (): Promise<AuthUser[]> => {
  try {
    console.log('Fetching all profiles from Supabase...');
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }

    if (!profiles || !Array.isArray(profiles)) {
      console.log('No profiles found or invalid response format');
      return [];
    }

    console.log(`Found ${profiles.length} profiles:`, profiles);
    
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id;
    const currentUserEmail = sessionData?.session?.user?.email || '';
    
    const usersWithData = await Promise.all(profiles.map(async (profile) => {
      let email = '';
      
      if (profile.id === currentUserId) {
        email = currentUserEmail;
      } else {
        try {
          const authData = await getUserAuthData(profile.id);
          email = authData?.email || '';
        } catch (e) {
          console.error('Error fetching auth data for user:', profile.id, e);
        }
      }
      
      return {
        id: profile?.id || '',
        name: profile?.name || '',
        email: email,
        role: (profile?.role as UserRole) || 'admin',
        avatar: profile?.avatar,
        created_at: profile?.created_at || ''
      };
    }));

    console.log('Processed all profiles with email data:', usersWithData);
    return usersWithData;
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    return [];
  }
};

export const createUserWithEdgeFunction = async (email: string, password: string, name: string, role: UserRole = 'admin'): Promise<{ user?: any; error?: any }> => {
  try {
    console.log(`Creating user with edge function: ${email}, ${name}, ${role}`);
    
    // First, create the user with Supabase auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role }
    });

    if (authError) {
      console.error('Error creating user:', authError);
      return { error: authError };
    }

    if (!authData.user) {
      return { error: 'Error: No user returned from auth' };
    }

    console.log('User created successfully with ID:', authData.user.id);
    
    // Then, ensure profile exists
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          id: authData.user.id, 
          name, 
          role
        }])
        .single();

      if (profileError) {
        // If the profile already exists, try updating it instead
        if (profileError.code === '23505') { // Duplicate key error
          console.log('Profile already exists, updating instead');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ name, role })
            .eq('id', authData.user.id);
            
          if (updateError) {
            console.error('Error updating profile:', updateError);
            return { error: updateError, user: authData.user };
          }
        } else {
          console.error('Error creating profile:', profileError);
          return { error: profileError, user: authData.user };
        }
      }
    } catch (profileError) {
      console.error('Exception creating profile:', profileError);
      return { error: profileError, user: authData.user };
    }

    return { user: authData.user };
  } catch (error) {
    console.error('Exception in createUserWithEdgeFunction:', error);
    return { error };
  }
};

export const getUserFromProfiles = async (userId: string): Promise<AuthUser | null> => {
  try {
    console.log('Getting user from profiles, ID:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', filterValue(userId))
      .single();
      
    if (error) {
      console.error('Error getting user from profiles:', error);
      return null;
    }
    
    if (!data) {
      console.log('No profile found for user ID:', userId);
      return null;
    }
    
    const { data: sessionData } = await supabase.auth.getSession();
    const userEmail = sessionData?.session?.user?.id === userId 
      ? sessionData.session.user.email || ''
      : '';
      
    return {
      id: data.id,
      name: data.name,
      email: userEmail,
      role: data.role as UserRole,
      avatar: data.avatar,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Error in getUserFromProfiles:', error);
    return null;
  }
};

export const getUserFromTable = async (tableName: string, userId: string): Promise<AuthUser | null> => {
  try {
    console.log(`Getting user from ${tableName}, ID:`, userId);
    
    // Validate table name to prevent SQL injection and type errors
    if (tableName !== 'profiles') {
      console.error(`Invalid table name: ${tableName}, only 'profiles' is allowed`);
      return null;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', filterValue(userId))
      .single();
      
    if (error) {
      console.error(`Error getting user from ${tableName}:`, error);
      return null;
    }
    
    if (!data) {
      console.log(`No user found in ${tableName} for ID:`, userId);
      return null;
    }
    
    // Now we know data is from the profiles table, so we can safely access its properties
    return {
      id: data.id,
      name: data.name || 'Unknown',
      email: '', // Email is not stored in profiles table
      role: data.role as UserRole, // Cast to UserRole type
      avatar: data.avatar,
      created_at: data.created_at
    };
  } catch (error) {
    console.error(`Error in getUserFromTable (${tableName}):`, error);
    return null;
  }
};

export const signupUser = signup;
export const createUserProfile = createProfileIfNotExists;
export const createUserByAdmin = createUserWithEdgeFunction;
export const updateUserRoleById = updateUserRole;
export const logoutUser = logout;
