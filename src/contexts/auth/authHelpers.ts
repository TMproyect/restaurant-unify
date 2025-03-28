
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
    
    // Use RPC function to get profile instead of direct query to avoid RLS issues
    const { data, error } = await supabase.rpc('get_profile_by_id', { user_id: userId });

    if (error) {
      console.error('Error in fetchUserProfile with RPC:', error.message, error);
      
      // Fallback to get_all_profiles RPC
      console.log('Falling back to get_all_profiles RPC');
      const { data: allProfiles, error: allProfilesError } = await supabase.rpc('get_all_profiles');
      
      if (allProfilesError) {
        console.error('Error in fallback to get_all_profiles:', allProfilesError);
        return null;
      }
      
      if (!allProfiles || !Array.isArray(allProfiles)) {
        console.error('No profiles found in get_all_profiles fallback');
        return null;
      }
      
      const userProfile = allProfiles.find(profile => profile.id === userId);
      if (!userProfile) {
        console.error('User profile not found in get_all_profiles results');
        return null;
      }
      
      console.log('Profile found in get_all_profiles:', userProfile);
      
      // Get the user's session to access email
      const { data: sessionData } = await supabase.auth.getSession();
      const userEmail = sessionData?.session?.user?.email || '';
      console.log('User email from session:', userEmail);
      
      return processProfileData(userProfile, userEmail);
    }

    if (!data) {
      console.error('No profile data found in fetchUserProfile');
      return null;
    }

    console.log('Profile data retrieved:', data);

    // Get the user's session to access email
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('Session data for email lookup:', sessionData);
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
    
    // Try using RPC function instead of direct query
    const { data, error } = await supabase.rpc('get_profile_by_id', { user_id: userId });

    if (error) {
      console.error('getProfile: Error fetching profile with RPC:', error);
      
      // Fallback to get_all_profiles
      console.log('getProfile: Falling back to get_all_profiles');
      const { data: allProfiles, error: allProfilesError } = await supabase.rpc('get_all_profiles');
      
      if (allProfilesError) {
        console.error('getProfile: Error in fallback to get_all_profiles:', allProfilesError);
        return null;
      }
      
      const userProfile = Array.isArray(allProfiles) 
        ? allProfiles.find(profile => profile.id === userId)
        : null;
        
      if (!userProfile) {
        console.error('getProfile: User profile not found in get_all_profiles results');
        return null;
      }
      
      console.log('getProfile: Profile found in get_all_profiles:', userProfile);
      
      // Get the user's session to access email
      const { data: sessionData } = await supabase.auth.getSession();
      const userEmail = sessionData?.session?.user?.email || '';
      console.log('getProfile: User email from session:', userEmail);
      
      return processProfileData(userProfile, userEmail);
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
    
    // Intentar obtener sesión antes del login para verificar el estado inicial
    const initialSession = await supabase.auth.getSession();
    console.log('login: Initial session state before login:', {
      hasSession: !!initialSession.data.session,
      userId: initialSession.data.session?.user?.id,
      error: initialSession.error
    });
    
    console.log('login: Calling supabase.auth.signInWithPassword');
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) {
      console.error('login: Error during signInWithPassword:', error);
      console.error('login: Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      return { error };
    }
    
    if (!data.user) {
      console.error('login: No user data returned from signInWithPassword');
      return { error: { message: 'No se recibieron datos de usuario' } };
    }
    
    // Verificar sesión después del login
    const afterLoginSession = await supabase.auth.getSession();
    console.log('login: Session state after login:', {
      hasSession: !!afterLoginSession.data.session,
      userId: afterLoginSession.data.session?.user?.id,
      error: afterLoginSession.error
    });
    
    console.log('login: Authentication successful, user:', data.user);
    
    // Intentar obtener perfil después del login para diagnosticar
    try {
      const userProfile = await fetchUserProfile(data.user.id);
      console.log('login: User profile after login:', userProfile);
    } catch (profileError) {
      console.error('login: Error fetching profile after successful login:', profileError);
    }
    
    return { user: data.user };
  } catch (err: any) {
    console.error('Login unexpected error:', err);
    console.error('Login error stack:', err.stack);
    return { error: err.message };
  }
};

export const signup = async (email: string, password: string, name: string, role: UserRole = 'admin'): Promise<{ user: any } | { error: any }> => {
  try {
    console.log(`signup: Starting signup process for email: ${email}, name: ${name}, role: ${role}`);
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
      console.error('signup: Error during signUp:', error);
      console.error('signup: Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
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
    console.log('signup: User created in auth:', user);
    
    if (user && user.id) {
      const userId = user.id;
      console.log('signup: Creating profile for user ID:', userId);
      
      const { error: profileError, data: profileData } = await supabase
        .from('profiles')
        .insert([{ 
          id: userId, 
          name, 
          role: 'admin' as UserRole
        }])
        .select();

      if (profileError) {
        console.error('signup: Profile creation error:', profileError);
        console.error('signup: Profile error details:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details
        });
        return { error: profileError };
      }
      
      console.log('signup: Profile created successfully:', profileData);
    } else {
      console.warn('User object missing ID, profile not created');
    }

    return { user: data.user };
  } catch (err: any) {
    console.error('Signup unexpected error:', err);
    console.error('Signup error stack:', err.stack);
    return { error: err.message };
  }
};

export const refreshProfile = async (user: any): Promise<AuthUser | null> => {
  if (!user || !user.id) {
    console.log('refreshProfile: No user or user ID provided');
    return null;
  }

  try {
    console.log('refreshProfile: Getting profile for user ID:', user.id);
    // Try using RPC function instead of direct query
    const { data, error } = await supabase.rpc('get_profile_by_id', { user_id: user.id });

    if (error) {
      console.error('refreshProfile: Error fetching profile with RPC:', error);
      
      // Fallback to get_all_profiles
      console.log('refreshProfile: Falling back to get_all_profiles');
      const { data: allProfiles, error: allProfilesError } = await supabase.rpc('get_all_profiles');
      
      if (allProfilesError) {
        console.error('refreshProfile: Error in fallback to get_all_profiles:', allProfilesError);
        return null;
      }
      
      const userProfile = Array.isArray(allProfiles) 
        ? allProfiles.find(profile => profile.id === user.id)
        : null;
        
      if (!userProfile) {
        console.error('refreshProfile: User profile not found in get_all_profiles results');
        return null;
      }
      
      console.log('refreshProfile: Profile found in get_all_profiles:', userProfile);
      
      // Get the user's session to access email
      const { data: sessionData } = await supabase.auth.getSession();
      const userEmail = sessionData?.session?.user?.email || '';
      
      return processProfileData(userProfile, userEmail);
    }

    // Get the user's email from session
    const { data: sessionData } = await supabase.auth.getSession();
    const userEmail = sessionData?.session?.user?.email || '';
    console.log('refreshProfile: User email from session:', userEmail);

    const profile = processProfileData(data, userEmail);
    console.log('refreshProfile: Profile refreshed successfully:', profile);
    return profile;
  } catch (error) {
    console.error('Error refreshing profile:', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    console.log('logout: Starting logout process');
    
    // Verificar sesión antes del logout
    const beforeLogoutSession = await supabase.auth.getSession();
    console.log('logout: Session before logout:', {
      hasSession: !!beforeLogoutSession.data.session,
      userId: beforeLogoutSession.data.session?.user?.id
    });
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('logout: Error during signOut:', error);
      throw error;
    }
    
    // Verificar sesión después del logout
    const afterLogoutSession = await supabase.auth.getSession();
    console.log('logout: Session after logout:', {
      hasSession: !!afterLogoutSession.data.session,
      userId: afterLogoutSession.data.session?.user?.id
    });
    
    console.log('logout: Logout completed successfully');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const createProfileIfNotExists = async (userId: string, userData: { name: string; role?: UserRole; email?: string }): Promise<AuthUser | null> => {
  try {
    console.log('createProfileIfNotExists: Checking for existing profile, user ID:', userId);
    // Try using RPC function to get profile
    const { data: existingProfile, error: fetchError } = await supabase.rpc('get_profile_by_id', { user_id: userId });

    if (fetchError) {
      console.error('createProfileIfNotExists: Error checking for existing profile with RPC:', fetchError);
      
      // Fallback to get_all_profiles
      console.log('createProfileIfNotExists: Falling back to get_all_profiles');
      const { data: allProfiles, error: allProfilesError } = await supabase.rpc('get_all_profiles');
      
      if (allProfilesError && allProfilesError.code !== 'PGRST116') {
        console.error('createProfileIfNotExists: Error in fallback to get_all_profiles:', allProfilesError);
        
        // Final fallback - try direct query
        const { data: directProfile, error: directError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', filterValue(userId))
          .single();
        
        if (directError && directError.code !== 'PGRST116') {
          console.error('createProfileIfNotExists: Error in final direct query fallback:', directError);
          throw directError;
        }
        
        if (directProfile) {
          console.log('createProfileIfNotExists: Profile found via direct query:', directProfile);
          
          // Get the user's session to access email
          const { data: sessionData } = await supabase.auth.getSession();
          const userEmail = sessionData?.session?.user?.email || userData.email || '';
          
          return processProfileData(directProfile, userEmail);
        }
      } else {
        const userProfile = Array.isArray(allProfiles) 
          ? allProfiles.find(profile => profile.id === userId)
          : null;
          
        if (userProfile) {
          console.log('createProfileIfNotExists: Profile found in get_all_profiles:', userProfile);
          
          // Get the user's session to access email
          const { data: sessionData } = await supabase.auth.getSession();
          const userEmail = sessionData?.session?.user?.email || userData.email || '';
          
          return processProfileData(userProfile, userEmail);
        }
      }
    }

    if (existingProfile) {
      console.log('createProfileIfNotExists: Profile already exists:', existingProfile);
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

    console.log('createProfileIfNotExists: Creating new profile:', newProfile);
    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();

    if (createError) {
      console.error('createProfileIfNotExists: Error creating profile:', createError);
      console.error('createProfileIfNotExists: Profile creation error details:', {
        message: createError.message,
        code: createError.code,
        details: createError.details
      });
      throw createError;
    }

    console.log('createProfileIfNotExists: Profile created successfully:', createdProfile);
    return processProfileData(createdProfile, userData.email);
  } catch (error) {
    console.error('Error creating profile:', error);
    return null;
  }
};

export const getRoleFromProfile = async (userId: string): Promise<UserRole | null> => {
  try {
    console.log('getRoleFromProfile: Getting role for user ID:', userId);
    
    // Try using RPC function
    const { data, error } = await supabase.rpc('get_user_role', { user_id: userId });

    if (error) {
      console.error('getRoleFromProfile: Error getting role with RPC:', error);
      
      // Fallback to get_all_profiles
      console.log('getRoleFromProfile: Falling back to get_all_profiles');
      const { data: allProfiles, error: allProfilesError } = await supabase.rpc('get_all_profiles');
      
      if (allProfilesError) {
        console.error('getRoleFromProfile: Error in fallback to get_all_profiles:', allProfilesError);
        
        // Final fallback - try direct query with service role
        const { data: directData, error: directError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', filterValue(userId))
          .single();
        
        if (directError) {
          console.error('getRoleFromProfile: Error in final direct query fallback:', directError);
          return null;
        }
        
        if (!directData) return null;
        
        const roleValue = safetyCheck<{ role: UserRole }, 'role'>(directData, 'role', 'admin' as UserRole);
        console.log('getRoleFromProfile: Retrieved role via direct query:', roleValue);
        
        return roleValue;
      }
      
      const userProfile = Array.isArray(allProfiles) 
        ? allProfiles.find(profile => profile.id === userId)
        : null;
        
      if (!userProfile) {
        console.error('getRoleFromProfile: User profile not found in get_all_profiles results');
        return null;
      }
      
      const roleValue = safetyCheck<{ role: UserRole }, 'role'>(userProfile, 'role', 'admin' as UserRole);
      console.log('getRoleFromProfile: Retrieved role from get_all_profiles:', roleValue);
      
      return roleValue;
    }

    if (!data) return null;
    
    console.log('getRoleFromProfile: Retrieved role via RPC:', data);
    
    if (data === 'admin' || data === 'waiter' || data === 'kitchen' || 
        data === 'delivery' || data === 'manager') {
      return data as UserRole;
    }
    
    return 'admin';
  } catch (error) {
    console.error('Error getting role:', error);
    return null;
  }
};

export const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
  try {
    console.log(`updateUserRole: Updating user ${userId} role to ${newRole}`);
    
    // Use the edge function to bypass RLS issues
    const { data, error } = await supabase.functions.invoke('create-user-with-profile', {
      body: { 
        userId, 
        role: newRole, 
        action: 'update_role' 
      }
    });

    if (error) {
      console.error('updateUserRole: Error calling edge function:', error);
      console.error('updateUserRole: Error details:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      throw error;
    }
    
    console.log(`updateUserRole: Successfully updated user ${userId} role to ${newRole}. Response:`, data);
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};

export const updateUserName = async (userId: string, newName: string): Promise<boolean> => {
  try {
    console.log(`updateUserName: Updating user ${userId} name to ${newName}`);
    
    // Use the edge function to bypass RLS issues
    const { data, error } = await supabase.functions.invoke('create-user-with-profile', {
      body: { 
        userId, 
        name: newName, 
        action: 'update_name' 
      }
    });

    if (error) {
      console.error('updateUserName: Error calling edge function:', error);
      throw error;
    }

    console.log('updateUserName: Name updated successfully:', data);
    return true;
  } catch (error) {
    console.error('Error updating user name:', error);
    return false;
  }
};

export const getUserAuthData = async (userId: string): Promise<{ email: string } | null> => {
  try {
    console.log('getUserAuthData: Getting auth data for user ID:', userId);
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData?.session?.user?.id === userId) {
      console.log('getUserAuthData: User is current user, returning email from session');
      return { 
        email: sessionData.session.user.email || '' 
      };
    }
    
    console.log('getUserAuthData: User is not current user, returning empty email');
    return { email: '' };
  } catch (error) {
    console.error('Error fetching user auth data:', error);
    return null;
  }
};

export const fetchAllProfiles = async (): Promise<AuthUser[]> => {
  try {
    console.log('fetchAllProfiles: Fetching all profiles from Supabase...');
    
    // Primero intentar usando la función RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_profiles');
    
    if (rpcError) {
      console.error('fetchAllProfiles: Error llamando RPC function:', rpcError);
      console.error('fetchAllProfiles: RPC error details:', {
        message: rpcError.message,
        code: rpcError.code,
        details: rpcError.details
      });
      
      // Si falla RPC, intentar consulta directa
      console.log('fetchAllProfiles: Fallback a consulta directa...');
      const { data: directData, error: directError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (directError) {
        console.error('fetchAllProfiles: Error en consulta directa:', directError);
        throw directError;
      }
      
      if (!directData || !Array.isArray(directData)) {
        console.log('fetchAllProfiles: No se encontraron perfiles con consulta directa');
        return [];
      }
      
      console.log(`fetchAllProfiles: Consulta directa retornó ${directData.length} perfiles`);
      return directData.map(profile => ({
        id: profile?.id || '',
        name: profile?.name || '',
        email: '',
        role: (profile?.role as UserRole) || 'admin',
        avatar: profile?.avatar,
        created_at: profile?.created_at || ''
      }));
    }
    
    if (!rpcData || !Array.isArray(rpcData)) {
      console.log('fetchAllProfiles: No se encontraron perfiles con RPC');
      return [];
    }

    console.log(`fetchAllProfiles: RPC retornó ${rpcData.length} perfiles:`, rpcData);
    
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id;
    const currentUserEmail = sessionData?.session?.user?.email || '';
    
    console.log('fetchAllProfiles: Datos de sesión actual:', {
      currentUserId,
      currentUserEmail,
      hasSession: !!sessionData?.session
    });
    
    const usersWithData = await Promise.all(rpcData.map(async (profile) => {
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

    console.log('fetchAllProfiles: Processed all profiles with email data:', usersWithData);
    return usersWithData;
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    return [];
  }
};

export const createUserWithEdgeFunction = async (email: string, password: string, name: string, role: UserRole = 'admin'): Promise<{ user?: any; error?: any }> => {
  try {
    console.log(`createUserWithEdgeFunction: Creating user with edge function: ${email}, ${name}, ${role}`);
    
    // Call the Supabase edge function to create a user with more detailed logging
    console.log('createUserWithEdgeFunction: Invocando edge function create-user-with-profile');
    const response = await supabase.functions.invoke('create-user-with-profile', {
      body: { email, password, name, role }
    });
    
    console.log('createUserWithEdgeFunction: Edge function raw response:', response);
    
    const { data, error } = response;

    if (error) {
      console.error('createUserWithEdgeFunction: Error calling create-user-with-profile function:', error);
      return { error };
    }

    if (!data || !data.user) {
      console.error('createUserWithEdgeFunction: Error: No user returned from edge function', data);
      return { error: 'No user returned from edge function' };
    }

    console.log('createUserWithEdgeFunction: User created successfully:', data);
    
    return { user: data.user };
  } catch (error) {
    console.error('Exception in createUserWithEdgeFunction:', error);
    return { error };
  }
};

export const getUserFromProfiles = async (userId: string): Promise<AuthUser | null> => {
  try {
    console.log('getUserFromProfiles: Getting user from profiles, ID:', userId);
    
    // Try using RPC function
    const { data, error } = await supabase.rpc('get_profile_by_id', { user_id: userId });
      
    if (error) {
      console.error('getUserFromProfiles: Error getting user with RPC:', error);
      
      // Fallback to get_all_profiles
      console.log('getUserFromProfiles: Falling back to get_all_profiles');
      const { data: allProfiles, error: allProfilesError } = await supabase.rpc('get_all_profiles');
      
      if (allProfilesError) {
        console.error('getUserFromProfiles: Error in fallback to get_all_profiles:', allProfilesError);
        return null;
      }
      
      const userProfile = Array.isArray(allProfiles) 
        ? allProfiles.find(profile => profile.id === userId)
        : null;
        
      if (!userProfile) {
        console.error('getUserFromProfiles: User profile not found in get_all_profiles results');
        return null;
      }
      
      console.log('getUserFromProfiles: Profile found in get_all_profiles:', userProfile);
      
      // Get the user's session to access email
      const { data: sessionData } = await supabase.auth.getSession();
      const userEmail = sessionData?.session?.user?.id === userId 
        ? sessionData.session.user.email || ''
        : '';
      
      return {
        id: userProfile.id,
        name: userProfile.name,
        email: userEmail,
        role: userProfile.role as UserRole,
        avatar: userProfile.avatar,
        created_at: userProfile.created_at
      };
    }
    
    if (!data) {
      console.log('getUserFromProfiles: No profile found for user ID:', userId);
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
    console.log(`getUserFromTable: Getting user from ${tableName}, ID:`, userId);
    
    // Validate table name to prevent SQL injection and type errors
    if (tableName !== 'profiles') {
      console.error(`Invalid table name: ${tableName}, only 'profiles' is allowed`);
      return null;
    }
    
    // Try using RPC function
    const { data, error } = await supabase.rpc('get_profile_by_id', { user_id: userId });
      
    if (error) {
      console.error(`Error getting user from ${tableName} with RPC:`, error);
      
      // Fallback to get_all_profiles
      console.log(`getUserFromTable: Falling back to get_all_profiles`);
      const { data: allProfiles, error: allProfilesError } = await supabase.rpc('get_all_profiles');
      
      if (allProfilesError) {
        console.error(`getUserFromTable: Error in fallback to get_all_profiles:`, allProfilesError);
        return null;
      }
      
      const userProfile = Array.isArray(allProfiles) 
        ? allProfiles.find(profile => profile.id === userId)
        : null;
        
      if (!userProfile) {
        console.log(`No user found in ${tableName} for ID:`, userId);
        return null;
      }
      
      return {
        id: userProfile.id,
        name: userProfile.name || 'Unknown',
        email: '', // Email is not stored in profiles table
        role: userProfile.role as UserRole,
        avatar: userProfile.avatar,
        created_at: userProfile.created_at
      };
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

// Removed duplicate exports
